import express from 'express';
import { getReviewers, assignReviewer, getManuscriptsUnderReview } from '../controllers/review.controller.js';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();

router.get('/reviewers', auth, role(['ae','eic']), getReviewers);
router.post('/assign', auth, role(['ae','eic']), assignReviewer);
router.get('/manuscripts', auth, role(['ae','eic']), getManuscriptsUnderReview);

export default router;
