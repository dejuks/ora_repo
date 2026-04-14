import { Router } from "express";
import {
  getAssignReviewersPageData,
  assignReviewersHandler,
  removeAssignmentHandler,
  updateAssignmentHandler,
  resendInvitationHandler,
} from "../controllers/editor-reviewer.controller.js";
import {
  validateAssignReviewers,
  validateUpdateAssignment,
} from "../validators/editor-reviewer.validator.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();
router.post(
  "/assign-me-reviewers/:submissionId",
  authenticate,
  assignReviewersHandler
);
// 5000/api/ebook/manuscripts/24393ce0-5cbb-49d3-8c39-f0fdb099e13d/screen
http://localhost:5000/api/ebook/manuscripts/24393ce0-5cbb-49d3-8c39-f0fdb099e13d/screen
// api/oraebook/editor/assign-me-reviewers/95980a7d-2e45-4225-80c0-558d20720ed7

router.post(
  "/manuscripts/:uuid/screen",
  assignReviewersHandler
);

router.get("/editor/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "editor reviewer routes working",
  });
});


router.get(
  "/assigned-reviewers/:submissionId",
  authenticate,
  getAssignReviewersPageData
);


router.patch(
  "/assign-reviewers/:submissionId/assignment/:assignmentId",
  authenticate,
  validateUpdateAssignment,
  updateAssignmentHandler
);

router.delete(
  "/assign-reviewers/:submissionId/assignment/:assignmentId",
  authenticate,
  removeAssignmentHandler
);

router.post(
  "/assign-reviewers/:submissionId/assignment/:assignmentId/resend",
  authenticate,
  resendInvitationHandler
);

export default router;