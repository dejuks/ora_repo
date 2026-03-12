// src/ebook/ebook.controller.js
import { q } from "../../config/db.js";

// helper (already in your file)
async function logHistory({ ebookId, fromStatus, toStatus, action, note, actorId }) {
  await q(
    `INSERT INTO ebook_workflow_history(ebook_id, from_status, to_status, action, note, actor_id)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [ebookId, fromStatus || null, toStatus, action, note || null, actorId]
  );
}

// Single source of truth for table name.
// Your schema uses: review_assignments (NOT ebook_review_assignments)
const REVIEW_ASSIGNMENTS_TABLE = "review_assignments";

// ORA publishing workflow extensions
const FINANCE_TABLE = "ebook_finance_clearances";
const PUBLICATION_TABLE = "ebook_publications";
const ACCESS_LOGS_TABLE = "ebook_access_logs";

function buildUploadUrl(req, storedName) {
  if (!storedName) return null;
  return `${req.protocol}://${req.get("host")}/uploads/ebooks/${storedName}`;
}

 


/** CREATE submission (v1 + ORIGINAL file optional) - supports DRAFT / SUBMITTED */
export async function createEbook(req, res) {
  const authorId = req.user.uuid;
  const { title, abstract, keywords, status } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: "title required" });
  }

  const allowed = ["DRAFT", "SUBMITTED"];
  const finalStatus = allowed.includes(String(status || "").toUpperCase())
    ? String(status).toUpperCase()
    : "DRAFT";

  const submittedAt = finalStatus === "SUBMITTED" ? new Date() : null;

  const kwArr =
    typeof keywords === "string"
      ? keywords.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(keywords)
        ? keywords
        : null;

  await q("BEGIN");
  try {
    const ebook = await q(
      `INSERT INTO ebooks(author_id, title, abstract, keywords, status, submitted_at)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [authorId, title.trim(), abstract || null, kwArr, finalStatus, submittedAt]
    );

    // ... keep rest same
    await q("COMMIT");
    return res.json({ success: true, data: ebook.rows[0] });
  } catch (err) {
    await q("ROLLBACK");
    return res.status(500).json({ success: false, message: err.message });
  }
}
/** READ: list my submissions */
export async function listMyEbooks(req, res) {
  const authorId = req.user.uuid;
  const rows = await q(
    `SELECT ebook_id, title, status, submitted_at, updated_at
     FROM ebooks
     WHERE author_id=$1 AND is_deleted=false
     ORDER BY COALESCE(submitted_at, updated_at) DESC`,
    [authorId],
  );
  res.json({ success: true, data: rows.rows });
}

/** READ: list all submissions (editor/admin) */
export async function listAllEbooks(req, res) {
  const { status } = req.query;
  const params = [];
  let where = `WHERE e.is_deleted=false`;
  if (status) {
    params.push(status);
    where += ` AND e.status=$${params.length}`;
  }

  const rows = await q(
    `SELECT e.ebook_id, e.title, e.status, e.submitted_at, e.updated_at,
            u.full_name AS author_name, u.email AS author_email
     FROM ebooks e
     JOIN users u ON u.uuid = e.author_id
     ${where}
     ORDER BY e.submitted_at DESC`,
    params,
  );
  res.json({ success: true, data: rows.rows });
}

/** READ: detail (author can only see own; editor/admin can see all) */
export async function getEbookDetail(req, res) {
  const userId = req.user.uuid;
  const { id } = req.params;

  // fetch ebook
  const ebook = await q(
    `SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`,
    [id],
  );
  if (!ebook.rows[0])
    return res.status(404).json({ success: false, message: "Not found" });

  // simple rule: author must own it unless elevated permission is granted elsewhere
  // (RBAC should already gate editor/admin routes; still safe to enforce)
  const isOwner = ebook.rows[0].author_id === userId;

  // load versions + files + history
  const versions = await q(
    `SELECT v.* FROM ebook_versions v
     WHERE v.ebook_id=$1
     ORDER BY v.version_no DESC`,
    [id],
  );

  const files = await q(
    `SELECT f.*, v.version_no
     FROM ebook_files f
     JOIN ebook_versions v ON v.version_id=f.version_id
     WHERE v.ebook_id=$1
     ORDER BY f.uploaded_at DESC`,
    [id],
  );

  const history = await q(
    `SELECT h.*, u.full_name AS actor_name
     FROM ebook_workflow_history h
     JOIN users u ON u.uuid = h.actor_id
     WHERE h.ebook_id=$1
     ORDER BY h.created_at DESC`,
    [id],
  );

  // If author: return only if owner
  if (!isOwner && !req.user.isStaff) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  res.json({
    success: true,
    data: {
      ebook: ebook.rows[0],
      versions: versions.rows,
      files: files.rows,
      history: history.rows,
    },
  });
}

/** UPDATE metadata (title/abstract/keywords) */
/** UPDATE metadata - supports editing DRAFT and submitting DRAFT -> SUBMITTED */
export async function updateEbook(req, res) {
  const authorId = req.user.uuid;
  const { id } = req.params;
  const { title, abstract, keywords, status } = req.body;

  const kwArr =
    typeof keywords === "string"
      ? keywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(keywords)
        ? keywords
        : null;

  const ebook = await q(
    `SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`,
    [id],
  );
  if (!ebook.rows[0])
    return res.status(404).json({ success: false, message: "Not found" });
  if (ebook.rows[0].author_id !== authorId)
    return res.status(403).json({ success: false, message: "Forbidden" });

  const editableStates = [
    "DRAFT",
    "SUBMITTED",
    "SCREENING",
    "REVISION_REQUESTED",
  ];
  if (!editableStates.includes(ebook.rows[0].status)) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot edit at this stage" });
  }

  // status transition: only allow author to submit draft
  let newStatus = ebook.rows[0].status;
  if (status) {
    const s = String(status).toUpperCase();
    if (ebook.rows[0].status === "DRAFT" && s === "SUBMITTED") {
      newStatus = "SUBMITTED";
    }
    // If you want allow SUBMITTED -> DRAFT, DO NOT (recommended no)
  }

  const updated = await q(
    `UPDATE ebooks
     SET title=COALESCE($1,title),
         abstract=COALESCE($2,abstract),
         keywords=COALESCE($3,keywords),
         status=$4,
         submitted_at = CASE
            WHEN $4='SUBMITTED' AND submitted_at IS NULL THEN NOW()
            ELSE submitted_at
         END,
         updated_at=NOW()
     WHERE ebook_id=$5
     RETURNING *`,
    [title || null, abstract || null, kwArr, newStatus, id]
  );

  await logHistory({
    ebookId: id,
    fromStatus: ebook.rows[0].status,
    toStatus: newStatus,
    action: newStatus !== ebook.rows[0].status ? "SUBMIT" : "UPDATE",
    note:
      newStatus !== ebook.rows[0].status
        ? "Draft submitted"
        : "Metadata updated",
    actorId: authorId,
  });

  res.json({ success: true, data: updated.rows[0] });
}

/** DELETE (soft delete) */
export async function deleteEbook(req, res) {
  const authorId = req.user.uuid;
  const { id } = req.params;

  const ebook = await q(
    `SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`,
    [id],
  );
  if (!ebook.rows[0])
    return res.status(404).json({ success: false, message: "Not found" });
  if (ebook.rows[0].author_id !== authorId)
    return res.status(403).json({ success: false, message: "Forbidden" });

  await q(`UPDATE ebooks SET is_deleted=true WHERE ebook_id=$1`, [id]);

  await logHistory({
    ebookId: id,
    fromStatus: ebook.rows[0].status,
    toStatus: ebook.rows[0].status,
    action: "DELETE",
    note: "Submission soft-deleted by author",
    actorId: authorId,
  });

  res.json({ success: true, message: "Deleted" });
}

/** Upload new file to current version (e.g. supplementary) */
export async function uploadFileToCurrentVersion(req, res) {
  const userId = req.user.uuid;
  const { id } = req.params;
  const { fileType } = req.body; // ORIGINAL|REVISED|SUPPLEMENTARY|FINAL_PDF...

  if (!req.file)
    return res.status(400).json({ success: false, message: "file required" });

  const ebook = await q(
    `SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`,
    [id],
  );
  if (!ebook.rows[0])
    return res.status(404).json({ success: false, message: "Not found" });

  // author must own unless staff
  const isOwner = ebook.rows[0].author_id === userId;
  if (!isOwner && !req.user.isStaff) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const versionId = ebook.rows[0].current_version_id;
  await q(
    `INSERT INTO ebook_files(version_id,file_type,original_name,stored_name,mime_type,size_bytes,uploaded_by)
     VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [
      versionId,
      fileType || "SUPPLEMENTARY",
      req.file.originalname,
      req.file.filename,
      req.file.mimetype,
      req.file.size,
      userId,
    ],
  );

  await logHistory({
    ebookId: id,
    fromStatus: ebook.rows[0].status,
    toStatus: ebook.rows[0].status,
    action: "UPLOAD_FILE",
    note: `Uploaded file (${fileType || "SUPPLEMENTARY"})`,
    actorId: userId,
  });

  res.json({ success: true, message: "Uploaded" });
}

/** Submit revision: creates new version, sets current_version_id, status stays REVISION_REQUESTED or moves back */
export async function submitRevision(req, res) {
  const authorId = req.user.uuid;
  const { id } = req.params;
  const { notes } = req.body;

  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "revised file required" });

  await q("BEGIN");
  try {
    const ebook = await q(
      `SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`,
      [id],
    );
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (ebook.rows[0].author_id !== authorId) {
      await q("ROLLBACK");
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // next version number
    const maxV = await q(
      `SELECT COALESCE(MAX(version_no),0) AS max_no FROM ebook_versions WHERE ebook_id=$1`,
      [id],
    );
    const nextNo = Number(maxV.rows[0].max_no) + 1;

    const v = await q(
      `INSERT INTO ebook_versions(ebook_id,version_no,is_final,submitted_by)
       VALUES($1,$2,false,$3) RETURNING *`,
      [id, nextNo, authorId],
    );

    await q(
      `INSERT INTO ebook_files(version_id,file_type,original_name,stored_name,mime_type,size_bytes,uploaded_by)
       VALUES($1,'REVISED',$2,$3,$4,$5,$6)`,
      [
        v.rows[0].version_id,
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size,
        authorId,
      ],
    );

    // status after resubmission (choose your policy)
    const fromStatus = ebook.rows[0].status;
    const toStatus = "SCREENING"; // common: revision comes back to editor screening
    await q(
      `UPDATE ebooks SET current_version_id=$1, status=$2 WHERE ebook_id=$3`,
      [v.rows[0].version_id, toStatus, id],
    );

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus,
      action: "RESUBMIT_REVISION",
      note: notes || "Author resubmitted revision",
      actorId: authorId,
    });

    await q("COMMIT");
    res.json({ success: true, message: "Revision submitted" });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}


// editor section 

/**
 * LIST screening queue (editor only)
 * Shows SUBMITTED + SCREENING (optional filter by status query)
 * GET /api/ebooks/editor/screening?status=SUBMITTED|SCREENING
 */
export async function listScreeningQueue(req, res) {
  try {
    const { status } = req.query;
    const params = [];
    let where = `WHERE e.is_deleted=false AND e.status IN ('SUBMITTED','SCREENING')`;

    if (status) {
      params.push(String(status).toUpperCase());
      where = `WHERE e.is_deleted=false AND e.status=$${params.length}`;
    }

    const rows = await q(
      `SELECT e.ebook_id, e.title, e.status, e.submitted_at, e.updated_at,
              u.full_name AS author_name, u.email AS author_email
       FROM ebooks e
       JOIN users u ON u.uuid = e.author_id
       ${where}
       ORDER BY e.submitted_at DESC`,
      params
    );

    res.json({ success: true, data: rows.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * START screening: SUBMITTED -> SCREENING
 * POST /api/ebooks/:id/editor/start-screening
 */
export async function startScreening(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;

  await q("BEGIN");
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const fromStatus = ebook.rows[0].status;
    if (fromStatus !== "SUBMITTED") {
      await q("ROLLBACK");
      return res.status(400).json({ success: false, message: "Only SUBMITTED can start screening" });
    }

    const updated = await q(
      `UPDATE ebooks SET status='SCREENING', updated_at=NOW() WHERE ebook_id=$1 RETURNING *`,
      [id]
    );

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus: "SCREENING",
      action: "START_SCREENING",
      note: "Editor started screening",
      actorId: editorId,
    });

    await q("COMMIT");
    res.json({ success: true, data: updated.rows[0] });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get screening form data: ebook + available reviewers
 * GET /api/ebooks/:id/screening-form
 */
export async function getScreeningFormData(req, res) {
  try {
    const { id } = req.params;

    const ebook = await q(
      `SELECT e.ebook_id, e.title, e.abstract, e.keywords, e.status, e.submitted_at,
              u.full_name AS author_name, u.email AS author_email
       FROM ebooks e
       JOIN users u ON u.uuid=e.author_id
       WHERE e.ebook_id=$1 AND e.is_deleted=false`,
      [id]
    );
    if (!ebook.rows[0]) return res.status(404).json({ success: false, message: "Not found" });

    // IMPORTANT:
    // You can adjust this query based on how you store reviewer role.
    // Option A (simple): users table has a "role" column (not shown in your schema) -> skip.
    // Option B (RBAC): user_roles + roles.name = 'PEER_REVIEWER' (recommended)
    const reviewers = await q(
      `SELECT DISTINCT u.uuid, u.full_name, u.email
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.uuid
       JOIN roles r ON r.uuid = ur.role_id
       WHERE LOWER(r.name) IN ('peer reviewer','reviewer','peer_reviewer')
       ORDER BY u.full_name ASC`
    );

    res.json({
      success: true,
      data: {
        ebook: ebook.rows[0],
        reviewers: reviewers.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Submit screening assessment:
 * - Insert screening_assessments
 * - Based on recommendedAction:
 *   SEND_TO_REVIEW -> create ebook_review_assignments + set ebook status UNDER_REVIEW
 *   REQUEST_REVISION -> set ebook status REVISION_REQUESTED
 *   REJECT -> set ebook status REJECTED
 *
 * POST /api/ebooks/:id/screening-assessment
 */
export async function submitScreeningAssessment(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;

  const {
    relevanceScore,
    scopeMatch,
    qualityScore,
    comments,
    recommendedAction, // SEND_TO_REVIEW | REQUEST_REVISION | REJECT
    reviewerIds = [],
  } = req.body;

  const action = String(recommendedAction || "").toUpperCase();

  if (!["SEND_TO_REVIEW", "REQUEST_REVISION", "REJECT"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid recommendedAction" });
  }

  if (action === "SEND_TO_REVIEW" && (!Array.isArray(reviewerIds) || reviewerIds.length === 0)) {
    return res.status(400).json({ success: false, message: "reviewerIds required for SEND_TO_REVIEW" });
  }

  await q("BEGIN");
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const fromStatus = ebook.rows[0].status;
    if (!["SUBMITTED", "SCREENING"].includes(fromStatus)) {
      await q("ROLLBACK");
      return res.status(400).json({ success: false, message: "Only SUBMITTED/SCREENING can be screened" });
    }

    // Save screening assessment
    await q(
      `INSERT INTO screening_assessments(
        ebook_id, editor_id, relevance_score, scope_match, quality_score, comments, recommended_action
       ) VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        id,
        editorId,
        relevanceScore ?? null,
        typeof scopeMatch === "boolean" ? scopeMatch : null,
        qualityScore ?? null,
        comments || null,
        action,
      ]
    );

    let toStatus = fromStatus;

    if (action === "REQUEST_REVISION") {
      toStatus = "REVISION_REQUESTED";
      await q(`UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`, [toStatus, id]);

      await logHistory({
        ebookId: id,
        fromStatus,
        toStatus,
        action: "REQUEST_REVISION",
        note: comments || "Revision requested from screening",
        actorId: editorId,
      });
    }

    if (action === "REJECT") {
      toStatus = "REJECTED";
      await q(`UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`, [toStatus, id]);

      await logHistory({
        ebookId: id,
        fromStatus,
        toStatus,
        action: "DESK_REJECT",
        note: comments || "Desk rejected at screening",
        actorId: editorId,
      });
    }

    if (action === "SEND_TO_REVIEW") {
      toStatus = "UNDER_REVIEW";
      await q(`UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`, [toStatus, id]);

      // Create review assignments
      for (const reviewerId of reviewerIds) {
        await q(
          `INSERT INTO ${REVIEW_ASSIGNMENTS_TABLE}(ebook_id, reviewer_id, assigned_by, status)
           VALUES($1,$2,$3,'PENDING')
           ON CONFLICT (ebook_id, reviewer_id) DO NOTHING`,
          [id, reviewerId, editorId]
        );
      }

      await logHistory({
        ebookId: id,
        fromStatus,
        toStatus,
        action: "SEND_TO_REVIEW",
        note: `Sent to review and assigned ${reviewerIds.length} reviewer(s)`,
        actorId: editorId,
      });
    }

    await q("COMMIT");
    res.json({ success: true, message: "Screening submitted", data: { ebook_id: id, status: toStatus } });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Simple endpoints if you want direct buttons (optional).
 * Your frontend already calls these in api/ebooks.js:
 * - requestRevision, sendToReview, deskReject
 * If you use submitScreeningAssessment, you may not need these.
 */

export async function requestRevision(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;
  const { note } = req.body || {};

  await q("BEGIN");
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const fromStatus = ebook.rows[0].status;
    if (!['SCREENING','SUBMITTED'].includes(fromStatus)) {
      await q('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only SUBMITTED/SCREENING can request revision' });
    }
    await q(`UPDATE ebooks SET status='REVISION_REQUESTED', updated_at=NOW() WHERE ebook_id=$1`, [id]);

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus: "REVISION_REQUESTED",
      action: "REQUEST_REVISION",
      note: note || "Revision requested",
      actorId: editorId,
    });

    await q("COMMIT");
    res.json({ success: true, message: "Revision requested" });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function sendToReview(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;
  const { reviewerIds = [] } = req.body || {};

  if (!Array.isArray(reviewerIds) || reviewerIds.length === 0) {
    return res.status(400).json({ success: false, message: "reviewerIds required" });
  }

  await q("BEGIN");
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const fromStatus = ebook.rows[0].status;

    if (!['SCREENING'].includes(fromStatus)) {
      await q('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only SCREENING can be sent to review (use start-screening + screening-assessment)' });
    }

    await q(`UPDATE ebooks SET status='UNDER_REVIEW', updated_at=NOW() WHERE ebook_id=$1`, [id]);

    for (const reviewerId of reviewerIds) {
      await q(
        `INSERT INTO ${REVIEW_ASSIGNMENTS_TABLE}(ebook_id, reviewer_id, assigned_by, status)
         VALUES($1,$2,$3,'PENDING')
         ON CONFLICT (ebook_id, reviewer_id) DO NOTHING`,
        [id, reviewerId, editorId]
      );
    }

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus: "UNDER_REVIEW",
      action: "SEND_TO_REVIEW",
      note: `Assigned ${reviewerIds.length} reviewer(s)`,
      actorId: editorId,
    });

    await q("COMMIT");
    res.json({ success: true, message: "Sent to review" });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deskReject(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;
  const { note } = req.body || {};

  await q("BEGIN");
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const fromStatus = ebook.rows[0].status;
    if (!['SCREENING','SUBMITTED'].includes(fromStatus)) {
      await q('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only SUBMITTED/SCREENING can be desk rejected' });
    }
    await q(`UPDATE ebooks SET status='REJECTED', updated_at=NOW() WHERE ebook_id=$1`, [id]);

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus: "REJECTED",
      action: "DESK_REJECT",
      note: note || "Desk rejected",
      actorId: editorId,
    });

    await q("COMMIT");
    res.json({ success: true, message: "Rejected" });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getReviewSummary(req, res) {
  try {
    const userId = req.user.uuid;
    const isStaff = !!req.user.isStaff; // you already use this pattern in getEbookDetail
    const { id } = req.params;

    // 1) Load ebook + author info
    const ebookRes = await q(
      `SELECT e.ebook_id, e.title, e.status, e.submitted_at, e.updated_at, e.author_id,
              u.full_name AS author_name, u.email AS author_email
       FROM ebooks e
       JOIN users u ON u.uuid = e.author_id
       WHERE e.ebook_id=$1 AND e.is_deleted=false`,
      [id]
    );

    const ebook = ebookRes.rows[0];
    if (!ebook) return res.status(404).json({ success: false, message: "Not found" });

    // 2) Access control: author or staff only
    const isOwner = ebook.author_id === userId;
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // 3) Assignments query: hide confidential_comments for authors
    const assignmentsSql = isStaff
      ? `
        SELECT a.assignment_id, a.ebook_id, a.reviewer_id, a.assigned_by,
               a.status, a.recommendation, a.comments, a.confidential_comments,
               a.assigned_at, a.accepted_at, a.completed_at,
               ru.full_name AS reviewer_name, ru.email AS reviewer_email
        FROM ${REVIEW_ASSIGNMENTS_TABLE} a
        JOIN users ru ON ru.uuid = a.reviewer_id
        WHERE a.ebook_id=$1
        ORDER BY a.assigned_at DESC
      `
      : `
        SELECT a.assignment_id, a.ebook_id, a.reviewer_id, a.assigned_by,
               a.status, a.recommendation, a.comments,
               NULL::text AS confidential_comments,
               a.assigned_at, a.accepted_at, a.completed_at,
               ru.full_name AS reviewer_name, ru.email AS reviewer_email
        FROM ${REVIEW_ASSIGNMENTS_TABLE} a
        JOIN users ru ON ru.uuid = a.reviewer_id
        WHERE a.ebook_id=$1
        ORDER BY a.assigned_at DESC
      `;

    const assignments = await q(assignmentsSql, [id]);

    return res.json({
      success: true,
      data: {
        ebook: {
          ebook_id: ebook.ebook_id,
          title: ebook.title,
          status: ebook.status,
          submitted_at: ebook.submitted_at,
          updated_at: ebook.updated_at,
          author_name: ebook.author_name,
          author_email: ebook.author_email,
        },
        assignments: assignments.rows,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/ebooks/:id/editor/accept
 */
export async function editorAccept(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;
  const { note } = req.body || {};

  await q("BEGIN");
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const fromStatus = ebook.rows[0].status;
    await q(`UPDATE ebooks SET status='ACCEPTED', updated_at=NOW() WHERE ebook_id=$1`, [id]);

    // ✅ Start finance stage (requires ebook_finance_clearances table)
    await q(
      `INSERT INTO ${FINANCE_TABLE}(ebook_id, status)
       VALUES($1,'PENDING')
       ON CONFLICT (ebook_id) DO NOTHING`,
      [id]
    );

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus: "ACCEPTED",
      action: "ACCEPT",
      note: note || "Accepted after review",
      actorId: editorId,
    });

    await q("COMMIT");
    res.json({ success: true, message: "Accepted" });
  } catch (err) {
    await q("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  }
}


// ================= REVIEWER =================

/**
 * GET /api/ebooks/reviewer/my-reviews
 */
export async function getMyReviews(req, res) {
  const reviewerId = req.user.uuid;

  try {
    const rows = await q(
      `
      SELECT
        a.assignment_id,
        a.ebook_id,
        a.status,
        a.assigned_at,
        a.accepted_at,
        a.completed_at,
        a.recommendation,
        e.title,
        e.status AS ebook_status,
        u.full_name AS author_name,
        u.email AS author_email
      FROM ${REVIEW_ASSIGNMENTS_TABLE} a
      JOIN ebooks e ON e.ebook_id = a.ebook_id
      JOIN users u ON u.uuid = e.author_id
      WHERE a.reviewer_id = $1
      ORDER BY a.assigned_at DESC
      `,
      [reviewerId]
    );

    return res.json({ success: true, data: rows.rows });
  } catch (err) {
    console.error("getMyReviews:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/ebooks/reviewer/:assignmentId/respond
 * body: { action: "accept" | "decline" }
 */
export async function respondToReview(req, res) {
  const reviewerId = req.user.uuid;
  const { assignmentId } = req.params;
  const { action } = req.body || {};

  if (!["accept", "decline"].includes(String(action || "").toLowerCase())) {
    return res.status(422).json({ success: false, message: "action must be accept or decline" });
  }

  try {
    const a = await q(
      `SELECT * FROM ${REVIEW_ASSIGNMENTS_TABLE} WHERE assignment_id=$1 AND reviewer_id=$2`,
      [assignmentId, reviewerId]
    );

    if (!a.rows[0]) return res.status(404).json({ success: false, message: "Assignment not found" });

    if (!['PENDING'].includes(a.rows[0].status)) {
      return res.status(409).json({ success: false, message: 'Only PENDING assignments can be responded to' });
    }

    if (String(action).toLowerCase() === "accept") {
      await q(
        `UPDATE ${REVIEW_ASSIGNMENTS_TABLE}
         SET status='ACCEPTED', accepted_at=NOW()
         WHERE assignment_id=$1 AND reviewer_id=$2`,
        [assignmentId, reviewerId]
      );

      await logHistory({
        ebookId: a.rows[0].ebook_id,
        fromStatus: null,
        toStatus: null,
        action: 'REVIEW_ACCEPT',
        note: `Reviewer accepted assignment ${assignmentId}`,
        actorId: reviewerId,
      });
      return res.json({ success: true, message: "Accepted" });
    }

    await q(
      `UPDATE ${REVIEW_ASSIGNMENTS_TABLE}
       SET status='DECLINED'
       WHERE assignment_id=$1 AND reviewer_id=$2`,
      [assignmentId, reviewerId]
    );

    await logHistory({
      ebookId: a.rows[0].ebook_id,
      fromStatus: null,
      toStatus: null,
      action: 'REVIEW_DECLINE',
      note: `Reviewer declined assignment ${assignmentId}`,
      actorId: reviewerId,
    });
    return res.json({ success: true, message: "Declined" });
  } catch (err) {
    console.error("respondToReview:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/ebooks/reviewer/:assignmentId/submit
 * body: { recommendation, comments, confidential_comments }
 */
export async function submitReview(req, res) {
  const reviewerId = req.user.uuid;
  const { assignmentId } = req.params;
  const { recommendation, comments, confidential_comments } = req.body || {};

  const allowed = ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"];
  const rec = String(recommendation || "").toUpperCase();

  if (!allowed.includes(rec)) {
    return res.status(422).json({
      success: false,
      message: `recommendation must be one of: ${allowed.join(", ")}`,
    });
  }

  try {
    const a = await q(
      `SELECT * FROM ${REVIEW_ASSIGNMENTS_TABLE} WHERE assignment_id=$1 AND reviewer_id=$2`,
      [assignmentId, reviewerId]
    );

    if (!a.rows[0]) return res.status(404).json({ success: false, message: "Assignment not found" });

    // optional rule: require ACCEPTED before submit
    if (a.rows[0].status !== "ACCEPTED") {
      return res.status(409).json({
        success: false,
        message: "Please accept the assignment before submitting a review",
      });
    }

    await q(
      `UPDATE ${REVIEW_ASSIGNMENTS_TABLE}
       SET status='COMPLETED',
           recommendation=$1,
           comments=$2,
           confidential_comments=$3,
           completed_at=NOW()
       WHERE assignment_id=$4 AND reviewer_id=$5`,
      [rec, comments || null, confidential_comments || null, assignmentId, reviewerId]
    );

    await logHistory({
      ebookId: a.rows[0].ebook_id,
      fromStatus: null,
      toStatus: null,
      action: 'REVIEW_SUBMIT',
      note: `Reviewer submitted review (${rec}) for assignment ${assignmentId}`,
      actorId: reviewerId,
    });

    return res.json({ success: true, message: "Review submitted" });
  } catch (err) {
    console.error("submitReview:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// ================= FINANCE =================

/**
 * GET /api/ebooks/finance/pending
 * Finance officer queue: accepted ebooks that are not finance-cleared.
 */
export async function listFinancePending(req, res) {
  try {
    const rows = await q(
      `
      SELECT
        e.ebook_id,
        e.title,
        e.status,
        e.submitted_at,
        e.updated_at,
        u.full_name AS author_name,
        u.email AS author_email,
        COALESCE(f.status,'PENDING') AS finance_status,
        f.amount,
        f.currency,
        f.reference,
        f.cleared_at
      FROM ebooks e
      JOIN users u ON u.uuid = e.author_id
      LEFT JOIN ${FINANCE_TABLE} f ON f.ebook_id = e.ebook_id
      WHERE e.is_deleted=false
        AND e.status IN ('ACCEPTED','FINANCE_PENDING','FINANCE_CLEARED')
        AND COALESCE(f.status,'PENDING') IN ('PENDING','DECLINED')
      ORDER BY e.updated_at DESC
      `
    );

    res.json({ success: true, data: rows.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/ebooks/:id/finance/decision
 * body: { action: 'clear'|'waive'|'decline', amount?, currency?, reference?, note? }
 */
export async function financeDecision(req, res) {
  const officerId = req.user.uuid;
  const { id } = req.params;
  const { action, amount, currency, reference, note } = req.body || {};

  const act = String(action || "").toLowerCase();
  if (!['clear', 'waive', 'decline'].includes(act)) {
    return res.status(422).json({ success: false, message: 'action must be clear, waive, or decline' });
  }

  await q('BEGIN');
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const financeStatus = act === 'clear' ? 'CLEARED' : act === 'waive' ? 'WAIVED' : 'DECLINED';
    const isCleared = financeStatus === 'CLEARED' || financeStatus === 'WAIVED';

    await q(
      `
      INSERT INTO ${FINANCE_TABLE}(ebook_id, status, amount, currency, reference, note, cleared_by, cleared_at)
      VALUES($1,$2,$3,$4,$5,$6,$7, CASE WHEN $2 IN ('CLEARED','WAIVED') THEN NOW() ELSE NULL END)
      ON CONFLICT (ebook_id) DO UPDATE
      SET status=EXCLUDED.status,
          amount=COALESCE(EXCLUDED.amount, ${FINANCE_TABLE}.amount),
          currency=COALESCE(EXCLUDED.currency, ${FINANCE_TABLE}.currency),
          reference=COALESCE(EXCLUDED.reference, ${FINANCE_TABLE}.reference),
          note=COALESCE(EXCLUDED.note, ${FINANCE_TABLE}.note),
          cleared_by=EXCLUDED.cleared_by,
          cleared_at=EXCLUDED.cleared_at
      `,
      [id, financeStatus, amount ?? null, currency || null, reference || null, note || null, officerId]
    );

    const fromStatus = ebook.rows[0].status;
    const toStatus = isCleared ? 'FINANCE_CLEARED' : 'FINANCE_PENDING';

    await q(`UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`, [toStatus, id]);

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus,
      action: isCleared ? 'FINANCE_CLEARED' : 'FINANCE_DECLINED',
      note: note || (isCleared ? 'Finance clearance completed' : 'Finance clearance declined'),
      actorId: officerId,
    });

    await q('COMMIT');
    res.json({
      success: true,
      message: 'Finance updated',
      data: { ebook_id: id, status: toStatus, finance_status: financeStatus },
    });
  } catch (err) {
    await q('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  }
}


// ================= DIGITAL PRODUCTION + PUBLICATION =================

/**
 * GET /api/ebooks/production/queue
 */
export async function listProductionQueue(req, res) {
  try {
    const rows = await q(
      `
      SELECT
        e.ebook_id,
        e.title,
        e.status,
        e.updated_at,
        u.full_name AS author_name,
        u.email AS author_email
      FROM ebooks e
      JOIN users u ON u.uuid = e.author_id
      WHERE e.is_deleted=false
        AND e.status IN ('FINANCE_CLEARED','IN_PRODUCTION')
      ORDER BY e.updated_at DESC
      `
    );

    res.json({ success: true, data: rows.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/ebooks/:id/production/upload-final
 * multipart fields: pdf?, epub?, cover?
 */
export async function uploadFinalOutputs(req, res) {
  const managerId = req.user.uuid;
  const { id } = req.params;

  const pdfFile = req.files?.pdf?.[0] || null;
  const epubFile = req.files?.epub?.[0] || null;
  const coverFile = req.files?.cover?.[0] || null;

  if (!pdfFile && !epubFile && !coverFile) {
    return res.status(400).json({ success: false, message: 'At least one file is required (pdf, epub, cover)' });
  }

  await q('BEGIN');
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const fromStatus = ebook.rows[0].status;
    if (!['FINANCE_CLEARED', 'IN_PRODUCTION'].includes(fromStatus)) {
      await q('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only FINANCE_CLEARED/IN_PRODUCTION can upload final outputs' });
    }

    const maxV = await q(
      `SELECT COALESCE(MAX(version_no),0) AS max_no FROM ebook_versions WHERE ebook_id=$1`,
      [id]
    );
    const nextNo = Number(maxV.rows[0].max_no) + 1;

    const v = await q(
      `INSERT INTO ebook_versions(ebook_id,version_no,is_final,submitted_by)
       VALUES($1,$2,true,$3) RETURNING *`,
      [id, nextNo, managerId]
    );

    await q(`UPDATE ebooks SET current_version_id=$1 WHERE ebook_id=$2`, [v.rows[0].version_id, id]);

    const insertFile = async (file, fileType) => {
      if (!file) return;
      await q(
        `INSERT INTO ebook_files(version_id,file_type,original_name,stored_name,mime_type,size_bytes,uploaded_by)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [
          v.rows[0].version_id,
          fileType,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
          managerId,
        ]
      );
    };

    await insertFile(pdfFile, 'FINAL_PDF');
    await insertFile(epubFile, 'FINAL_EPUB');
    await insertFile(coverFile, 'COVER');

    const toStatus = 'IN_PRODUCTION';
    await q(`UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`, [toStatus, id]);

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus,
      action: 'UPLOAD_FINAL_FILES',
      note: 'Digital production files uploaded',
      actorId: managerId,
    });

    await q('COMMIT');

    res.json({
      success: true,
      message: 'Final outputs uploaded',
      data: {
        ebook_id: id,
        status: toStatus,
        files: {
          pdf: pdfFile ? buildUploadUrl(req, pdfFile.filename) : null,
          epub: epubFile ? buildUploadUrl(req, epubFile.filename) : null,
          cover: coverFile ? buildUploadUrl(req, coverFile.filename) : null,
        },
      },
    });
  } catch (err) {
    await q('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/ebooks/:id/production/publish
 * body: { isbn?, doi?, access_type: 'OPEN'|'RESTRICTED'|'EMBARGO', embargo_until?, note? }
 */
export async function publishEbook(req, res) {
  const managerId = req.user.uuid;
  const { id } = req.params;
  const { isbn, doi, access_type, embargo_until, note } = req.body || {};

  const access = String(access_type || 'OPEN').toUpperCase();
  if (!['OPEN', 'RESTRICTED', 'EMBARGO'].includes(access)) {
    return res.status(422).json({ success: false, message: 'access_type must be OPEN, RESTRICTED, or EMBARGO' });
  }

  await q('BEGIN');
  try {
    const ebook = await q(`SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false`, [id]);
    if (!ebook.rows[0]) {
      await q('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const fromStatus = ebook.rows[0].status;
    if (fromStatus !== 'IN_PRODUCTION') {
      await q('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only IN_PRODUCTION can be published' });
    }

    const files = await q(
      `SELECT file_id, file_type, stored_name
       FROM ebook_files
       WHERE version_id=$1 AND file_type IN ('FINAL_PDF','FINAL_EPUB','COVER')
       ORDER BY uploaded_at DESC`,
      [ebook.rows[0].current_version_id]
    );
    const pick = (t) => files.rows.find((x) => x.file_type === t) || null;
    const pdf = pick('FINAL_PDF');
    const epub = pick('FINAL_EPUB');
    const cover = pick('COVER');

    await q(
      `
      INSERT INTO ${PUBLICATION_TABLE}(
        ebook_id, isbn, doi, access_type, embargo_until,
        final_pdf_file_id, final_epub_file_id, cover_file_id,
        published_by, published_at
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      ON CONFLICT (ebook_id) DO UPDATE
      SET isbn=EXCLUDED.isbn,
          doi=EXCLUDED.doi,
          access_type=EXCLUDED.access_type,
          embargo_until=EXCLUDED.embargo_until,
          final_pdf_file_id=EXCLUDED.final_pdf_file_id,
          final_epub_file_id=EXCLUDED.final_epub_file_id,
          cover_file_id=EXCLUDED.cover_file_id,
          published_by=EXCLUDED.published_by,
          published_at=EXCLUDED.published_at
      `,
      [
        id,
        isbn || null,
        doi || null,
        access,
        embargo_until ? new Date(embargo_until) : null,
        pdf?.file_id || null,
        epub?.file_id || null,
        cover?.file_id || null,
        managerId,
      ]
    );

    const toStatus = 'PUBLISHED';
    await q(`UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`, [toStatus, id]);

    await logHistory({
      ebookId: id,
      fromStatus,
      toStatus,
      action: 'PUBLISH',
      note: note || 'Published to public library',
      actorId: managerId,
    });

    await q('COMMIT');
    res.json({ success: true, message: 'Published', data: { ebook_id: id, status: toStatus } });
  } catch (err) {
    await q('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  }
}


// ================= PUBLIC LIBRARY =================

/**
 * GET /api/ebooks/public?q=...
 */
export async function publicListPublished(req, res) {
  try {
    const qtxt = String(req.query.q || '').trim();
    const params = [];
    let where = `WHERE e.is_deleted=false AND e.status='PUBLISHED'`;

    if (qtxt) {
      params.push(`%${qtxt.toLowerCase()}%`);
      where += ` AND (LOWER(e.title) LIKE $${params.length} OR LOWER(COALESCE(e.abstract,'')) LIKE $${params.length})`;
    }

    const rows = await q(
      `
      SELECT
        e.ebook_id,
        e.title,
        e.abstract,
        e.keywords,
        e.updated_at,
        u.full_name AS author_name,
        p.isbn,
        p.doi,
        p.access_type,
        p.embargo_until
      FROM ebooks e
      JOIN users u ON u.uuid = e.author_id
      LEFT JOIN ${PUBLICATION_TABLE} p ON p.ebook_id = e.ebook_id
      ${where}
      ORDER BY e.updated_at DESC
      `,
      params
    );

    res.json({ success: true, data: rows.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/ebooks/public/:id
 */
export async function publicEbookDetail(req, res) {
  try {
    const { id } = req.params;

    const row = await q(
      `
      SELECT
        e.ebook_id,
        e.title,
        e.abstract,
        e.keywords,
        u.full_name AS author_name,
        p.isbn,
        p.doi,
        p.access_type,
        p.embargo_until,
        p.published_at,
        p.final_pdf_file_id,
        p.final_epub_file_id,
        p.cover_file_id
      FROM ebooks e
      JOIN users u ON u.uuid = e.author_id
      LEFT JOIN ${PUBLICATION_TABLE} p ON p.ebook_id = e.ebook_id
      WHERE e.ebook_id=$1 AND e.is_deleted=false AND e.status='PUBLISHED'
      `,
      [id]
    );

    if (!row.rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/ebooks/public/:id/download?type=pdf|epub
 */
export async function publicDownload(req, res) {
  try {
    const { id } = req.params;
    const type = String(req.query.type || 'pdf').toLowerCase();
    if (!['pdf', 'epub'].includes(type)) {
      return res.status(422).json({ success: false, message: 'type must be pdf or epub' });
    }

    const pub = await q(
      `SELECT access_type, embargo_until, final_pdf_file_id, final_epub_file_id
       FROM ${PUBLICATION_TABLE}
       WHERE ebook_id=$1`,
      [id]
    );
    if (!pub.rows[0]) return res.status(404).json({ success: false, message: 'Not found' });

    const access = String(pub.rows[0].access_type || 'OPEN').toUpperCase();
    const embargoUntil = pub.rows[0].embargo_until ? new Date(pub.rows[0].embargo_until) : null;

    if (access === 'EMBARGO' && embargoUntil && new Date() < embargoUntil) {
      return res.status(403).json({ success: false, message: 'This eBook is under embargo' });
    }

    if (access === 'RESTRICTED') {
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Login required to download this eBook' });
      }
    }

    const fileId = type === 'pdf' ? pub.rows[0].final_pdf_file_id : pub.rows[0].final_epub_file_id;
    if (!fileId) return res.status(404).json({ success: false, message: 'File not available' });

    const file = await q(`SELECT stored_name FROM ebook_files WHERE file_id=$1`, [fileId]);
    if (!file.rows[0]) return res.status(404).json({ success: false, message: 'File not found' });

    await q(
      `INSERT INTO ${ACCESS_LOGS_TABLE}(ebook_id, access_type, action, user_id, ip_address, user_agent)
       VALUES($1,$2,'DOWNLOAD',NULL,$3,$4)`,
      [id, access, req.ip || null, req.get('user-agent') || null]
    );

    res.json({ success: true, data: { url: buildUploadUrl(req, file.rows[0].stored_name) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

 



