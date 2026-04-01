import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadDigitalFile } from "../middleware/libraryUpload.middleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";
import { digitalResourceFileController } from "../controllers/digitalResourceFile.controller.js";

const router = express.Router();
// router.use(authenticate);
router.get('/', paginationRules, validateRequest, digitalResourceFileController.index);
router.get('/:id', uuidParam(), validateRequest, digitalResourceFileController.show);
router.get('/:id/download', uuidParam(), validateRequest, digitalResourceFileController.download);
router.post('/', digitalResourceFileController.store);
router.post('/upload/:resourceId', uuidParam('resourceId'), validateRequest, uploadDigitalFile.single('file'), digitalResourceFileController.upload);
router.put('/:id', uuidParam(), validateRequest, digitalResourceFileController.update);
router.patch('/:id', uuidParam(), validateRequest, digitalResourceFileController.update);
router.delete('/:id', uuidParam(), validateRequest, digitalResourceFileController.destroy);
export default router;
