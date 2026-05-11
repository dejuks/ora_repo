import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getCurrentUserDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/dashboard",
  getCurrentUserDashboard
);

export default router;