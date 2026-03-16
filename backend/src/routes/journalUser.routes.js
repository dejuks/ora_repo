import express from "express";
import { registerJournalAuthor } from "../controllers/journalUser.controller.js";
import { loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerJournalAuthor);
router.post("/login", loginUser);

export default router;
