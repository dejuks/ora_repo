import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createNewArticle,
  getArticles,
  getArticle,
  getArticleBySlugHandler,
  getMyArticles,
  getUserContributions,
  getUserStats,
  getUserActivity,
  deleteArticleHandler,
  permanentlyDeleteArticleHandler,
  restoreArticleHandler,
  getRevisions,
  getPopularArticles,
  getRecentArticles,
  getWikiStats,
  getAdminUserActivity,
  updateArticleHandler,
  getLanguageStats,
  // VANDALISM FUNCTIONS - FIXED IMPORTS
  reportVandalism,           // For POST /:id/report-vandalism
  reviewVandalismReport,      // For PUT /vandalism/reports/:id/review
  getVandalismReports         // For GET /vandalism/reports
} from "../controllers/articleController.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get("/", getArticles);
router.get("/popular", getPopularArticles);
router.get("/recent", getRecentArticles);
router.get("/stats", getWikiStats);
router.get("/languages/stats", getLanguageStats);
router.get("/slug/:slug", getArticleBySlugHandler);
router.get("/:id", getArticle);

// ==================== VANDALISM ROUTES ====================
// Report vandalism (any authenticated user) - THIS IS THE FIX
router.post("/:id/report-vandalism", authenticate, reportVandalism);

// Admin vandalism management routes
router.get("/vandalism/reports", authenticate, getVandalismReports);
router.put("/vandalism/reports/:id/review", authenticate, reviewVandalismReport);

// ==================== PROTECTED ROUTES ====================
router.post("/", authenticate, createNewArticle);
router.get("/my-articles", authenticate, getMyArticles);
router.get("/user/activity", authenticate, getUserActivity);
router.get("/admin/activity", authenticate, getAdminUserActivity);
router.get("/user/contributions", authenticate, getUserContributions);
router.get("/user/stats", authenticate, getUserStats);
router.put("/:id", authenticate, updateArticleHandler);
router.delete("/:id", authenticate, deleteArticleHandler);
router.post("/:id/restore", authenticate, restoreArticleHandler);
router.get("/:id/revisions", authenticate, getRevisions);

// ==================== ADMIN ONLY ROUTES ====================
router.delete("/:id/permanent", authenticate, permanentlyDeleteArticleHandler);

export default router;