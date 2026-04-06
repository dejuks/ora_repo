import {
  getReviewerAssignments,
  getReviewerPendingAssignments,
  getReviewerAssignmentById,
  respondToAssignment,
  submitReview,
  getAssignmentFiles,
} from "../models/reviewer.model.js";

function isUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function getReviewerAssignmentsHandler(req, res) {
  try {
    const reviewerId = req.user?.id || req.user?.uuid;
    const { search = "", status = "" } = req.query;

    const rows = await getReviewerAssignments(reviewerId, { search, status });

    return res.json({
      success: true,
      message: "Reviewer assignments fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("getReviewerAssignmentsHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviewer assignments",
      error: error.message,
    });
  }
}

export async function getReviewerPendingAssignmentsHandler(req, res) {
  try {
    const reviewerId = req.user?.id || req.user?.uuid;
    const { search = "", status = "" } = req.query;

    const rows = await getReviewerPendingAssignments(reviewerId, {
      search,
      status,
    });

    return res.json({
      success: true,
      message: "Reviewer pending assignments fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("getReviewerPendingAssignmentsHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviewer pending assignments",
      error: error.message,
    });
  }
}

export async function getReviewerAssignmentByIdHandler(req, res) {
  try {
    const reviewerId = req.user?.id || req.user?.uuid;
    const { assignmentId } = req.params;

    if (!isUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id",
      });
    }

    const row = await getReviewerAssignmentById(assignmentId, reviewerId);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.json({
      success: true,
      message: "Reviewer assignment fetched successfully",
      data: row,
    });
  } catch (error) {
    console.error("getReviewerAssignmentByIdHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviewer assignment",
      error: error.message,
    });
  }
}

export async function respondToAssignmentHandler(req, res) {
  try {
    const reviewerId = req.user?.id || req.user?.uuid;
    const { assignmentId } = req.params;
    const status = req.body?.status || req.body?.action;
    const { response_note } = req.body;

    if (!isUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id",
      });
    }

    if (!["accepted", "declined"].includes(status)) {
      return res.status(422).json({
        success: false,
        message: "Status must be accepted or declined",
      });
    }

    const updated = await respondToAssignment({
      assignmentId,
      reviewerId,
      status,
      response_note: response_note || null,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or already updated",
      });
    }

    return res.json({
      success: true,
      message: `Assignment ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("respondToAssignmentHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to assignment",
      error: error.message,
    });
  }
}

export async function submitReviewHandler(req, res) {
  try {
    const reviewerId = req.user?.id || req.user?.uuid;
    const { assignmentId } = req.params;

    if (!isUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id",
      });
    }

    const {
      originality_score,
      clarity_score,
      methodology_score,
      relevance_score,
      comments_for_author,
      confidential_comments,
      recommendation,
    } = req.body;

    if (!recommendation) {
      return res.status(422).json({
        success: false,
        message: "Recommendation is required",
      });
    }

    const allowedRecommendations = [
      "accept",
      "minor_revision",
      "major_revision",
      "reject",
    ];

    if (!allowedRecommendations.includes(recommendation)) {
      return res.status(422).json({
        success: false,
        message: "Invalid recommendation value",
      });
    }

    const result = await submitReview({
      assignmentId,
      reviewerId,
      originality_score,
      clarity_score,
      methodology_score,
      relevance_score,
      comments_for_author,
      confidential_comments,
      recommendation,
    });

    return res.json({
      success: true,
      message: "Review submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("submitReviewHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
}

export async function getAssignmentFilesHandler(req, res) {
  try {
    const reviewerId = req.user?.id || req.user?.uuid;
    const { assignmentId } = req.params;

    if (!isUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id",
      });
    }

    const files = await getAssignmentFiles(assignmentId, reviewerId);

    return res.json({
      success: true,
      message: "Assignment files fetched successfully",
      data: files,
    });
  } catch (error) {
    console.error("getAssignmentFilesHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment files",
      error: error.message,
    });
  }
}