import express from "express";
import {
  getPermissions,
  createPermission,
  deletePermission
} from "../controllers/permission.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("role.manage"));

router.get("/", getPermissions);
router.post("/", createPermission);
router.delete("/:uuid", deletePermission);

export default router;
