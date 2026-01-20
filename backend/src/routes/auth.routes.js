import express from "express";
import { loginUser, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", authenticate, me);

export default router; // ✅ must exist
