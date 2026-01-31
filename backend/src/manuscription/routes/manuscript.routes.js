import express from "express";
import uploadManuscript from "../../middleware/uploadManuscript.js";
import {
  getManuscripts,
  getManuscript,
  createManuscript,
  updateManuscript,
  updateManuscriptStatus,
  deleteManuscript,
  inviteCoAuthor,
  getCoAuthors,
  updateCoAuthorStatus,getMyInvitedCoAuthors,
} from "../controllers/manuscript.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
const router = express.Router();

router.get("/", getManuscripts);
router.get("/:uuid", getManuscript);
router.post("/", uploadManuscript.single("manuscript_file"), createManuscript);

router.put(
  "/:id",
  uploadManuscript.single("manuscript_file"),
  updateManuscript,
);

router.patch("/:id/status", updateManuscriptStatus);

/* 🔹 CO-AUTHORS */
router.post("/:id/co-authors", authenticate, inviteCoAuthor);
router.get("/:id/co-authors", getCoAuthors);
router.patch("/:id/co-authors/:userId", updateCoAuthorStatus);
router.get("/co-authors/my-invites",authenticate, getMyInvitedCoAuthors);

router.delete("/:id", deleteManuscript);

export default router;
