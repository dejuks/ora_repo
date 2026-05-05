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