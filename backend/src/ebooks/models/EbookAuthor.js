// models/EbookAuthor.js
import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

class EbookAuthor {
  // Register new ebook author (inserts into both users and ebook_authors)
  static async register(authorData) {
    const { username, email, password, full_name, biography, affiliation } = authorData;
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generate IDs
      const userId = uuidv4();
      const authorId = uuidv4();
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert into users table
      const userQuery = `
        INSERT INTO users (uuid, username, email, password, full_name, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING uuid, username, email, full_name, created_at
      `;
      
      const userValues = [userId, username, email, hashedPassword, full_name];
      const userResult = await client.query(userQuery, userValues);
      
      // Insert into ebook_authors table
      const authorQuery = `
        INSERT INTO ebook_authors (id, user_id, biography, affiliation, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, user_id, biography, affiliation, created_at
      `;
      
      const authorValues = [authorId, userId, biography || null, affiliation || null];
      const authorResult = await client.query(authorQuery, authorValues);
      
      await client.query('COMMIT');
      
      // Combine and return the data
      return {
        user: userResult.rows[0],
        author: authorResult.rows[0]
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find author by email
  static async findByEmail(email) {
    const query = `
      SELECT u.*, ea.id as author_id, ea.biography, ea.affiliation, ea.created_at as author_created_at
      FROM users u
      LEFT JOIN ebook_authors ea ON u.uuid = ea.user_id
      WHERE u.email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find author by username
  static async findByUsername(username) {
    const query = `
      SELECT u.*, ea.id as author_id, ea.biography, ea.affiliation
      FROM users u
      LEFT JOIN ebook_authors ea ON u.uuid = ea.user_id
      WHERE u.username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Find author by ID (user uuid)
  static async findById(id) {
    const query = `
      SELECT u.*, ea.id as author_id, ea.biography, ea.affiliation, ea.created_at as author_created_at
      FROM users u
      LEFT JOIN ebook_authors ea ON u.uuid = ea.user_id
      WHERE u.uuid = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find author by author ID (ebook_authors id)
  static async findByAuthorId(authorId) {
    const query = `
      SELECT u.*, ea.id as author_id, ea.biography, ea.affiliation, ea.created_at as author_created_at
      FROM ebook_authors ea
      JOIN users u ON u.uuid = ea.user_id
      WHERE ea.id = $1
    `;
    
    const result = await pool.query(query, [authorId]);
    return result.rows[0];
  }

  // Get all authors
  static async getAll() {
    const query = `
      SELECT 
        u.uuid as user_id,
        u.username,
        u.email,
        u.full_name,
        u.created_at as user_created_at,
        ea.id as author_id,
        ea.biography,
        ea.affiliation,
        ea.created_at as author_created_at
      FROM ebook_authors ea
      JOIN users u ON u.uuid = ea.user_id
      ORDER BY ea.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Update author
  static async update(userId, updateData) {
    const { full_name, email, biography, affiliation } = updateData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update users table if needed
      if (full_name || email) {
        const userQuery = `
          UPDATE users 
          SET full_name = COALESCE($1, full_name),
              email = COALESCE($2, email),
              updated_at = NOW()
          WHERE uuid = $3
          RETURNING uuid, username, email, full_name
        `;
        
        await client.query(userQuery, [full_name, email, userId]);
      }
      
      // Update ebook_authors table
      const authorQuery = `
        UPDATE ebook_authors 
        SET biography = COALESCE($1, biography),
            affiliation = COALESCE($2, affiliation),
            updated_at = NOW()
        WHERE user_id = $3
        RETURNING id, biography, affiliation, updated_at
      `;
      
      await client.query(authorQuery, [biography, affiliation, userId]);
      
      await client.query('COMMIT');
      
      // Get updated author data
      const updatedAuthor = await this.findById(userId);
      return updatedAuthor;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete author (cascade delete will handle both tables if set in schema)
  static async delete(userId) {
    const query = 'DELETE FROM users WHERE uuid = $1 RETURNING uuid';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default EbookAuthor;