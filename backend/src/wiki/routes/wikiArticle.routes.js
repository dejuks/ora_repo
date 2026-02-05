import express from "express";

import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,getDraftArticles,getArticleBySlug
} from "../controllers/wikiArticle.controller.js";

const router = express.Router();

router.post("/", createArticle);
router.get("/", getArticles);
router.get("/:id", getArticleById);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);



router.get("/drafts", getDraftArticles);

router.get("/slug/:slug", getArticleBySlug);

export default router;
