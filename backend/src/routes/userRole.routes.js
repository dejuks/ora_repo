import express from "express";
import { assignRoles, fetchUserRoles,assignPublic } from "../controllers/userRole.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

// Only authenticated + admin users
// router.use(authenticate, authorize("role.manage"));

router.get("/:uuid",authenticate, fetchUserRoles);
router.post("/:uuid",authenticate, assignRoles);
router.post("/assign-author-role/:uuid", assignPublic);
export default router;
