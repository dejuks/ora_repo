import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

class Ebook {
  // Create new ebook
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

      // Insert ebook with all fields from your schema
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
        keywords || [],
        status || 'draft',
        editor_id || null,
        finance_clearance || false,
        manuscriptFile ? manuscriptFile.path : null,
        manuscriptFile ? manuscriptFile.size : null,
        manuscriptFile ? manuscriptFile.mimetype : null,
        coverFile ? coverFile.path : null,
        file_format || null,
        page_count ? parseInt(page_count) : null,
        language || 'om'
      ];

      const result = await client.query(query, values);
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
        u.email as editor_email
      FROM ebooks e
      LEFT JOIN users u ON e.editor_id = u.uuid
      WHERE 1=1
    `;
    
    const values = [];
    let paramIndex = 1;

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
      query += ` AND (e.title ILIKE $${paramIndex} OR e.abstract ILIKE $${paramIndex} OR $${paramIndex} = ANY(e.keywords))`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Find ebook by ID
  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        u.full_name as editor_name,
        u.email as editor_email
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

      // Get current ebook to check existing files
      const currentEbook = await this.findById(id);

      // Build update query dynamically
      let updateFields = [];
      let values = [];
      let paramIndex = 1;

      const fields = {
        title, 
        abstract, 
        keywords: keywords || [], 
        status, 
        editor_id,
        finance_clearance, 
        language, 
        page_count: page_count ? parseInt(page_count) : null, 
        file_format,
        updated_at: 'NOW()'
      };

      // Add file fields if new files uploaded
      if (manuscriptFile) {
        // Delete old manuscript file if exists
        if (currentEbook?.manuscript_file && fs.existsSync(currentEbook.manuscript_file)) {
          fs.unlinkSync(currentEbook.manuscript_file);
        }
        fields.manuscript_file = manuscriptFile.path;
        fields.manuscript_size = manuscriptFile.size;
        fields.manuscript_type = manuscriptFile.mimetype;
      }

      if (coverFile) {
        // Delete old cover file if exists
        if (currentEbook?.cover_image && fs.existsSync(currentEbook.cover_image)) {
          fs.unlinkSync(currentEbook.cover_image);
        }
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
      await client.query('COMMIT');
      
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete ebook
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
      }

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

  // Delete manuscript file only
  static async deleteManuscript(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const ebook = await client.query(
        'SELECT manuscript_file FROM ebooks WHERE id = $1',
        [id]
      );

      if (ebook.rows[0]?.manuscript_file) {
        const filePath = ebook.rows[0].manuscript_file;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await client.query(
        `UPDATE ebooks SET 
          manuscript_file = NULL, 
          manuscript_size = NULL, 
          manuscript_type = NULL,
          file_format = NULL,
          updated_at = NOW()
        WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete cover image only
  static async deleteCover(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const ebook = await client.query(
        'SELECT cover_image FROM ebooks WHERE id = $1',
        [id]
      );

      if (ebook.rows[0]?.cover_image) {
        const filePath = ebook.rows[0].cover_image;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await client.query(
        `UPDATE ebooks SET 
          cover_image = NULL,
          updated_at = NOW()
        WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get manuscript file path for download
  static async getFilePath(id) {
    const query = 'SELECT manuscript_file as file_path, title as file_name FROM ebooks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update status only
  static async updateStatus(id, status) {
    const query = `
      UPDATE ebooks 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, status
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Get ebooks by editor
  static async findByEditor(editorId) {
    const query = `
      SELECT * FROM ebooks 
      WHERE editor_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [editorId]);
    return result.rows;
  }
}

export default Ebook;