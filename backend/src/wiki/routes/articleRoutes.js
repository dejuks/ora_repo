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
  getRecentChangesHandler,
  getWikiStats,
  getAdminUserActivity,
  updateArticleHandler,
  getLanguageStats,
  reportVandalism,
  reviewVandalismReport,
  getVandalismReports,
} from "../controllers/articleController.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get("/", getArticles);
router.get("/popular", getPopularArticles);
router.get("/recent", getRecentArticles);
router.get("/recent-changes", getRecentChangesHandler);
router.get("/stats", getWikiStats);
router.get("/languages/stats", getLanguageStats);
router.get("/slug/:slug", getArticleBySlugHandler);

// ==================== PROTECTED FIXED ROUTES ====================
router.post("/", authenticate, createNewArticle);
router.get("/my-articles", authenticate, getMyArticles);
router.get("/user/activity", authenticate, getUserActivity);
router.get("/admin/activity", authenticate, getAdminUserActivity);
router.get("/user/contributions", authenticate, getUserContributions);
router.get("/user/stats", authenticate, getUserStats);

// ==================== VANDALISM ROUTES ====================
router.get("/vandalism/reports", authenticate, getVandalismReports);
router.put("/vandalism/reports/:id/review", authenticate, reviewVandalismReport);

// ==================== DYNAMIC ARTICLE ROUTES ====================
router.get("/:id", getArticle);
router.put("/:id", authenticate, updateArticleHandler);
router.delete("/:id", authenticate, deleteArticleHandler);
router.post("/:id/restore", authenticate, restoreArticleHandler);
router.get("/:id/revisions", authenticate, getRevisions);
router.post("/:id/report-vandalism", authenticate, reportVandalism);

// ==================== ADMIN ONLY ROUTES ====================
router.delete("/:id/permanent", authenticate, permanentlyDeleteArticleHandler);

export default router;