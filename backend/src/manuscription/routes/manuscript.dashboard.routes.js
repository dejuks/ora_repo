// dashboard.routes.js
import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import { authenticate, } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Main dashboard stats (accessible by all authenticated users, but with different data)
router.get('/stats', DashboardController.getDashboardStats);

// Workflow analytics (EIC, AE, Admin only)
router.get(
  '/workflow-analytics',
  authorizeRoles('admin', 'eic', 'ae'),
  DashboardController.getWorkflowAnalytics
);

// Reviewer performance (Admin, EIC only)
router.get(
  '/reviewer-performance',
  authorizeRoles('admin', 'eic'),
  DashboardController.getReviewerPerformance
);

// Publication trends (Public for dashboard)
router.get('/publication-trends', DashboardController.getPublicationTrends);

// Author statistics (Admin, EIC only)
router.get(
  '/author-stats',
  authorizeRoles('admin', 'eic'),
  DashboardController.getAuthorStats
);

// Category performance (All authenticated)
router.get('/category-performance', DashboardController.getCategoryPerformance);

// Status timeline (All authenticated)
router.get('/status-timeline', DashboardController.getStatusTimeline);

// System health (Admin only)
router.get(
  '/system-health',
  authorizeRoles('admin'),
  DashboardController.getSystemHealth
);

// Dashboard manuscripts list with filters
router.get('/manuscripts', DashboardController.getDashboardManuscripts);

export default router;