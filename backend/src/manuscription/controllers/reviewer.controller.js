import pool from "../../config/db.js";

/* ================= GET ASSIGNED ================= */
export const getAssignedReviews = async (req, res) => {
  try {
    const reviewerID = req.user.uuid;

    const result = await pool.query(
      `
      SELECT 
        ra.id,
        m.id AS manuscript_id,
        m.title AS manuscript_title,
        j.title AS journal_title,
        ra.status
      FROM review_assignments ra
      JOIN manuscripts m ON m.id = ra.manuscript_id
      LEFT JOIN journals j ON j.id = m.journal_id
      WHERE ra.reviewer_id = $1
      ORDER BY ra.id DESC
      `,
      [reviewerID]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load assigned reviews" });
  }
};

/* ================= ACCEPT / DECLINE ================= */
export const respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body; // accepted | declined
    const { id } = req.params;

    await pool.query(
      `UPDATE review_assignments SET status=$1 WHERE id=$2`,
      [status, id]
    );

    res.json({ message: "Response recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Invitation response failed" });
  }
};

/* ================= START REVIEW ================= */
export const startReview = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE review_assignments SET status='in_review' WHERE id=$1`,
      [id]
    );

    res.json({ message: "Review started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start review" });
  }
};


/* ================= REVIEWER WORKSPACE ================= */
export const getReviewerWorkspace = async (req, res) => {
  try {
    const reviewerId = req.user.uuid;

    const result = await pool.query(
      `
      SELECT 
        m.uuid,
        m.title,
        m.status_id,
        m.created_at,
        u.full_name AS author
      FROM manuscripts m
      JOIN users u ON u.uuid = m.author_id
      JOIN manuscript_reviewers mr ON mr.manuscript_id = m.uuid
      WHERE mr.reviewer_id = $1
      ORDER BY m.created_at DESC
      `,
      [reviewerId]
    );

    // 🔥 RETURN ARRAY ONLY
    res.json(result.rows);

  } catch (error) {
    console.error("Reviewer workspace error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
/* ================= ACCEPT REVIEW ================= */
export const acceptReview = async (req, res) => {
  const { uuid } = req.params;

  await pool.query(
    `UPDATE review_assignments
     SET status='accepted'
     WHERE id=$1`,
    [uuid]
  );

  res.json({ message: "Review accepted" });
};

/* ================= DECLINE REVIEW ================= */
export const declineReview = async (req, res) => {
  const { uuid } = req.params;

  await pool.query(
    `UPDATE review_assignments
     SET status='declined'
     WHERE id=$1`,
    [uuid]
  );

  res.json({ message: "Review declined" });
};

/* ================= SUBMIT REVIEW ================= */
export const submitReview = async (req, res) => {
  const { uuid } = req.params;
  const { comments, recommendation } = req.body;

  await pool.query(
    `
    UPDATE review_assignments
    SET
      status='completed',
      reviewer_comments=$2,
      recommendation=$3,
      submitted_at=NOW()
    WHERE id=$1
    `,
    [uuid, comments, recommendation]
  );

  res.json({ message: "Review submitted" });
};
