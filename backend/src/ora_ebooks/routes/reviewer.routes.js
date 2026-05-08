import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";

import {
  getReviewerAssignmentsHandler,
  getReviewerPendingAssignmentsHandler,
  getReviewerAssignmentByIdHandler,
  respondToAssignmentHandler,
  startReviewHandler,
  submitReviewHandler,getCompletedReviewsHandler,getReviewerCompletedProductionHandler,
  getProductionPaymentOrdersHandler,markPaymentPaidHandler,createProductionPaymentOrderHandler,markProductionPaymentPaidHandler 
} from "../controllers/reviewer.controller.js";

const router = express.Router();

router.use(authenticate);
/**
 * ACCEPT / DECLINE
 */
router.post(
  "/:assignmentId/respond",
  respondToAssignmentHandler
);

/**
 * ==========================================
 * SUBMIT REVIEW
 * ==========================================
 */
router.post(
  "/review-assignments/:assignmentId/submit-review",
  submitReviewHandler
);

/**
 * =========================================
 * COMPLETED REVIEWS
 * =========================================
 */
router.get(
  "/completed",
  getCompletedReviewsHandler
);

router.get(
  "/production/completed",
  getReviewerCompletedProductionHandler
);

/**
 * GET pending assignments
 */
router.get(
  "/pending",
  getReviewerPendingAssignmentsHandler
);

router.get(
  "/production/payments",
  getProductionPaymentOrdersHandler
);


/**
 * CREATE PAYMENT ORDER
 */
router.post(
  "/production/payment-orders",
  createProductionPaymentOrderHandler
);

/**
 * GET ALL PAYMENT ORDERS
 */
router.get(
  "/production/payment-orders",
  getProductionPaymentOrdersHandler
);

/**
 * MARK PAYMENT AS PAID
 */
router.put(
  "/payment-orders/:assignmentId/paid",
  markProductionPaymentPaidHandler
);

/**
 * MARK PAYMENT AS PAID
 */
router.post(
  "/production/payments/:assignmentId/paid",
  markPaymentPaidHandler
);

/**
 * GET all reviewer assignments
 */
router.get(
  "/assignments",
  getReviewerAssignmentsHandler
);

/**
 * GET single assignment detail
 */
router.get(
  "/assignments/:assignmentId",
  getReviewerAssignmentByIdHandler
);



/**
 * START REVIEW
 */
router.post(
  "/:assignmentId/start",
  startReviewHandler
);
// accept/ decline: http://localhost:5000/api/oraebook/reviewer/e6baa1a5-12e8-4a20-adb8-b86bd898905c/respond
// start review: http://localhost:5000/api/oraebook/reviewer/e6baa1a5-12e8-4a20-adb8-b86bd898905c/start
export default router;