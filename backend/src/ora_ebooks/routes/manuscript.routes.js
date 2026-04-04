import express from "express";
import multer from "multer";
import { create, getAll, getOne, update, remove,getDrafts,getRevisions } from "../controllers/manuscript.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getRevision } from "../../../../frontend/src/api/api.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
// ✅ SPECIAL ROUTES FIRST
router.get("/drafts", authenticate, getDrafts);
router.get("/revisions", authenticate, getRevisions);

router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getOne);
router.post("/", authenticate, upload.single("file"), create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);
// draft getDrafts
export default router;