import pool from '../../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   MULTER CONFIGURATION FOR FILE UPLOADS
================================= */
// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/manuscripts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  file_name: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `manuscript-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).array('files', 5); // Max 5 files

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
        CONCAT(u.full_name) AS author_name,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', f.id,
            'file_path', f.file_path,
            'file_type', f.file_type,
            'file_size', f.file_size,
            'uploaded_at', f.uploaded_at
          )), '[]'::json)
          FROM files f
          WHERE f.manuscript_id = m.id
        ) AS files
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
        CONCAT(u.full_name) AS author_name,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', f.id,
            'file_path', f.file_path,
            'file_type', f.file_type,
            'file_size', f.file_size,
            'uploaded_at', f.uploaded_at
          )), '[]'::json)
          FROM files f
          WHERE f.manuscript_id = m.id
        ) AS files
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

/* ==========================================
   CREATE MANUSCRIPT - ULTIMATE FIXED VERSION
========================================== */
export const createManuscript = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // Get fields from FormData
    const title = req.body.title;
    const abstract = req.body.abstract;
    const keywords = req.body.keywords;
    const authors = req.body.authors;
    const status = req.body.status || 'draft';

    // Get logged in user UUID from auth middleware
    const createdBy = req.user?.uuid;
    
    if (!createdBy) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Received data:", { title, abstract, keywords, authors, status, createdBy });

    /* =============================
       1️⃣ VALIDATION
    ============================== */
    if (!title || !abstract) {
      return res.status(400).json({ error: "title and abstract are required" });
    }

    /* =============================
       2️⃣ SAFE ARRAY PARSER
    ============================== */
    const parseToArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map(v => v.trim()).filter(v => v !== "");
      if (typeof value === "string") return value.split(",").map(v => v.trim()).filter(v => v !== "");
      return [];
    };

    const keywordsArray = parseToArray(keywords);
    const authorsArray = parseToArray(authors);

    /* =============================
       3️⃣ INSERT MANUSCRIPT
    ============================== */
    const manuscriptResult = await client.query(
      `INSERT INTO manuscripts (
        title, 
        abstract, 
        keywords, 
        authors, 
        status, 
        created_by, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3::text[], $4::text[], $5, $6, NOW(), NOW())
      RETURNING *`,
      [title, abstract, keywordsArray, authorsArray, status, createdBy]
    );

    const manuscript = manuscriptResult.rows[0];
    console.log("Manuscript created with ID:", manuscript.id);

    /* =============================
       4️⃣ HANDLE FILE UPLOADS - DEBUG VERSION
    ============================== */
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} files...`);
      
      for (const file of req.files) {
        console.log("Processing file:", {
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });

        // Generate UUID for file record
        const fileIdResult = await client.query(`SELECT gen_random_uuid() as id`);
        const fileId = fileIdResult.rows[0].id;
        
        console.log("Generated fileId:", fileId);
        console.log("manuscript.id:", manuscript.id);
        console.log("file.originalname:", file.originalname);
        console.log("file.mimetype:", file.mimetype);
        console.log("file.path:", file.path);
        console.log("file.size.toString():", file.size.toString());
        console.log("createdBy:", createdBy);

        // METHOD 1: Using named parameters with object (if your pg library supports it)
        // But standard pg doesn't support named parameters, so we'll use METHOD 2
        
        // METHOD 2: Explicit parameter order with clear variable naming
        const query = `
          INSERT INTO files (
            "id",
            "manuscript_id",
            "file_type",
            "file_path",
            "file_size",
            "uploaded_by",
            "uploaded_at"
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `;
        
        const params = [
          fileId,           // $1 - id (uuid)
          manuscript.id,    // $2 - manuscript_id (uuid)
          file.mimetype,    // $3 - file_type (text)
          file.path,        // $4 - file_path (text)
          file.size.toString(), // $5 - file_size (varchar)
          createdBy         // $6 - uploaded_by (uuid)
        ];
        
        console.log("Query:", query);
        console.log("Params with types:", [
          { value: params[0], type: typeof params[0] },
          { value: params[1], type: typeof params[1] },
          { value: params[2], type: typeof params[2] },
          { value: params[3], type: typeof params[3] },
          { value: params[4], type: typeof params[4] },
          { value: params[5], type: typeof params[5] },
          { value: params[6], type: typeof params[6] }
        ]);

        await client.query(query, params);

        console.log(`File inserted: ${file.originalname}`);
      }
      
      console.log(`Successfully processed ${req.files.length} files`);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Manuscript created successfully",
      manuscript: {
        ...manuscript,
        files_count: req.files?.length || 0
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("CREATE ERROR:", error);
    console.error("Error detail:", error.detail);
    console.error("Error position:", error.position);
    return res.status(500).json({ error: error.message });

  } finally {
    client.release();
  }
};
/* ===============================
   UPDATE Manuscript
================================= */
export const updateManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    // Parse data - handle both JSON and FormData
    let manuscriptData;
    if (req.body.data) {
      manuscriptData = JSON.parse(req.body.data);
    } else {
      manuscriptData = req.body;
    }

    const {
      title,
      abstract,
      category_id,
      corresponding_author_id,
      status,
      current_stage_id,
      keywords,
      authors,
      manuscript_type,
      language,
      comments,
      references,
      acknowledgements,
      cover_letter,
      funding_statement,
      conflict_of_interest,
      ethics_statement
    } = manuscriptData;

    await client.query('BEGIN');

    // Update manuscripts table
    const manuscriptResult = await client.query(
      `UPDATE manuscripts
       SET title = COALESCE($1, title),
           abstract = COALESCE($2, abstract),
           category_id = COALESCE($3, category_id),
           corresponding_author_id = COALESCE($4, corresponding_author_id),
           status = COALESCE($5, status),
           current_stage_id = COALESCE($6, current_stage_id),
           keywords = COALESCE($7, keywords),
           authors = COALESCE($8, authors),
           manuscript_type = COALESCE($9, manuscript_type),
           language = COALESCE($10, language),
           comments = COALESCE($11, comments),
           references = COALESCE($12, references),
           acknowledgements = COALESCE($13, acknowledgements),
           cover_letter = COALESCE($14, cover_letter),
           funding_statement = COALESCE($15, funding_statement),
           conflict_of_interest = COALESCE($16, conflict_of_interest),
           ethics_statement = COALESCE($17, ethics_statement),
           updated_at = NOW()
       WHERE id = $18
       RETURNING *`,
      [
        title,
        abstract,
        category_id ? parseInt(category_id) : null,
        corresponding_author_id,
        status,
        current_stage_id ? parseInt(current_stage_id) : null,
        keywords,
        authors,
        manuscript_type,
        language,
        comments,
        references,
        acknowledgements,
        cover_letter,
        funding_statement,
        conflict_of_interest,
        ethics_statement,
        id
      ]
    );

    if (!manuscriptResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Manuscript not found" });
    }

    const manuscript = manuscriptResult.rows[0];

    // Handle new file uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await client.query(
          `INSERT INTO files
           (manuscript_id, file_path, file_type, file_size, uploaded_by, uploaded_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            manuscript.id,
            file.originalname,
            file.path,
            file.mimetype,
            file.size,
            req.user.uuid
          ]
        );
      }
    }

    // Update manuscript_authors if corresponding author changed
    if (corresponding_author_id) {
      const existingAuthor = await client.query(
        `SELECT * FROM manuscript_authors 
         WHERE manuscript_id = $1 AND is_corresponding = true`,
        [id]
      );

      if (existingAuthor.rows.length) {
        await client.query(
          `UPDATE manuscript_authors
           SET user_id = $1
           WHERE manuscript_id = $2 AND is_corresponding = true`,
          [corresponding_author_id, id]
        );
      } else {
        await client.query(
          `INSERT INTO manuscript_authors
           (manuscript_id, user_id, author_order, is_corresponding)
           VALUES ($1, $2, $3, $4)`,
          [id, corresponding_author_id, 1, true]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Manuscript updated successfully',
      manuscript: manuscript
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* ===============================
   GET SUBMITTED MANUSCRIPTS
================================= */
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
              'id', f.id,
              'file_path', f.file_path,
              'file_type', f.file_type,
              'file_size', f.file_size,
              'uploaded_by', f.uploaded_by,
              'uploaded_at', f.uploaded_at
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS files
      FROM manuscripts m
      LEFT JOIN workflow_stages ws ON m.current_stage_id = ws.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      LEFT JOIN files f ON m.id = f.manuscript_id
      WHERE m.status = 'submitted'
      GROUP BY m.id, ws.name, c.name, u.full_name
      ORDER BY m.created_at ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET SUBMITTED ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   GET SCREENING MANUSCRIPTS
================================= */
export const getScreeningManuscripts = async (req, res) => {
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
              'id', f.id,
              'file_path', f.file_path,
              'file_type', f.file_type,
              'file_size', f.file_size,
              'uploaded_by', f.uploaded_by,
              'uploaded_at', f.uploaded_at
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS files
      FROM manuscripts m
      LEFT JOIN workflow_stages ws ON m.current_stage_id = ws.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      LEFT JOIN files f ON m.id = f.manuscript_id
      WHERE m.status = 'screening'
      GROUP BY m.id, ws.name, c.name, u.full_name
      ORDER BY m.created_at ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET SCREENING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   GET INITIAL SCREENED MANUSCRIPTS
================================= */
export const getInitialScreenedManuscripts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.status,
        ws.name AS stage_name,
        u.full_name AS author_name,
        c.name AS category_name,
        m.created_at,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', f.id,
              'file_path', f.file_path
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS files
      FROM manuscripts m
      LEFT JOIN workflow_stages ws ON m.current_stage_id = ws.id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN files f ON m.id = f.manuscript_id
      WHERE m.status = 'screening'
        AND m.current_stage_id = 2
      GROUP BY m.id, ws.name, u.full_name, c.name
      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET INITIAL SCREENED ERROR:", err);
    res.status(500).json({ error: 'Failed to load screened manuscripts' });
  }
};

/* ===============================
   MOVE TO SCREENING
================================= */
export const moveToScreening = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const { comment } = req.body;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    const result = await client.query(
      `SELECT current_stage_id FROM manuscripts WHERE id = $1`,
      [manuscriptId]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    const prevStage = result.rows[0].current_stage_id;

    await client.query(
      `UPDATE manuscripts
       SET status = 'screening',
           current_stage_id = 2,
           updated_at = NOW()
       WHERE id = $1`,
      [manuscriptId]
    );

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [manuscriptId, userId, prevStage, 2, comment || 'Initial Screening']
    );

    await client.query('COMMIT');

    res.json({ message: 'Moved to screening' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("MOVE TO SCREENING ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* ===============================
   REJECT TO AUTHOR
================================= */
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
      `SELECT current_stage_id FROM manuscripts WHERE id = $1`,
      [manuscriptId]
    );

    if (!m.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    const previousStage = m.rows[0].current_stage_id;

    // Update manuscript
    await client.query(
      `UPDATE manuscripts
       SET status = 'rejected',
           current_stage_id = 1,
           updated_at = NOW()
       WHERE id = $1`,
      [manuscriptId]
    );

    // Stage history with checklist
    const fullComment = `Checklist:\n- ${checklist?.join('\n- ') || 'None'}\n\nComment:\n${comment}`;

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1, $2, $3, $4, $5)`,
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

/* ===============================
   RESUBMIT MANUSCRIPT
================================= */
export const resubmitManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    const m = await client.query(
      `SELECT * FROM manuscripts WHERE id = $1 AND created_by = $2`,
      [manuscriptId, userId]
    );

    if (!m.rows.length) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not allowed' });
    }

    await client.query(
      `UPDATE manuscripts
       SET status = 'submitted',
           current_stage_id = 1,
           updated_at = NOW()
       WHERE id = $1`,
      [manuscriptId]
    );

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1, $2, $3, $4, 'Revised & resubmitted')`,
      [manuscriptId, userId, m.rows[0].current_stage_id, 1]
    );

    await client.query('COMMIT');

    res.json({ message: 'Resubmitted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("RESUBMIT ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* ===============================
   GET DRAFT MANUSCRIPTS
================================= */
export const getDraftManuscripts = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        category_id,
        authors,
        keywords,
        updated_at,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', f.id,
            'file_path', f.file_path
          )), '[]'::json)
          FROM files f
          WHERE f.manuscript_id = manuscripts.id
        ) AS files
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

/* ===============================
   SUBMIT DRAFT MANUSCRIPT
================================= */
export const submitDraftManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscriptId } = req.params;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    const m = await client.query(
      `SELECT * FROM manuscripts
       WHERE id = $1 AND created_by = $2 AND status = 'draft'`,
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
       SET status = 'submitted',
           current_stage_id = 1,
           updated_at = NOW(),
           submitted_at = NOW()
       WHERE id = $1`,
      [manuscriptId]
    );

    await client.query(
      `INSERT INTO manuscript_stage_history
       (manuscript_id, changed_by, previous_stage_id, new_stage_id, comment)
       VALUES ($1, $2, 1, 1, 'Submitted by author')`,
      [manuscriptId, userId]
    );

    await client.query('COMMIT');

    res.json({ message: 'Draft submitted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("SUBMIT DRAFT ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* ===============================
   DELETE MANUSCRIPT (Draft only)
================================= */
export const deleteManuscript = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const userId = req.user.uuid;

    await client.query('BEGIN');

    // Check if it's a draft and owned by user
    const check = await client.query(
      `SELECT * FROM manuscripts 
       WHERE id = $1 AND created_by = $2 AND status = 'draft'`,
      [id, userId]
    );

    if (!check.rows.length) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not allowed to delete this manuscript' });
    }

    // Delete associated files first
    await client.query(
      `DELETE FROM files WHERE manuscript_id = $1`,
      [id]
    );

    // Delete manuscript
    await client.query(
      `DELETE FROM manuscripts WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Draft deleted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* ===============================
   FILE DOWNLOAD
================================= */
export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await pool.query(
      `SELECT * FROM files WHERE id = $1`,
      [fileId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];

    // Check if file exists
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(file.file_path, file.file_name);

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};