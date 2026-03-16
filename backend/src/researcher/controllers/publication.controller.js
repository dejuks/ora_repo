import pool from "../../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

/* =====================================================
   PUBLICATION FILE UPLOAD CONFIG
===================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/publications";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pub-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const uploadPublicationFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).single('file');

/* =====================================================
   CREATE PUBLICATION
===================================================== */
export const createPublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const userId = req.user.uuid;
    const { title, authors, journal, year, doi, abstract } = req.body;
    const file = req.file ? `/uploads/publications/${req.file.filename}` : null;

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    // Parse authors from string to array
    let authorsArray = [];
    if (authors) {
      authorsArray = typeof authors === 'string' 
        ? authors.split(',').map(a => a.trim()) 
        : authors;
    }

    const result = await client.query(
      `
      INSERT INTO publications (
        uuid, user_id, title, authors, journal, year, doi, abstract, file_url, created_at, updated_at
      )
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
      `,
      [userId, title, authorsArray, journal || null, year || null, doi || null, abstract || null, file]
    );

    // Get user details
    const userResult = await client.query(
      `SELECT full_name, photo FROM users WHERE uuid = $1`,
      [userId]
    );

    const publication = {
      ...result.rows[0],
      user_name: userResult.rows[0]?.full_name,
      user_affiliation: userResult.rows[0]?.affiliation,
      user_photo: userResult.rows[0]?.photo,
      like_count: 0,
      comment_count: 0,
      is_liked: false
    };

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Publication created successfully",
      publication
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET MY PUBLICATIONS
===================================================== */
export const getMyPublications = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        p.*,
        u.full_name as user_name,
        u.email as user_email,
        r.affiliation as user_affiliation,
        r.photo as user_photo,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM publications p
      JOIN users u ON u.uuid = p.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = p.user_id
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as like_count
        FROM publication_likes
        GROUP BY publication_id
      ) l ON l.publication_id = p.uuid
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as comment_count
        FROM publication_comments
        GROUP BY publication_id
      ) c ON c.publication_id = p.uuid
      LEFT JOIN publication_likes ul ON ul.publication_id = p.uuid AND ul.user_id = $1
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [userId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting my publications:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   GET ALL PUBLICATIONS (PUBLIC FEED)
===================================================== */
export const getAllPublications = async (req, res) => {
  try {
    const userId = req.user?.uuid || null;

    const { rows } = await pool.query(
      `
      SELECT 
        p.*,
        u.full_name as user_name,
        u.email as user_email,
        r.affiliation as user_affiliation,
        r.photo as user_photo,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN $1::uuid IS NOT NULL AND ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM publications p
      JOIN users u ON u.uuid = p.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = p.user_id
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as like_count
        FROM publication_likes
        GROUP BY publication_id
      ) l ON l.publication_id = p.uuid
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as comment_count
        FROM publication_comments
        GROUP BY publication_id
      ) c ON c.publication_id = p.uuid
      LEFT JOIN publication_likes ul ON ul.publication_id = p.uuid AND ul.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [userId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting all publications:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   GET PUBLICATIONS BY USER
===================================================== */
export const getPublicationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.uuid || null;

    const { rows } = await pool.query(
      `
      SELECT 
        p.*,
        u.full_name as user_name,
        u.email as user_email,
        r.affiliation as user_affiliation,
        r.photo as user_photo,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN $2::uuid IS NOT NULL AND ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM publications p
      JOIN users u ON u.uuid = p.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = p.user_id
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as like_count
        FROM publication_likes
        GROUP BY publication_id
      ) l ON l.publication_id = p.uuid
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as comment_count
        FROM publication_comments
        GROUP BY publication_id
      ) c ON c.publication_id = p.uuid
      LEFT JOIN publication_likes ul ON ul.publication_id = p.uuid AND ul.user_id = $2
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [userId, currentUserId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting publications by user:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   UPDATE PUBLICATION
===================================================== */
export const updatePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;
    const { title, authors, journal, year, doi, abstract } = req.body;

    // Check ownership
    const checkResult = await client.query(
      `SELECT user_id FROM publications WHERE uuid = $1`,
      [publicationId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Publication not found" 
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own publications" 
      });
    }

    let authorsArray = null;
    if (authors) {
      authorsArray = typeof authors === 'string' 
        ? authors.split(',').map(a => a.trim()) 
        : authors;
    }

    const result = await client.query(
      `
      UPDATE publications
      SET
        title = COALESCE($1, title),
        authors = COALESCE($2, authors),
        journal = COALESCE($3, journal),
        year = COALESCE($4, year),
        doi = COALESCE($5, doi),
        abstract = COALESCE($6, abstract),
        updated_at = NOW()
      WHERE uuid = $7
      RETURNING *
      `,
      [title || null, authorsArray, journal || null, year || null, doi || null, abstract || null, publicationId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication updated successfully",
      publication: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   DELETE PUBLICATION
===================================================== */
export const deletePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;

    // Check ownership
    const checkResult = await client.query(
      `SELECT user_id, file_url FROM publications WHERE uuid = $1`,
      [publicationId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Publication not found" 
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own publications" 
      });
    }

    // Delete file if exists
    const fileUrl = checkResult.rows[0].file_url;
    if (fileUrl) {
      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete publication (cascade will delete likes and comments)
    await client.query(
      `DELETE FROM publications WHERE uuid = $1`,
      [publicationId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication deleted successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   LIKE PUBLICATION
===================================================== */
export const likePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;

    // Check if already liked
    const checkResult = await client.query(
      `SELECT * FROM publication_likes WHERE publication_id = $1 AND user_id = $2`,
      [publicationId, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query(
        `
        INSERT INTO publication_likes (uuid, publication_id, user_id, created_at)
        VALUES (gen_random_uuid(), $1, $2, NOW())
        `,
        [publicationId, userId]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication liked successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error liking publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   UNLIKE PUBLICATION
===================================================== */
export const unlikePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;

    await client.query(
      `DELETE FROM publication_likes WHERE publication_id = $1 AND user_id = $2`,
      [publicationId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication unliked successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error unliking publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   COMMENT ON PUBLICATION
===================================================== */
export const commentOnPublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment content is required" 
      });
    }

    const result = await client.query(
      `
      INSERT INTO publication_comments (uuid, publication_id, user_id, content, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      RETURNING *
      `,
      [publicationId, userId, content]
    );

    // Get user details
    const userResult = await client.query(
      `SELECT full_name, photo FROM users WHERE uuid = $1`,
      [userId]
    );

    const comment = {
      ...result.rows[0],
      user_name: userResult.rows[0]?.full_name,
      user_photo: userResult.rows[0]?.photo
    };

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error commenting on publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET PUBLICATION COMMENTS
===================================================== */
export const getPublicationComments = async (req, res) => {
  try {
    const { publicationId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT 
        pc.*,
        u.full_name as user_name,
        u.email as user_email,
        r.photo as user_photo
      FROM publication_comments pc
      JOIN users u ON u.uuid = pc.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = pc.user_id
      WHERE pc.publication_id = $1
      ORDER BY pc.created_at ASC
      `,
      [publicationId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting publication comments:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};