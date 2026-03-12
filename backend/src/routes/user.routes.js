import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  getAllRolesForUsers,
} from "../controllers/user.controller.js";
import { uploadUserPhoto } from "../middleware/upload.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/roles/all", authenticate, getAllRolesForUsers);
router.get("/:userId/roles", authenticate, getUserRoles);

router.get("/", authenticate, getUsers);
router.get("/:uuid", authenticate, getUserById);
router.post("/", authenticate, uploadUserPhoto.single("photo"), createUser);
router.put("/:uuid", authenticate, uploadUserPhoto.single("photo"), updateUser);
router.delete("/:uuid", authenticate, deleteUser);

export default router;