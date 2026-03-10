import express from "express";
import {
  sendConnectionRequest,
  getPendingConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  checkConnectionStatus
} from "../controllers/connection.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send connection request - THIS IS THE ROUTE YOU'RE CALLING
router.post("/connect/:researcherId", sendConnectionRequest);

// Get pending requests (received)
router.get("/connections/pending", getPendingConnectionRequests);

// Get sent requests
router.get("/connections/sent", getSentConnectionRequests);

// Accept connection request
router.put("/connections/accept/:requestId", acceptConnectionRequest);

// Reject connection request
router.put("/connections/reject/:requestId", rejectConnectionRequest);

// Get all connections
router.get("/connections", getMyConnections);

// Check connection status with specific researcher
router.get("/connections/status/:researcherId", checkConnectionStatus);

export default router;