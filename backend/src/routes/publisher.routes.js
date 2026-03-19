import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadDigitalFile } from "../library/middleware/libraryUpload.middleware.js";
import { createPackage, createResource, listPackages } from "../controllers/publisherExternal.controller.js";

const router = express.Router();
router.use(authenticate);

router.get('/packages', listPackages);
router.post('/packages', uploadDigitalFile.single('file'), createPackage);
router.post('/resources', uploadDigitalFile.single('file'), createResource);

export default router;
