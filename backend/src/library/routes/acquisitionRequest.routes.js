import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { acquisitionRequestController } from "../controllers/acquisitionRequest.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";

const router = express.Router();
router.use(authenticate);
router.get('/', paginationRules, validateRequest, acquisitionRequestController.index);
router.get('/:id', uuidParam(), validateRequest, acquisitionRequestController.show);
router.post('/', acquisitionRequestController.store);
router.post('/:id/submit', uuidParam(), validateRequest, acquisitionRequestController.submit);
router.post('/:id/approve', uuidParam(), validateRequest, acquisitionRequestController.approve);
router.post('/:id/reject', uuidParam(), validateRequest, acquisitionRequestController.reject);
router.post('/:id/mark-ordered', uuidParam(), validateRequest, acquisitionRequestController.markOrdered);
router.put('/:id', uuidParam(), validateRequest, acquisitionRequestController.update);
router.patch('/:id', uuidParam(), validateRequest, acquisitionRequestController.update);
router.delete('/:id', uuidParam(), validateRequest, acquisitionRequestController.destroy);
export default router;
