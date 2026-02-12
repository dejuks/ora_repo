import express from "express";
import {
  getAssignedReviews,
  respondToInvitation,
  startReview,
  getReviewerWorkspace,
   acceptReview, 
   declineReview, 
   submitReview
} from "../controllers/reviewer.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();


/* ================= GET ASSIGNED REVIEWS ================= */
router.get(
  "/assigned",
  authenticate,
  getAssignedReviews
);

/* ================= ACCEPT / DECLINE ================= */
router.post(
  "/invitation/:id/respond",
 authenticate,
  respondToInvitation
);

/* ================= START REVIEW ================= */
router.post(
  "/start-review/:id",
  authenticate,
  startReview
);

router.post(
  "/journal/reviewer/submit-review",
  authenticate,
  submitReview
);

router.get("/workspace", authenticate, getReviewerWorkspace);

router.put("/accept/:uuid", authenticate, acceptReview);
router.put("/decline/:uuid", authenticate, declineReview);
router.put("/submit/:uuid", authenticate, submitReview);
export default router;
