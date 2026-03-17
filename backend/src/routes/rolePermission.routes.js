import express from "express";
import {
  assignPermission,
  removePermission,
  getPermissionsByRole
} from "../controllers/rolePermission.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("role.manage"));

router.get("/:roleId", getPermissionsByRole);
router.post("/assign", assignPermission);
router.post("/remove", removePermission);

export default router;
