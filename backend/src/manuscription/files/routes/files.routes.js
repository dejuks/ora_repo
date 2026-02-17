import express from 'express';
import { upload, uploadFile, getFilesByManuscript } from '../controllers/file.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = express.Router();
router.post('/upload', authenticate, upload.array('files'), uploadFile); // <-- 'files' is the key

// Upload a single file
router.post('/upload', authenticate, upload.single('file'), uploadFile);

// Get all files for a manuscript
router.get('/manuscript/:manuscript_id', authenticate, getFilesByManuscript);

export default router;
