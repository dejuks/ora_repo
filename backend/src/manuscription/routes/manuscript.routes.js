import express from "express";
import {
  getAllManuscripts,
  getManuscriptById,
  createManuscript,
  updateManuscript,
  deleteManuscript,

  // AUTHOR
  getDraftManuscripts,
  submitDraftManuscript,

  // AE / EIC
  getSubmittedManuscripts,
  moveToScreening,
  rejectToAuthor,
  resubmitManuscript,
  getInitialScreenedManuscripts,
} from "../controllers/manuscript.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

/* ======================================================
   AE / EIC ROUTES (MOST SPECIFIC FIRST)
====================================================== */

// Submitted manuscripts (AE)
router.get("/submitted", authenticate, getSubmittedManuscripts);

// Initial screened manuscripts (AE)
router.get("/ae/screening", authenticate, getInitialScreenedManuscripts);

// Move to screening
router.post("/:manuscriptId/screening", authenticate, moveToScreening);

// Reject to author
router.post("/:manuscriptId/reject", authenticate, rejectToAuthor);

// Author resubmission after rejection
router.post("/:manuscriptId/resubmit", authenticate, resubmitManuscript);


/* ======================================================
   AUTHOR – DRAFT ROUTES
====================================================== */

// Get author drafts
router.get("/drafts", authenticate, getDraftManuscripts);

// Submit draft
router.post("/:manuscriptId/submit", authenticate, submitDraftManuscript);


/* ======================================================
   NORMAL CRUD (LEAST SPECIFIC LAST)
====================================================== */

router.get("/", authenticate, getAllManuscripts);
router.get("/:id", authenticate, getManuscriptById);
router.post("/", authenticate, createManuscript);
router.put("/:id", authenticate, updateManuscript);
router.delete("/:id", authenticate, deleteManuscript);

export default router;
