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
      es.keywords,
      es.category,
      es.language,
      es.publication_year,
      es.target_audience,
      es.status AS submission_status,
      es.current_version_no,

      author.full_name AS author_name,
      editor.full_name AS assigned_by_name
    FROM ebook_review_assignments era
    INNER JOIN ebook_submissions es
      ON es.submission_id = era.submission_id
    LEFT JOIN users editor
      ON editor.uuid = era.assigned_by
    LEFT JOIN users author
      ON author.uuid = es.author_id
    WHERE era.reviewer_id = $1
  `;

  const values = [reviewerId];
  let index = values.length + 1;

  if (status && status.trim()) {
    query += ` AND era.status = $${index}::ebook_assignment_status`;
    values.push(status.trim());
    index++;
  }

  if (search && search.trim()) {
    query += `
      AND (
        es.title ILIKE $${index}
        OR COALESCE(es.subtitle, '') ILIKE $${index}
        OR COALESCE(es.category, '') ILIKE $${index}
        OR COALESCE(es.language, '') ILIKE $${index}
        OR COALESCE(author.full_name, '') ILIKE $${index}
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
      es.keywords,
      es.category,
      es.language,
      es.publication_year,
      es.target_audience,
      es.status AS submission_status,
      es.current_version_no,

      author.full_name AS author_name,
      editor.full_name AS assigned_by_name
    FROM ebook_review_assignments era
    INNER JOIN ebook_submissions es
      ON es.submission_id = era.submission_id
    LEFT JOIN users editor
      ON editor.uuid = era.assigned_by
    LEFT JOIN users author
      ON author.uuid = es.author_id
    WHERE era.reviewer_id = $1
      AND era.status = 'assigned'::ebook_assignment_status
  `;

  const values = [reviewerId];
  let index = values.length + 1;

  if (status && status.trim()) {
    query += ` AND era.status = $${index}::ebook_assignment_status`;
    values.push(status.trim());
    index++;
  }

  if (search && search.trim()) {
    query += `
      AND (
        es.title ILIKE $${index}
        OR COALESCE(es.subtitle, '') ILIKE $${index}
        OR COALESCE(es.category, '') ILIKE $${index}
        OR COALESCE(es.language, '') ILIKE $${index}
        OR COALESCE(author.full_name, '') ILIKE $${index}
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
      es.keywords,
      es.category,
      es.language,
      es.publication_year,
      es.target_audience,
      es.requires_bpc,
      es.bpc_amount,
      es.status AS submission_status,
      es.current_version_no,
      es.final_decision,
      es.final_decision_note,

      author.full_name AS author_name,
      editor.full_name AS assigned_by_name,

      er.review_id,
      er.originality_score,
      er.clarity_score,
      er.methodology_score,
      er.relevance_score,
      er.comments_for_author,
      er.confidential_comments,
      er.recommendation,
      er.created_at AS review_created_at,
      er.updated_at AS review_updated_at
    FROM ebook_review_assignments era
    INNER JOIN ebook_submissions es
      ON es.submission_id = era.submission_id
    LEFT JOIN users editor
      ON editor.uuid = era.assigned_by
    LEFT JOIN users author
      ON author.uuid = es.author_id
    LEFT JOIN ebook_reviews er
      ON er.assignment_id = era.assignment_id
    WHERE era.assignment_id = $1
      AND era.reviewer_id = $2
    LIMIT 1
  `;

  const { rows } = await db.query(query, [assignmentId, reviewerId]);
  return rows[0] || null;
}

export async function respondToAssignment({
  assignmentId,
  reviewerId,
  status,
  response_note,
}) {
  const query = `
    UPDATE ebook_review_assignments
    SET
      status = $3::ebook_assignment_status,
      response_note = $4,
      accepted_at = CASE
        WHEN $3::text = 'accepted' THEN NOW()
        ELSE accepted_at
      END
    WHERE assignment_id = $1
      AND reviewer_id = $2
      AND status = 'assigned'::ebook_assignment_status
    RETURNING *
  `;

  const values = [assignmentId, reviewerId, status, response_note];
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

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
        era.assignment_id,
        era.submission_id,
        era.reviewer_id,
        era.status
      FROM ebook_review_assignments era
      WHERE era.assignment_id = $1
        AND era.reviewer_id = $2
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
        assignmentId,
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
      WHERE assignment_id = $1
      `,
      [assignmentId]
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
      ON era.submission_id = ef.submission_id
    WHERE era.assignment_id = $1
      AND era.reviewer_id = $2
    ORDER BY ef.uploaded_at DESC
  `;

  const { rows } = await db.query(query, [assignmentId, reviewerId]);
  return rows;
}