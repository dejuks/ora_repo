import express from "express";
import { registerJournalAuthor } from "../controllers/journalUser.controller.js";
import { loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerJournalAuthor);
// For simplicity, we can use the same login endpoint as the main auth, but if you want a separate one for journal users, you can create it here. For now, we'll just use the main auth login.
router.post("/login", loginUser);

export default router;
