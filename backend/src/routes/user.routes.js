import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("user.read"),
  getUsers
);

router.get(
  "/:uuid",
  authenticate,
  authorize("user.read"),
  getUserById
);

router.post(
  "/",
  authenticate,
  authorize("user.create"),
  createUser
);

router.put(
  "/:uuid",
  authenticate,
  authorize("user.update"),
  updateUser
);

router.delete(
  "/:uuid",
  authenticate,
  authorize("user.delete"),
  deleteUser
);

export default router; // 🔥 THIS WAS MISSING
