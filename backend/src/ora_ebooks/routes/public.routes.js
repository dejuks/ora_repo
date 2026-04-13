import express from "express";
import * as ebookController from "../controllers/ebook.controller.js";

const router = express.Router();

router.get("/", ebookController.index); // optional root
router.get("/publications", ebookController.getPublications);
router.get("/publications/:slug", ebookController.getPublicationBySlug);

export default router;