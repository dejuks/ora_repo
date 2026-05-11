// services/ebookWorkflow.service.js
import path from "path";
import pool from "../../config/db.js";
import { sha256File } from "../utils/fileChecksum.js";
import { EbookSubmissionModel } from "../models/ebookSubmission.model.js";
import e from "express";

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

const PUBLIC_ACCESS = new Set(["open_access", "public"]);

const addHistory = async (
  client,
  submissionId,
  fromStatus,
  toStatus,
  action,
  actorId,
  note = null
) => {
  await client.query(
    `INSERT INTO ebook_workflow_history
      (submission_id, from_status, to_status, action, note, actor_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [submissionId, fromStatus, toStatus, action, note, actorId]
  );
};

const normalizeKeywords = (keywords) => {
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  if (typeof keywords === "string") {
    return keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeReviewerIds = (payload = {}) => {
  const ids = Array.isArray(payload.reviewer_ids)
    ? payload.reviewer_ids
    : payload.reviewer_id
    ? [payload.reviewer_id]
    : [];

  return [...new Set(ids.filter(Boolean))];
};

const getCurrentReviewRound = async (client, submissionId) => {
  const { rows } = await client.query(
    `SELECT COALESCE(MAX(round_no), 0)::int AS round_no
     FROM ebook_review_assignments
     WHERE submission_id = $1`,
    [submissionId]
  );
  return rows[0]?.round_no || 0;
};
// publish
export const publish = async (submissionId, actorId, payload = {}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const currentRes = await client.query(
      `SELECT *
        FROM ora_ebook_manuscripts
        WHERE id = $1
        FOR UPDATE`,
      [submissionId]
    );
    const current = currentRes.rows[0];

    if (!current) throw notFound("Submission not found");

    if (current.status !== "accepted") {
      throw badRequest("Submission is not accepted");
    }

    const updateRes = await client.query(
      ` UPDATE ora_ebook_manuscripts
        SET status = 'published',
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [submissionId]
    );
    const updated = updateRes.rows[0];
    await addHistory(
      client,
      submissionId,
      current.status,
      "published",
      "editor.published",
      actorId,
      JSON.stringify(payload)
    );
    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
         FROM ora_ebook_manuscripts
         WHERE author_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT es.*, ep.slug, ep.access_level, ep.is_public
         FROM ora_ebook_manuscripts es
         LEFT JOIN ebook_publications ep ON ep.submission_id = es.id
         WHERE es.author_id = $1
         ORDER BY COALESCE(es.updated_at, es.created_at) DESC
         LIMIT 50`,
        [userId]
      ),
    ]);

    return { summary: summaryRes.rows[0], submissions: itemsRes.rows };
  },

 async editorDashboard(userId = null) {
  const [summaryRes, itemsRes] = await Promise.all([
    // ================= SUMMARY =================
    pool.query(
      `
      SELECT
        COUNT(*)::int AS total_queue,

        COUNT(*) FILTER (
          WHERE status = 'submitted'
        )::int AS new_submissions,

        COUNT(*) FILTER (
          WHERE status = 'editor_screening'
        )::int AS screening_count,

        COUNT(*) FILTER (
          WHERE status = 'under_review'
        )::int AS review_count,

        COUNT(*) FILTER (
          WHERE status = 'revision_requested'
        )::int AS revision_count,

        COUNT(*) FILTER (
          WHERE status = 'accepted'
        )::int AS accepted_count,

        COUNT(*) FILTER (
          WHERE status = 'rejected'
        )::int AS rejected_count

      FROM ora_ebook_manuscripts
      `,
      []
    ),

    // ================= ITEMS =================
    pool.query(
      `
      SELECT
        es.id,
        es.author_id,
        es.title,
        es.abstract,
        es.file_path,
        es.isbn,
        es.language,
        es.publication_year,
        es.status,
        es.created_at,
        es.updated_at,

        u.full_name AS author_name,

        COUNT(DISTINCT era.assignment_id)::int AS assignment_count,

        COUNT(DISTINCT er.review_id)::int AS review_count

      FROM ora_ebook_manuscripts es

      LEFT JOIN users u
        ON u.uuid = es.author_id

      LEFT JOIN ebook_review_assignments era
        ON era.submission_id = es.id

      LEFT JOIN ebook_reviews er
        ON er.submission_id = es.id

      GROUP BY
        es.id,
        u.full_name

      ORDER BY
        COALESCE(es.updated_at, es.created_at) DESC

      LIMIT 100
      `,
      []
    ),
  ]);

  return {
    summary: summaryRes.rows[0] || {},
    manuscripts: itemsRes.rows || [],
    viewer_id: userId,
  };
},

  async reviewerDashboard(userId) {
    const [summaryRes, itemsRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_assignments,
                COUNT(*) FILTER (WHERE status = 'assigned')::int AS assigned_count,
                COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted_count,
                COUNT(*) FILTER (WHERE status = 'submitted')::int AS completed_count,
                COUNT(*) FILTER (
                  WHERE due_date IS NOT NULL
                    AND due_date < CURRENT_DATE
                    AND status IN ('assigned','accepted')
                )::int AS overdue_count
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
      ),
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
      ),
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
      ),
    ]);

    return { summary: summaryRes.rows[0], production: itemsRes.rows };
  },

  async publicCatalog({ search = "", access_level, limit = 20, offset = 0, page }) {
    const safeLimit = Number.isFinite(Number(limit))
      ? Math.min(Math.max(Number(limit), 1), 100)
      : 20;
    const safeOffset = Number.isFinite(Number(offset))
      ? Math.max(Number(offset), 0)
      : page
      ? (Math.max(Number(page), 1) - 1) * safeLimit
      : 0;

    const values = [];
    const clauses = [
      "ep.is_public = TRUE",
      "(ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)",
    ];

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      clauses.push(
        `(es.title ILIKE $${idx}
          OR es.subtitle ILIKE $${idx}
          OR es.abstract ILIKE $${idx}
          OR array_to_string(es.keywords, ',') ILIKE $${idx})`
      );
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
         SELECT file_path
         FROM ebook_submission_files esf
         WHERE esf.submission_id = es.submission_id
           AND esf.is_active = TRUE
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
  console.log("Submission ID:", submissionId);

  const submissionRes = await pool.query(
  `SELECT 
      era.*, 
      u.full_name AS reviewer_name, 
      u.email AS reviewer_email
   FROM ebook_review_assignments era
   LEFT JOIN users u ON u.uuid = era.reviewer_id
   WHERE era.submission_id = $1
   ORDER BY COALESCE(era.round_no, 1) DESC, era.assigned_at DESC`,
  [submissionId]
);

  const submission = submissionRes.rows[0];

  if (!submission) {
    console.error("No submission found for ID:", submissionId);
    throw notFound("Submission not found");
  }

  const [filesRes, assignmentsRes, reviewsRes, historyRes] = await Promise.all([
    pool.query(
      `SELECT *
       FROM ebook_submission_files
       WHERE submission_id = $1
       ORDER BY version_no DESC, created_at DESC`,
      [submissionId]
    ),
    pool.query(
      `SELECT era.*, u.full_name AS reviewer_name, u.email AS reviewer_email,era.round_no as round_no,
       FROM ebook_review_assignments era
       LEFT JOIN users u ON u.uuid = era.reviewer_id
       WHERE era.submission_id = $1
       ORDER BY COALESCE(era.round_no, 1) DESC, era.assigned_at DESC`,
      [submissionId]
    ),
    pool.query(
      `SELECT er.*, u.full_name AS reviewer_name, u.email AS reviewer_email
       FROM ebook_reviews er
       LEFT JOIN users u ON u.uuid = er.reviewer_id
       WHERE er.submission_id = $1
       ORDER BY COALESCE(er.round_no, 1) DESC, er.submitted_at DESC`,
      [submissionId]
    ),
    pool.query(
      `SELECT ewh.*, u.full_name AS actor_name, u.email AS actor_email
       FROM ebook_workflow_history ewh
       LEFT JOIN users u ON u.uuid = ewh.actor_id
       WHERE ewh.submission_id = $1
       ORDER BY ewh.acted_at DESC`,
      [submissionId]
    ),
  ]);

  return {
    submission,
    files: filesRes.rows,
    assignments: assignmentsRes.rows,
    reviews: reviewsRes.rows,
    history: historyRes.rows,
  };
},

  async createSubmission(payload = {}, actorId, file = null, fileRole = "manuscript") {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const created = await EbookSubmissionModel.create(payload, client);

      if (file) {
        const checksum = await sha256File(file.path);

        await client.query(
          `INSERT INTO ebook_submission_files (
             submission_id, version_no, file_role, original_name, stored_name, file_path,
             mime_type, file_size_bytes, checksum_sha256, uploaded_by
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            created.submission_id,
            created.current_version_no || 1,
            fileRole,
            file.originalname,
            file.filename,
            path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
            file.mimetype,
            file.size,
            checksum,
            actorId || created.author_id,
          ]
        );
      }

      await addHistory(
        client,
        created.submission_id,
        null,
        created.status,
        "create_submission",
        actorId || created.author_id,
        "Submission created"
      );

      await client.query("COMMIT");

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
         LEFT JOIN ebook_submission_files esf
           ON esf.submission_id = es.submission_id
          AND esf.is_active = TRUE
         WHERE es.submission_id = $1
         GROUP BY es.submission_id, u.full_name`,
        [created.submission_id]
      );

      return createdRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async submitManuscript(submissionId, actorId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Submission not found");
      if (!["draft", "revision_requested"].includes(current.status)) {
        throw badRequest("Submission is not ready for submit");
      }

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = 'submitted',
             submitted_at = NOW(),
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId]
      );

      await addHistory(
        client,
        submissionId,
        current.status,
        "submitted",
        "submit",
        actorId,
        "Author submitted manuscript"
      );

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

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Submission not found");
      if (!["revision_requested", "rejected", "draft"].includes(current.status)) {
        throw badRequest("Submission cannot be resubmitted");
      }

      const metadata = payload.metadata || {};
      const patchKeys = [
        "title",
        "subtitle",
        "abstract",
        "category",
        "language",
        "publication_year",
        "target_audience",
        "requires_bpc",
        "bpc_amount",
        "keywords",
      ];

      const entries = Object.entries(metadata).filter(
        ([key, value]) => patchKeys.includes(key) && value !== undefined
      );

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
          `UPDATE ebook_submissions
           SET ${sets.join(", ")}, updated_at = NOW()
           WHERE submission_id = $${values.length}
           RETURNING *`,
          values
        );
        updated = updatedRes.rows[0];
      }

      const submitRes = await client.query(
        `UPDATE ebook_submissions
         SET status = 'submitted',
             final_decision = NULL,
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId]
      );

      updated = submitRes.rows[0];

      await addHistory(
        client,
        submissionId,
        current.status,
        "submitted",
        "resubmit",
        actorId,
        payload.reason || "Author resubmitted revised manuscript"
      );

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

    const currentRes = await pool.query(
      `SELECT submission_id, current_version_no
       FROM ebook_submissions
       WHERE submission_id = $1`,
      [submissionId]
    );
    const current = currentRes.rows[0];

    if (!current) throw notFound("Submission not found");

    const checksum = await sha256File(file.path);

    const insertRes = await pool.query(
      `INSERT INTO ebook_submission_files (
         submission_id, version_no, file_role, original_name, stored_name,
         file_path, mime_type, file_size_bytes, checksum_sha256, uploaded_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
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

  async editorScreening(submissionId, actorId, payload = {}) {
    const rawDecision = String(payload?.decision || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const decisionMap = {
      screened: "editor_screening",
      mark_screened: "editor_screening",
      pass: "editor_screening",
      request_revision: "revision_requested",
      revision_requested: "revision_requested",
      revise: "revision_requested",
      reject: "rejected",
      rejected: "rejected",
    };

    const nextStatus = decisionMap[rawDecision];
    if (!nextStatus) {
      throw badRequest(
        "Invalid screening decision. Use screened, request_revision, or reject."
      );
    }

    const note =
      payload?.note ??
      payload?.comments ??
      payload?.editor_note ??
      null;

    const screeningSummary = {
      decision: rawDecision,
      scope_match: payload?.scope_match ?? null,
      plagiarism_check: payload?.plagiarism_check ?? null,
      formatting_check: payload?.formatting_check ?? null,
      completeness_check: payload?.completeness_check ?? null,
      language_check: payload?.language_check ?? null,
      relevance_score: payload?.relevance_score ?? null,
      quality_score: payload?.quality_score ?? null,
      recommended_action: payload?.recommended_action ?? null,
      comments: payload?.comments ?? null,
      note: note ?? null,
    };

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Submission not found");

      if (!["submitted", "editor_screening", "revision_requested"].includes(current.status)) {
        throw badRequest(
          `Submission is not in screening stage. Current status: ${current.status}`
        );
      }

      const finalDecision = nextStatus === "rejected" ? "reject" : null;

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = $2,
             editor_id = COALESCE(editor_id, $3),
             final_decision = $4,
             final_decision_note = $5,
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId, nextStatus, actorId, finalDecision, note]
      );

      const historyActionMap = {
        editor_screening: "editor.screened",
        revision_requested: "editor.revision_requested",
        rejected: "editor.rejected",
      };

      await client.query(
        `INSERT INTO ebook_workflow_history
          (submission_id, from_status, to_status, action, note, actor_id, acted_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          submissionId,
          current.status,
          nextStatus,
          historyActionMap[nextStatus],
          JSON.stringify(screeningSummary),
          actorId,
        ]
      );

      await client.query("COMMIT");

      return {
        message:
          nextStatus === "editor_screening"
            ? "Submission screened successfully."
            : nextStatus === "revision_requested"
            ? "Revision requested successfully."
            : "Submission rejected successfully.",
        submission: updateRes.rows[0],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async assignReviewer(submissionId, actorId, payload = {}) {
    const reviewerIds = normalizeReviewerIds(payload);
    if (!reviewerIds.length) {
      throw badRequest("At least one reviewer is required");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Submission not found");

      const skipStatusCheck = Boolean(payload?.skip_status_check);
      if (
        !skipStatusCheck &&
        !["editor_screening", "under_review"].includes(current.status)
      ) {
        throw badRequest(
          `Reviewers can only be assigned from editor_screening or under_review. Current status: ${current.status}`
        );
      }

      const reviewerCheck = await client.query(
        `SELECT DISTINCT u.uuid
         FROM users u
         INNER JOIN user_roles ur ON ur.user_id = u.uuid
         INNER JOIN roles r ON r.uuid = ur.role_id
         WHERE u.uuid = ANY($1::uuid[])
           AND UPPER(REPLACE(COALESCE(r.name, ''), ' ', '_')) = 'EBOOK_REVIEWER'`,
        [reviewerIds]
      );

      const validReviewerIds = reviewerCheck.rows.map((row) => row.uuid);
      const invalidReviewerIds = reviewerIds.filter((id) => !validReviewerIds.includes(id));

      if (invalidReviewerIds.length) {
        throw badRequest(
          `Some selected users are not valid reviewers: ${invalidReviewerIds.join(", ")}`
        );
      }

      const requestedRoundNo =
        Number.isInteger(Number(payload.round_no)) && Number(payload.round_no) > 0
          ? Number(payload.round_no)
          : null;

      const latestRoundNo = await getCurrentReviewRound(client, submissionId);
      const roundNo =
        requestedRoundNo ||
        (current.status === "editor_screening" && latestRoundNo === 0
          ? 1
          : latestRoundNo || 1);

      const existingRes = await client.query(
        `SELECT reviewer_id
         FROM ebook_review_assignments
         WHERE submission_id = $1
           AND round_no = $2`,
        [submissionId, roundNo]
      );
      const existingReviewerIds = new Set(existingRes.rows.map((row) => row.reviewer_id));
      const newReviewerIds = reviewerIds.filter((id) => !existingReviewerIds.has(id));

      if (!newReviewerIds.length) {
        throw badRequest("All selected reviewers are already assigned in this review round.");
      }

      const assignments = [];
      for (const reviewerId of newReviewerIds) {
        const assignmentRes = await client.query(
          `INSERT INTO ebook_review_assignments
            (submission_id, reviewer_id, assigned_by, status, due_date, invitation_note, round_no)
           VALUES ($1, $2, $3, 'assigned', $4, $5, $6)
           RETURNING *`,
          [
            submissionId,
            reviewerId,
            actorId,
            payload.due_date || null,
            payload.invitation_note || null,
            roundNo,
          ]
        );
        assignments.push(assignmentRes.rows[0]);
      }

      const nextStatus = "under_review";
      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = $2,
             editor_id = COALESCE(editor_id, $3),
             assigned_reviewer_count = (
               SELECT COUNT(*)::int
               FROM ebook_review_assignments
               WHERE submission_id = $1
                 AND round_no = $4
                 AND status IN ('assigned', 'accepted', 'submitted')
             ),
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId, nextStatus, actorId, roundNo]
      );

      await addHistory(
        client,
        submissionId,
        current.status,
        nextStatus,
        "editor.assigned_reviewer",
        actorId,
        JSON.stringify({
          round_no: roundNo,
          reviewer_ids: newReviewerIds,
          due_date: payload.due_date || null,
          note: payload.invitation_note || null,
        })
      );

      await client.query("COMMIT");

      return {
        assignments,
        submission: updateRes.rows[0],
        assigned_count: assignments.length,
        round_no: roundNo,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async reassignReviewer(submissionId, actorId, payload = {}) {
    const {
      from_assignment_id,
      to_reviewer_id,
      due_date = null,
      note = null,
    } = payload || {};

    if (!from_assignment_id || !to_reviewer_id) {
      throw badRequest("from_assignment_id and to_reviewer_id are required");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const current = currentRes.rows[0];
      if (!current) throw notFound("Submission not found");

      const fromRes = await client.query(
        `SELECT *
         FROM ebook_review_assignments
         WHERE assignment_id = $1
         FOR UPDATE`,
        [from_assignment_id]
      );
      const fromAssignment = fromRes.rows[0];

      if (!fromAssignment) throw notFound("Original assignment not found");
      if (fromAssignment.submission_id !== submissionId) {
        throw badRequest("Assignment does not belong to this submission");
      }
      if (fromAssignment.reviewer_id === to_reviewer_id) {
        throw badRequest("Please choose a different reviewer for reassignment");
      }

      await client.query(
        `UPDATE ebook_review_assignments
         SET status = 'declined',
             response_note = COALESCE($2, response_note),
             updated_at = NOW()
         WHERE assignment_id = $1`,
        [from_assignment_id, note || "Reviewer changed by editor"]
      );

      const reviewerCheck = await client.query(
        `SELECT DISTINCT u.uuid
         FROM users u
         INNER JOIN user_roles ur ON ur.user_id = u.uuid
         INNER JOIN roles r ON r.uuid = ur.role_id
         WHERE u.uuid = $1
           AND UPPER(REPLACE(COALESCE(r.name, ''), ' ', '_')) = 'EBOOK_REVIEWER'`,
        [to_reviewer_id]
      );

      if (!reviewerCheck.rows.length) {
        throw badRequest("Selected replacement user is not a valid reviewer");
      }

      const duplicateRes = await client.query(
        `SELECT assignment_id
         FROM ebook_review_assignments
         WHERE submission_id = $1
           AND reviewer_id = $2
           AND round_no = $3
         LIMIT 1`,
        [submissionId, to_reviewer_id, fromAssignment.round_no || 1]
      );

      if (
        duplicateRes.rows.length &&
        duplicateRes.rows[0].assignment_id !== from_assignment_id
      ) {
        throw badRequest("Reviewer already assigned in this round");
      }

      const assignmentRes = await client.query(
        `INSERT INTO ebook_review_assignments
          (submission_id, reviewer_id, assigned_by, status, due_date, invitation_note, round_no)
         VALUES ($1, $2, $3, 'assigned', $4, $5, $6)
         RETURNING *`,
        [
          submissionId,
          to_reviewer_id,
          actorId,
          due_date || fromAssignment.due_date || null,
          note || "Reviewer changed by editor",
          fromAssignment.round_no || 1,
        ]
      );

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = 'under_review',
             assigned_reviewer_count = (
               SELECT COUNT(*)::int
               FROM ebook_review_assignments
               WHERE submission_id = $1
                 AND round_no = $2
                 AND status IN ('assigned', 'accepted', 'submitted')
             ),
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId, fromAssignment.round_no || 1]
      );

      await addHistory(
        client,
        submissionId,
        current.status,
        updateRes.rows[0]?.status || current.status,
        "editor.reassigned_reviewer",
        actorId,
        JSON.stringify({
          from_assignment_id,
          from_reviewer_id: fromAssignment.reviewer_id,
          to_reviewer_id,
          round_no: fromAssignment.round_no || 1,
          note: note || null,
        })
      );

      await client.query("COMMIT");

      return {
        assignment: assignmentRes.rows[0],
        submission: updateRes.rows[0],
        round_no: fromAssignment.round_no || 1,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async assignPreviousReviewersForRevision(submissionId, actorId, payload = {}) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const subRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const submission = subRes.rows[0];
      if (!submission) throw notFound("Submission not found");

      const latestRoundNo = await getCurrentReviewRound(client, submissionId);
      if (!latestRoundNo) {
        throw badRequest("No previous reviewer assignments found for this submission.");
      }

      const previousRes = await client.query(
        `SELECT reviewer_id
         FROM ebook_review_assignments
         WHERE submission_id = $1
           AND round_no = $2`,
        [submissionId, latestRoundNo]
      );

      const reviewerIds = previousRes.rows.map((row) => row.reviewer_id);
      if (!reviewerIds.length) {
        throw badRequest("No previous reviewers found.");
      }

      const nextRoundNo = latestRoundNo + 1;

      const assignments = [];
      for (const reviewerId of reviewerIds) {
        const assignmentRes = await client.query(
          `INSERT INTO ebook_review_assignments
            (submission_id, reviewer_id, assigned_by, status, due_date, invitation_note, round_no)
           VALUES ($1, $2, $3, 'assigned', $4, $5, $6)
           RETURNING *`,
          [
            submissionId,
            reviewerId,
            actorId,
            payload.due_date || null,
            payload.invitation_note || "Assigned previous reviewers again",
            nextRoundNo,
          ]
        );
        assignments.push(assignmentRes.rows[0]);
      }

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = 'under_review',
             editor_id = COALESCE(editor_id, $2),
             assigned_reviewer_count = (
               SELECT COUNT(*)::int
               FROM ebook_review_assignments
               WHERE submission_id = $1
                 AND round_no = $3
             ),
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId, actorId, nextRoundNo]
      );

      await addHistory(
        client,
        submissionId,
        submission.status,
        "under_review",
        "editor.reassigned_previous_reviewers",
        actorId,
        JSON.stringify({
          from_round_no: latestRoundNo,
          to_round_no: nextRoundNo,
          reviewer_ids: reviewerIds,
          note: payload.invitation_note || null,
        })
      );

      await client.query("COMMIT");

      return {
        assignments,
        submission: updateRes.rows[0],
        assigned_count: assignments.length,
        round_no: nextRoundNo,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async removeReviewAssignment(assignmentId, actorId, note = null) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_review_assignments
         WHERE assignment_id = $1
         FOR UPDATE`,
        [assignmentId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Assignment not found");

      await client.query(
        `DELETE FROM ebook_review_assignments
         WHERE assignment_id = $1`,
        [assignmentId]
      );

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET assigned_reviewer_count = (
             SELECT COUNT(*)::int
             FROM ebook_review_assignments
             WHERE submission_id = $1
               AND round_no = $2
               AND status IN ('assigned', 'accepted', 'submitted')
           ),
           updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [current.submission_id, current.round_no || 1]
      );

      await addHistory(
        client,
        current.submission_id,
        updateRes.rows[0]?.status || null,
        updateRes.rows[0]?.status || null,
        "editor.removed_reviewer_assignment",
        actorId,
        note || `Removed reviewer assignment ${assignmentId}`
      );

      await client.query("COMMIT");
      return { ok: true, submission: updateRes.rows[0] || null };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async respondReviewAssignment(assignmentId, actorId, { status, response_note = null }) {
    if (!["accepted", "declined"].includes(status)) {
      throw badRequest("Invalid reviewer response");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_review_assignments
         WHERE assignment_id = $1
         FOR UPDATE`,
        [assignmentId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Assignment not found");
      if (current.reviewer_id !== actorId) {
        throw badRequest("You can only respond to your own assignments");
      }

      const acceptedAtSql = status === "accepted" ? "accepted_at = NOW()," : "";

      const res = await client.query(
        `UPDATE ebook_review_assignments
         SET status = $2,
             response_note = $3,
             ${acceptedAtSql}
             updated_at = NOW()
         WHERE assignment_id = $1
         RETURNING *`,
        [assignmentId, status, response_note]
      );

      await addHistory(
        client,
        current.submission_id,
        null,
        null,
        `review_assignment.${status}`,
        actorId,
        response_note
      );

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

      const assignmentRes = await client.query(
        `SELECT *
         FROM ebook_review_assignments
         WHERE assignment_id = $1
         FOR UPDATE`,
        [assignmentId]
      );
      const assignment = assignmentRes.rows[0];

      if (!assignment) throw notFound("Assignment not found");
      if (assignment.reviewer_id !== actorId) {
        throw badRequest("You can only submit your own review");
      }

      const reviewRes = await client.query(
        `INSERT INTO ebook_reviews (
          assignment_id, submission_id, reviewer_id, round_no,
          originality_score, quality_score, relevance_score,
          recommendation, comments_for_author, confidential_comments, submitted_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
        RETURNING *`,
        [
          assignmentId,
          assignment.submission_id,
          actorId,
          assignment.round_no || 1,
          payload.originality_score || null,
          payload.quality_score || null,
          payload.relevance_score || null,
          payload.recommendation,
          payload.comments_for_author || null,
          payload.confidential_comments || null,
        ]
      );

      await client.query(
        `UPDATE ebook_review_assignments
         SET status = 'submitted',
             completed_at = NOW(),
             updated_at = NOW()
         WHERE assignment_id = $1`,
        [assignmentId]
      );

      await addHistory(
        client,
        assignment.submission_id,
        "under_review",
        "under_review",
        "review_submitted",
        actorId,
        payload.recommendation || null
      );

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
    const decision = String(
      payload?.decision ??
        payload?.recommendation ??
        payload?.editorial_decision ??
        ""
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const note = payload?.note ?? payload?.comments ?? null;

    const map = {
      accept: "accepted",
      minor_revision: "revision_requested",
      major_revision: "revision_requested",
      reject: "rejected",
    };

    const nextStatus = map[decision];
    if (!nextStatus) {
      throw badRequest(
        "Decision must be one of accept, minor_revision, major_revision, reject"
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const current = currentRes.rows[0];

      if (!current) throw notFound("Submission not found");

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

      if (cols.has("final_decision")) {
        setParts.push(`final_decision = $${idx}`);
        values.push(decision);
        idx += 1;
      }

      if (cols.has("final_decision_note")) {
        setParts.push(`final_decision_note = $${idx}`);
        values.push(note);
        idx += 1;
      }

      if (cols.has("accepted_at") && nextStatus === "accepted") {
        setParts.push(`accepted_at = NOW()`);
      }

      const updateSql = `
        UPDATE ebook_submissions
        SET ${setParts.join(", ")}
        WHERE submission_id = $1
        RETURNING *`;

      const updateRes = await client.query(updateSql, values);

      await addHistory(
        client,
        submissionId,
        current.status,
        nextStatus,
        `editorial_decision.${decision}`,
        actorId,
        note
      );

      await client.query("COMMIT");
      return updateRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async upsertFinance(submissionId, actorId, payload = {}) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const subRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const submission = subRes.rows[0];

      if (!submission) throw notFound("Submission not found");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_finance_clearances
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );

      let result;

      if (currentRes.rows[0]) {
        const existing = currentRes.rows[0];
        const nextPaymentStatus = payload.payment_status || existing.payment_status || null;
        const clearedAtSql = nextPaymentStatus === "cleared" ? "cleared_at = NOW()," : "";

        const res = await client.query(
          `UPDATE ebook_finance_clearances
           SET invoice_number = COALESCE($2, invoice_number),
               currency_code = COALESCE($3, currency_code),
               amount_due = COALESCE($4, amount_due),
               amount_paid = COALESCE($5, amount_paid),
               waiver_requested = COALESCE($6, waiver_requested),
               waiver_percentage = COALESCE($7, waiver_percentage),
               waiver_reason = COALESCE($8, waiver_reason),
               payment_status = COALESCE($9, payment_status),
               payment_reference = COALESCE($10, payment_reference),
               receipt_number = COALESCE($11, receipt_number),
               reviewed_by = $12,
               review_note = COALESCE($13, review_note),
               ${clearedAtSql}
               updated_at = NOW()
           WHERE submission_id = $1
           RETURNING *`,
          [
            submissionId,
            payload.invoice_number || null,
            payload.currency_code || null,
            payload.amount_due ?? null,
            payload.amount_paid ?? null,
            payload.waiver_requested ?? null,
            payload.waiver_percentage ?? null,
            payload.waiver_reason || null,
            payload.payment_status || null,
            payload.payment_reference || null,
            payload.receipt_number || null,
            actorId,
            payload.review_note || null,
          ]
        );
        result = res.rows[0];
      } else {
        const nextPaymentStatus = payload.payment_status || "pending";
        const clearedAtValue = nextPaymentStatus === "cleared" ? new Date() : null;

        const res = await client.query(
          `INSERT INTO ebook_finance_clearances (
             submission_id, invoice_number, currency_code, amount_due, amount_paid,
             waiver_requested, waiver_percentage, waiver_reason, payment_status,
             payment_reference, receipt_number, reviewed_by, review_note, cleared_at
           ) VALUES (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
           )
           RETURNING *`,
          [
            submissionId,
            payload.invoice_number || null,
            payload.currency_code || "ETB",
            payload.amount_due ?? 0,
            payload.amount_paid ?? 0,
            payload.waiver_requested ?? false,
            payload.waiver_percentage ?? null,
            payload.waiver_reason || null,
            nextPaymentStatus,
            payload.payment_reference || null,
            payload.receipt_number || null,
            actorId,
            payload.review_note || null,
            clearedAtValue,
          ]
        );
        result = res.rows[0];
      }

      const nextStatus =
        result.payment_status === "cleared" && submission.status === "accepted"
          ? "finance_cleared"
          : submission.status;

      if (nextStatus !== submission.status) {
        await client.query(
          `UPDATE ebook_submissions
           SET status = $2,
               updated_at = NOW()
           WHERE submission_id = $1`,
          [submissionId, nextStatus]
        );
      }

      await addHistory(
        client,
        submissionId,
        submission.status,
        nextStatus,
        `finance.${result.payment_status}`,
        actorId,
        payload.review_note || null
      );

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

      const subRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const submission = subRes.rows[0];

      if (!submission) throw notFound("Submission not found");

      const currentRes = await client.query(
        `SELECT *
         FROM ebook_production
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );

      let result;

      if (currentRes.rows[0]) {
        const res = await client.query(
          `UPDATE ebook_production
           SET handled_by = $2,
               pdf_ready = COALESCE($3, pdf_ready),
               epub_ready = COALESCE($4, epub_ready),
               proof_sent_to_author = COALESCE($5, proof_sent_to_author),
               author_proof_approved = COALESCE($6, author_proof_approved),
               isbn = COALESCE($7, isbn),
               doi = COALESCE($8, doi),
               repository_path = COALESCE($9, repository_path),
               quality_note = COALESCE($10, quality_note),
               completed_at = CASE
                 WHEN COALESCE($3, pdf_ready) = TRUE OR COALESCE($4, epub_ready) = TRUE
                 THEN COALESCE(completed_at, NOW())
                 ELSE completed_at
               END,
               updated_at = NOW()
           WHERE submission_id = $1
           RETURNING *`,
          [
            submissionId,
            actorId,
            payload.pdf_ready ?? null,
            payload.epub_ready ?? null,
            payload.proof_sent_to_author ?? null,
            payload.author_proof_approved ?? null,
            payload.isbn || null,
            payload.doi || null,
            payload.repository_path || null,
            payload.quality_note || null,
          ]
        );
        result = res.rows[0];
      } else {
        const res = await client.query(
          `INSERT INTO ebook_production (
             submission_id, handled_by, pdf_ready, epub_ready, proof_sent_to_author,
             author_proof_approved, isbn, doi, repository_path, quality_note, completed_at
           ) VALUES (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
             CASE WHEN $3 = TRUE OR $4 = TRUE THEN NOW() ELSE NULL END
           )
           RETURNING *`,
          [
            submissionId,
            actorId,
            payload.pdf_ready ?? false,
            payload.epub_ready ?? false,
            payload.proof_sent_to_author ?? false,
            payload.author_proof_approved ?? false,
            payload.isbn || null,
            payload.doi || null,
            payload.repository_path || null,
            payload.quality_note || null,
          ]
        );
        result = res.rows[0];
      }

      const nextStatus =
        result.pdf_ready || result.epub_ready ? "in_production" : submission.status;

      if (nextStatus !== submission.status) {
        await client.query(
          `UPDATE ebook_submissions
           SET status = $2,
               updated_at = NOW()
           WHERE submission_id = $1`,
          [submissionId, nextStatus]
        );
      }

      await addHistory(
        client,
        submissionId,
        submission.status,
        nextStatus,
        "production.update",
        actorId,
        payload.quality_note || null
      );

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

      const subRes = await client.query(
        `SELECT *
         FROM ebook_submissions
         WHERE submission_id = $1
         FOR UPDATE`,
        [submissionId]
      );
      const submission = subRes.rows[0];

      if (!submission) throw notFound("Submission not found");
      if (!["accepted", "finance_cleared", "in_production"].includes(submission.status)) {
        throw badRequest("Submission is not ready for publication");
      }

      const productionRes = await client.query(
        `SELECT *
         FROM ebook_production
         WHERE submission_id = $1`,
        [submissionId]
      );
      const production = productionRes.rows[0];

      if (!production) {
        throw badRequest("Production record is required before publication");
      }

      const slug =
        payload.slug ||
        String(submission.title || submission.submission_id)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const publicationRes = await client.query(
        `INSERT INTO ebook_publications (
           submission_id, production_id, published_by, slug, access_level, embargo_until,
           license_name, landing_page_title, cover_image_path, published_at, is_public
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
        [
          submissionId,
          production.production_id,
          actorId,
          slug,
          payload.access_level || "open_access",
          payload.embargo_until || null,
          payload.license_name || "All rights reserved",
          payload.landing_page_title || submission.title,
          payload.cover_image_path || null,
          payload.is_public ??
            PUBLIC_ACCESS.has(payload.access_level || "open_access"),
        ]
      );

      const updateRes = await client.query(
        `UPDATE ebook_submissions
         SET status = 'published',
             updated_at = NOW()
         WHERE submission_id = $1
         RETURNING *`,
        [submissionId]
      );

      await addHistory(
        client,
        submissionId,
        submission.status,
        "published",
        "publish",
        actorId,
        payload.license_name || null
      );

      await client.query("COMMIT");
      return {
        submission: updateRes.rows[0],
        publication: publicationRes.rows[0],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async logPublicAccess(publicationId, reqMeta = {}) {
    await pool.query(
      `INSERT INTO ebook_access_logs
        (publication_id, event_type, ip_address, user_agent, actor_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        publicationId,
        reqMeta.event_type || "view",
        reqMeta.ip_address || null,
        reqMeta.user_agent || null,
        reqMeta.actor_id || null,
      ]
    );
  },

  // ==================== PUBLIC METHODS ====================

  async getTrendingEbooks({ limit = 10 } = {}) {
    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language, es.category,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
            AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
          ORDER BY ep.downloads DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getNewReleases({ limit = 10 } = {}) {
    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language, es.category,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
       ORDER BY ep.published_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getFeaturedEbooks({ limit = 6 } = {}) {
    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language, es.category,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND ep.is_featured = TRUE
       ORDER BY ep.published_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getPublicationBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.keywords, es.language, 
              es.category, es.publication_year,
              u.full_name AS author_name, u.uuid AS author_id,
              epd.pdf_ready, epd.epub_ready, epd.isbn, epd.doi
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       LEFT JOIN ebook_production epd ON epd.submission_id = es.submission_id
       WHERE ep.slug = $1
         AND ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)`,
      [slug]
    );
    return rows[0] || null;
  },

  async getPublicationById(id) {
    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.keywords, es.language, 
              es.category, es.publication_year,
              u.full_name AS author_name, u.uuid AS author_id,
              epd.pdf_ready, epd.epub_ready, epd.isbn, epd.doi
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       LEFT JOIN ebook_production epd ON epd.submission_id = es.submission_id
       WHERE ep.publication_id = $1
         AND ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)`,
      [id]
    );
    return rows[0] || null;
  },

  async getEbookFile(publicationId, format) {
    const { rows } = await pool.query(
      `SELECT ef.*, ep.publication_id
       FROM ebook_publication_files ef
       INNER JOIN ebook_publications ep ON ep.publication_id = ef.publication_id
       WHERE ef.publication_id = $1
         AND ef.file_format = $2
         AND ef.is_active = TRUE
         AND ep.is_public = TRUE`,
      [publicationId, format]
    );
    return rows[0] || null;
  },

  async getSimilarPublications(publicationId, { limit = 5 } = {}) {
    const publication = await this.getPublicationById(publicationId);
    if (!publication) return [];

    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND ep.publication_id != $1
         AND es.category = $2
       LIMIT $3`,
      [publicationId, publication.category, limit]
    );
    return rows;
  },

  async getAllCategories() {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(es.submission_id)::int as ebook_count
       FROM categories c
       LEFT JOIN ebook_submissions es ON es.category = c.name 
         AND es.status = 'published'
       LEFT JOIN ebook_publications ep ON ep.submission_id = es.submission_id
         AND ep.is_public = TRUE
       GROUP BY c.id, c.name,  c.created_at, c.updated_at
       ORDER BY ebook_count DESC`
    );
    return rows;
  },

  async getPublicationsByCategory(slug, { limit = 20, page = 1 } = {}) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND es.category = $1
       ORDER BY ep.published_at DESC
       LIMIT $2 OFFSET $3`,
      [slug, limit, offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int as total
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND es.category = $1`,
      [slug]
    );

    return {
      rows,
      total: countRes.rows[0]?.total || 0,
      page,
      limit
    };
  },

  async getAllAuthors({ limit = 20, page = 1, sort = 'downloads' } = {}) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT u.uuid as id, u.full_name, u.email, u.bio, u.avatar,
              COUNT(DISTINCT es.submission_id)::int as publication_count,
              COALESCE(SUM(ep.downloads), 0) as total_downloads,
              COALESCE(AVG(es.rating), 0) as avg_rating
       FROM users u
       LEFT JOIN ebook_submissions es ON es.author_id = u.uuid 
         AND es.status = 'published'
       LEFT JOIN ebook_publications ep ON ep.submission_id = es.submission_id
       GROUP BY u.uuid, u.full_name, u.email, u.bio, u.avatar
       ORDER BY ${sort === 'downloads' ? 'total_downloads' : 'publication_count'} DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int as total
       FROM users
       WHERE role = 'author'`
    );

    return {
      rows,
      total: countRes.rows[0]?.total || 0,
      page,
      limit
    };
  },

  async getTopAuthors({ limit = 10, sortBy = 'downloads' } = {}) {
    const { rows } = await pool.query(
      `SELECT u.uuid as id, u.full_name,
              COUNT(DISTINCT es.submission_id)::int as publication_count,
              COALESCE(SUM(ep.downloads), 0) as total_downloads,
              COALESCE(AVG(es.rating), 0) as avg_rating
       FROM users u
       LEFT JOIN ebook_submissions es ON es.author_id = u.uuid 
         AND es.status = 'published'
       LEFT JOIN ebook_publications ep ON ep.submission_id = es.submission_id
       GROUP BY u.uuid, u.full_name
       ORDER BY ${sortBy === 'downloads' ? 'total_downloads' : 'publication_count'} DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getAuthorDetails(authorId) {
    const { rows } = await pool.query(
      `SELECT u.uuid as id, u.full_name, u.email, u.bio, u.avatar,
              COUNT(DISTINCT es.submission_id)::int as publication_count,
              COALESCE(SUM(ep.downloads), 0) as total_downloads,
              COALESCE(AVG(es.rating), 0) as avg_rating
       FROM users u
       LEFT JOIN ebook_submissions es ON es.author_id = u.uuid 
         AND es.status = 'published'
       LEFT JOIN ebook_publications ep ON ep.submission_id = es.submission_id
       WHERE u.uuid = $1
       GROUP BY u.uuid, u.full_name, u.email, u.bio, u.avatar`,
      [authorId]
    );
    return rows[0] || null;
  },

  async getPublicationsByAuthor(authorId, { limit = 20, page = 1 } = {}) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language, es.category,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND es.author_id = $1
       ORDER BY ep.published_at DESC
       LIMIT $2 OFFSET $3`,
      [authorId, limit, offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int as total
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND es.author_id = $1`,
      [authorId]
    );

    return {
      rows,
      total: countRes.rows[0]?.total || 0,
      page,
      limit
    };
  },

  async searchPublications(query, { limit = 20, page = 1, category, language } = {}) {
    const offset = (page - 1) * limit;
    const values = [`%${query}%`];
    let whereClause = `(es.title ILIKE $1 OR es.subtitle ILIKE $1 OR es.abstract ILIKE $1)`;
    let idx = 2;

    if (category) {
      whereClause += ` AND es.category = $${idx}`;
      values.push(category);
      idx++;
    }

    if (language) {
      whereClause += ` AND es.language = $${idx}`;
      values.push(language);
      idx++;
    }

    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language, es.category,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND ${whereClause}
       ORDER BY ep.published_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    const countValues = values.slice(0, -2);
    const countRes = await pool.query(
      `SELECT COUNT(*)::int as total
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND ${whereClause}`,
      countValues
    );

    return {
      rows,
      total: countRes.rows[0]?.total || 0,
      page,
      limit,
      query
    };
  },

  async getPopularTags({ limit = 20 } = {}) {
    const { rows } = await pool.query(
      `SELECT t.*, COUNT(pt.publication_id)::int as usage_count
       FROM tags t
       LEFT JOIN publication_tags pt ON pt.tag_id = t.id
       LEFT JOIN ebook_publications ep ON ep.publication_id = pt.publication_id
         AND ep.is_public = TRUE
       GROUP BY t.id, t.name, t.slug, t.created_at
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getPublicationsByTag(tag, { limit = 20, page = 1 } = {}) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT ep.*, es.title, es.subtitle, es.abstract, es.language, es.category,
              u.full_name AS author_name
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       INNER JOIN publication_tags pt ON pt.publication_id = ep.publication_id
       INNER JOIN tags t ON t.id = pt.tag_id
       LEFT JOIN users u ON u.uuid = es.author_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND t.name = $1
       ORDER BY ep.published_at DESC
       LIMIT $2 OFFSET $3`,
      [tag, limit, offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int as total
       FROM ebook_publications ep
       INNER JOIN publication_tags pt ON pt.publication_id = ep.publication_id
       INNER JOIN tags t ON t.id = pt.tag_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND t.name = $1`,
      [tag]
    );

    return {
      rows,
      total: countRes.rows[0]?.total || 0,
      page,
      limit,
      tag
    };
  },

  async getPublicStats() {
    try {
      const [totalEbooks, totalDownloads, totalAuthors, languagesRes] = await Promise.all([
        pool.query(
          `SELECT COUNT(*)::int as count
           FROM ebook_publications ep
           WHERE ep.is_public = TRUE
             AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)`
        ),
        pool.query(
          `SELECT COALESCE(SUM(ep.downloads), 0)::int as total
           FROM ebook_publications ep
           WHERE ep.is_public = TRUE
             AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)`
        ),
        pool.query(
          `SELECT COUNT(DISTINCT es.author_id)::int as count
           FROM ebook_publications ep
           INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
           WHERE ep.is_public = TRUE
             AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)`
        ),
        pool.query(
          `SELECT COUNT(DISTINCT es.language)::int as count
           FROM ebook_publications ep
           INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
           WHERE ep.is_public = TRUE
             AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
             AND es.language IS NOT NULL`
        )
      ]);

      return {
        totalEbooks: totalEbooks.rows[0]?.count || 0,
        totalDownloads: totalDownloads.rows[0]?.total || 0,
        totalAuthors: totalAuthors.rows[0]?.count || 0,
        languages: languagesRes.rows[0]?.count || 0
      };
    } catch (error) {
      console.error('Error in getPublicStats:', error);
      // Return default values on error
      return {
        totalEbooks: 0,
        totalDownloads: 0,
        totalAuthors: 0,
        languages: 0
      };
    }
  },

  async getLanguageStats() {
    const { rows } = await pool.query(
      `SELECT es.language, COUNT(*)::int as count
       FROM ebook_publications ep
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND es.language IS NOT NULL
       GROUP BY es.language
       ORDER BY count DESC`
    );
    return rows;
  },

  async getPublicationTimeline() {
    const { rows } = await pool.query(
      `SELECT EXTRACT(YEAR FROM ep.published_at)::int as year, 
              COUNT(*)::int as count
       FROM ebook_publications ep
       WHERE ep.is_public = TRUE
         AND (ep.embargo_until IS NULL OR ep.embargo_until <= CURRENT_DATE)
         AND ep.published_at IS NOT NULL
       GROUP BY year
       ORDER BY year DESC`
    );
    return rows;
  },

  async getRecentActivity({ limit = 20 } = {}) {
    const { rows } = await pool.query(
      `SELECT eal.*, ep.slug, es.title
       FROM ebook_access_logs eal
       INNER JOIN ebook_publications ep ON ep.publication_id = eal.publication_id
       INNER JOIN ebook_submissions es ON es.submission_id = ep.submission_id
       ORDER BY eal.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getReadingStats() {
    const { rows } = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*)::int as download_count
       FROM ebook_access_logs
       WHERE event_type = 'download'
         AND created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    return rows;
  },

  async getShareMetadata(publicationId) {
    const publication = await this.getPublicationById(publicationId);
    if (!publication) return null;

    return {
      title: publication.title,
      description: publication.abstract || publication.subtitle || `${publication.title} by ${publication.author_name}`,
      image: publication.cover_image_path || null,
      url: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/ebooks/${publication.slug}`,
      author: publication.author_name
    };
  },

  async subscribeNewsletter(email, { preferences = {}, source, ip_address } = {}) {
    const existing = await pool.query(
      `SELECT * FROM newsletter_subscribers WHERE email = $1`,
      [email]
    );

    if (existing.rows[0]) {
      if (existing.rows[0].unsubscribed_at) {
        await pool.query(
          `UPDATE newsletter_subscribers
           SET unsubscribed_at = NULL,
               preferences = $2,
               updated_at = NOW()
           WHERE email = $1`,
          [email, JSON.stringify(preferences)]
        );
      }
      return { success: true, message: 'Already subscribed' };
    }

    await pool.query(
      `INSERT INTO newsletter_subscribers (email, preferences, source, ip_address, subscribed_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [email, JSON.stringify(preferences), source, ip_address]
    );

    return { success: true, message: 'Subscribed successfully' };
  }
};