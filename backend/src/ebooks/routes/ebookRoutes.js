// routes/ebookRoutes.js
import express from "express";
import {
  getAllEbooks,
  getEbookById,
  getEbookCategories,
  getEbookStats,
  downloadEbook,
  searchEbooks
} from "../controllers/ebookController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/all", getAllEbooks);
router.get("/categories", getEbookCategories);
router.get("/stats", getEbookStats);
router.get("/search", searchEbooks);
router.get("/:id", getEbookById);

// Protected routes
router.post("/download/:id", authenticate, downloadEbook);

export default router;