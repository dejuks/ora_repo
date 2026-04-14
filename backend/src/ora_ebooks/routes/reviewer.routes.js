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
// http://localhost:5000/api/ebook/manuscripts/24393ce0-5cbb-49d3-8c39-f0fdb099e13d/screen
router.post("/manuscripts/:manuscriptId/screen", respondToAssignmentHandler);
router.get("/review-assignments", getReviewerAssignmentsHandler);
router.get("/review-assignments/:assignmentId", getReviewerAssignmentByIdHandler);
router.post("/review-assignments/:assignmentId/respond", respondToAssignmentHandler);
router.post("/review-assignments/:assignmentId/submit-review", submitReviewHandler);
router.get("/review-assignments/:assignmentId/files", getAssignmentFilesHandler);

export default router;