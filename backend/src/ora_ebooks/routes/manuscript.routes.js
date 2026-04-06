import express from "express";
import multer from "multer";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  getDrafts,
  getRevisions,
  getScreened,
  screeningHandler,
} from "../controllers/manuscript.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// special routes first
router.get("/drafts", authenticate, getDrafts);
router.get("/revisions", authenticate, getRevisions);
router.get("/screened", authenticate, getScreened);

// screening route
router.post("/:id/oraebookscreening", authenticate, screeningHandler);

// normal routes
router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getOne);
router.post("/", authenticate, upload.single("file"), create);
router.put("/:id", authenticate, upload.single("file"), update);
router.delete("/:id", authenticate, remove);

export default router;