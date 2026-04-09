import express from "express";
import * as publisherExternalController from "../controllers/publisherExternal.controller.js";

const router = express.Router();

router.get("/", publisherExternalController.index);
router.get("/:id", publisherExternalController.show);
router.post("/", publisherExternalController.store);
router.put("/:id", publisherExternalController.update);
router.patch("/:id", publisherExternalController.update);
router.delete("/:id", publisherExternalController.destroy);

export default router;