import pool from '../../config/db.js';

/* ===============================
   GET ALL Manuscripts (current user only)
================================= */
export const getAllManuscripts = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const result = await pool.query(`
      SELECT 
        m.*,
        ws.name AS stage_name,
        c.name AS category_name,
        CONCAT(u.full_name) AS author_name
      FROM manuscripts m
      LEFT JOIN workflow_stages ws ON m.current_stage_id = ws.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      WHERE m.created_by = $1
      ORDER BY m.created_at DESC
    `, [userId]);

    res.json(result.rows);

  } catch (err) {
    console.error("GET ALL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


/* ===============================
   GET BY ID
================================= */
export const getManuscriptById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        m.*,
        ws.name AS stage_name,
        c.name AS category_name,
        CONCAT(u.full_name) AS author_name
      FROM manuscripts m
      LEFT JOIN workflow_stages ws 
        ON m.current_stage_id = ws.id
      LEFT JOIN categories c
        ON m.category_id = c.id
      LEFT JOIN users u
        ON m.corresponding_author_id = u.uuid
      WHERE m.id = $1
    `, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("GET BY ID ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};



/* ===============================
   CREATE
================================= */
export const createManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, abstract, category_id, corresponding_author_id, status, current_stage_id } = req.body;
    const createdBy = req.user.uuid; // Logged-in user

    await client.query('BEGIN');

    // Insert manuscript
    const manuscriptResult = await client.query(
      `INSERT INTO manuscripts
       (title, abstract, category_id, corresponding_author_id, status, current_stage_id, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
       RETURNING *`,
      [
        title,
        abstract || null,
        category_id || null,
        corresponding_author_id || null,
        status || 'submitted',
        current_stage_id || 1,
        createdBy
      ]
    );

    const manuscript = manuscriptResult.rows[0];

    // Insert manuscript_authors
    if (corresponding_author_id) {
      await client.query(
        `INSERT INTO manuscript_authors
         (manuscript_id, user_id, author_order, is_corresponding)
         VALUES ($1,$2,$3,$4)`,
        [manuscript.id, corresponding_author_id, 1, true]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(manuscript);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};




/* ===============================
   UPDATE Manuscript
   Also updates manuscript_authors if corresponding author changed
================================= */
export const updateManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      title,
      abstract,
      category_id,
      corresponding_author_id, // optional
      status,
      current_stage_id
    } = req.body;

    await client.query('BEGIN');

    // 1️⃣ Update manuscripts table
    const manuscriptResult = await client.query(
      `UPDATE manuscripts
       SET title=$1,
           abstract=$2,
           category_id=$3,
           corresponding_author_id=$4,
           status=$5,
           current_stage_id=$6,
           updated_at=NOW()
       WHERE id=$7
       RETURNING *`,
      [
        title,
        abstract,
        category_id,
        corresponding_author_id || null,
        status,
        current_stage_id,
        id
      ]
    );

    if (!manuscriptResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Manuscript not found" });
    }

    const manuscript = manuscriptResult.rows[0];

    // 2️⃣ Update manuscript_authors table
    if (corresponding_author_id) {
      // Check if a corresponding author already exists
      const existingAuthor = await client.query(
        `SELECT * FROM manuscript_authors 
         WHERE manuscript_id=$1 AND is_corresponding=true`,
        [id]
      );

      if (existingAuthor.rows.length) {
        // Update existing corresponding author
        await client.query(
          `UPDATE manuscript_authors
           SET user_id=$1
           WHERE manuscript_id=$2 AND is_corresponding=true`,
          [corresponding_author_id, id]
        );
      } else {
        // Insert if no corresponding author exists
        await client.query(
          `INSERT INTO manuscript_authors
           (manuscript_id, user_id, author_order, is_corresponding)
           VALUES ($1,$2,$3,$4)`,
          [id, corresponding_author_id, 1, true]
        );
      }
    }

    await client.query('COMMIT');

    res.json(manuscript);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const getSubmittedManuscripts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        ws.name AS stage_name,
        c.name AS category_name,
        u.full_name AS author_name,

        COALESCE(
          json_agg(
            jsonb_build_object(
              'manuscript_id', mf.manuscript_id,
              'revision_id', mf.revision_id,
              'file_type', mf.file_type,
              'file_path', mf.file_path,
              'uploaded_by', mf.uploaded_by,
              'uploaded_at', mf.uploaded_at
            )
          ) FILTER (WHERE mf.manuscript_id IS NOT NULL),
          '[]'
        ) AS files

      FROM manuscripts m

      LEFT JOIN workflow_stages ws 
        ON m.current_stage_id = ws.id

      LEFT JOIN categories c 
        ON m.category_id = c.id

      LEFT JOIN users u 
        ON m.corresponding_author_id = u.uuid

      LEFT JOIN files mf
        ON m.id = mf.manuscript_id

      WHERE m.status = 'submitted'

      GROUP BY 
        m.id,
        ws.name,
        c.name,
        u.full_name

      ORDER BY m.created_at ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET SUBMITTED ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};




export const moveToScreening = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const { comment } = req.body;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    const result = await client.query(
      `SELECT current_stage_id FROM manuscripts WHERE id=$1`,
      [manuscriptId]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    const prevStage = result.rows[0].current_stage_id;

    await client.query(
      `UPDATE manuscripts
       SET status='screening',
           current_stage_id=2,
           updated_at=NOW()
       WHERE id=$1`,
      [manuscriptId]
    );

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1,$2,$3,$4,$5)`,
      [manuscriptId, userId, prevStage, 2, comment || 'Initial Screening']
    );

    await client.query('COMMIT');

    res.json({ message: 'Moved to screening' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const rejectToAuthor = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const { comment, checklist } = req.body;
    const userId = req.user.uuid;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Rejection comment is required' });
    }

    await client.query('BEGIN');

    const m = await client.query(
      `SELECT current_stage_id FROM manuscripts WHERE id=$1`,
      [manuscriptId]
    );

    if (!m.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    const previousStage = m.rows[0].current_stage_id;

    // 1️⃣ Update manuscript
    await client.query(
      `UPDATE manuscripts
       SET status='rejected',
           current_stage_id=1,
           updated_at=NOW()
       WHERE id=$1`,
      [manuscriptId]
    );

    // 2️⃣ Stage history (store checklist in comment)
    const fullComment =
      `Checklist:\n- ${checklist?.join('\n- ') || 'None'}\n\nComment:\n${comment}`;

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1,$2,$3,$4,$5)`,
      [manuscriptId, userId, previousStage, 1, fullComment]
    );

    await client.query('COMMIT');

    res.json({ message: 'Rejected and returned to author' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('REJECT ERROR:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const resubmitManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    const m = await client.query(
      `SELECT * FROM manuscripts WHERE id=$1 AND created_by=$2`,
      [manuscriptId, userId]
    );

    if (!m.rows.length) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not allowed' });
    }

    await client.query(
      `UPDATE manuscripts
       SET status='submitted',
           current_stage_id=1,
           updated_at=NOW()
       WHERE id=$1`,
      [manuscriptId]
    );

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1,$2,$3,$4,'Revised & resubmitted')`,
      [manuscriptId, userId, m.rows[0].current_stage_id, 1]
    );

    await client.query('COMMIT');

    res.json({ message: 'Resubmitted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const getInitialScreenedManuscripts = async (req, res) => {
  try {
    const rows = await db.query(
      `
      SELECT 
        m.id,
        m.title,
        m.status,
        s.name AS stage_name,
        u.name AS author_name,
        c.name AS category_name,
        m.created_at
      FROM manuscripts m
      JOIN stages s ON s.id = m.stage_id
      JOIN users u ON u.id = m.corresponding_author_id
      JOIN categories c ON c.id = m.category_id
      WHERE m.status = 'screening'
        AND s.code = 'initial_screening'
      ORDER BY m.created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load screened manuscripts' });
  }
};

/* ===============================
   GET DRAFT MANUSCRIPTS (AUTHOR)
================================ */
export const getDraftManuscripts = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        category_id,
        updated_at
      FROM manuscripts
      WHERE created_by = $1
        AND status = 'draft'
      ORDER BY updated_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('DRAFT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};


export const submitDraftManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    const m = await client.query(
      `SELECT * FROM manuscripts
       WHERE id=$1 AND created_by=$2 AND status='draft'`,
      [manuscriptId, userId]
    );

    if (!m.rows.length) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Draft not found or not allowed' });
    }

    // Validation
    if (!m.rows[0].title || !m.rows[0].abstract || !m.rows[0].category_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Draft is incomplete' });
    }

    await client.query(
      `UPDATE manuscripts
       SET status='submitted',
           current_stage_id=1,
           updated_at=NOW()
       WHERE id=$1`,
      [manuscriptId]
    );

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1,$2,1,1,'Submitted by author')`,
      [manuscriptId, userId]
    );

    await client.query('COMMIT');

    res.json({ message: 'Draft submitted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
export const deleteManuscript = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uuid;

  await pool.query(
    `DELETE FROM manuscripts
     WHERE id=$1 AND created_by=$2 AND status='draft'`,
    [id, userId]
  );

  res.json({ message: 'Draft deleted' });
};

