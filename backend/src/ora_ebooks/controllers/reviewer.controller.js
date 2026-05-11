import {
  getReviewerAssignments,
  getReviewerPendingAssignments,
  getReviewerAssignmentById,
  respondToAssignmentModel,
  startReview,submitReview,getCompletedReviews,
  markPaymentAsPaidModel,createProductionPaymentOrder,
  markProductionPaymentPaid,getReviewerCompletedProduction,
  getProductionPaymentOrders,getReviewerRejectedProduction,getReviewerAssignmentsAll
} from "../models/reviewer.model.js";

/**
 * LIST
 */
export async function getReviewerAssignmentsHandler(req, res) {
  const data = await getReviewerAssignments(req.user.id, req.query);
  res.json({ success: true, data });
}

/**
 * PENDING
 */
export async function getReviewerPendingAssignmentsHandler(req, res) {
  try {
    const reviewerId =
      req.user?.id ||
      req.user?.uuid ||
      req.user?.user_id;

    const { search = "", status = "" } = req.query;

    const data = await getReviewerPendingAssignments(
      reviewerId,
      { search, status }
    );

    return res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("getReviewerPendingAssignmentsHandler error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load assignments",
      error: error.message,
    });
  }
}
// submitReviewHandler
/**
 * ==========================================
 * SUBMIT REVIEW CONTROLLER
 * ==========================================
 */
export async function submitReviewHandler(req, res) {
  try {
    console.log("BODY:", req.body);

    const { assignmentId } = req.params;

    const result = await submitReview({
      assignmentId,
      reviewerId: req.user.uuid || req.user.id || req.user.user_id,
      reviewData: req.body,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or invalid status",
      });
    }

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("SUBMIT REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      detail: error.detail,
    });
  }
}

/**
 * DETAIL
 */
export async function getReviewerAssignmentByIdHandler(req, res) {
  try {
    const reviewerId =
      req.user?.uuid ||
      req.user?.id ||
      req.user?.user_id;

    const { assignmentId } = req.params;

    console.log("assignmentId:", assignmentId);
    console.log("reviewerId:", reviewerId);

    const data = await getReviewerAssignmentById(
      assignmentId,
      reviewerId
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "getReviewerAssignmentByIdHandler:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * ACCEPT / DECLINE
 */
export async function respondToAssignmentHandler(req, res) {
  try {
    const { assignmentId } = req.params;
    const { action } = req.body;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    // validate action
    if (!["accepted", "declined"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    // reviewer id
    const reviewerId =
      req.user?.id ||
      req.user?.uuid ||
      req.user?.user_id;

    if (!reviewerId) {
      return res.status(401).json({
        success: false,
        message: "Reviewer not authenticated",
      });
    }

    const result = await respondToAssignmentModel({
      assignmentId,
      reviewerId,
      status: action,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.json({
      success: true,
      message: `Assignment ${action} successfully`,
      data: result,
    });

  } catch (error) {
    console.error("RESPOND ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * START REVIEW
 */
export async function startReviewHandler(req, res) {
  const result = await startReview({
    assignmentId: req.params.assignmentId,
    reviewerId: req.user.id,
  });

  if (!result) {
    return res.status(400).json({
      success: false,
      message: "Accept first",
    });
  }

  res.json({ success: true, data: result });
}
/**
 * =========================================
 * COMPLETED REVIEWS
 * =========================================
 */
export async function getCompletedReviewsHandler(
  req,
  res
) {
  try {
    const data = await getCompletedReviews(
      req.user.uuid || req.user.id || req.user.user_id
    );

    return res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
export async function getReviewerCompletedProductionHandler(req, res) {
  try {
    const reviewerId = req.user.id;

    const data = await getReviewerCompletedProduction(reviewerId);

    return res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("Completed production error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// rejcted
// getRejectedReviewsHandler
export async function getRejectedReviewsHandler(
  req,
  res
) {
  try {
    const reviewerId =
      req.user.uuid || req.user.id || req.user.user_id;

    const data = await getReviewerRejectedProduction(
      reviewerId,
      "declined"
    );

    return res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// display all status
// getReviewerAssignmentsAllHandler
export async function getReviewerAssignmentsAllHandler(
  req,
  res
) {
  try {
    const reviewerId =
      req.user.uuid || req.user.id || req.user.user_id;

    const data = await getReviewerAssignmentsAll(
      reviewerId,
      req.query
    );

    return res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export async function markPaymentPaidHandler(req, res) {
  try {
    const { assignmentId } = req.params;
    const { method } = req.body;

    const result = await markPaymentAsPaidModel(
      assignmentId,
      method
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
    });
  }
}
export async function createProductionPaymentOrderHandler(
  req,
  res
) {
  try {

    const {
      assignment_id,
      amount,
      payment_method,
    } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: "assignment_id is required",
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "amount is required",
      });
    }

    const result =
      await createProductionPaymentOrder({
        assignmentId: assignment_id,
        amount,
        paymentMethod: payment_method,
      });

    return res.json({
      success: true,
      message:
        "Payment order created successfully",
      data: result,
    });

  } catch (err) {

    console.error(
      "CREATE PAYMENT ORDER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}

/**
 * MARK PAYMENT PAID
 */
export async function markProductionPaymentPaidHandler(
  req,
  res
) {
  try {

    const { assignmentId } = req.params;

    const result =
      await markProductionPaymentPaid({
        assignmentId,
      });

    return res.json({
      success: true,
      message: "Payment marked as paid",
      data: result,
    });

  } catch (err) {

    console.error(
      "MARK PAYMENT PAID ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}

/**
 * GET PAYMENT ORDERS
 */
export async function getProductionPaymentOrdersHandler(
  req,
  res
) {
  try {

    const rows =
      await getProductionPaymentOrders();

    return res.json({
      success: true,
      data: rows,
    });

  } catch (err) {

    console.error(
      "GET PAYMENT ORDERS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}