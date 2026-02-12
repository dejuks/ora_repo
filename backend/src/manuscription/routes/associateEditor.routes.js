import express from "express";
import {
  getAssignedManuscripts,
  screeningManuscript,
  getReviewersByRole,
  assignReviewer,
  recommendDecision,
} from "../controllers/associateEditor.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// AE assigned manuscripts
router.get("/assigned-manuscripts", authenticate, getAssignedManuscripts);

// Screening
router.put("/screening/:uuid", authenticate, screeningManuscript);

// Reviewers (from users_roles)
router.get("/reviewers", authenticate, getReviewersByRole);

// Assign reviewer
router.post("/assign-reviewer/:uuid", authenticate, assignReviewer);

// Recommend
router.put("/recommend/:uuid", authenticate, recommendDecision);


export default router;
