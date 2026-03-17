import express from "express";
import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/module.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

// CRUD routes
router.get("/", authenticate, authorize("module.read"), getModules);
router.get("/:uuid", authenticate, authorize("module.read"), getModuleById);
router.post("/", authenticate, authorize("module.create"), createModule);
router.put("/:uuid", authenticate, authorize("module.update"), updateModule);
router.delete("/:uuid", authenticate, authorize("module.delete"), deleteModule);

export default router;
