import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getReviewerAssignmentsHandler,
  getReviewerPendingAssignmentsHandler,
  getReviewerAssignmentByIdHandler,
  respondToAssignmentHandler,
  submitReviewHandler,
  getAssignmentFilesHandler,
} from "../controllers/reviewer.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/pending", getReviewerPendingAssignmentsHandler);
router.post("/pending/:assignmentId/respond", respondToAssignmentHandler);

router.get("/review-assignments", getReviewerAssignmentsHandler);
router.get("/review-assignments/:assignmentId", getReviewerAssignmentByIdHandler);
router.post("/review-assignments/:assignmentId/respond", respondToAssignmentHandler);
router.post("/review-assignments/:assignmentId/submit-review", submitReviewHandler);
router.get("/review-assignments/:assignmentId/files", getAssignmentFilesHandler);

export default router;