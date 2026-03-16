import db from '../../config/db.js';

/* ===============================
   GET REVIEWERS LIST
================================ */
export const getReviewers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email FROM users WHERE role='reviewer'"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reviewers' });
  }
};

/* ===============================
   ASSIGN REVIEWERS
================================ */
export const assignReviewer = async (req, res) => {
  const { manuscript_id, reviewer_ids, due_date } = req.body;
  const assigned_by = req.user.id; // AE or EIC

  if (!manuscript_id || !reviewer_ids || !due_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Insert into review_assignments
    for (let reviewer_id of reviewer_ids) {
      await db.query(
        `INSERT INTO review_assignments (manuscript_id, reviewer_id, assigned_by, due_date)
         VALUES (?, ?, ?, ?)`,
        [manuscript_id, reviewer_id, assigned_by, due_date]
      );
    }

    // Update manuscript stage to 'under_review'
    const [stage] = await db.query(
      `SELECT id FROM stages WHERE code='under_review' LIMIT 1`
    );

    await db.query(
      `UPDATE manuscripts SET stage_id=? WHERE id=?`,
      [stage[0].id, manuscript_id]
    );

    // Insert into manuscript_stage_history
    await db.query(
      `INSERT INTO manuscript_stage_history (manuscript_id, stage_id, changed_by, comment)
       VALUES (?, ?, ?, ?)`,
      [manuscript_id, stage[0].id, assigned_by, 'Assigned reviewers, stage updated to under_review']
    );

    res.json({ message: 'Reviewers assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign reviewers' });
  }
};

/* ===============================
   GET MANUSCRIPTS READY FOR REVIEW
================================ */
export const getManuscriptsUnderReview = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.title, m.stage_id, s.name AS stage_name, u.name AS author_name
      FROM manuscripts m
      JOIN stages s ON s.id = m.stage_id
      JOIN users u ON u.id = m.corresponding_author_id
      WHERE m.stage_id = (SELECT id FROM stages WHERE code='under_review')
      ORDER BY m.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load manuscripts under review' });
  }
};
