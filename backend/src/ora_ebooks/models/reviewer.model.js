import db from "../../config/db.js";

/**
 * ===============================
 * LIST
 * ===============================
 */
export async function getReviewerAssignments(reviewerId, filters = {}) {
  const { search = "", status = "" } = filters;

  let query = `
    SELECT
      era.assignment_id,
      era.submission_id,
      era.status,
      era.assigned_at,
      era.due_date,
      era.accepted_at,
      era.completed_at,

      em.title,
      em.abstract,
      em.language,
      em.publication_year

    FROM ebook_review_assignments era
    LEFT JOIN ora_ebook_manuscripts em
      ON em.id = era.submission_id
    WHERE era.reviewer_id = $1
  `;

  const values = [reviewerId];
  let i = 2;

  if (status) {
    query += ` AND era.status = $${i++}`;
    values.push(status);
  }

  if (search) {
    query += ` AND em.title ILIKE $${i}`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY era.assigned_at DESC`;

  const { rows } = await db.query(query, values);
  return rows;
}

/**
 * ===============================
 * PENDING
 * ===============================
 */
export async function getReviewerPendingAssignments(reviewerId, filters = {}) {
  const { search = "", status = "" } = filters;

  let query = `
    SELECT
      era.assignment_id,
      era.status,
      era.assigned_at,
      era.due_date,
      em.title,
      em.abstract,
      em.file_path
    FROM ebook_review_assignments era
    LEFT JOIN ora_ebook_manuscripts em
      ON em.id = era.submission_id
    WHERE era.reviewer_id = $1
  `;

  const values = [reviewerId];
  let i = 2;

  if (status) {
    query += ` AND era.status = $${i++}`;
    values.push(status);
  } else {
    query += ` AND era.status IN ('assigned','accepted')`;
  }

  if (search) {
    query += ` AND em.title ILIKE $${i}`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY era.assigned_at DESC`;

  const { rows } = await db.query(query, values);
  return rows;
}

/**
 * ===============================
 * DETAIL
 * ===============================
 */
export async function getReviewerAssignmentById(
  assignmentId,
  reviewerId
) {
  const { rows } = await db.query(
    `
    SELECT
      era.*,
      em.title,
      em.abstract,
      em.file_path,
      em.language,
      em.publication_year,
      em.isbn

    FROM ebook_review_assignments era

    LEFT JOIN ora_ebook_manuscripts em
      ON em.id::text = era.submission_id::text

    WHERE era.assignment_id::text = $1::text
      AND era.reviewer_id::text = $2::text

    LIMIT 1
    `,
    [assignmentId, reviewerId]
  );

  return rows[0] || null;
}

/**
 * ===============================
 * RESPOND
 * ===============================
 */
export async function respondToAssignmentModel({
  assignmentId,
  reviewerId,
  status,
}) {
  try {
    const query = `
      UPDATE ebook_review_assignments
      SET
        status = $3::ebook_assignment_status,

        accepted_at = CASE
          WHEN $3 = 'accepted'
          THEN NOW()
          ELSE accepted_at
        END,

        declined_at = CASE
          WHEN $3 = 'declined'
          THEN NOW()
          ELSE declined_at
        END,

        updated_at = NOW()

      WHERE assignment_id::text = $1::text
        AND reviewer_id::text = $2::text

      RETURNING *;
    `;

    const values = [
      assignmentId,
      reviewerId,
      status,
    ];

    const { rows } = await db.query(query, values);

    return rows[0] || null;

  } catch (error) {
    console.error("MODEL ERROR:", error);
    throw error;
  }
}
/**
 * ===============================
 * START REVIEW
 * ===============================
 */
export async function startReview({ assignmentId, reviewerId }) {
  const { rows } = await db.query(
    `
    UPDATE ebook_review_assignments
    SET
      status = 'in_review',
      started_at = NOW(),
      updated_at = NOW()
    WHERE assignment_id = $1
      AND reviewer_id = $2
      AND status = 'accepted'
    RETURNING *;
  `,
    [assignmentId, reviewerId]
  );

  return rows[0];
}

/**
 * ==========================================
 * SUBMIT REVIEW
 * ==========================================
 */
export async function submitReview({
  assignmentId,
  reviewerId,
  reviewData,
}) {
  const {
    originality_score,
    clarity_score,
    methodology_score,
    relevance_score,
    recommendation,
    comments_for_author,
    confidential_comments,
  } = reviewData;

  const reviewContent = {
    originality_score,
    clarity_score,
    methodology_score,
    relevance_score,
    recommendation,
    comments_for_author,
    confidential_comments,
  };

  const { rows } = await db.query(
  `
  UPDATE ebook_review_assignments
  SET
    status = 'completed'::ebook_assignment_status,

    originality_score = $3,
    clarity_score = $4,
    methodology_score = $5,
    relevance_score = $6,

    recommendation = $7,

    comments_for_author = $8,
    confidential_comments = $9,

    review_content = $10::jsonb,

    completed_at = NOW(),
    updated_at = NOW()

  WHERE assignment_id = $1
    AND reviewer_id = $2

  RETURNING *;
  `,
  [
    assignmentId,
    reviewerId,

    originality_score,
    clarity_score,
    methodology_score,
    relevance_score,

    recommendation,

    comments_for_author,
    confidential_comments,

    JSON.stringify(reviewContent),
  ]
);

  return rows[0];
}
/**
 * =========================================
 * GET COMPLETED REVIEWS
 * =========================================
 */
export async function getCompletedReviews(
  reviewerId
) {
  const { rows } = await db.query(
    `
    SELECT
      era.assignment_id,
      era.status,
      era.completed_at,

      era.originality_score,
      era.clarity_score,
      era.methodology_score,
      era.relevance_score,

      era.recommendation,

      em.title,
      em.abstract,
      em.language,
      em.publication_year,
      em.file_path

    FROM ebook_review_assignments era

    LEFT JOIN ora_ebook_manuscripts em
      ON em.id = era.submission_id

    WHERE era.reviewer_id = $1
      AND era.status =
      'completed'::ebook_assignment_status

    ORDER BY era.completed_at DESC
    `,
    [reviewerId]
  );

  return rows;
}

export async function getReviewerCompletedProduction() {
  const { rows } = await db.query(
    `
    SELECT
      era.assignment_id,
      era.status,
      era.completed_at,
      era.recommendation,
      era.originality_score,
      era.clarity_score,
      era.methodology_score,
      era.relevance_score,

      em.title,
      em.abstract,
      em.language

    FROM ebook_review_assignments era
    LEFT JOIN ora_ebook_manuscripts em
      ON em.id = era.submission_id

    WHERE era.status = 'completed'

    ORDER BY era.completed_at DESC
    `
  );

  return rows;
}

export async function markPaymentAsPaidModel(assignmentId, method) {
  const { rows } = await db.query(
    `
    UPDATE ebook_review_assignments
    SET
      payment_status = 'paid',
      payment_method = $2,
      paid_at = NOW()
    WHERE assignment_id = $1
    RETURNING *;
    `,
    [assignmentId, method]
  );

  return rows[0];
}
export async function createProductionPaymentOrder({
  assignmentId,
  amount,
  paymentMethod,
}) {

  const paymentOrderId =
    "PAY-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 10000);

  const { rows } = await db.query(
    `
    UPDATE ebook_review_assignments
    SET
      payment_status = 'ordered',
      payment_amount = $2,
      payment_method = $3,
      payment_order_id = $4,
      updated_at = NOW()
    WHERE assignment_id = $1
    RETURNING *;
    `,
    [
      assignmentId,
      amount,
      paymentMethod,
      paymentOrderId,
    ]
  );

  return rows[0];
}

export async function markProductionPaymentPaid({
  assignmentId,
}) {

  const { rows } = await db.query(
    `
    UPDATE ebook_review_assignments
    SET
      payment_status = 'paid',
      paid_at = NOW(),
      updated_at = NOW()
    WHERE assignment_id = $1
    RETURNING *;
    `,
    [assignmentId]
  );

  return rows[0];
}

/**
 * GET PAYMENT ORDERS
 */
export async function getProductionPaymentOrders() {

  const { rows } = await db.query(
    `
    SELECT
      era.assignment_id,
      era.payment_status,
      era.payment_amount,
      era.payment_method,
      era.payment_order_id,
      era.paid_at,
      era.completed_at,
      era.status,

      em.title,
      em.language

    FROM ebook_review_assignments era

    LEFT JOIN ora_ebook_manuscripts em
      ON em.id = era.submission_id

    WHERE era.status = 'completed'

    ORDER BY era.completed_at DESC
    `
  );

  return rows;
}