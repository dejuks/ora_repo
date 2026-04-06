import {
  getSubmissionById,
  getAvailableReviewers,
  getSubmissionAssignments,
  assignMultipleReviewers,
  removeAssignment,
  updateAssignmentStatus,
  resendInvitation,
} from "../models/editor-reviewer.model.js";

export async function getAssignReviewersPageData(req, res) {
  try {
    const { submissionId } = req.params;
    const search = String(req.query.search || "").trim();

    const submission = await getSubmissionById(submissionId);
    const reviewers = await getAvailableReviewers(search);
    const assignments = await getSubmissionAssignments(submissionId);

    return res.status(200).json({
      success: true,
      data: {
        submission: submission || null,
        reviewers: Array.isArray(reviewers) ? reviewers : [],
        assignments: Array.isArray(assignments) ? assignments : [],
      },
    });
  } catch (error) {
    console.error("getAssignReviewersPageData error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load assign reviewers page data",
      error: error.message,
    });
  }
}

export async function assignReviewersHandler(req, res) {
  try {
    const { submissionId } = req.params;
    const { reviewer_ids, due_date, invitation_note } = req.body || {};
    const assignedBy = req.user?.uuid || req.user?.id;

    console.log("assignReviewersHandler called with:", {
      submissionId,
      reviewer_ids,
      due_date,
      invitation_note,
      assignedBy,
    });

    if (!Array.isArray(reviewer_ids) || reviewer_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one reviewer ID must be provided",
      });
    }

    const submission = await getSubmissionById(submissionId);

    console.log("submission lookup result:", submission);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const result = await assignMultipleReviewers({
      submissionId: submission.submission_id,
      reviewerIds: reviewer_ids,
      assignedBy,
      dueDate: due_date || null,
      invitationNote: invitation_note || null,
    });

    return res.status(201).json({
      success: true,
      message: "Reviewer(s) assigned successfully",
      data: result,
    });
  } catch (error) {
    console.error("assignReviewersHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign reviewers",
      error: error.message,
    });
  }
}

export async function updateAssignmentHandler(req, res) {
  try {
    const { assignmentId } = req.params;
    const { status, due_date, invitation_note } = req.body || {};

    const updated = await updateAssignmentStatus({
      assignmentId,
      status,
      dueDate: due_date || null,
      invitationNote: invitation_note || null,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updateAssignmentHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
}

export async function removeAssignmentHandler(req, res) {
  try {
    const { submissionId, assignmentId } = req.params;

    const removed = await removeAssignment(assignmentId, submissionId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment removed successfully",
      data: removed,
    });
  } catch (error) {
    console.error("removeAssignmentHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove assignment",
      error: error.message,
    });
  }
}

export async function resendInvitationHandler(req, res) {
  try {
    const { assignmentId } = req.params;

    const updated = await resendInvitation(assignmentId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
      data: updated,
    });
  } catch (error) {
    console.error("resendInvitationHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend invitation",
      error: error.message,
    });
  }
}