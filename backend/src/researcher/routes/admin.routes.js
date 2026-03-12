import express from "express";
import { listPendingResearchers, approveResearcher } from "../controllers/admin.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/pending-researchers", authenticate, listPendingResearchers);
router.put("/approve-researcher/:userId", authenticate, approveResearcher);

export default router;
