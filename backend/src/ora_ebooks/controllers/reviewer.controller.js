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
export async function getReviewerAssignmentDetailHandler(req, res) {
  try {
    const userId = req.user?.id;
    const userUuid = req.user?.uuid;
    const { assignmentId } = req.params;

    if (!isUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id",
      });
    }

    const query = `
      SELECT 
        ra.assignment_id,
        ra.ebook_id,
        ra.reviewer_id,
        ra.status,
        ra.recommendation,
        ra.comments,
        ra.confidential_comments,
        ra.assigned_at,
        ra.accepted_at,
        ra.completed_at,

        e.title,
        e.abstract,
        e.keywords,
        e.status AS ebook_status,

        u.name AS author_name,
        u.email AS author_email

      FROM review_assignments ra
      JOIN ebooks e ON e.ebook_id = ra.ebook_id
      LEFT JOIN users u ON u.id = e.author_id

      WHERE ra.assignment_id = $1
      AND (
        ra.reviewer_id::text = $2::text
        OR ra.reviewer_id::text = $3::text
      )
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [
      assignmentId,
      userId,
      userUuid,
    ]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found for this reviewer",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getReviewerAssignmentDetailHandler error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load assignment",
      error: error.message,
    });
  }
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

export const startReview = async ({ assignmentId, reviewerId }) => {
  try {
    const { rows } = await db.query(
      `
      UPDATE ebook_review_assignments
      SET
        status = 'in_review',
        started_at = NOW(),
        updated_at = NOW()
      WHERE assignment_id = $1
        AND reviewer_id = $2
        AND status = 'accepted'
      RETURNING *;
      `,
      [assignmentId, reviewerId]
    );

    if (!rows.length) {
      console.warn("⚠️ Start review failed:", { assignmentId, reviewerId });
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("❌ MODEL ERROR:", error);
    throw error;
  }
};

export async function startReviewHandler(req, res) {
  try {
    const reviewerId = req.user.id;
    const { assignmentId } = req.params;

    const result = await startReview({ assignmentId, reviewerId });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Assignment must be accepted first",
      });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("🔥 START REVIEW ERROR:", error); // 👈 VERY IMPORTANT

    return res.status(500).json({
      success: false,
      message: error.message, // 👈 SHOW REAL ERROR
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
    const reviewerId = 
  req.user?.id ||
  req.user?.uuid ||
  req.user?.user_id;
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

export const respondToAssignmentHandler = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { assignmentId } = req.params;

    const { action, response_note } = req.body;

    // ✅ FIX: map action → status
    const status = action;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const result = await respondToAssignment({
      assignmentId,
      reviewerId,
      status,
      response_note,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("respondToAssignmentHandler error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitReviewHandler = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { assignmentId } = req.params;

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
};

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