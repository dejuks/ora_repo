import express from 'express';
import {
  createManuscript,
  getManuscripts,
  getMyManuscripts,
  getAssignedManuscripts,
  getForReviewManuscripts,
  getAllManuscripts,
  getManuscriptById,
  updateManuscript,
  deleteManuscript,
  uploadFile,
  getDrafts,
  getRevisions,
  getScreened,
   getPaymentOrderedManuscripts,
  getPaymentOrderedCount,screeningHandler
} from '../controllers/manuscript.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/uploadManuscript.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============= IMPORTANT: SPECIFIC ROUTES MUST COME BEFORE PARAMETER ROUTES =============
// These routes MUST be defined BEFORE router.route('/:id')
router.get('/revisions', getRevisions);

router.get('/my-manuscripts', getMyManuscripts);

// Status-specific routes (no UUID parameters)
router.post('/:id/screen', screeningHandler);

router.get('/drafts', getDrafts);
router.get('/screened', getScreened);
router.get('/payment-ordered', getPaymentOrderedManuscripts);
router.get('/payment-ordered/count', getPaymentOrderedCount);
// screening post
// http://localhost:5000/api/ebook/manuscripts/24393ce0-5cbb-49d3-8c39-f0fdb099e13d/screen


// Role-specific manuscript listing routes
router.get('/assigned-to-me', getAssignedManuscripts);
router.get('/for-review', getForReviewManuscripts);
router.get('/all', getAllManuscripts);

// CRUD routes
router.route('/')
  .get(getManuscripts)
  .post(upload.single('file'), createManuscript);

// ============= PARAMETER ROUTE MUST BE LAST =============
router.route('/:id')
  .get(getManuscriptById)
  .put(upload.single('file'), updateManuscript)
  .delete(deleteManuscript);

// File upload route (also uses parameter, but it's a POST action)
router.post('/:id/upload', upload.single('file'), uploadFile);

export default router;