import express from "express";
import {
  getAllPublicManuscripts,
  getPublicManuscriptById,
  downloadFile
} from "../controllers/manuscript.controller.js";

const router = express.Router();

router.get("/public", getAllPublicManuscripts);
router.get("/public/:id", getPublicManuscriptById);
router.get("/files/:fileId/download", downloadFile);

export default router;