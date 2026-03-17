import express from "express";
import { getAllSupporters } from "../controllers/manuscriptSupporter.controller.js";

const router = express.Router();

router.get("/manuscript-supporters", getAllSupporters);

export default router;