// controllers/ebookController.js
import pool from "../../config/db.js";

export const getAllEbooks = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*,
        u.full_name as author_name,
        u.username as author_username,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM ebooks e
      JOIN users u ON e.author_id = u.uuid
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.is_published = true
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ebooks"
    });
  }
};

export const getEbookCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(e.id) as count
      FROM categories c
      LEFT JOIN ebooks e ON c.id = e.category_id AND e.is_published = true
      GROUP BY c.id
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories"
    });
  }
};

export const getEbookStats = async (req, res) => {
  try {
    const queries = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM ebooks WHERE is_published = true"),
      pool.query("SELECT COALESCE(SUM(downloads), 0) as total FROM ebooks WHERE is_published = true"),
      pool.query("SELECT COUNT(DISTINCT author_id) as total FROM ebooks WHERE is_published = true"),
      pool.query("SELECT COUNT(DISTINCT language) as total FROM ebooks WHERE is_published = true")
    ]);
    
    const stats = {
      totalEbooks: parseInt(queries[0].rows[0].total),
      totalDownloads: Math.round(parseInt(queries[1].rows[0].total) / 1000),
      totalAuthors: parseInt(queries[2].rows[0].total),
      languages: parseInt(queries[3].rows[0].total)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stats"
    });
  }
};

export const getEbookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        e.*,
        u.full_name as author_name,
        u.username as author_username,
        u.bio as author_bio,
        c.name as category_name
      FROM ebooks e
      JOIN users u ON e.author_id = u.uuid
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = $1 AND e.is_published = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching ebook:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ebook"
    });
  }
};

export const downloadEbook = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update download count
    await pool.query(
      "UPDATE ebooks SET downloads = downloads + 1 WHERE id = $1",
      [id]
    );
    
    // Get ebook file path
    const result = await pool.query(
      "SELECT file_path, title FROM ebooks WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }
    
    // Return download URL (you'll need to implement file serving)
    res.json({
      success: true,
      data: {
        downloadUrl: `/uploads/ebooks/${result.rows[0].file_path}`
      }
    });
  } catch (error) {
    console.error("Error downloading ebook:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading ebook"
    });
  }
};

export const searchEbooks = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const query = `
      SELECT 
        e.*,
        u.full_name as author_name,
        c.name as category_name
      FROM ebooks e
      JOIN users u ON e.author_id = u.uuid
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE 
        e.is_published = true AND
        (e.title ILIKE $1 OR 
         e.description ILIKE $1 OR 
         u.full_name ILIKE $1 OR
         c.name ILIKE $1)
      ORDER BY e.downloads DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [`%${q}%`]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error searching ebooks:", error);
    res.status(500).json({
      success: false,
      message: "Error searching ebooks"
    });
  }
};