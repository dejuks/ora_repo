import express from "express";
import {
  getAllPublicManuscripts,
  getPublicManuscriptById,
  downloadFile
} from "../controllers/manuscript.controller.js";

const router = express.Router();

router.get("/online", getAllPublicManuscripts);
router.get("/online/:id", getPublicManuscriptById);
router.get("/files/:fileId/download", downloadFile);

export default router;