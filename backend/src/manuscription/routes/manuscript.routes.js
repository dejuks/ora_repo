import express from "express";
import uploadManuscript from "../../middleware/uploadManuscript.js";
import Manuscript from "../models/manuscript.model.js"; // ✅ Import your model

import {
  getManuscripts,
  getManuscript,
  createManuscript,
  updateManuscript,
  updateManuscriptStatus,
  deleteManuscript,
  inviteCoAuthor,
  getCoAuthors,
  updateCoAuthorStatus,
  getMyInvitedCoAuthors,
  getEICSubmissions,
  getManuscriptsForAssignEditors,
  assignEditor,
  getEditors,
  getManuscriptsForFinalDecision,
  makeFinalDecision,
  getEICManuscriptDetails,
  updateScreeningStatus,
  getEthicsManuscripts,
  updateEthicsDecision,
  getProductionManuscripts,
  updateProduction,getDecisions
} from "../controllers/manuscript.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { get } from "http";
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
router.get("/co-authors/my-invites", authenticate, getMyInvitedCoAuthors);

router.delete("/:id", deleteManuscript);

router.post("/:id/co-authors", authenticate, inviteCoAuthor);
router.get("/:id/co-authors", getCoAuthors);
router.patch("/:id/co-authors/:userId", updateCoAuthorStatus);
router.get("/co-authors/my-invites", authenticate, getMyInvitedCoAuthors);

router.delete("/:id", deleteManuscript);

router.get("/user/:uuid", async (req, res) => {
  const { uuid } = req.params;
  const manuscripts = await Manuscript.findByUser(uuid);
  res.json(manuscripts);
});

router.get("/eic/submissions", getEICSubmissions);
router.get("/eic/submissions/:id", getEICManuscriptDetails);

// Get manuscripts for EIC to assign editors
router.get("/eic/assign-editors", getManuscriptsForAssignEditors);

// POST to assign editor
router.post("/eic/assign-editor", assignEditor);

router.get("/eic/editors", getEditors);

router.get("/eic/ethics", getEthicsManuscripts);
router.post("/eic/ethics/update", updateEthicsDecision);

// GET manuscripts ready for final decision
router.get("/eic/final-decisions", getManuscriptsForFinalDecision);

router.get("/eic/decisions", getDecisions);

// POST make final decision
router.post("/eic/final-decision", makeFinalDecision);

router.patch("/eic/manuscripts/:id/screening", updateScreeningStatus);

router.get("/eic/production", getProductionManuscripts);
router.post("/eic/production/update", updateProduction);
export default router;
