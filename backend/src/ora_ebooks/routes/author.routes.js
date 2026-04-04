import express from "express";
import { registerAuthor } from "../controllers/author.controller.js";

const router = express.Router();

router.post("/register-author", registerAuthor);

export default router;