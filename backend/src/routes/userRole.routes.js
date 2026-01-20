import express from "express";
import { assignRoles, fetchUserRoles } from "../controllers/userRole.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

// Only authenticated + admin users
router.use(authenticate, authorize("role.manage"));

router.get("/:uuid", fetchUserRoles);
router.post("/:uuid", assignRoles);

export default router;
