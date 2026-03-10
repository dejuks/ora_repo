import express from "express";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/journalSection.controller.js";

const router = express.Router();

router.get("/journals/:journalId/sections", getSections);
router.post("/journals/:journalId/sections", createSection);
router.put("/journal-sections/:id", updateSection);
router.delete("/journal-sections/:id", deleteSection);

export default router;
