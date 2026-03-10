import express from "express";
import {
  getPublishedManuscripts,
  getPublishedManuscriptById,
  getRecentManuscripts,
  getJournalStats
} from "../controllers/publication.controller.js";

const router = express.Router();

// Public routes - no authentication needed
router.get("/manuscripts", getPublishedManuscripts);
router.get("/manuscripts/recent", getRecentManuscripts);
router.get("/manuscripts/:id", getPublishedManuscriptById);
router.get("/stats", getJournalStats);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Publication routes are working" });
});

export default router;