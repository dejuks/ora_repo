import express from "express";
import {
  getAssignedReviews,
  respondToInvitation,
  startReview,
  getReviewerWorkspace,
  acceptReview,
  declineReview,
  submitReview,
  getReviewDraft,
  getAssignmentDetails,
  saveReviewDraft, // You'll need to add this controller
} from "../controllers/reviewer.controller.js";
import multer from "multer";
const upload = multer({ dest: "uploads/review-drafts/" });

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(authenticate);

router.post("/assignments/:id/submit", upload.single("file"), submitReview);
/* ================= GET ASSIGNED REVIEWS ================= */
// This should match /api/reviewer/assignments
router.get("/assignments", getAssignedReviews);

// router.post("/assignments/:id/draft", saveReviewDraft);
router.post(
  "/assignments/:id/draft",
  upload.single("file"), // 👈 add this
  saveReviewDraft,
);

/* ================= GET SINGLE ASSIGNMENT DETAILS ================= */
router.get("/assignments/:id", getAssignmentDetails);

/* ================= ACCEPT / DECLINE ================= */
// This should match /api/reviewer/assignments/:id/respond
router.put("/assignments/:id/respond", respondToInvitation);

/* ================= START REVIEW ================= */
// This should match /api/reviewer/assignments/:id/start
router.put("/assignments/:id/start", startReview);

/* ================= SUBMIT REVIEW ================= */
// This should match /api/reviewer/assignments/:id/submit
router.post("/assignments/:id/submit", submitReview);
/* ================= WORKSPACE ================= */
router.get("/workspace", getReviewerWorkspace);

// Legacy routes (keep for backward compatibility)
// router.post("/assignments/:id/respond", respondToInvitation);
router.post("/start-review/:id", startReview);
router.post("/journal/reviewer/submit-review", submitReview);
router.put("/accept/:uuid", acceptReview);
router.put("/decline/:uuid", declineReview);
router.put("/submit/:uuid", submitReview);

router.get("/assignments/:id/draft", getReviewDraft);

router.get("/reviewer/assignments/:id", getAssignmentDetails);

export default router;
