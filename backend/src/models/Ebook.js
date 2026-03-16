// models/Ebook.js
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

class Ebook {
  // Create new ebook with files
  static async create(ebookData, files = {}, userId) {
    const { 
      title, abstract, keywords, status, editor_id, 
      finance_clearance, language, page_count, file_format 
    } = ebookData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const ebookId = uuidv4();
      const manuscriptFile = files.manuscript?.[0];
      const coverFile = files.cover?.[0];

      // Insert ebook
      const query = `
        INSERT INTO ebooks (
          id, title, abstract, keywords, status, editor_id, 
          finance_clearance, manuscript_file, manuscript_size, 
          manuscript_type, cover_image, file_format, page_count, 
          language, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        ebookId,
        title,
        abstract || null,
        keywords || null,
        status || 'draft',
        editor_id || null,
        finance_clearance || false,
        manuscriptFile ? manuscriptFile.path : null,
        manuscriptFile ? manuscriptFile.size : null,
        manuscriptFile ? manuscriptFile.mimetype : null,
        coverFile ? coverFile.path : null,
        file_format || null,
        page_count || null,
        language || 'om'
      ];

      const result = await client.query(query, values);

      // Record manuscript in ebook_files table
      if (manuscriptFile) {
        const fileId = uuidv4();
        await client.query(
          `INSERT INTO ebook_files 
           (id, ebook_id, file_name, file_path, file_size, file_type, uploaded_by, is_current)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            fileId,
            ebookId,
            manuscriptFile.originalname,
            manuscriptFile.path,
            manuscriptFile.size,
            manuscriptFile.mimetype,
            userId,
            true
          ]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find all ebooks with filters
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        e.*,
        u.full_name as editor_name,
        u.email as editor_email,
        (
          SELECT COUNT(*) FROM ebook_files WHERE ebook_id = e.id
        ) as version_count
      FROM ebooks e
      LEFT JOIN users u ON e.editor_id = u.uuid
      WHERE 1=1
    `;
    
    const values = [];
    let paramIndex = 1;

    // Apply filters
    if (filters.status) {
      query += ` AND e.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.language) {
      query += ` AND e.language = $${paramIndex}`;
      values.push(filters.language);
      paramIndex++;
    }

    if (filters.editor_id) {
      query += ` AND e.editor_id = $${paramIndex}`;
      values.push(filters.editor_id);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (e.title ILIKE $${paramIndex} OR e.abstract ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Find ebook by ID with full details
  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        u.full_name as editor_name,
        u.email as editor_email,
        (
          SELECT json_agg(json_build_object(
            'id', ef.id,
            'file_name', ef.file_name,
            'file_size', ef.file_size,
            'file_type', ef.file_type,
            'uploaded_at', ef.uploaded_at,
            'version', ef.version,
            'is_current', ef.is_current,
            'uploaded_by_name', up.full_name
          ) ORDER BY ef.version DESC)
          FROM ebook_files ef
          LEFT JOIN users up ON ef.uploaded_by = up.uuid
          WHERE ef.ebook_id = e.id
        ) as file_versions
      FROM ebooks e
      LEFT JOIN users u ON e.editor_id = u.uuid
      WHERE e.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update ebook
  static async update(id, updateData, files = {}, userId) {
    const { 
      title, abstract, keywords, status, editor_id, 
      finance_clearance, language, page_count, file_format 
    } = updateData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const manuscriptFile = files.manuscript?.[0];
      const coverFile = files.cover?.[0];

      // Build update query dynamically
      let updateFields = [];
      let values = [];
      let paramIndex = 1;

      const fields = {
        title, abstract, keywords, status, editor_id,
        finance_clearance, language, page_count, file_format,
        updated_at: 'NOW()'
      };

      // Add file fields if new files uploaded
      if (manuscriptFile) {
        fields.manuscript_file = manuscriptFile.path;
        fields.manuscript_size = manuscriptFile.size;
        fields.manuscript_type = manuscriptFile.mimetype;
      }

      if (coverFile) {
        fields.cover_image = coverFile.path;
      }

      // Build SET clause
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value === 'NOW()' ? 'NOW()' : value);
          paramIndex++;
        }
      });

      values.push(id);
      const query = `
        UPDATE ebooks 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);

      // Record new manuscript version if uploaded
      if (manuscriptFile) {
        // Mark old versions as not current
        await client.query(
          'UPDATE ebook_files SET is_current = FALSE WHERE ebook_id = $1',
          [id]
        );

        // Insert new version
        const fileId = uuidv4();
        await client.query(
          `INSERT INTO ebook_files 
           (id, ebook_id, file_name, file_path, file_size, file_type, uploaded_by, version, is_current)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 
           (SELECT COALESCE(MAX(version), 0) + 1 FROM ebook_files WHERE ebook_id = $2), $8)`,
          [
            fileId,
            id,
            manuscriptFile.originalname,
            manuscriptFile.path,
            manuscriptFile.size,
            manuscriptFile.mimetype,
            userId,
            true
          ]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete ebook and associated files
  static async delete(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get file paths before deletion
      const ebook = await client.query(
        'SELECT manuscript_file, cover_image FROM ebooks WHERE id = $1',
        [id]
      );

      // Delete physical files
      if (ebook.rows[0]) {
        const { manuscript_file, cover_image } = ebook.rows[0];
        
        if (manuscript_file && fs.existsSync(manuscript_file)) {
          fs.unlinkSync(manuscript_file);
        }
        if (cover_image && fs.existsSync(cover_image)) {
          fs.unlinkSync(cover_image);
        }

        // Delete all version files
        const versions = await client.query(
          'SELECT file_path FROM ebook_files WHERE ebook_id = $1',
          [id]
        );
        
        versions.rows.forEach(version => {
          if (version.file_path && fs.existsSync(version.file_path)) {
            fs.unlinkSync(version.file_path);
          }
        });
      }

      // Delete from database (cascade will handle ebook_files)
      const query = 'DELETE FROM ebooks WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);

      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get ebook statistics
  static async getStats() {
    const queries = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM ebooks"),
      pool.query("SELECT COUNT(*) as total FROM ebooks WHERE status = 'published'"),
      pool.query("SELECT COUNT(*) as total FROM ebooks WHERE status = 'draft'"),
      pool.query("SELECT COUNT(*) as total FROM ebooks WHERE status = 'under_review'"),
      pool.query("SELECT COUNT(*) as total FROM ebooks WHERE status = 'accepted'"),
      pool.query("SELECT COUNT(DISTINCT language) as total FROM ebooks"),
      pool.query("SELECT COUNT(DISTINCT editor_id) as total FROM ebooks WHERE editor_id IS NOT NULL"),
      pool.query(`
        SELECT language, COUNT(*) as count 
        FROM ebooks 
        GROUP BY language 
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT status, COUNT(*) as count 
        FROM ebooks 
        GROUP BY status 
        ORDER BY count DESC
      `)
    ]);

    return {
      total: parseInt(queries[0].rows[0].total),
      published: parseInt(queries[1].rows[0].total),
      draft: parseInt(queries[2].rows[0].total),
      underReview: parseInt(queries[3].rows[0].total),
      accepted: parseInt(queries[4].rows[0].total),
      languages: parseInt(queries[5].rows[0].total),
      editors: parseInt(queries[6].rows[0].total),
      byLanguage: queries[7].rows,
      byStatus: queries[8].rows
    };
  }

  // Get file versions
  static async getFileVersions(ebookId) {
    const query = `
      SELECT 
        ef.*,
        u.full_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM ebook_files ef
      LEFT JOIN users u ON ef.uploaded_by = u.uuid
      WHERE ef.ebook_id = $1
      ORDER BY ef.version DESC
    `;
    
    const result = await pool.query(query, [ebookId]);
    return result.rows;
  }

  // Download file
  static async getFilePath(ebookId, versionId = null) {
    let query;
    let values;

    if (versionId) {
      query = 'SELECT file_path, file_name FROM ebook_files WHERE id = $1 AND ebook_id = $2';
      values = [versionId, ebookId];
    } else {
      query = 'SELECT manuscript_file as file_path, title as file_name FROM ebooks WHERE id = $1';
      values = [ebookId];
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default Ebook;