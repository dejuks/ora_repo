import express from "express";
import {
  getLibraryUsers,
  createLibraryUser,
  updateLibraryUser,
  deleteLibraryUser,
} from "../controllers/libraryUser.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";
import { uploadUserPhoto } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("library.user.read"),
  getLibraryUsers
);

router.post(
  "/",
  authenticate,
  authorize("library.user.create"),
  uploadUserPhoto.single("photo"),
  createLibraryUser
);

router.put(
  "/:uuid",
  authenticate,
  authorize("library.user.update"),
  uploadUserPhoto.single("photo"),
  updateLibraryUser
);

router.delete(
  "/:uuid",
  authenticate,
  authorize("library.user.delete"),
  deleteLibraryUser
);

export default router;
