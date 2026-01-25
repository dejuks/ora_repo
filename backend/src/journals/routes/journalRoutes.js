import express from "express";
import {
  createJournal,
  getAllJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
} from "../controllers/journalController.js";
import {
  getSections
} from "../../journals/journalsection/controllers/journalSection.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize("journal.create"), createJournal);
router.get("/", authenticate, authorize("journal.read"), getAllJournals);
router.get("/:id", authenticate, authorize("journal.read"), getJournalById);
router.put("/:id", authenticate, authorize("journal.update"), updateJournal);
router.delete("/:id", authenticate, authorize("journal.delete"), deleteJournal);
router.get("/:journalId/sections", getSections);
export default router;
