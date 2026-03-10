import pool from "../../config/db.js";

/* ================= GET ASSIGNED ================= */
export const getAssignedReviews = async (req, res) => {
  try {
    const reviewerID = req.user.uuid;

    const result = await pool.query(
      `
      SELECT 
        ra.id,
        ra.manuscript_id,
        ra.review_status,
        ra.due_date,
        ra.created_at,
        ra.updated_at,
        m.id AS manuscript_uuid,
        m.title AS manuscript_title,
        m.abstract,
        m.status AS manuscript_status,
        u.full_name AS author_name,
        u.email AS author_email
      FROM review_assignments ra
      JOIN manuscripts m ON m.id = ra.manuscript_id
      LEFT JOIN users u ON u.uuid = m.corresponding_author_id
      WHERE ra.reviewer_id = $1
      ORDER BY 
        CASE 
          WHEN ra.review_status = 'assigned' THEN 1
          WHEN ra.review_status = 'accepted' THEN 2
          WHEN ra.review_status = 'declined' THEN 3
          WHEN ra.review_status = 'completed' THEN 4
          ELSE 5
        END,
        ra.due_date ASC
      `,
      [reviewerID]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load assigned reviews" });
  }
};

export const getAssignmentDetails = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const reviewerId = req.user.uuid;   // consistent UUID usage

    const { rows } = await pool.query(
      `
      SELECT
        ra.id,
        ra.review_status AS status,
        ra.due_date AS deadline,

        m.id AS manuscript_id,
        m.title AS manuscript_title,
        m.abstract,
        m.status AS manuscript_status,
        m.submitted_at AS manuscript_submitted_at,

        f.file_path AS manuscript_file_path,

        reviewer.full_name AS reviewer_name,
        reviewer.email AS reviewer_email,

        u.full_name AS author_name,
        u.email AS author_email

      FROM review_assignments ra
      JOIN manuscripts m 
        ON ra.manuscript_id = m.id

      LEFT JOIN users u 
        ON m.corresponding_author_id = u.uuid

      LEFT JOIN users reviewer 
        ON ra.reviewer_id = reviewer.uuid

      LEFT JOIN files f 
        ON f.manuscript_id = m.id   -- manuscript file comes from files table

      WHERE ra.id = $1 
        AND ra.reviewer_id = $2
      `,
      [assignmentId, reviewerId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Assignment details error:", err);
    res.status(500).json({ error: err.message });
  }
};



export const respondToInvitation = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // accepted | declined
  const reviewerId = req.user.uuid;   // ✅ ALWAYS uuid

  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ error: "Invalid response status" });
  }

  try {
    const { rowCount } = await pool.query(
      `
      UPDATE review_assignments
      SET review_status = $1, updated_at = NOW()
      WHERE id = $2 AND reviewer_id = $3
      `,
      [status, id, reviewerId]
    );

    if (!rowCount)
      return res.status(404).json({ error: "Assignment not found" });

    res.json({ message: `Invitation ${status}` });
  } catch (err) {
    console.error("Respond invitation error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= START REVIEW ================= */
export const startReview = async (req, res) => {
  const { id } = req.params;
  const reviewerId = req.user.uuid;

  try {
    const { rows } = await pool.query(
      `
      SELECT manuscript_id FROM review_assignments
      WHERE id = $1 AND reviewer_id = $2 AND review_status = 'accepted'
      `,
      [id, reviewerId]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Cannot start this review" });
    }

    // ✅ update assignment status
    await pool.query(
      `
      UPDATE review_assignments
      SET review_status = 'under_review', updated_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    // ensure manuscript is marked under review
    await pool.query(
      `
      UPDATE manuscripts
      SET status = 'under_review', updated_at = NOW()
      WHERE id = $1
      `,
      [rows[0].manuscript_id]
    );

    res.json({ message: "Review started" });

  } catch (err) {
    console.error("Start review error:", err);
    res.status(500).json({ error: err.message });
  }
};


/* ================= SUBMIT REVIEW ================= */
export const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.uuid;

    const comments = req.body.comments?.trim();
    const recommendation = req.body.recommendation?.trim();
    const file_path = req.file ? req.file.path : null;

    // ✅ validate required fields
    if (!comments || !recommendation) {
      return res.status(400).json({
        message: "Comments and recommendation are required"
      });
    }

    // ✅ allowed recommendations
    const allowed = [
      "accepted",
      "minor_revisions",
      "major_revisions",
      "reject"
    ];

    if (!allowed.includes(recommendation)) {
      return res.status(400).json({
        message: "Invalid recommendation value"
      });
    }

    // ✅ save review
    await pool.query(
      `
      UPDATE review_assignments
      SET 
        review_comments = $2,
        recommendation = $3,
        review_file_path = COALESCE($4, review_file_path),
        review_status = 'completed',
        updated_at = NOW()
      WHERE id = $1 AND reviewer_id = $5
      `,
      [id, comments, recommendation, file_path, reviewerId]
    );

    res.json({ message: "Review submitted successfully" });

  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({ error: err.message });
  }
};




/* ================= REVIEWER WORKSPACE ================= */
export const getReviewerWorkspace = async (req, res) => {
  try {
    const reviewerId = req.user.uuid;

    const result = await pool.query(
      `
      SELECT 
        ra.id AS assignment_id,
        ra.status,
        ra.deadline,
        m.id AS manuscript_uuid,
        m.title AS manuscript_title,
        m.abstract,
        m.status AS manuscript_status,
        m.created_at,
        u.full_name AS author,
        u.email AS author_email
      FROM review_assignments ra
      JOIN manuscripts m ON m.id = ra.manuscript_id
      JOIN users u ON u.uuid = m.corresponding_author_id
      WHERE ra.reviewer_id = $1 AND ra.status IN ('accepted', 'in_review')
      ORDER BY ra.deadline ASC
      `,
      [reviewerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Reviewer workspace error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= LEGACY FUNCTIONS (keep for backward compatibility) ================= */
export const acceptReview = async (req, res) => {
  const { uuid } = req.params;
  const reviewerID = req.user.uuid;

  await pool.query(
    `UPDATE review_assignments
     SET status = 'accepted', updated_at = NOW()
     WHERE id = $1 AND reviewer_id = $2`,
    [uuid, reviewerID]
  );

  res.json({ message: "Review accepted" });
};

export const declineReview = async (req, res) => {
  const { uuid } = req.params;
  const reviewerID = req.user.uuid;

  await pool.query(
    `UPDATE review_assignments
     SET status = 'declined', updated_at = NOW()
     WHERE id = $1 AND reviewer_id = $2`,
    [uuid, reviewerID]
  );

  res.json({ message: "Review declined" });
};
export const getReviewDraft = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const reviewerId = req.user.uuid;   // ✅ fixed

    const { rows } = await pool.query(
      `
      SELECT 
        draft_comments AS comments,
        draft_recommendation AS recommendation,
        draft_file_path AS file_path
      FROM review_assignments
      WHERE id = $1 AND reviewer_id = $2
      LIMIT 1
      `,
      [assignmentId, reviewerId]
    );

    if (!rows.length || !rows[0].comments) {
      return res.status(404).json({ message: "No draft found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Get draft error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const saveReviewDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.uuid;

    const comments = req.body?.comments || null;
    const recommendation = req.body?.recommendation || null;
    const file_path = req.file?.path || null;   // 👈 multer file

    await pool.query(
      `
      UPDATE review_assignments
      SET draft_comments = $2,
          draft_recommendation = $3,
          draft_file_path = COALESCE($4, draft_file_path),
          updated_at = NOW()
      WHERE id = $1 AND reviewer_id = $5
      `,
      [id, comments, recommendation, file_path, reviewerId]
    );

    res.json({ message: "Draft saved successfully" });

  } catch (err) {
    console.error("Save draft error:", err);
    res.status(500).json({ error: err.message });
  }
};
