import express from "express";
import {
  getAssignedManuscripts,
  getInitialScreeningManuscripts,
  screeningManuscript,
  completeScreening,
  getReviewersByRole,
  assignReviewer,
  recommendDecision,
  rejectManuscript,
} from "../controllers/manuscript.ae.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Initial Screening List (AE)
router.get("/screening", authenticate, getInitialScreeningManuscripts);

// Start screening (submitted → screening)
router.put("/screening/:uuid/start", authenticate, screeningManuscript);

// Complete screening (screening → screened)
router.put("/screening/:uuid/complete", authenticate, completeScreening);

// Reject manuscript with comment
router.put("/reject/:uuid", authenticate, rejectManuscript);

// AE assigned manuscripts
router.get("/assigned-manuscripts", authenticate, getAssignedManuscripts);

// Reviewers (from user_roles)
router.get("/reviewers", authenticate, getReviewersByRole);

// Assign reviewer
router.post("/assign-reviewer/:uuid", authenticate, assignReviewer);

// Recommend decision (AE → EIC)
router.put("/recommend/:uuid", authenticate, recommendDecision);

export default router;