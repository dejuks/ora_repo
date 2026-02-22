// routes/articleRoutes.js
import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createNewArticle,
  getArticles,
  getArticle,
  getArticleBySlugHandler,
  getMyArticles,
  updateArticleHandler,
  deleteArticleHandler,
  permanentlyDeleteArticleHandler,
  restoreArticleHandler,
  getRevisions,
  getPopularArticles,
  getRecentArticles,
  getWikiStats,getLanguageStats
} from "../controllers/articleController.js";

const router = express.Router();

// Public routes
router.get("/", getArticles);
router.get("/slug/:slug", getArticleBySlugHandler);
router.get("/stats", getWikiStats);

router.get("/my-articles", authenticate, getMyArticles); // Protected route for user's articles
router.get("/:id", getArticle);
// routes/statsRoutes.js

// Protected routes (require authentication)
router.post("/", authenticate, createNewArticle);
router.put("/:id", authenticate, updateArticleHandler);
router.delete("/:id", authenticate, deleteArticleHandler);
router.post("/:id/restore", authenticate, restoreArticleHandler);
router.get("/:id/revisions", authenticate, getRevisions);

// Admin only routes
router.delete("/:id/permanent", authenticate, permanentlyDeleteArticleHandler);

router.get("/popular", getPopularArticles);
router.get("/recent", getRecentArticles);
router.get('/languages/stats', getLanguageStats);



export default router;
