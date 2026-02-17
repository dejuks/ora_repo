import express from "express";
import {
  getAssignedManuscripts,
  getInitialScreeningManuscripts, // ✅ import the new controller
  screeningManuscript,
  getReviewersByRole,
  assignReviewer,
  recommendDecision,rejectManuscript
} from "../controllers/manuscript.ae.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/screening", authenticate, getInitialScreeningManuscripts);
router.put("/screening/:uuid", authenticate, screeningManuscript);
router.put("/reject/:uuid", authenticate, rejectManuscript);

// AE assigned manuscripts
router.get("/assigned-manuscripts", authenticate, getAssignedManuscripts);

// ✅ Initial Screening List
router.get("/screening", authenticate, getInitialScreeningManuscripts);

// // Screening (mark as screened)
// router.put("/screening/:uuid", authenticate, screeningManuscript);

// Reviewers (from users_roles)
router.get("/reviewers", authenticate, getReviewersByRole);

// Assign reviewer
router.post("/assign-reviewer/:uuid", authenticate, assignReviewer);

// Recommend decision (AE → EIC)
router.put("/recommend/:uuid", authenticate, recommendDecision);


export default router;
