import express from "express";
import { assignAuthorRoleController } from "../controllers/userAccess.controller.js";
const router = express.Router();
router.post("/assign-journal-author", assignAuthorRoleController);

export default router;
