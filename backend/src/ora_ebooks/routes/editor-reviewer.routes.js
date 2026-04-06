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
  "/editor/assign-me-reviewers/:submissionId",
  authenticate,
  assignReviewersHandler
);
router.get("/editor/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "editor reviewer routes working",
  });
});


router.get(
  "/editor/assigned-reviewers/:submissionId",
  authenticate,
  getAssignReviewersPageData
);


router.patch(
  "/editor/assign-reviewers/:submissionId/assignment/:assignmentId",
  authenticate,
  validateUpdateAssignment,
  updateAssignmentHandler
);

router.delete(
  "/editor/assign-reviewers/:submissionId/assignment/:assignmentId",
  authenticate,
  removeAssignmentHandler
);

router.post(
  "/editor/assign-reviewers/:submissionId/assignment/:assignmentId/resend",
  authenticate,
  resendInvitationHandler
);

export default router;