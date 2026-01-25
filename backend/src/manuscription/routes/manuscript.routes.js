import express from "express";
import uploadManuscript from "../../middleware/uploadManuscript.js";
import {
  getManuscripts,
  getManuscript,
  createManuscript,
  updateManuscript,
  updateManuscriptStatus,
  deleteManuscript,
} from "../controllers/manuscript.controller.js";

const router = express.Router();

router.get("/", getManuscripts);
router.get("/:id", getManuscript);

router.post(
  "/",
  uploadManuscript.single("manuscript_file"), // ✅ THIS LINE FIXES FILE UPLOAD
  createManuscript
);

router.put(
  "/:id",
  uploadManuscript.single("manuscript_file"),
  updateManuscript
);

router.patch("/:id/status", updateManuscriptStatus);
router.delete("/:id", deleteManuscript);

export default router;
