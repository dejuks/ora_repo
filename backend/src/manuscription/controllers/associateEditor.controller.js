import pool from "../../config/db.js";

/* ================= GET ASSIGNED MANUSCRIPTS ================= */
export const getAssignedManuscripts = async (req, res) => {
  const aeId = req.user.uuid;

  const result = await pool.query(
    `
    SELECT 
      m.id,
      m.title AS manuscript_title,
      j.title AS journal_title,
      ms.label AS status_label
    FROM manuscripts m
    JOIN journals j ON j.id = m.journal_id
    JOIN manuscript_statuses ms ON ms.id = m.status_id
    WHERE m.assigned_editor_id = $1
    ORDER BY m.created_at DESC
    `,
    [aeId]
  );

  res.json(result.rows);
};

/* ================= SCREENING ================= */
export const screeningManuscript = async (req, res) => {
  const { uuid } = req.params;

  await pool.query(
    `
    UPDATE manuscripts
    SET status_id = (SELECT id FROM manuscript_statuses WHERE label='screened')
    WHERE id = $1
    `,
    [uuid]
  );

  res.json({ message: "Screened" });
};

/* ================= GET REVIEWERS (ROLE FILTERED) ================= */
export const getReviewersByRole = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT
        u.uuid,
        u.full_name,
        u.email
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.uuid
      WHERE ur.role_id = $1
      ORDER BY u.full_name
      `,
      ["30d22914-dc7f-4532-ba19-31be2beb2e9d"]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get reviewers error:", error);
    res.status(500).json({ error: "Failed to fetch reviewers" });
  }
};


/* ================= ASSIGN REVIEWER ================= */
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

      /* 1. Insert Review Assignment (REAL WORKFLOW TABLE) */
      await client.query(
        `
        INSERT INTO review_assignments
        (
          manuscript_id,
          reviewer_id,
          status,
          deadline,
          created_at
        )
        VALUES ($1,$2,'pending',NOW()+INTERVAL '14 days',NOW())
        ON CONFLICT DO NOTHING
        `,
        [manuscriptUUID, reviewerId]
      );

      /* 2. Optional link table */
      await client.query(
        `
        INSERT INTO manuscript_reviewers
        (manuscript_id, reviewer_id)
        VALUES ($1,$2)
        ON CONFLICT DO NOTHING
        `,
        [manuscriptUUID, reviewerId]
      );
    }

    /* 3. Update Manuscript Status */
    await client.query(
      `
      UPDATE manuscripts
      SET status_id = (
        SELECT id FROM manuscript_statuses WHERE label='review'
      )
      WHERE id=$1
      `,
      [manuscriptUUID]
    );

    await client.query("COMMIT");

    res.json({ message: "Reviewers assigned & invitations created" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};



/* ================= RECOMMEND ================= */
export const recommendDecision = async (req, res) => {
  const { uuid } = req.params;
  const { decision } = req.body;

  await pool.query(
    `
    UPDATE manuscripts
    SET status_id = (SELECT id FROM manuscript_statuses WHERE label='decision'),
        recommendation = $2
    WHERE id = $1
    `,
    [uuid, decision]
  );

  res.json({ message: "Recommendation sent" });
};
