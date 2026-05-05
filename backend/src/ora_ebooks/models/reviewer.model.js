import db from "../../config/db.js";

export async function getReviewerAssignments(reviewerId, filters = {}) {
  const { search = "", status = "" } = filters;

  let query = `
    SELECT
      era.assignment_id,
      era.submission_id,
      era.reviewer_id,
      era.assigned_by,
      era.status,
      era.due_date,
      era.invitation_note,
      era.response_note,
      era.assigned_at,
      era.accepted_at,
      era.completed_at,

      es.title,
      es.subtitle,
      es.abstract,
      es.category,
      es.language,
      es.publication_year,
      es.status AS submission_status,

      editor.full_name AS assigned_by_name

    FROM ebook_review_assignments era

    LEFT JOIN ebook_submissions es
      ON es.submission_id = era.submission_id   -- ✅ FIXED (no cast)

    LEFT JOIN users editor
      ON editor.uuid = era.assigned_by          -- ✅ FIXED

    WHERE era.reviewer_id = $1                  -- ✅ FIXED
  `;

  const values = [reviewerId];
  let index = 2;

  // ✅ STATUS FILTER (SAFE FOR ENUM)
  if (status && status.trim()) {
    query += ` AND era.status = $${index}`;
    values.push(status.trim());
    index++;
  }

  // ✅ SEARCH FILTER
  if (search && search.trim()) {
    query += `
      AND (
        es.title ILIKE $${index}
        OR es.subtitle ILIKE $${index}
        OR es.category ILIKE $${index}
        OR es.language ILIKE $${index}
        OR es.publication_year::text ILIKE $${index}
      )
    `;
    values.push(`%${search.trim()}%`);
    index++;
  }

  query += ` ORDER BY era.assigned_at DESC`;

  const { rows } = await db.query(query, values);
  return rows;
}
export async function getReviewerPendingAssignments(reviewerId, filters = {}) {
  const { search = "", status = "" } = filters;

  let query = `
    SELECT
      era.assignment_id,
      era.submission_id,
      era.reviewer_id,
      era.status,
      era.invitation_note,
      era.response_note,
      era.assigned_at,
      era.due_date,
      era.accepted_at,
      era.declined_at,
      era.completed_at,

      es.title,
      es.abstract,
      es.language,
      es.publication_year,
      es.file_path,
      es.isbn,
      es.status AS submission_status

    FROM ebook_review_assignments era

    -- ✅ FIXED JOIN
    LEFT JOIN ora_ebook_manuscripts es
      ON es.id::text = era.submission_id::text

    WHERE era.reviewer_id::text = $1::text
  `;

  const values = [reviewerId];
  let index = 2;

  // ✅ STATUS FILTER
  if (status && status.trim()) {
    query += ` AND LOWER(era.status::text) = LOWER($${index})`;
    values.push(status.trim());
    index++;
  } else {
    query += ` AND LOWER(era.status::text) IN ('assigned', 'accepted')`;
  }

  // ✅ SEARCH FILTER
  if (search && search.trim()) {
    query += `
      AND (
        COALESCE(es.title, '') ILIKE $${index}
        OR COALESCE(es.abstract, '') ILIKE $${index}
        OR COALESCE(es.language, '') ILIKE $${index}
        OR COALESCE(es.publication_year::text, '') ILIKE $${index}
        OR COALESCE(es.isbn, '') ILIKE $${index}
      )
    `;
    values.push(`%${search.trim()}%`);
    index++;
  }

  query += ` ORDER BY era.assigned_at DESC`;

  const { rows } = await db.query(query, values);
  return rows;
}

export async function getReviewerAssignmentById(assignmentId, reviewerId) {
  const query = `
    SELECT
      era.assignment_id,
      era.submission_id,
      era.reviewer_id,
      era.status,
      era.due_date,
      era.invitation_note,
      era.response_note,
      era.assigned_at,
      era.accepted_at,
      era.completed_at,

      es.title,
      es.subtitle,
      es.abstract,
      es.category,
      es.language,
      es.publication_year,
      es.keywords,
      es.target_audience,
      es.status AS submission_status

    FROM ebook_review_assignments era

    LEFT JOIN ebook_submissions es
      ON es.submission_id::text = era.submission_id::text

    WHERE era.assignment_id::text = $1::text
      AND era.reviewer_id::text = $2::text

    LIMIT 1
  `;

  const { rows } = await db.query(query, [assignmentId, reviewerId]);
  return rows[0] || null;
}



export const startReview = async ({ assignmentId, reviewerId }) => {
  const query = `
    UPDATE ebook_review_assignments
    SET
      status = 'in_review',
      started_at = NOW(),
      updated_at = NOW()
    WHERE assignment_id = $1
      AND reviewer_id = $2
      AND status = 'accepted'
    RETURNING *;
  `;

  const { rows } = await db.query(query, [assignmentId, reviewerId]);

  if (!rows.length) {
    console.warn("⚠️ No rows updated:", { assignmentId, reviewerId });
    return null;
  }

  return rows[0];
};

export const respondToAssignment = async ({
  assignmentId,
  reviewerId,
  status,
  response_note,
}) => {
  const query = `
    UPDATE ebook_review_assignments
SET
  status = $3::ebook_assignment_status,
  response_note = $4,
  accepted_at = CASE
    WHEN $3::ebook_assignment_status = 'accepted' THEN NOW()
    ELSE accepted_at
  END,
  declined_at = CASE
    WHEN $3::ebook_assignment_status = 'declined' THEN NOW()
    ELSE declined_at
  END,
  updated_at = NOW()
WHERE assignment_id = $1 AND reviewer_id = $2
RETURNING *;
  `;

  const values = [assignmentId, reviewerId, status, response_note];

  const result = await db.query(query, values);
  return result.rows[0];
};

export async function submitReview({
  assignmentId,
  reviewerId,
  originality_score,
  clarity_score,
  methodology_score,
  relevance_score,
  comments_for_author,
  confidential_comments,
  recommendation,
}) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const assignmentResult = await client.query(
      `
      SELECT
        assignment_id,
        submission_id,
        reviewer_id,
        status
      FROM ebook_review_assignments
      WHERE assignment_id::text = $1::text
        AND reviewer_id::text = $2::text
      LIMIT 1
      `,
      [assignmentId, reviewerId]
    );

    const assignment = assignmentResult.rows[0];

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (assignment.status !== "accepted") {
      throw new Error("Only accepted assignments can submit reviews");
    }

    const reviewResult = await client.query(
      `
      INSERT INTO ebook_reviews (
        assignment_id,
        submission_id,
        reviewer_id,
        originality_score,
        clarity_score,
        methodology_score,
        relevance_score,
        comments_for_author,
        confidential_comments,
        recommendation,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10::ebook_recommendation,
        NOW(),
        NOW()
      )
      ON CONFLICT (assignment_id)
      DO UPDATE SET
        originality_score = EXCLUDED.originality_score,
        clarity_score = EXCLUDED.clarity_score,
        methodology_score = EXCLUDED.methodology_score,
        relevance_score = EXCLUDED.relevance_score,
        comments_for_author = EXCLUDED.comments_for_author,
        confidential_comments = EXCLUDED.confidential_comments,
        recommendation = EXCLUDED.recommendation,
        updated_at = NOW()
      RETURNING *
      `,
      [
        assignment.assignment_id,
        assignment.submission_id,
        reviewerId,
        originality_score ?? null,
        clarity_score ?? null,
        methodology_score ?? null,
        relevance_score ?? null,
        comments_for_author ?? null,
        confidential_comments ?? null,
        recommendation,
      ]
    );

    await client.query(
      `
      UPDATE ebook_review_assignments
      SET
        status = 'submitted'::ebook_assignment_status,
        completed_at = NOW()
      WHERE assignment_id::text = $1::text
        AND reviewer_id::text = $2::text
      `,
      [assignmentId, reviewerId]
    );

    await client.query("COMMIT");
    return reviewResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getAssignmentFiles(assignmentId, reviewerId) {
  const query = `
    SELECT
      ef.file_id,
      ef.submission_id,
      ef.version_no,
      ef.file_type,
      ef.original_name,
      ef.stored_name,
      ef.mime_type,
      ef.size_bytes,
      ef.uploaded_by,
      ef.uploaded_at
    FROM ebook_files ef
    INNER JOIN ebook_review_assignments era
      ON era.submission_id::text = ef.submission_id::text
    WHERE era.assignment_id::text = $1::text
      AND era.reviewer_id::text = $2::text
    ORDER BY ef.uploaded_at DESC
  `;

  const { rows } = await db.query(query, [assignmentId, reviewerId]);
  return rows;
}