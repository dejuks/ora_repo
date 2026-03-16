import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createNewArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  restoreArticle,
  permanentlyDeleteArticle,
  getArticleRevisions,
  getRevisionById,
  revertToRevision,
  getPendingReviews,
  reviewArticle,
  getVandalismReports,
  reportVandalism,
  reviewVandalismReport,
  protectArticle,
  getUserContributions,
  getArticleHistory,
  getPopularArticles,
  getRecentChanges,
  getRandomArticle
} from '../controllers/wikiArticle.controller.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (no auth required) ====================
// Get all articles with filters
router.get('/', getArticles);

// Get recent changes (public feed)
router.get('/recent-changes', getRecentChanges);

// Get popular articles
router.get('/popular', getPopularArticles);

// Get random article
router.get('/random', getRandomArticle);

// Get article history
router.get('/history/:id', getArticleHistory);

// Get article by slug (for clean URLs)
router.get('/slug/:slug', getArticleBySlug);

// Get article by ID
router.get('/:id', getArticleById);

// ==================== PROTECTED ROUTES (auth required) ====================
router.use(authenticateToken);

// Article CRUD operations
router.post('/', createNewArticle);                    // Create article
router.put('/:id', updateArticle);                      // Update article
router.delete('/:id', deleteArticle);                   // Soft delete article

// Article revisions
router.get('/:id/revisions', getArticleRevisions);      // Get all revisions
router.get('/:articleId/revisions/:revisionId', getRevisionById); // Get specific revision
router.post('/:articleId/revert/:revisionId', revertToRevision); // Revert to revision

// Admin only routes
router.post('/:id/restore', restoreArticle);                    // Restore soft-deleted
router.delete('/:id/permanent', permanentlyDeleteArticle);       // Permanent delete
router.get('/admin/reviews/pending', getPendingReviews);         // Get pending reviews
router.put('/:id/review', reviewArticle);                         // Review article

// Vandalism management
router.get('/vandalism/reports', getVandalismReports);           // Get reports (admin)
router.post('/:id/report-vandalism', reportVandalism);            // Report vandalism
router.put('/vandalism/reports/:id/review', reviewVandalismReport); // Review report (admin)

// Article protection
router.post('/:id/protect', protectArticle);                      // Protect article (admin)

// User contributions
router.get('/users/:userId/contributions', getUserContributions); // Get user contributions

export default router;