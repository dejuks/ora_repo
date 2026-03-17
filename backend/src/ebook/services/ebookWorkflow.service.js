import path from "path";
import pool from "../../config/db.js";
import { sha256File } from "../utils/fileChecksum.js";
import { EbookSubmissionModel } from "../models/ebookSubmission.model.js";

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

const PUBLIC_ACCESS = new Set(["open_access", "public"]);

const addHistory = async (client, submissionId, fromStatus, toStatus, action, actorId, note = null) => {
  await client.query(
    `INSERT INTO ebook_workflow_history (submission_id, from_status, to_status, action, note, actor_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [submissionId, fromStatus, toStatus, action, note, actorId]
  );
};

const normalizeKeywords = (keywords) => {
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  if (typeof keywords === "string") return keywords.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

export const ebookWorkflowService = {
  async authorDashboard(userId) {
    const [summaryRes, itemsRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_submissions,
                COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_count,
                COUNT(*) FILTER (WHERE status IN ('submitted','editor_screening','under_review','revision_requested'))::int AS active_count,
                COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted_count,
                COUNT(*) FILTER (WHERE status = 'published')::int AS published_count,
                COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_count
         FROM ebook_submissions WHERE author_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT es.*, ep.slug, ep.access_level, ep.is_public
         FROM ebook_submissions es
         LEFT JOIN ebook_publications ep ON ep.submission_id = es.submission_id
         WHERE es.author_id = $1
         ORDER BY COALESCE(es.updated_at, es.created_at) DESC
         LIMIT 50`,
        [userId]
      )
    ]);
    return { summary: summaryRes.rows[0], submissions: itemsRes.rows };
  },

  async editorDashboard(userId = null) {
    const [summaryRes, itemsRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_queue,
                COUNT(*) FILTER (WHERE status = 'submitted')::int AS new_submissions,
                COUNT(*) FILTER (WHERE status = 'editor_screening')::int AS screening_count,
                COUNT(*) FILTER (WHERE status = 'under_review')::int AS review_count,
                COUNT(*) FILTER (WHERE status = 'revision_requested')::int AS revision_count,
                COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted_count,
                COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_count
         FROM ebook_submissions`,
        []
      ),
      pool.query(
        `SELECT es.*, u.full_name AS author_name, e.full_name AS editor_name,
                COUNT(DISTINCT era.assignment_id)::int AS assignment_count,
                COUNT(DISTINCT er.review_id)::int AS review_count
         FROM ebook_submissions es
         LEFT JOIN users u ON u.uuid = es.author_id
         LEFT JOIN users e ON e.uuid = es.editor_id
         LEFT JOIN ebook_review_assignments era ON era.submission_id = es.submission_id
         LEFT JOIN ebook_reviews er ON er.submission_id = es.submission_id
         GROUP BY es.submission_id, u.full_name, e.full_name
         ORDER BY COALESCE(es.updated_at, es.created_at) DESC
         LIMIT 100`,
        []
      )
    ]);
    return { summary: summaryRes.rows[0], submissions: itemsRes.rows, viewer_id: userId };
  },

  async reviewerDashboard(userId) {
    const [summaryRes, itemsRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_assignments,
                COUNT(*) FILTER (WHERE status = 'assigned')::int AS assigned_count,
                COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted_count,
                COUNT(*) FILTER (WHERE status = 'submitted')::int AS completed_count,
                COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND status IN ('assigned','accepted'))::int AS overdue_count
         FROM ebook_review_assignments
         WHERE reviewer_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT era.*, es.title, es.status AS submission_status, es.abstract,
                u.full_name AS author_name
         FROM ebook_review_assignments era
         INNER JOIN ebook_submissions es ON es.submission_id = era.submission_id
         LEFT JOIN users u ON u.uuid = es.author_id
         WHERE era.reviewer_id = $1
         ORDER BY COALESCE(era.due_date, CURRENT_DATE + 365) ASC, era.assigned_at DESC`,
        [userId]
      )
    ]);
    return { summary: summaryRes.rows[0], assignments: itemsRes.rows };
  },

  async financeDashboard() {
    const [summaryRes, itemsRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_records,
                COUNT(*) FILTER (WHERE payment_status = 'pending')::int AS pending_count,
                COUNT(*) FILTER (WHERE payment_status = 'waiver_requested')::int AS waiver_requested_count,
                COUNT(*) FILTER (WHERE payment_status = 'cleared')::int AS cleared_count,
                COALESCE(SUM(amount_due), 0)::numeric AS total_due,
                COALESCE(SUM(amount_paid), 0)::numeric AS total_paid
         FROM ebook_finance_clearances`,
        []
      ),
      pool.query(
        `SELECT efc.*, es.title, es.status AS submission_status, u.full_name AS author_name
         FROM ebook_finance_clearances efc
         INNER JOIN ebook_submissions es ON es.submission_id = efc.submission_id
         LEFT JOIN users u ON u.uuid = es.author_id
         ORDER BY COALESCE(efc.cleared_at, efc.updated_at, efc.created_at) DESC
         LIMIT 100`,
        []
      )
    ]);
    return { summary: summaryRes.rows[0], finances: itemsRes.rows };
  },

  async productionDashboard() {
    const [summaryRes, itemsRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_items,
                COUNT(*) FILTER (WHERE pdf_ready = TRUE OR epub_ready = TRUE)::int AS formatted_count,
                COUNT(*) FILTER (WHERE proof_sent_to_author = TRUE)::int AS proof_sent_count,
                COUNT(*) FILTER (WHERE author_proof_approved = TRUE)::int AS proof_approved_count,
                COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::int AS completed_count
         FROM ebook_production`,
        []
      ),
      pool.query(
        `SELECT epd.*, es.title, es.status AS submission_status, u.full_name AS author_name
         FROM ebook_production epd
         INNER JOIN ebook_submissions es ON es.submission_id = epd.submission_id
         LEFT JOIN users u ON u.uuid = es.author_id
         ORDER BY COALESCE(epd.completed_at, epd.updated_at, epd.created_at) DESC
         LIMIT 100`,
        []
      )
    ]);
    return { summary: summaryRes.rows[0], production: itemsRes.rows };
  },

  async publicCatalog({ search = "", access_level, limit = 20, offset = 0, page }) {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.min(Math.max(Number(limit), 1), 100) : 20;
    const safeOffset = Number.isFinite(Number(offset)) ? Math.max(Number(offset), 0) : (page ? (Math.max(Number(page), 1) - 1) * safeLimit : 0);
    const values = [];
    const clauses = ["ep.is_public = TRUE", "(ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)"];
    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      clauses.push(`(es.title ILIKE $${idx} OR es.subtitle ILIKE $${idx} OR es.abstract ILIKE $${idx} OR array_to_string(es.keywords, ',') ILIKE $${idx})`);
    }
    if (access_level) {
      values.push(access_level);
      clauses.push(`ep.access_level = $${values.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       ${where}`,
      values
    );
    const dataRes = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.keywords, es.language, es.category, es.publication_year,
              u.full_name AS author_name, epd.isbn, epd.doi,
              f.file_path AS cover_or_main_file
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       LEFT JOIN ebook_production epd ON epd.production_id = ep.production_id
       LEFT JOIN LATERAL (
         SELECT file_path FROM ebook_submission_files esf
         WHERE esf.submission_id = es.submission_id AND esf.is_active = TRUE
         ORDER BY CASE WHEN esf.file_role = 'cover' THEN 0 ELSE 1 END, esf.created_at DESC
         LIMIT 1
       ) f ON TRUE
       ${where}
       ORDER BY ep.published_at DESC NULLS LAST, ep.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, safeLimit, safeOffset]
    );
    return {
      rows: dataRes.rows,
      meta: {
        total: countRes.rows[0]?.total || 0,
        limit: safeLimit,
        offset: safeOffset,
        page: Math.floor(safeOffset / safeLimit) + 1,
      },
    };
  },

  async getReviewerOptions() {
    const { rows } = await pool.query(
      `SELECT
         u.uuid,
         u.full_name,
         u.email,
         COUNT(era.assignment_id) FILTER (WHERE era.status IN ('assigned','accepted'))::int AS active_assignment_count,
         COUNT(era.assignment_id)::int AS total_assignment_count
       FROM users u
       INNER JOIN user_roles ur ON ur.user_id = u.uuid
       INNER JOIN roles r ON r.uuid = ur.role_id
       LEFT JOIN ebook_review_assignments era ON era.reviewer_id = u.uuid
       WHERE UPPER(REPLACE(r.name, ' ', '_')) = 'EBOOK_REVIEWER'
       GROUP BY u.uuid, u.full_name, u.email
       ORDER BY u.full_name ASC, u.email ASC`
    );
    return rows;
  },

  async getWorkflow(submissionId) {
    const submissionRes = await pool.query(
      `SELECT es.*, a.full_name AS author_name, a.email AS author_email, e.full_name AS editor_name, e.email AS editor_email,
              ep.publication_id, ep.slug, ep.access_level, ep.is_public, ep.published_at,
              epd.production_id, epd.pdf_ready, epd.epub_ready, epd.proof_sent_to_author, epd.author_proof_approved,
              epd.isbn, epd.doi, epd.repository_path,
              efc.finance_id, efc.payment_status, efc.amount_due, efc.amount_paid, efc.invoice_number, efc.receipt_number
       FROM ebook_submissions es
       LEFT JOIN users a ON a.uuid = es.author_id
       LEFT JOIN users e ON e.uuid = es.editor_id
       LEFT JOIN ebook_publications ep ON ep.submission_id = es.submission_id
       LEFT JOIN ebook_production epd ON epd.submission_id = es.submission_id
       LEFT JOIN ebook_finance_clearances efc ON efc.submission_id = es.submission_id
       WHERE es.submission_id = $1`,
      [submissionId]
    );
    const submission = submissionRes.rows[0];
    if (!submission) throw notFound("Submission not found");

    const [filesRes, assignmentsRes, reviewsRes, historyRes] = await Promise.all([
      pool.query(`SELECT * FROM ebook_submission_files WHERE submission_id = $1 ORDER BY version_no DESC, created_at DESC`, [submissionId]),
      pool.query(`SELECT era.*, u.full_name AS reviewer_name, u.email AS reviewer_email FROM ebook_review_assignments era LEFT JOIN users u ON u.uuid = era.reviewer_id WHERE era.submission_id = $1 ORDER BY era.assigned_at DESC`, [submissionId]),
      pool.query(`SELECT er.*, u.full_name AS reviewer_name, u.email AS reviewer_email FROM ebook_reviews er LEFT JOIN users u ON u.uuid = er.reviewer_id WHERE er.submission_id = $1 ORDER BY er.submitted_at DESC`, [submissionId]),
      pool.query(`SELECT ewh.*, u.full_name AS actor_name, u.email AS actor_email FROM ebook_workflow_history ewh LEFT JOIN users u ON u.uuid = ewh.actor_id WHERE ewh.submission_id = $1 ORDER BY ewh.acted_at DESC`, [submissionId]),
    ]);

    return {
      submission,
      files: filesRes.rows,
      assignments: assignmentsRes.rows,
      reviews: reviewsRes.rows,
      history: historyRes.rows,
    };
  },


  async createSubmission(payload = {}, actorId, file = null, fileRole = 'manuscript') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const created = await EbookSubmissionModel.create(payload, client);
      if (file) {
        const checksum = await sha256File(file.path);
        await client.query(
          `INSERT INTO ebook_submission_files (
             submission_id, version_no, file_role, original_name, stored_name, file_path, mime_type, file_size_bytes, checksum_sha256, uploaded_by
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            created.submission_id,
            created.current_version_no || 1,
            fileRole,
            file.originalname,
            file.filename,
            path.relative(process.cwd(), file.path).replace(/\\/g, '/'),
            file.mimetype,
            file.size,
            checksum,
            actorId || created.author_id,
          ]
        );
      }
      await addHistory(client, created.submission_id, null, created.status, 'create_submission', actorId || created.author_id, 'Submission created');
      await client.query('COMMIT');
      const createdRes = await pool.query(
        `SELECT es.*, u.full_name AS author_name,
                COUNT(esf.file_id)::int AS file_count,
                ARRAY_REMOVE(ARRAY_AGG(DISTINCT esf.file_role), NULL) AS file_roles,
                JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                    'file_id', esf.file_id,
                    'file_role', esf.file_role,
                    'original_name', esf.original_name,
                    'file_path', esf.file_path,
                    'created_at', esf.created_at
                  )
                ) FILTER (WHERE esf.file_id IS NOT NULL) AS files
         FROM ebook_submissions es
         LEFT JOIN users u ON u.uuid = es.author_id
         LEFT JOIN ebook_submission_files esf ON esf.submission_id = es.submission_id AND esf.is_active = TRUE
         WHERE es.submission_id = $1
         GROUP BY es.submission_id, u.full_name`,
        [created.submission_id]
      );
      return createdRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async submitManuscript(submissionId, actorId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const currentRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const current = currentRes.rows[0];
      if (!current) throw notFound("Submission not found");
      if (!["draft", "revision_requested"].includes(current.status)) throw badRequest("Submission is not ready for submit");
      const updateRes = await client.query(
        `UPDATE ebook_submissions SET status = 'submitted', submitted_at = NOW(), updated_at = NOW() WHERE submission_id = $1 RETURNING *`,
        [submissionId]
      );
      await addHistory(client, submissionId, current.status, "submitted", "submit", actorId, "Author submitted manuscript");
      await client.query("COMMIT");
      return updateRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async resubmitManuscript(submissionId, actorId, payload = {}) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const currentRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const current = currentRes.rows[0];
      if (!current) throw notFound("Submission not found");
      if (!["revision_requested", "rejected", "draft"].includes(current.status)) throw badRequest("Submission cannot be resubmitted");

      const metadata = payload.metadata || {};
      const patchKeys = ["title", "subtitle", "abstract", "category", "language", "publication_year", "target_audience", "requires_bpc", "bpc_amount"];
      const entries = Object.entries(metadata).filter(([key, value]) => patchKeys.includes(key) && value !== undefined);
      let updated = current;
      if (entries.length) {
        const values = [];
        const sets = [];
        entries.forEach(([key, value], index) => {
          values.push(key === "keywords" ? normalizeKeywords(value) : value);
          sets.push(`${key} = $${index + 1}`);
        });
        values.push(submissionId);
        const updatedRes = await client.query(
          `UPDATE ebook_submissions SET ${sets.join(', ')}, updated_at = NOW() WHERE submission_id = $${values.length} RETURNING *`,
          values
        );
        updated = updatedRes.rows[0];
      }
      const submitRes = await client.query(
        `UPDATE ebook_submissions SET status = 'submitted', final_decision = NULL, updated_at = NOW() WHERE submission_id = $1 RETURNING *`,
        [submissionId]
      );
      updated = submitRes.rows[0];
      await addHistory(client, submissionId, current.status, "submitted", "resubmit", actorId, payload.reason || "Author resubmitted revised manuscript");
      await client.query("COMMIT");
      return updated;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async uploadFile(submissionId, actorId, file, fileRole = "manuscript") {
    if (!file) throw badRequest("File is required");
    const currentRes = await pool.query(`SELECT submission_id, current_version_no FROM ebook_submissions WHERE submission_id = $1`, [submissionId]);
    const current = currentRes.rows[0];
    if (!current) throw notFound("Submission not found");
    const checksum = await sha256File(file.path);
    const insertRes = await pool.query(
      `INSERT INTO ebook_submission_files (
         submission_id, version_no, file_role, original_name, stored_name, file_path, mime_type, file_size_bytes, checksum_sha256, uploaded_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        submissionId,
        current.current_version_no || 1,
        fileRole,
        file.originalname,
        file.filename,
        path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
        file.mimetype,
        file.size,
        checksum,
        actorId,
      ]
    );
    return insertRes.rows[0];
  },

  async editorScreening(submissionId, actorId, { decision, note = null }) {
    const nextStatusMap = {
      send_to_review: "under_review",
      request_revision: "revision_requested",
      reject: "rejected",
    };
    const nextStatus = nextStatusMap[decision];
    if (!nextStatus) throw badRequest("Invalid screening decision");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const currentRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const current = currentRes.rows[0];
      if (!current) throw notFound("Submission not found");
      if (!["submitted", "editor_screening", "revision_requested"].includes(current.status)) throw badRequest("Submission is not in screening stage");
      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = $2, editor_id = COALESCE(editor_id, $3), final_decision = CASE WHEN $2 = 'rejected' THEN 'rejected' ELSE NULL END,
             final_decision_note = $4, updated_at = NOW()
         WHERE submission_id = $1 RETURNING *`,
        [submissionId, nextStatus, actorId, note]
      );
      await addHistory(client, submissionId, current.status, nextStatus, `screening.${decision}`, actorId, note);
      await client.query("COMMIT");
      return updateRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async assignReviewer(submissionId, actorId, payload = {}) {
    const reviewerIds = Array.isArray(payload.reviewer_ids)
      ? payload.reviewer_ids.filter(Boolean)
      : payload.reviewer_id
      ? [payload.reviewer_id]
      : [];
    if (!reviewerIds.length) throw badRequest("At least one reviewer is required");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const currentRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const current = currentRes.rows[0];
      if (!current) throw notFound("Submission not found");

      const reviewerCheck = await client.query(
        `SELECT DISTINCT u.uuid
         FROM users u
         INNER JOIN user_roles ur ON ur.user_id = u.uuid
         INNER JOIN roles r ON r.uuid = ur.role_id
         WHERE u.uuid = ANY($1::uuid[])
           AND UPPER(REPLACE(r.name, ' ', '_')) = 'EBOOK_REVIEWER'`,
        [reviewerIds]
      );
      const validReviewerIds = reviewerCheck.rows.map((row) => row.uuid);
      const invalidReviewerIds = reviewerIds.filter((id) => !validReviewerIds.includes(id));
      if (invalidReviewerIds.length) {
        throw badRequest(`Some selected users are not valid reviewers: ${invalidReviewerIds.join(', ')}`);
      }

      const assignments = [];
      for (const reviewerId of reviewerIds) {
        const assignmentRes = await client.query(
          `INSERT INTO ebook_review_assignments (submission_id, reviewer_id, assigned_by, status, due_date, invitation_note)
           VALUES ($1,$2,$3,'assigned',$4,$5)
           ON CONFLICT (submission_id, reviewer_id)
           DO UPDATE SET assigned_by = EXCLUDED.assigned_by, status = 'assigned', due_date = EXCLUDED.due_date, invitation_note = EXCLUDED.invitation_note, assigned_at = NOW(), updated_at = NOW()
           RETURNING *`,
          [submissionId, reviewerId, actorId, payload.due_date || null, payload.invitation_note || null]
        );
        assignments.push(assignmentRes.rows[0]);
      }

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = 'under_review', editor_id = COALESCE(editor_id, $2), assigned_reviewer_count = (
           SELECT COUNT(*)::int FROM ebook_review_assignments WHERE submission_id = $1
         ), updated_at = NOW()
         WHERE submission_id = $1 RETURNING *`,
        [submissionId, actorId]
      );
      await addHistory(client, submissionId, current.status, updateRes.rows[0].status, "assign_reviewer", actorId, payload.invitation_note || null);
      await client.query("COMMIT");
      return {
        assignments,
        submission: updateRes.rows[0],
        assigned_count: assignments.length,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async respondReviewAssignment(assignmentId, actorId, { status, response_note = null }) {
    if (!["accepted", "declined"].includes(status)) throw badRequest("Invalid reviewer response");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const currentRes = await client.query(`SELECT * FROM ebook_review_assignments WHERE assignment_id = $1 FOR UPDATE`, [assignmentId]);
      const current = currentRes.rows[0];
      if (!current) throw notFound("Assignment not found");
      if (current.reviewer_id !== actorId) throw badRequest("You can only respond to your own assignments");
      const res = await client.query(
        `UPDATE ebook_review_assignments
         SET status = $2, response_note = $3, accepted_at = CASE WHEN $2 = 'accepted' THEN NOW() ELSE accepted_at END,
             updated_at = NOW()
         WHERE assignment_id = $1 RETURNING *`,
        [assignmentId, status, response_note]
      );
      await addHistory(client, current.submission_id, null, null, `review_assignment.${status}`, actorId, response_note);
      await client.query("COMMIT");
      return res.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async submitReview(assignmentId, actorId, payload = {}) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const assignmentRes = await client.query(`SELECT * FROM ebook_review_assignments WHERE assignment_id = $1 FOR UPDATE`, [assignmentId]);
      const assignment = assignmentRes.rows[0];
      if (!assignment) throw notFound("Assignment not found");
      if (assignment.reviewer_id !== actorId) throw badRequest("You can only submit your own review");
      const reviewRes = await client.query(
        `INSERT INTO ebook_reviews (
          assignment_id, submission_id, reviewer_id, originality_score, quality_score, relevance_score,
          recommendation, comments_for_author, confidential_comments, submitted_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
        [
          assignmentId,
          assignment.submission_id,
          actorId,
          payload.originality_score || null,
          payload.quality_score || null,
          payload.relevance_score || null,
          payload.recommendation,
          payload.comments_for_author || null,
          payload.confidential_comments || null,
        ]
      );
      await client.query(
        `UPDATE ebook_review_assignments SET status = 'submitted', completed_at = NOW(), updated_at = NOW() WHERE assignment_id = $1`,
        [assignmentId]
      );
      await addHistory(client, assignment.submission_id, "under_review", "under_review", "review_submitted", actorId, payload.recommendation || null);
      await client.query("COMMIT");
      return reviewRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async editorialDecision(submissionId, actorId, payload = {}) {
    const decision = (payload?.decision ?? payload?.recommendation ?? payload?.editorial_decision ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
    const note = payload?.note ?? payload?.comments ?? null;
    const map = {
      accept: 'accepted',
      minor_revision: 'revision_requested',
      major_revision: 'revision_requested',
      reject: 'rejected',
    };
    const nextStatus = map[decision];
    if (!nextStatus) throw badRequest('Decision must be one of accept, minor_revision, major_revision, reject');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const currentRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const current = currentRes.rows[0];
      if (!current) throw notFound('Submission not found');

      const colsRes = await client.query(
        `SELECT column_name
           FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'ebook_submissions'`
      );
      const cols = new Set(colsRes.rows.map((r) => r.column_name));

      const setParts = [
        `status = $2`,
        `editor_id = COALESCE(editor_id, $3)`,
        `updated_at = NOW()`,
      ];
      const values = [submissionId, nextStatus, actorId];
      let idx = 4;

      if (cols.has('final_decision')) {
        setParts.push(`final_decision = $${idx}`);
        values.push(decision);
        idx += 1;
      }
      if (cols.has('final_decision_note')) {
        setParts.push(`final_decision_note = $${idx}`);
        values.push(note);
        idx += 1;
      }
      if (cols.has('accepted_at')) {
        setParts.push(`accepted_at = CASE WHEN $2 = 'accepted' THEN NOW() ELSE accepted_at END`);
      }

      const updateSql = `
        UPDATE ebook_submissions
           SET ${setParts.join(', ')}
         WHERE submission_id = $1
         RETURNING *`;

      const updateRes = await client.query(updateSql, values);
      await addHistory(client, submissionId, current.status, nextStatus, `editorial_decision.${decision}`, actorId, note);
      await client.query('COMMIT');
      return updateRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async upsertFinance(submissionId, actorId, payload = {}) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const subRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = subRes.rows[0];
      if (!submission) throw notFound("Submission not found");
      const currentRes = await client.query(`SELECT * FROM ebook_finance_clearances WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      let result;
      if (currentRes.rows[0]) {
        const current = currentRes.rows[0];
        const res = await client.query(
          `UPDATE ebook_finance_clearances SET
             invoice_number = COALESCE($2, invoice_number), currency_code = COALESCE($3, currency_code), amount_due = COALESCE($4, amount_due),
             amount_paid = COALESCE($5, amount_paid), waiver_requested = COALESCE($6, waiver_requested), waiver_percentage = COALESCE($7, waiver_percentage),
             waiver_reason = COALESCE($8, waiver_reason), payment_status = COALESCE($9, payment_status), payment_reference = COALESCE($10, payment_reference),
             receipt_number = COALESCE($11, receipt_number), reviewed_by = $12, review_note = COALESCE($13, review_note),
             cleared_at = CASE WHEN COALESCE($9, payment_status) = 'cleared' THEN NOW() ELSE cleared_at END, updated_at = NOW()
           WHERE submission_id = $1 RETURNING *`,
          [submissionId, payload.invoice_number || null, payload.currency_code || null, payload.amount_due ?? null, payload.amount_paid ?? null, payload.waiver_requested ?? null, payload.waiver_percentage ?? null, payload.waiver_reason || null, payload.payment_status || null, payload.payment_reference || null, payload.receipt_number || null, actorId, payload.review_note || null]
        );
        result = res.rows[0];
      } else {
        const res = await client.query(
          `INSERT INTO ebook_finance_clearances (
             submission_id, invoice_number, currency_code, amount_due, amount_paid, waiver_requested, waiver_percentage,
             waiver_reason, payment_status, payment_reference, receipt_number, reviewed_by, review_note, cleared_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, CASE WHEN $9 = 'cleared' THEN NOW() ELSE NULL END)
           RETURNING *`,
          [submissionId, payload.invoice_number || null, payload.currency_code || 'ETB', payload.amount_due ?? 0, payload.amount_paid ?? 0, payload.waiver_requested ?? false, payload.waiver_percentage ?? null, payload.waiver_reason || null, payload.payment_status || 'pending', payload.payment_reference || null, payload.receipt_number || null, actorId, payload.review_note || null]
        )
        result = res.rows[0];
      }
      const nextStatus = result.payment_status === 'cleared' && submission.status === 'accepted' ? 'finance_cleared' : submission.status;
      if (nextStatus !== submission.status) {
        await client.query(`UPDATE ebook_submissions SET status = $2, updated_at = NOW() WHERE submission_id = $1`, [submissionId, nextStatus]);
      }
      await addHistory(client, submissionId, submission.status, nextStatus, `finance.${result.payment_status}`, actorId, payload.review_note || null);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async upsertProduction(submissionId, actorId, payload = {}) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const subRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = subRes.rows[0];
      if (!submission) throw notFound("Submission not found");
      const currentRes = await client.query(`SELECT * FROM ebook_production WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      let result;
      if (currentRes.rows[0]) {
        const res = await client.query(
          `UPDATE ebook_production SET
             handled_by = $2, pdf_ready = COALESCE($3, pdf_ready), epub_ready = COALESCE($4, epub_ready),
             proof_sent_to_author = COALESCE($5, proof_sent_to_author), author_proof_approved = COALESCE($6, author_proof_approved),
             isbn = COALESCE($7, isbn), doi = COALESCE($8, doi), repository_path = COALESCE($9, repository_path), quality_note = COALESCE($10, quality_note),
             completed_at = CASE WHEN COALESCE($3, pdf_ready) = TRUE OR COALESCE($4, epub_ready) = TRUE THEN COALESCE(completed_at, NOW()) ELSE completed_at END,
             updated_at = NOW()
           WHERE submission_id = $1 RETURNING *`,
          [submissionId, actorId, payload.pdf_ready ?? null, payload.epub_ready ?? null, payload.proof_sent_to_author ?? null, payload.author_proof_approved ?? null, payload.isbn || null, payload.doi || null, payload.repository_path || null, payload.quality_note || null]
        );
        result = res.rows[0];
      } else {
        const res = await client.query(
          `INSERT INTO ebook_production (
             submission_id, handled_by, pdf_ready, epub_ready, proof_sent_to_author, author_proof_approved,
             isbn, doi, repository_path, quality_note, completed_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, CASE WHEN $3 = TRUE OR $4 = TRUE THEN NOW() ELSE NULL END) RETURNING *`,
          [submissionId, actorId, payload.pdf_ready ?? false, payload.epub_ready ?? false, payload.proof_sent_to_author ?? false, payload.author_proof_approved ?? false, payload.isbn || null, payload.doi || null, payload.repository_path || null, payload.quality_note || null]
        );
        result = res.rows[0];
      }
      const nextStatus = (result.pdf_ready || result.epub_ready) ? 'in_production' : submission.status;
      if (nextStatus !== submission.status) {
        await client.query(`UPDATE ebook_submissions SET status = $2, updated_at = NOW() WHERE submission_id = $1`, [submissionId, nextStatus]);
      }
      await addHistory(client, submissionId, submission.status, nextStatus, 'production.update', actorId, payload.quality_note || null);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async publishSubmission(submissionId, actorId, payload = {}) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const subRes = await client.query(`SELECT * FROM ebook_submissions WHERE submission_id = $1 FOR UPDATE`, [submissionId]);
      const submission = subRes.rows[0];
      if (!submission) throw notFound("Submission not found");
      if (!["accepted", "finance_cleared", "in_production"].includes(submission.status)) throw badRequest("Submission is not ready for publication");
      const productionRes = await client.query(`SELECT * FROM ebook_production WHERE submission_id = $1`, [submissionId]);
      const production = productionRes.rows[0];
      if (!production) throw badRequest("Production record is required before publication");
      const slug = payload.slug || String(submission.title || submission.submission_id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const publicationRes = await client.query(
        `INSERT INTO ebook_publications (
           submission_id, production_id, published_by, slug, access_level, embargo_until, license_name,
           landing_page_title, cover_image_path, published_at, is_public
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10)
         ON CONFLICT (submission_id)
         DO UPDATE SET
           production_id = EXCLUDED.production_id,
           published_by = EXCLUDED.published_by,
           slug = EXCLUDED.slug,
           access_level = EXCLUDED.access_level,
           embargo_until = EXCLUDED.embargo_until,
           license_name = EXCLUDED.license_name,
           landing_page_title = EXCLUDED.landing_page_title,
           cover_image_path = EXCLUDED.cover_image_path,
           published_at = NOW(),
           is_public = EXCLUDED.is_public,
           updated_at = NOW()
         RETURNING *`,
        [submissionId, production.production_id, actorId, slug, payload.access_level || 'open_access', payload.embargo_until || null, payload.license_name || 'All rights reserved', payload.landing_page_title || submission.title, payload.cover_image_path || null, payload.is_public ?? PUBLIC_ACCESS.has(payload.access_level || 'open_access')]
      );
      const updateRes = await client.query(`UPDATE ebook_submissions SET status = 'published', updated_at = NOW() WHERE submission_id = $1 RETURNING *`, [submissionId]);
      await addHistory(client, submissionId, submission.status, 'published', 'publish', actorId, payload.license_name || null);
      await client.query("COMMIT");
      return { submission: updateRes.rows[0], publication: publicationRes.rows[0] };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async logPublicAccess(publicationId, reqMeta = {}) {
    await pool.query(
      `INSERT INTO ebook_access_logs (publication_id, event_type, ip_address, user_agent, actor_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [publicationId, reqMeta.event_type || 'view', reqMeta.ip_address || null, reqMeta.user_agent || null, reqMeta.actor_id || null]
    );
  },
};
