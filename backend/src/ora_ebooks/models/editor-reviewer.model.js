import db from "../../config/db.js";

export async function getSubmissionById(submissionId) {
  const id = String(submissionId);

  // 1) ebook_submissions by submission_id
  try {
    const q1 = `
      SELECT
        es.submission_id::text AS submission_id,
        es.title,
        es.abstract,
        es.status,
        es.language,
        es.publication_year,
        es.current_version_no,
        es.author_id,
        es.created_at,
        es.updated_at
      FROM ora_ebook_manuscripts es
      LEFT JOIN users u ON u.uuid = es.author_id
      WHERE es.id::uuid = $1
      LIMIT 1
    `;
    const r1 = await db.query(q1, [id]);
    if (r1.rows.length) return r1.rows[0];
  } catch (e) {
    console.log("ora_ebook_manuscripts by submission_id lookup skipped:", e.message);
  }

  // 2) ora_ebook_manuscripts by id (if table uses id instead of submission_id)
  try {
    const q2 = `
      SELECT
        COALESCE(es.submission_id::text, es.id::text) AS submission_id,
        es.title,
        es.subtitle,
        es.abstract,
        es.status,
        es.category,
        es.language,
        es.publication_year,
        es.current_version_no,
        es.author_id,
        u.full_name AS author_name,
        u.email AS author_email,
        es.created_at,
        es.updated_at
      FROM ebook_submissions es
      LEFT JOIN users u ON u.uuid = es.author_id
      WHERE es.id::text = $1
      LIMIT 1
    `;
    const r2 = await db.query(q2, [id]);
    if (r2.rows.length) return r2.rows[0];
  } catch (e) {
    console.log("ebook_submissions by id lookup skipped:", e.message);
  }

  // 3) manuscripts by manuscript_id
  try {
    const q3 = `
      SELECT
        m.manuscript_id::text AS submission_id,
        m.title,
        m.subtitle,
        m.abstract,
        m.status,
        m.category,
        m.language,
        m.publication_year,
        m.current_version_no,
        m.author_id,
        u.full_name AS author_name,
        u.email AS author_email,
        m.created_at,
        m.updated_at
      FROM manuscripts m
      LEFT JOIN users u ON u.uuid = m.author_id
      WHERE m.manuscript_id::text = $1
      LIMIT 1
    `;
    const r3 = await db.query(q3, [id]);
    if (r3.rows.length) return r3.rows[0];
  } catch (e) {
    console.log("manuscripts by manuscript_id lookup skipped:", e.message);
  }

  // 4) manuscripts by id
  try {
    const q4 = `
      SELECT
        COALESCE(m.id::text) AS submission_id,
        m.title,
        m.abstract,
        m.status,
        m.language,
        m.publication_year,
        m.author_id,
        m.created_at,
        m.updated_at
      FROM ora_ebook_manuscripts m
      LEFT JOIN users u ON u.uuid = m.author_id
      WHERE m.id::uuid = $1
      LIMIT 1
    `;
    const r4 = await db.query(q4, [id]);
    if (r4.rows.length) return r4.rows[0];
  } catch (e) {
    console.log("manuscripts by id lookup skipped:", e.message);
  }

  return null;
}
export async function getAvailableReviewers(search = "") {
  const query = `
    SELECT DISTINCT
      u.uuid,
      u.full_name,
      u.email,
      u.phone,
      r.name AS role_name
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.uuid
    INNER JOIN roles r
      ON (
        (r.uuid IS NOT NULL AND r.uuid = ur.role_id)
        OR
        (r.uuid IS NOT NULL AND r.uuid::text = ur.role_id::text)
      )
    WHERE UPPER(r.name) = 'EBOOK_REVIEWER'
      AND (
        $1 = ''
        OR u.full_name ILIKE '%' || $1 || '%'
        OR u.email ILIKE '%' || $1 || '%'
      )
    ORDER BY u.full_name ASC
  `;
  const { rows } = await db.query(query, [search]);
  return rows;
}

export async function getSubmissionAssignments(submissionId) {
  const query = `
    SELECT
      era.assignment_id,
      era.submission_id,
      era.reviewer_id,
      era.assigned_by,
      era.status,
      era.due_date,
      era.invitation_note,
      era.response_note,
      era.accepted_at,
      era.completed_at,
      era.created_at,
      era.updated_at,
      reviewer.full_name AS reviewer_name,
      reviewer.email AS reviewer_email,
      assigner.full_name AS assigned_by_name
    FROM ebook_review_assignments era
    LEFT JOIN users reviewer ON reviewer.uuid = era.reviewer_id
    LEFT JOIN users assigner ON assigner.uuid = era.assigned_by
    WHERE era.submission_id::text = $1
    ORDER BY era.created_at DESC
  `;
  const { rows } = await db.query(query, [String(submissionId)]);
  return rows;
}

export async function assignReviewer({
  submissionId,
  reviewerId,
  assignedBy,
  dueDate = null,
  invitationNote = null,
}) {
  const query = `
    INSERT INTO ebook_review_assignments (
      submission_id,
      reviewer_id,
      assigned_by,
      status,
      due_date,
      invitation_note,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, 'assigned', $4, $5, NOW(), NOW())
    ON CONFLICT (submission_id, reviewer_id)
    DO UPDATE SET
      assigned_by = EXCLUDED.assigned_by,
      due_date = EXCLUDED.due_date,
      invitation_note = EXCLUDED.invitation_note,
      status = 'assigned',
      updated_at = NOW()
    RETURNING *
  `;

  const { rows } = await db.query(query, [
    submissionId,
    reviewerId,
    assignedBy,
    dueDate,
    invitationNote,
  ]);

  return rows[0] || null;
}

export async function assignMultipleReviewers({
  submissionId,
  reviewerIds,
  assignedBy,
  dueDate = null,
  invitationNote = null,
}) {
  const results = [];

  for (const reviewerId of reviewerIds) {
    const row = await assignReviewer({
      submissionId,
      reviewerId,
      assignedBy,
      dueDate,
      invitationNote,
    });
    if (row) results.push(row);
  }

  await db.query(
    `
      UPDATE ebook_submissions
      SET assigned_reviewer_count = (
        SELECT COUNT(*)
        FROM ebook_review_assignments
        WHERE submission_id = $1
      ),
      updated_at = NOW()
      WHERE submission_id = $1
    `,
    [submissionId]
  );

  return results;
}

export async function removeAssignment(assignmentId, submissionId) {
  const query = `
    DELETE FROM ebook_review_assignments
    WHERE assignment_id = $1
    RETURNING *
  `;
  const { rows } = await db.query(query, [assignmentId]);

  await db.query(
    `
      UPDATE ebook_submissions
      SET assigned_reviewer_count = (
        SELECT COUNT(*)
        FROM ebook_review_assignments
        WHERE submission_id = $1
      ),
      updated_at = NOW()
      WHERE submission_id = $1
    `,
    [submissionId]
  );

  return rows[0] || null;
}

export async function updateAssignmentStatus({
  assignmentId,
  status,
  dueDate = null,
  invitationNote = null,
}) {
  const query = `
    UPDATE ebook_review_assignments
    SET
      status = COALESCE($2, status),
      due_date = COALESCE($3, due_date),
      invitation_note = COALESCE($4, invitation_note),
      updated_at = NOW()
    WHERE assignment_id = $1
    RETURNING *
  `;
  const { rows } = await db.query(query, [
    assignmentId,
    status || null,
    dueDate,
    invitationNote,
  ]);
  return rows[0] || null;
}

export async function resendInvitation(assignmentId) {
  const query = `
    UPDATE ebook_review_assignments
    SET
      status = 'assigned',
      updated_at = NOW()
    WHERE assignment_id = $1
    RETURNING *
  `;
  const { rows } = await db.query(query, [assignmentId]);
  return rows[0] || null;
}