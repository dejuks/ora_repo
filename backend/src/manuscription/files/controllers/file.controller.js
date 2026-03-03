import pool from '../../../config/db.js';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  const client = await pool.connect();
  try {
    const { manuscript_id } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!manuscript_id) {
      return res.status(400).json({ error: 'manuscript_id is required' });
    }

    await client.query('BEGIN');

    const fileRecords = [];
    
    for (const file of req.files) {
      console.log("Processing file:", {
        file_name: file.file_name,
        originalname: file.originalname,
        path: file.path,
        size: file.size
      });

      // Generate UUID for file record
      const fileIdResult = await client.query(`SELECT gen_random_uuid() as id`);
      const fileId = fileIdResult.rows[0].id;

      const result = await client.query(
        `INSERT INTO files (
          id,
          manuscript_id,
          file_name,
          file_type,
          file_path,
          file_size,
          uploaded_by,
          uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *`,
        [
          fileId,
          manuscript_id,
          file.originalname,
          file.mimetype,
          file.path,
          file.size.toString(),
          req.user.uuid
        ]
      );
      fileRecords.push(result.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: fileRecords
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getFilesByManuscript = async (req, res) => {
  try {
    const { manuscript_id } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM files WHERE manuscript_id = $1 ORDER BY uploaded_at DESC`,
      [manuscript_id]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fileId } = req.params;
    
    await client.query('BEGIN');
    
    // Get file info first
    const fileResult = await client.query(
      `SELECT * FROM files WHERE id = $1`,
      [fileId]
    );
    
    if (fileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = fileResult.rows[0];
    
    // Delete from database
    await client.query(
      `DELETE FROM files WHERE id = $1`,
      [fileId]
    );
    
    // Delete from filesystem
    try {
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
      }
    } catch (fsError) {
      console.error('Error deleting file from filesystem:', fsError);
      // Continue even if file doesn't exist
    }
    
    await client.query('COMMIT');
    
    res.json({ message: 'File deleted successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};