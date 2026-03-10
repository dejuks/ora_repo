import express from "express";
import {
  createStage,
  getAllStages,
  getStageById,
  updateStage,
  deleteStage,
} from "../../workflowstages/controllers/workflowStage.controller.js";

const router = express.Router();

router.post("/", createStage);
router.get("/", getAllStages);
router.get("/:id", getStageById);
router.put("/:id", updateStage);
router.delete("/:id", deleteStage);

export default router;
    