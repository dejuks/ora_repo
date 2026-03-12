import pool from '../../../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// ====== Setup Multer Storage ======
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/manuscripts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });

// ====== Upload Multiple Files ======
export const uploadFile = async (req, res) => {
  try {
    const { manuscript_id, file_type } = req.body;
    const uploaded_by = req.user?.uuid;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    const insertedFiles = [];

    for (const file of req.files) {
      const filePath = file.path;
      const result = await pool.query(
        `INSERT INTO files (manuscript_id, file_type, file_path, uploaded_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [manuscript_id, file_type, filePath, uploaded_by]
      );
      insertedFiles.push(result.rows[0]);
    }

    res.status(201).json(insertedFiles);

  } catch (err) {
    console.error("UPLOAD FILE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ====== Get Files by Manuscript ======
export const getFilesByManuscript = async (req, res) => {
  try {
    const { manuscript_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM files WHERE manuscript_id=$1 ORDER BY uploaded_at DESC`,
      [manuscript_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET FILES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
