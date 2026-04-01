import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadDigitalFile } from "../middleware/libraryUpload.middleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";
import { digitalSubmissionFileController } from "../controllers/digitalSubmissionFile.controller.js";

const router = express.Router();
// router.use(authenticate);
router.get('/', paginationRules, validateRequest, digitalSubmissionFileController.index);
router.get('/:id', uuidParam(), validateRequest, digitalSubmissionFileController.show);
router.post('/', digitalSubmissionFileController.store);
router.post('/upload/:submissionId', uuidParam('submissionId'), validateRequest, uploadDigitalFile.single('file'), digitalSubmissionFileController.upload);
router.put('/:id', uuidParam(), validateRequest, digitalSubmissionFileController.update);
router.patch('/:id', uuidParam(), validateRequest, digitalSubmissionFileController.update);
router.delete('/:id', uuidParam(), validateRequest, digitalSubmissionFileController.destroy);
export default router;
