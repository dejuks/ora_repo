// src/ebooks/models/ebook.js 
const pool = require('../../config/db');

class Ebook {
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM ebooks WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.editor_id) {
        query += ` AND editor_id = $${paramCount}`;
        values.push(filters.editor_id);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching ebooks: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT * FROM ebooks WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching ebook by ID: ${error.message}`);
    }
  }

  static async create(ebookData) {
    try {
      const {
        title,
        author,
        description,
        abstract,
        keywords,
        status,
        editor_id,
        finance_clearance,
        manuscript_file,
        manuscript_size,
        manuscript_type,
        cover_image,
        file_format,
        page_count,
        language
      } = ebookData;

      // Validate required fields
      if (!title || !editor_id) {
        throw new Error('Title and editor_id are required');
      }

      const query = `
        INSERT INTO ebooks (
          title, author, description, abstract, keywords, status, editor_id,
          finance_clearance, manuscript_file, manuscript_size, manuscript_type,
          cover_image, file_format, page_count, language, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        title,
        author || null,
        description || null,
        abstract || null,
        keywords ? JSON.stringify(keywords) : '[]',
        status || 'draft',
        editor_id,
        finance_clearance || false,
        manuscript_file || null,
        manuscript_size ? parseInt(manuscript_size) : null,
        manuscript_type || null,
        cover_image || null,
        file_format || null,
        page_count ? parseInt(page_count) : null,
        language || 'om'
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating ebook: ${error.message}`);
    }
  }

  static async update(id, ebookData) {
    try {
      const {
        title,
        author,
        description,
        abstract,
        keywords,
        status,
        editor_id,
        finance_clearance,
        manuscript_file,
        manuscript_size,
        manuscript_type,
        cover_image,
        file_format,
        page_count,
        language
      } = ebookData;

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount}`);
        values.push(title);
        paramCount++;
      }
      if (author !== undefined) {
        updates.push(`author = $${paramCount}`);
        values.push(author);
        paramCount++;
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(description);
        paramCount++;
      }
      if (abstract !== undefined) {
        updates.push(`abstract = $${paramCount}`);
        values.push(abstract);
        paramCount++;
      }
      if (keywords !== undefined) {
        updates.push(`keywords = $${paramCount}`);
        values.push(JSON.stringify(keywords));
        paramCount++;
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }
      if (editor_id !== undefined) {
        updates.push(`editor_id = $${paramCount}`);
        values.push(editor_id);
        paramCount++;
      }
      if (finance_clearance !== undefined) {
        updates.push(`finance_clearance = $${paramCount}`);
        values.push(finance_clearance);
        paramCount++;
      }
      if (manuscript_file !== undefined) {
        updates.push(`manuscript_file = $${paramCount}`);
        values.push(manuscript_file);
        paramCount++;
      }
      if (manuscript_size !== undefined) {
        updates.push(`manuscript_size = $${paramCount}`);
        values.push(manuscript_size ? parseInt(manuscript_size) : null);
        paramCount++;
      }
      if (manuscript_type !== undefined) {
        updates.push(`manuscript_type = $${paramCount}`);
        values.push(manuscript_type);
        paramCount++;
      }
      if (cover_image !== undefined) {
        updates.push(`cover_image = $${paramCount}`);
        values.push(cover_image);
        paramCount++;
      }
      if (file_format !== undefined) {
        updates.push(`file_format = $${paramCount}`);
        values.push(file_format);
        paramCount++;
      }
      if (page_count !== undefined) {
        updates.push(`page_count = $${paramCount}`);
        values.push(page_count ? parseInt(page_count) : null);
        paramCount++;
      }
      if (language !== undefined) {
        updates.push(`language = $${paramCount}`);
        values.push(language);
        paramCount++;
      }

      updates.push(`updated_at = NOW()`);

      if (updates.length === 1) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE ebooks 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      values.push(id);

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating ebook: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM ebooks WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting ebook: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE ebooks SET status = $1, updated_at = NOW()
        WHERE id = $2 RETURNING *
      `;
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating ebook status: ${error.message}`);
    }
  }

  static async findByEditor(editorId) {
    try {
      const query = 'SELECT * FROM ebooks WHERE editor_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [editorId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching editor ebooks: ${error.message}`);
    }
  }

  static async search(query) {
    try {
      const searchQuery = `
        SELECT * FROM ebooks 
        WHERE title ILIKE $1 
           OR author ILIKE $1 
           OR description ILIKE $1 
           OR abstract ILIKE $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(searchQuery, [`%${query}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching ebooks: ${error.message}`);
    }
  }
}

module.exports = Ebook;