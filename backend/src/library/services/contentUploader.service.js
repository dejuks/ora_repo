import pool from '../../config/db.js';
import { badRequest, notFound } from '../utils/appError.js';
import { writeLibraryAuditLog } from '../utils/audit.js';
import { notificationService } from './notification.service.js';

export const contentUploaderService = {
  async getDashboard(userId) {
    const params = [];
    let where = '';
    if (userId) {
      params.push(userId);
      where = `WHERE ds.submitted_by = $${params.length}`;
    }

    const summarySql = `
      SELECT
        COUNT(*)::int AS total_submissions,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_count,
        COUNT(*) FILTER (WHERE status IN ('submitted','under_review'))::int AS in_review_count,
        COUNT(*) FILTER (WHERE status = 'correction_requested')::int AS correction_requested_count,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_count,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_count
      FROM digital_submissions ds
      ${where}
    `;

    const submissionsSql = `
      SELECT ds.*, 
             p.name AS publisher_name,
             mt.name AS material_type_name,
             lc.name AS category_name,
             lang.name AS language_name,
             COUNT(DISTINCT dsf.submission_file_id)::int AS file_count,
             MAX(dsr.reviewed_at) AS last_reviewed_at,
             MAX(dssh.changed_at) AS last_status_change_at
      FROM digital_submissions ds
      LEFT JOIN publishers p ON p.publisher_id = ds.publisher_id
      LEFT JOIN material_types mt ON mt.material_type_id = ds.material_type_id
      LEFT JOIN library_categories lc ON lc.category_id = ds.category_id
      LEFT JOIN languages lang ON lang.language_id = ds.language_id
      LEFT JOIN digital_submission_files dsf ON dsf.submission_id = ds.submission_id
      LEFT JOIN digital_submission_reviews dsr ON dsr.submission_id = ds.submission_id
      LEFT JOIN digital_submission_status_history dssh ON dssh.submission_id = ds.submission_id
      ${where}
      GROUP BY ds.submission_id, p.name, mt.name, lc.name, lang.name
      ORDER BY COALESCE(ds.updated_at, ds.created_at) DESC
      LIMIT 50
    `;

    const [summaryRes, submissionsRes] = await Promise.all([
      pool.query(summarySql, params),
      pool.query(submissionsSql, params),
    ]);

    return {
      summary: summaryRes.rows[0] || {
        total_submissions: 0,
        draft_count: 0,
        in_review_count: 0,
        correction_requested_count: 0,
        approved_count: 0,
        published_count: 0,
        rejected_count: 0,
      },
      submissions: submissionsRes.rows,
    };
  },

  async getWorkflow(submissionId) {
    const submissionRes = await pool.query(
      `SELECT ds.*, p.name AS publisher_name, mt.name AS material_type_name, lc.name AS category_name, lang.name AS language_name,
              u.name AS submitted_by_name, u.email AS submitted_by_email,
              dsp.publication_id, dsp.material_id, dsp.digital_resource_id, dsp.published_at AS publication_published_at
       FROM digital_submissions ds
       LEFT JOIN publishers p ON p.publisher_id = ds.publisher_id
       LEFT JOIN material_types mt ON mt.material_type_id = ds.material_type_id
       LEFT JOIN library_categories lc ON lc.category_id = ds.category_id
       LEFT JOIN languages lang ON lang.language_id = ds.language_id
       LEFT JOIN users u ON u.uuid = ds.submitted_by
       LEFT JOIN digital_submission_publications dsp ON dsp.submission_id = ds.submission_id
       WHERE ds.submission_id = $1`,
      [submissionId]
    );
    const submission = submissionRes.rows[0];
    if (!submission) throw notFound('Submission not found');

    const [filesRes, reviewsRes, historyRes, contributorsRes] = await Promise.all([
      pool.query(`SELECT * FROM digital_submission_files WHERE submission_id = $1 ORDER BY uploaded_at DESC`, [submissionId]),
      pool.query(`SELECT dsr.*, u.name AS reviewer_name, u.email AS reviewer_email FROM digital_submission_reviews dsr LEFT JOIN users u ON u.uuid = dsr.reviewer_id WHERE dsr.submission_id = $1 ORDER BY dsr.reviewed_at DESC`, [submissionId]),
      pool.query(`SELECT dssh.*, u.name AS changed_by_name, u.email AS changed_by_email FROM digital_submission_status_history dssh LEFT JOIN users u ON u.uuid = dssh.changed_by WHERE dssh.submission_id = $1 ORDER BY dssh.changed_at DESC`, [submissionId]),
      pool.query(`SELECT dsc.*, c.full_name AS contributor_name FROM digital_submission_contributors dsc LEFT JOIN contributors c ON c.contributor_id = dsc.contributor_id WHERE dsc.submission_id = $1 ORDER BY dsc.sequence_no ASC`, [submissionId]),
    ]);

    return {
      submission,
      files: filesRes.rows,
      reviews: reviewsRes.rows,
      history: historyRes.rows,
      contributors: contributorsRes.rows,
    };
  },

  async resubmit(submissionId, actorUserId, payload = {}, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const currentRes = await client.query(`SELECT * FROM digital_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = currentRes.rows[0];
      if (!submission) throw notFound('Submission not found');
      if (!['draft', 'correction_requested', 'rejected'].includes(submission.status)) {
        throw badRequest('Only draft, correction requested, or rejected submissions can be resubmitted');
      }

      const patch = payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
      const allowedKeys = [
        'publisher_id', 'material_type_id', 'category_id', 'language_id', 'title', 'subtitle', 'abstract',
        'keywords', 'publication_year', 'isbn', 'issn', 'access_level', 'note'
      ];
      const entries = Object.entries(patch).filter(([key, value]) => allowedKeys.includes(key) && value !== undefined);
      let updated = submission;
      if (entries.length) {
        const sets = [];
        const values = [];
        entries.forEach(([key, value], idx) => {
          values.push(value);
          sets.push(`${key} = $${idx + 1}`);
        });
        values.push(submissionId);
        const updateRes = await client.query(
          `UPDATE digital_submissions SET ${sets.join(', ')}, updated_at = NOW() WHERE submission_id = $${values.length} RETURNING *`,
          values
        );
        updated = updateRes.rows[0];
      }

      const submitRes = await client.query(
        `UPDATE digital_submissions SET status = 'submitted', submitted_at = NOW(), updated_at = NOW() WHERE submission_id = $1 RETURNING *`,
        [submissionId]
      );
      updated = submitRes.rows[0];

      await client.query(
        `INSERT INTO digital_submission_status_history (submission_id, old_status, new_status, changed_by, reason)
         VALUES ($1,$2,'submitted',$3,$4)`,
        [submissionId, submission.status, actorUserId, payload.reason || 'Resubmitted after revision']
      );

      await notificationService.create({
        userId: actorUserId,
        type: 'submission_resubmitted',
        title: 'Submission resubmitted',
        message: 'Your corrected submission was resubmitted for review.',
        relatedEntityType: 'digital_submission',
        relatedEntityId: submissionId,
      }, client);

      await client.query('COMMIT');
      await writeLibraryAuditLog({
        actorUserId,
        action: 'digital_submission.resubmit',
        entityType: 'digital_submission',
        entityId: submissionId,
        oldValues: submission,
        newValues: updated,
        ipAddress: reqMeta.ipAddress || null,
        userAgent: reqMeta.userAgent || null,
      });
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
