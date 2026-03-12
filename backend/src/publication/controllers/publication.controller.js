import pool from "../../config/db.js";

/* =====================================================
   GET PUBLISHED MANUSCRIPTS (status = 'paid')
===================================================== */
export const getPublishedManuscripts = async (req, res) => {
  try {
    console.log("getPublishedManuscripts called");
    
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        m.id,
        m.title,
        m.abstract,
        m.keywords,
        m.status,
        m.created_at as submitted_at,
        m.updated_at,
        m.published_at,
        u.full_name as author_name,
        u.email as author_email,
        f.file_path as file_path
      FROM manuscripts m
      LEFT JOIN users u ON u.uuid = m.corresponding_author_id
      LEFT JOIN files f ON f.manuscript_id = m.id 
      WHERE m.status = 'paid'
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        m.title ILIKE $${paramIndex} OR 
        m.abstract ILIKE $${paramIndex} OR 
        u.full_name ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY m.published_at DESC NULLS LAST, m.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM manuscripts WHERE status = 'paid'`
    );

    res.json({
      success: true,
      manuscripts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });

  } catch (err) {
    console.error("Get published manuscripts error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =====================================================
   GET SINGLE PUBLISHED MANUSCRIPT BY ID
===================================================== */
export const getPublishedManuscriptById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        m.id,
        m.title,
        m.abstract,
        m.keywords,
        m.status,
        m.created_at as submitted_at,
        m.published_at,
        u.full_name as author_name,
        u.email as author_email,
        u.affiliation as author_affiliation,
        (
          SELECT json_agg(
            json_build_object(
              'id', f.id,
              'file_path', f.file_path,
              'file_name', f.file_name,
              'file_type', f.file_type
            )
          )
          FROM files f
          WHERE f.manuscript_id = m.id
        ) as files
      FROM manuscripts m
      LEFT JOIN users u ON u.uuid = m.corresponding_author_id
      WHERE m.id = $1 AND m.status = 'paid'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Manuscript not found"
      });
    }

    res.json({
      success: true,
      manuscript: result.rows[0]
    });

  } catch (err) {
    console.error("Get published manuscript error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =====================================================
   GET JOURNAL STATISTICS
===================================================== */
export const getJournalStats = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total_manuscripts,
        COUNT(DISTINCT corresponding_author_id) as total_authors,
        MAX(published_at) as latest_publication
      FROM manuscripts
      WHERE status = 'paid'
      `
    );

    res.json({
      success: true,
      stats: result.rows[0]
    });

  } catch (err) {
    console.error("Get journal stats error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =====================================================
   GET RECENT MANUSCRIPTS
===================================================== */
export const getRecentManuscripts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const result = await pool.query(
      `
      SELECT 
        m.id,
        m.title,
        m.abstract,
        m.published_at,
        u.full_name as author_name
      FROM manuscripts m
      LEFT JOIN users u ON u.uuid = m.corresponding_author_id
      WHERE m.status = 'paid'
      ORDER BY m.published_at DESC NULLS LAST, m.updated_at DESC
      LIMIT $1
      `,
      [limit]
    );

    res.json({
      success: true,
      manuscripts: result.rows
    });

  } catch (err) {
    console.error("Get recent manuscripts error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};