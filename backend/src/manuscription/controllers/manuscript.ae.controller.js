import pool from "../../config/db.js";

/* =====================================================
   GET ASSIGNED MANUSCRIPTS (AE)
   STATUS is ENUM (direct column)
===================================================== */
export const getAssignedManuscripts = async (req, res) => {
  try {
    const aeId = req.user.uuid;

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.status,
        m.submitted_at
      FROM manuscripts m
      WHERE m.assigned_editor_id = $1
      ORDER BY m.submitted_at DESC
      `,
      [aeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get assigned manuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};

/* =====================================================
   SCREENING MANUSCRIPT
   Change status from 'submitted' → 'screening'
===================================================== */
export const screeningManuscript = async (req, res) => {
  try {
    const { uuid } = req.params;

    await pool.query(
      `
      UPDATE manuscripts
      SET status = 'screening'
      WHERE id = $1
      `,
      [uuid]
    );

    res.json({ message: "Manuscript moved to screening successfully" });
  } catch (err) {
    console.error("Screening error:", err);
    res.status(500).json({ error: "Screening failed" });
  }
};

/* =====================================================
   GET REVIEWERS (BY ROLE)
===================================================== */
export const getReviewersByRole = async (req, res) => {
  try {
    const REVIEWER_ROLE_ID = "30d22914-dc7f-4532-ba19-31be2beb2e9d";

    const result = await pool.query(
      `
      SELECT DISTINCT
        u.uuid,
        u.full_name,
        u.email
      FROM users u
      JOIN user_roles ur 
        ON ur.user_id = u.uuid
      WHERE ur.role_id = $1
      ORDER BY u.full_name
      `,
      [REVIEWER_ROLE_ID]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get reviewers error:", error);
    res.status(500).json({ error: "Failed to fetch reviewers" });
  }
};

/* =====================================================
   ASSIGN REVIEWERS
   Change status → 'review'
===================================================== */
export const assignReviewer = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const manuscriptUUID = req.params.uuid;
    const { reviewers } = req.body;

    if (!Array.isArray(reviewers) || reviewers.length === 0) {
      throw new Error("No reviewers selected");
    }

    for (const reviewerId of reviewers) {
      await client.query(
        `
        INSERT INTO review_assignments
          (manuscript_id, reviewer_id, status, deadline, created_at)
        VALUES
          ($1, $2, 'assigned', NOW() + INTERVAL '14 days', NOW())
        ON CONFLICT (manuscript_id, reviewer_id) DO NOTHING
        `,
        [manuscriptUUID, reviewerId]
      );
    }

    // Update manuscript status to review
    await client.query(
      `
      UPDATE manuscripts
      SET status = 'review'
      WHERE id = $1
      `,
      [manuscriptUUID]
    );

    await client.query("COMMIT");

    res.json({ message: "Reviewers assigned successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Assign reviewer error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   RECOMMEND DECISION (AE → EIC)
   Change status → 'decision'
===================================================== */
export const recommendDecision = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { decision } = req.body;

    if (!decision) {
      return res.status(400).json({ error: "Decision is required" });
    }

    await pool.query(
      `
      UPDATE manuscripts
      SET
        status = 'decision',
        recommendation = $2
      WHERE id = $1
      `,
      [uuid, decision]
    );

    res.json({ message: "Recommendation sent successfully" });
  } catch (err) {
    console.error("Recommend decision error:", err);
    res.status(500).json({ error: "Failed to send recommendation" });
  }
};


/* =====================================================
   GET INITIAL SCREENING MANUSCRIPTS
===================================================== */
/* =====================================================
   GET INITIAL SCREENING MANUSCRIPTS (FIXED)
===================================================== */
export const getInitialScreeningManuscripts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        status,
        created_at
      FROM manuscripts
      WHERE status = 'screening'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Initial screening fetch error:", err);
    res.status(500).json({
      error: "Failed to fetch initial screening manuscripts",
    });
  }
};
export const rejectManuscript=async(req,res)=>{

}