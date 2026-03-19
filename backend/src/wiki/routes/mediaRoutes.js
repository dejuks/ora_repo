// routes/mediaRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  uploadMedia,
  getMedia,
  getMediaItem,
  getArticleMedia,
  getMyMedia,
  updateMediaItem,
  deleteMediaItem,
  getMediaStatistics
} from '../controllers/mediaController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/wiki/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|mp3|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload images, videos, audio, or documents.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Public routes
router.get('/', getMedia);
router.get('/stats', getMediaStatistics);
router.get('/article/:articleId', getArticleMedia);
router.get('/:id', getMediaItem);

// Protected routes
router.post('/upload', authenticate, upload.single('file'), uploadMedia);
router.get('/user/me', authenticate, getMyMedia);
router.put('/:id', authenticate, updateMediaItem);
router.delete('/:id', authenticate, deleteMediaItem);

export default router;