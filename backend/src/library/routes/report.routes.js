import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { libraryReportController } from "../controllers/libraryReport.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();
router.use(authenticate);
router.get('/summary', asyncHandler(libraryReportController.summary));
router.get('/overdue-loans', asyncHandler(libraryReportController.overdueLoans));
export default router;
