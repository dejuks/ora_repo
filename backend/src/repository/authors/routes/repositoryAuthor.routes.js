import express from "express";
import { register,getAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,updateAccess } from "../controllers/repositoryAuthor.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.get("/", getAuthors);
router.get("/:id", getAuthor);
router.put("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);
router.put("/update-access", authenticate, updateAccess);

export default router;