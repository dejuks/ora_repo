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
        m.uuid,
        m.title,
        m.abstract,
        m.status,
        m.submitted_at,
        m.created_at,
        m.updated_at,
        u.full_name as author_name,
        u.email as author_email
      FROM manuscripts m
      LEFT JOIN users u ON m.author_id = u.uuid
      WHERE m.assigned_editor_id = $1
      ORDER BY m.created_at DESC
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
    
    const result = await pool.query(
      `UPDATE manuscripts 
       SET status = 'screening', 
           updated_at = NOW() 
       WHERE uuid = $1 
       RETURNING *`,
      [uuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    res.json({ 
      message: "Manuscript moved to screening successfully",
      manuscript: result.rows[0]
    });
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
      SELECT 
        u.uuid,
        u.full_name,
        u.email
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.uuid
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

    // 🔥 logged-in user uuid from JWT
    const assignedBy = req.user.uuid;

    if (!Array.isArray(reviewers) || reviewers.length === 0) {
      return res.status(400).json({ error: "No reviewers selected" });
    }

    // 🔥 convert manuscript UUID → INT ID
    const manuscriptRes = await client.query(
      `SELECT id FROM manuscripts WHERE id = $1`,
      [manuscriptUUID]
    );

    if (manuscriptRes.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    const manuscriptId = manuscriptRes.rows[0].id;

    // 🔥 insert assignments
    for (const reviewerId of reviewers) {
      await client.query(
        `
        INSERT INTO review_assignments
          (manuscript_id, reviewer_id, assigned_by, due_date, review_status, created_at, updated_at)
        VALUES
          ($1, $2, $3, CURRENT_DATE + INTERVAL '14 days', 'assigned', NOW(), NOW())
        ON CONFLICT (manuscript_id, reviewer_id) DO NOTHING
        `,
        [manuscriptId, reviewerId, assignedBy]
      );
    }

    // 🔥 update manuscript status
    await client.query(
      `
      UPDATE manuscripts
      SET status = 'under_review', updated_at = NOW()
      WHERE id = $1
      `,
      [manuscriptId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Reviewers assigned successfully",
      assignedCount: reviewers.length,
    });

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

    const result = await pool.query(
      `
      UPDATE manuscripts
      SET
        status = 'decision',
        recommendation = $2,
        updated_at = NOW()
      WHERE uuid = $1
      RETURNING *
      `,
      [uuid, decision]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    res.json({ 
      message: "Recommendation sent successfully",
      manuscript: result.rows[0]
    });
  } catch (err) {
    console.error("Recommend decision error:", err);
    res.status(500).json({ error: "Failed to send recommendation" });
  }
};

/* ==================== GET INITIAL SCREENING MANUSCRIPTS ==================== */
export const getInitialScreeningManuscripts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.corresponding_author_id,
        m.id,
        m.title,
        m.abstract,
        m.status,
        m.submitted_at,
        m.created_at,
        m.updated_at,
        u.full_name as author_name,
        u.email as author_email
      FROM manuscripts m
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      WHERE m.status = 'screening'
      ORDER BY m.created_at DESC
    `);

    const transformedData = result.rows.map(row => ({
      uuid: row.uuid,
      id: row.id,
      title: row.title,
      abstract: row.abstract,
      authors: row.author_name || 'Unknown Author',
      author_email: row.author_email,
      status: row.status,
      submitted_at: row.submitted_at || row.created_at,
      created_at: row.created_at
    }));

    res.json(transformedData);
  } catch (err) {
    console.error("Initial screening fetch error:", err);
    res.status(500).json({ error: "Failed to load manuscripts" });
  }
};

/* ==================== REJECT MANUSCRIPT ==================== */
export const rejectManuscript = async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const result = await pool.query(
      `UPDATE manuscripts 
       SET status = 'rejected', 
           updated_at = NOW() 
       WHERE uuid = $1 
       RETURNING *`,
      [uuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    res.json({ 
      message: "Manuscript rejected successfully",
      manuscript: result.rows[0]
    });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ error: "Failed to reject manuscript" });
  }
};
/* =====================================================
   COMPLETE SCREENING (mark as screened)
===================================================== */
export const completeScreening = async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Check if manuscript exists and is in screening
    const checkResult = await pool.query(
      `SELECT status FROM manuscripts WHERE uuid = $1`,
      [uuid]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    if (checkResult.rows[0].status !== 'screening') {
      return res.status(400).json({ 
        error: "Manuscript must be in 'screening' status to complete screening" 
      });
    }

    const result = await pool.query(
      `UPDATE manuscripts 
       SET status = 'screened', 
           updated_at = NOW() 
       WHERE uuid = $1 
       RETURNING *`,
      [uuid]
    );

    res.json({ 
      message: "Screening completed successfully",
      manuscript: result.rows[0]
    });
  } catch (err) {
    console.error("Complete screening error:", err);
    res.status(500).json({ error: "Failed to complete screening" });
  }
};