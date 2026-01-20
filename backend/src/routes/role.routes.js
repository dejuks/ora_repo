import express from "express";
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/role.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("role.manage"));

router.get("/", getRoles);
router.get("/:uuid", getRole);
router.post("/", createRole);
router.put("/:uuid", updateRole);
router.delete("/:uuid", deleteRole);

export default router;
