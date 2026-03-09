import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadFile, getFilesByManuscript, deleteFile } from '../controllers/file.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads/manuscripts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word documents and images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Upload multiple files
router.post('/upload', upload.array('files', 10), uploadFile);

// Get all files for a manuscript
router.get('/manuscript/:manuscript_id', getFilesByManuscript);

// Download a file
router.get('/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const filePath = path.join(uploadDir, fileId);

  if (fs.existsSync(filePath)) {
    res.download(filePath, err => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
}); 

// Delete a file
router.delete('/:fileId', deleteFile);

export default router;