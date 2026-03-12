import pool from "../../config/db.js";
import { writeLibraryAuditLog } from "../utils/audit.js";
import { notificationService } from "./notification.service.js";
import { badRequest, notFound } from "../utils/appError.js";

const addStatusHistory = async (client, submissionId, oldStatus, newStatus, changedBy, reason = null) => {
  await client.query(`INSERT INTO digital_submission_status_history (submission_id, old_status, new_status, changed_by, reason) VALUES ($1,$2,$3,$4,$5)`, [submissionId, oldStatus, newStatus, changedBy, reason]);
};

export const digitalSubmissionService = {
  async submit(submissionId, actorUserId, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(`SELECT * FROM digital_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = res.rows[0];
      if (!submission) throw notFound('Submission not found');
      if (!['draft', 'correction_requested'].includes(submission.status)) throw badRequest('Submission cannot be submitted');
      const updateRes = await client.query(`UPDATE digital_submissions SET status = 'submitted', submitted_at = NOW() WHERE submission_id = $1 RETURNING *`, [submissionId]);
      await addStatusHistory(client, submissionId, submission.status, 'submitted', actorUserId, 'Submitted for review');
      await notificationService.create({ userId: actorUserId, type: 'submission_submitted', title: 'Submission sent', message: 'Your digital submission has been submitted for review.', relatedEntityType: 'digital_submission', relatedEntityId: submissionId }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId, action: 'digital_submission.submit', entityType: 'digital_submission', entityId: submissionId, newValues: updateRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return updateRes.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },

  async review(submissionId, { reviewer_id, decision, comments = null, internal_note = null, reason = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(`SELECT * FROM digital_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = res.rows[0];
      if (!submission) throw notFound('Submission not found');
      if (!['submitted', 'under_review', 'correction_requested'].includes(submission.status)) throw badRequest('Submission is not in a reviewable state');
      await client.query(`INSERT INTO digital_submission_reviews (submission_id, reviewer_id, decision, comments, internal_note) VALUES ($1,$2,$3,$4,$5)`, [submissionId, reviewer_id, decision, comments, internal_note]);
      const statusMap = { approved: 'approved', rejected: 'rejected', correction_requested: 'correction_requested', pending: 'under_review' };
      const nextStatus = statusMap[decision] || 'under_review';
      const updateRes = await client.query(`UPDATE digital_submissions SET status = $2, reviewed_at = NOW(), approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END WHERE submission_id = $1 RETURNING *`, [submissionId, nextStatus]);
      await addStatusHistory(client, submissionId, submission.status, nextStatus, reviewer_id, reason || decision);
      await notificationService.create({ userId: submission.submitted_by, type: 'submission_reviewed', title: `Submission ${nextStatus.replace('_',' ')}`, message: `Your digital submission was marked ${nextStatus.replace('_',' ')}.`, relatedEntityType: 'digital_submission', relatedEntityId: submissionId }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: reviewer_id, action: `digital_submission.${decision}`, entityType: 'digital_submission', entityId: submissionId, newValues: updateRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return updateRes.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },

  async publish(submissionId, actorUserId, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const subRes = await client.query(`SELECT * FROM digital_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = subRes.rows[0];
      if (!submission) throw notFound('Submission not found');
      if (submission.status !== 'approved') throw badRequest('Only approved submissions can be published');
      const materialRes = await client.query(`INSERT INTO catalog_materials (material_type_id, category_id, language_id, title, subtitle, abstract, keywords, publication_year, isbn, issn, material_format, is_active, created_by, updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'digital',TRUE,$11,$12) RETURNING *`, [submission.material_type_id, submission.category_id, submission.language_id, submission.title, submission.subtitle, submission.abstract, submission.keywords, submission.publication_year, submission.isbn, submission.issn, actorUserId, actorUserId]);
      const material = materialRes.rows[0];
      const resourceRes = await client.query(`INSERT INTO digital_resources (material_id, publisher_id, access_level, is_downloadable, is_streamable, is_active, created_by, updated_by) VALUES ($1,$2,$3,TRUE,FALSE,TRUE,$4,$5) RETURNING *`, [material.material_id, submission.publisher_id, submission.access_level, actorUserId, actorUserId]);
      const resource = resourceRes.rows[0];
      const filesRes = await client.query(`SELECT * FROM digital_submission_files WHERE submission_id = $1`, [submissionId]);
      for (const file of filesRes.rows) {
        await client.query(`INSERT INTO digital_resource_files (digital_resource_id, file_role, original_name, stored_name, file_path, mime_type, file_size_bytes, checksum_sha256, version_no, is_current, uploaded_by, uploaded_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,TRUE,$9,COALESCE($10,NOW()))`, [resource.digital_resource_id, file.file_role, file.original_name, file.stored_name, file.file_path, file.mime_type, file.file_size_bytes, file.checksum_sha256, file.uploaded_by || actorUserId, file.uploaded_at]);
      }
      await client.query(`INSERT INTO digital_submission_publications (submission_id, material_id, digital_resource_id, published_by) VALUES ($1,$2,$3,$4)`, [submissionId, material.material_id, resource.digital_resource_id, actorUserId]);
      const updateRes = await client.query(`UPDATE digital_submissions SET status = 'published', published_at = NOW() WHERE submission_id = $1 RETURNING *`, [submissionId]);
      await addStatusHistory(client, submissionId, submission.status, 'published', actorUserId, 'Published into digital library');
      await notificationService.create({ userId: submission.submitted_by, type: 'submission_published', title: 'Submission published', message: 'Your digital submission has been published in the library.', relatedEntityType: 'digital_submission', relatedEntityId: submissionId }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId, action: 'digital_submission.publish', entityType: 'digital_submission', entityId: submissionId, newValues: updateRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return { submission: updateRes.rows[0], material, resource };
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },
};
