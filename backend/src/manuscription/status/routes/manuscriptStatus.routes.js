import express from "express";
import {
  getStatuses,
  getStatus,
  createStatus,
  updateStatus,
  deleteStatus,
} from "../controllers/manuscriptStatus.controller.js";

const router = express.Router();

router.get("/", getStatuses);
router.get("/:id", getStatus);
router.post("/", createStatus);
router.put("/:id", updateStatus);
router.delete("/:id", deleteStatus);

export default router;
