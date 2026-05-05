import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getReviewerAssignmentsHandler,
  getReviewerPendingAssignmentsHandler,
  getReviewerAssignmentByIdHandler,
  respondToAssignmentHandler,
  submitReviewHandler,
  getAssignmentFilesHandler,startReviewHandler
} from "../controllers/reviewer.controller.js";

const router = express.Router();

router.use(authenticate);

/**
 * Reviewer assignment lists
 */
router.get("/pending", getReviewerPendingAssignmentsHandler);
router.post("/:assignmentId/start", startReviewHandler);
router.get("/review-assignments", getReviewerAssignmentsHandler);

/**
 * Pending assignment response
 */
router.post("/pending/:assignmentId/respond", respondToAssignmentHandler);

/**
 * Reviewer assignment actions
 * IMPORTANT: keep these before /review-assignments/:assignmentId
 */
router.get("/review-assignments/:assignmentId/files", getAssignmentFilesHandler);

router.post(
  "/review-assignments/:assignmentId/respond",
  respondToAssignmentHandler
);

router.post(
  "/review-assignments/:assignmentId/submit-review",
  submitReviewHandler
);

/**
 * Reviewer assignment detail
 * This supports SubmitReviewPage.jsx loadAssignment()
 */
router.get(
  "/review-assignments/:assignmentId",
  getReviewerAssignmentByIdHandler
);

/**
 * Optional legacy route
 * Keep only if your frontend really uses this.
 */
router.post("/manuscripts/:manuscriptId/screen", respondToAssignmentHandler);

export default router;