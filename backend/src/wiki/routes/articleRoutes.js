// routes/articleRoutes.js
import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createNewArticle,
  getArticles,
  getArticle,
  getArticleBySlugHandler,
  getMyArticles,
  getUserContributions, // You need to add this to controller
  getUserStats,        // You need to add this to controller
  getUserActivity,     // You need to add this to controller
  updateArticleHandler,
  deleteArticleHandler,
  permanentlyDeleteArticleHandler,
  restoreArticleHandler,
  getRevisions,
  getPopularArticles,
  getRecentArticles,
  getWikiStats,getAdminUserActivity,
  getLanguageStats
} from "../controllers/articleController.js";

const router = express.Router();

// Public routes
router.get("/", getArticles);
router.get("/popular", getPopularArticles);
router.get("/recent", getRecentArticles);
router.get("/stats", getWikiStats);
router.get("/languages/stats", getLanguageStats);
router.get("/slug/:slug", getArticleBySlugHandler);
router.get("/:id", getArticle);

// Protected routes (require authentication)
router.post("/", authenticate, createNewArticle);
router.get("/my-articles", authenticate, getMyArticles);

// THESE ARE THE MISSING ROUTES - ADD THEM
router.get("/user/activity", getUserActivity);
router.get("/admin/activity", getAdminUserActivity);
router.get("/user/contributions", authenticate, getUserContributions);
router.get("/user/stats", authenticate, getUserStats);

router.put("/:id", authenticate, updateArticleHandler);
router.delete("/:id",authenticate, deleteArticleHandler);
router.post("/:id/restore", authenticate, restoreArticleHandler);
router.get("/:id/revisions", authenticate, getRevisions);

// Admin only routes
router.delete("/:id/permanent", authenticate, permanentlyDeleteArticleHandler);

export default router;