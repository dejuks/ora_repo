import express from "express";
import {
  registerAuthor,
  loginAuthor,
  getProfile,
  updateProfile,
  deleteAuthor
} from "../controllers/author.controller.js";

import { authenticate } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerAuthor);
router.post("/login", loginAuthor);

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.delete("/profile", authenticate, deleteAuthor);

export default router; // ✅ this exports default
