// models/wikiMedia.model.js
import pool from "../../config/db.js";
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'wiki');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CREATE: Upload new media
export const createMedia = async (mediaData, userId, file) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const { article_id, license, alt_text, caption } = mediaData;
    
    // Generate file URL
    const fileUrl = `/uploads/wiki/${file.filename}`;
    const fileType = file.mimetype.split('/')[0]; // 'image', 'video', etc.
    const fileSize = file.size;

    const result = await client.query(
      `
      INSERT INTO wiki_media (
        article_id,
        file_url,
        file_type,
        file_size,
        uploaded_by,
        license,
        alt_text,
        caption,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
      `,
      [
        article_id || null,
        fileUrl,
        fileType,
        fileSize,
        userId,
        license || 'CC-BY-SA-4.0',
        alt_text || null,
        caption || null
      ]
    );

    // Get uploader info
    const userResult = await client.query(
      `SELECT username, full_name FROM users WHERE uuid = $1`,
      [userId]
    );

    await client.query("COMMIT");

    return {
      ...result.rows[0],
      uploaded_by_name: userResult.rows[0]?.full_name || userResult.rows[0]?.username,
      uploaded_by_username: userResult.rows[0]?.username
    };

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating media:", err);
    throw err;
  } finally {
    client.release();
  }
};

// READ: Get all media with pagination
export const getAllMedia = async (filters = {}, page = 1, limit = 20) => {
  const client = await pool.connect();
  
  try {
    const offset = (page - 1) * limit;
    
    // Build count query
    let countQuery = `SELECT COUNT(*) as total FROM wiki_media WHERE 1=1`;
    const countParams = [];

    if (filters.file_type) {
      countQuery += ` AND file_type = $${countParams.length + 1}`;
      countParams.push(filters.file_type);
    }

    if (filters.article_id) {
      countQuery += ` AND article_id = $${countParams.length + 1}`;
      countParams.push(filters.article_id);
    }

    if (filters.uploaded_by) {
      countQuery += ` AND uploaded_by = $${countParams.length + 1}`;
      countParams.push(filters.uploaded_by);
    }

    // Get total count
    const countResult = countParams.length > 0
      ? await client.query(countQuery, countParams)
      : await client.query(countQuery);
    
    const total = parseInt(countResult.rows[0]?.total) || 0;

    // Build main query
    let query = `
      SELECT 
        m.*,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_name,
        wp.display_name as uploader_display_name,
        wp.avatar_url as uploader_avatar,
        a.title as article_title,
        a.slug as article_slug
      FROM wiki_media m
      LEFT JOIN users u ON m.uploaded_by = u.uuid
      LEFT JOIN wiki_profiles wp ON m.uploaded_by = wp.user_id
      LEFT JOIN wiki_articles a ON m.article_id = a.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (filters.file_type) {
      query += ` AND m.file_type = $${queryParams.length + 1}`;
      queryParams.push(filters.file_type);
    }

    if (filters.article_id) {
      query += ` AND m.article_id = $${queryParams.length + 1}`;
      queryParams.push(filters.article_id);
    }

    if (filters.uploaded_by) {
      query += ` AND m.uploaded_by = $${queryParams.length + 1}`;
      queryParams.push(filters.uploaded_by);
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await client.query(query, queryParams);

    return {
      media: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

  } catch (err) {
    console.error("Error getting all media:", err);
    throw err;
  } finally {
    client.release();
  }
};

// READ: Get media by ID
export const getMediaById = async (mediaId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        m.*,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_name,
        wp.display_name as uploader_display_name,
        wp.avatar_url as uploader_avatar,
        a.title as article_title,
        a.slug as article_slug
      FROM wiki_media m
      LEFT JOIN users u ON m.uploaded_by = u.uuid
      LEFT JOIN wiki_profiles wp ON m.uploaded_by = wp.user_id
      LEFT JOIN wiki_articles a ON m.article_id = a.id
      WHERE m.id = $1
      `,
      [mediaId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error getting media by ID:", err);
    throw err;
  } finally {
    client.release();
  }
};

// READ: Get media by article
export const getMediaByArticle = async (articleId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        m.*,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_name
      FROM wiki_media m
      LEFT JOIN users u ON m.uploaded_by = u.uuid
      WHERE m.article_id = $1
      ORDER BY m.created_at DESC
      `,
      [articleId]
    );

    return result.rows;
  } catch (err) {
    console.error("Error getting media by article:", err);
    throw err;
  } finally {
    client.release();
  }
};

// READ: Get media by user
export const getMediaByUser = async (userId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        m.*,
        a.title as article_title,
        a.slug as article_slug
      FROM wiki_media m
      LEFT JOIN wiki_articles a ON m.article_id = a.id
      WHERE m.uploaded_by = $1
      ORDER BY m.created_at DESC
      `,
      [userId]
    );

    return result.rows;
  } catch (err) {
    console.error("Error getting media by user:", err);
    throw err;
  } finally {
    client.release();
  }
};

// UPDATE: Update media metadata
export const updateMedia = async (mediaId, updateData, userId) => {
  const client = await pool.connect();
  
  try {
    const { article_id, license, alt_text, caption } = updateData;

    const result = await client.query(
      `
      UPDATE wiki_media 
      SET 
        article_id = COALESCE($1, article_id),
        license = COALESCE($2, license),
        alt_text = COALESCE($3, alt_text),
        caption = COALESCE($4, caption)
      WHERE id = $5
      RETURNING *
      `,
      [article_id, license, alt_text, caption, mediaId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error updating media:", err);
    throw err;
  } finally {
    client.release();
  }
};

// DELETE: Delete media
export const deleteMedia = async (mediaId, userId) => {
  const client = await pool.connect();
  
  try {
    // Get file info first
    const media = await client.query(
      "SELECT file_url FROM wiki_media WHERE id = $1",
      [mediaId]
    );

    if (media.rows.length === 0) {
      throw new Error("Media not found");
    }

    // Delete from database
    const result = await client.query(
      "DELETE FROM wiki_media WHERE id = $1 RETURNING id",
      [mediaId]
    );

    // Delete physical file
    const filePath = path.join(process.cwd(), media.rows[0].file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.rows[0];
  } catch (err) {
    console.error("Error deleting media:", err);
    throw err;
  } finally {
    client.release();
  }
};

// GET: Media statistics
export const getMediaStats = async () => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_media,
        COUNT(DISTINCT uploaded_by) as total_contributors,
        SUM(CASE WHEN file_type = 'image' THEN 1 ELSE 0 END) as total_images,
        SUM(CASE WHEN file_type = 'video' THEN 1 ELSE 0 END) as total_videos,
        SUM(CASE WHEN file_type = 'audio' THEN 1 ELSE 0 END) as total_audio,
        SUM(CASE WHEN file_type = 'application' THEN 1 ELSE 0 END) as total_documents,
        SUM(file_size) as total_size_bytes
      FROM wiki_media
    `);

    return result.rows[0];
  } catch (err) {
    console.error("Error getting media stats:", err);
    throw err;
  } finally {
    client.release();
  }
};