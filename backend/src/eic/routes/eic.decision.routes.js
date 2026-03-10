import express from "express";
import {
  getCompletedReviews,
  getManuscriptForDecision,
  makeDecision,
  getDecisionHistory,
  getDecisionStats,
  getPaymentStats,
  updatePaymentStatus,
  getPendingPayments,
  getManuscriptPayments,
  initiatePayment,

} from "../controllers/eic.decision.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication and EIC role
router.use(authenticate);

// Get all manuscripts ready for decision
router.get("/completed-reviews", getCompletedReviews);

// Get single manuscript details for decision
router.get("/manuscript/:id", getManuscriptForDecision);

// Make final decision on manuscript
router.post("/manuscript/:id/decide", makeDecision);

// Get decision history for a manuscript
router.get("/manuscript/:id/decisions", getDecisionHistory);

// Get decision statistics for dashboard
router.get("/stats", getDecisionStats);

// Initiate payment for accepted manuscript
router.post("/manuscripts/:manuscriptId/initiate-payment", initiatePayment);

// Get payments for a specific manuscript
router.get("/manuscripts/:manuscriptId/payments", getManuscriptPayments);

// Get all pending payments
router.get("/payments/pending", getPendingPayments);

// Update payment status
router.patch("/payments/:paymentId", updatePaymentStatus);

// Get payment statistics
router.get("/payments/stats", getPaymentStats);

export default router;