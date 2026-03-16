import express from "express";
import {
  getAllPublicManuscripts,
  getPublicManuscriptById,
  downloadFile
} from "../controllers/manuscript.controller.js";

const router = express.Router();

router.get("/", getAllPublicManuscripts);
router.get("/files/:fileId/download", downloadFile);
router.get("/:id", getPublicManuscriptById);

export default router;