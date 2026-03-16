import express from "express";
import { registerJournalAuthor } from "../controllers/journalUser.controller.js";

const router = express.Router();

router.post("/register", registerJournalAuthor);

export default router;
