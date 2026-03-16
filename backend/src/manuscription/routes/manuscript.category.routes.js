import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/manuscriptCategory.controller.js";

const router = express.Router();
router.get("/categories", getCategories);
router.post("/categories", createCategory);

router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
