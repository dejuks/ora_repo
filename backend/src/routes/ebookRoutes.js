// routes/ebookRoutes.js
import express from "express";
import {
  createEbook,
  getAllEbooks,
  getEbookById,
  updateEbook,
  deleteEbook,
  downloadManuscript,
  getFileVersions,
  deleteFileVersion,
  getEbookStats,
  bulkUpdateStatus
} from "../controllers/ebookController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllEbooks);
router.get("/stats", getEbookStats);
router.get("/:id", getEbookById);
router.get("/:id/download", downloadManuscript);
router.get("/:id/versions", getFileVersions);

// Protected routes (require authentication)
router.post("/", authenticate, createEbook);
router.put("/:id", authenticate, updateEbook);
router.delete("/:id", authenticate, deleteEbook);
router.delete("/:id/versions/:versionId", authenticate, deleteFileVersion);

// Admin/Editor only routes
router.post("/bulk/status", authenticate, authorize(['admin', 'editor']), bulkUpdateStatus);

export default router;