// routes/wikiRoutes.js
import express from 'express';
import { 
  registerWikiAuthor, 
  loginWikiAuthor,
  getCurrentWikiAuthor
} from '../controllers/authController.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerWikiAuthor);
router.post('/login', loginWikiAuthor);

// Protected routes
router.get('/me', authenticate, getCurrentWikiAuthor);


// Get user activity
router.get('/user/activity', authenticate, async (req, res) => {
  try {
    const activities = await getUserActivity(req.user.id);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user contributions
router.get('/user/contributions', authenticate, async (req, res) => {
  try {
    const contributions = await getUserContributions(req.user.id);
    res.json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user notifications
router.get('/user/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user stats
router.get('/user/stats', authenticate, async (req, res) => {
  try {
    const stats = await getUserStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;