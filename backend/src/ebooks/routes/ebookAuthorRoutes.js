// routes/ebookAuthorRoutes.js
import express from "express";
import {
  register,
  login,
  getAllAuthors,
  getAuthorById,
  getCurrentAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/ebookAuthorController.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);
router.get("/", getAllAuthors);
router.get("/:id", getAuthorById);

// Protected routes (require authentication)
router.get("/profile/me", authenticate, getCurrentAuthor);
router.put("/:id", authenticate, updateAuthor);
router.delete("/:id", authenticate, deleteAuthor);

export default router;