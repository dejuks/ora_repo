import express from "express";
import {
  createEbook,
  getAllEbooks,
  getEbookById,
  updateEbook,
  deleteEbook,
  deleteManuscript,
  deleteCover,
  downloadManuscript,
  getEbookStats,
  updateStatus,
  getEbooksByEditor
} from "../controllers/ebookController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllEbooks);
router.get("/stats", getEbookStats);
router.get("/:id", getEbookById);
router.get("/:id/download", downloadManuscript);

// Protected routes (authentication required)
router.post("/", authenticate, createEbook);
router.put("/:id", authenticate, updateEbook);
router.delete("/:id", authenticate, deleteEbook);

// File management routes (authentication required)
router.delete("/:id/manuscript", authenticate, deleteManuscript);
router.delete("/:id/cover", authenticate, deleteCover);

// Status management (admin/editor only)
router.patch("/:id/status", authenticate, authorize(['admin', 'editor']), updateStatus);

// Editor specific routes
router.get("/editor/:editorId", authenticate, getEbooksByEditor);

export default router;