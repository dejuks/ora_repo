import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { uploadUserPhoto } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:uuid", getUserById);
router.post("/", uploadUserPhoto.single("photo"), createUser);
router.put("/:uuid", uploadUserPhoto.single("photo"), updateUser);
router.delete("/:uuid", deleteUser);

export default router;
