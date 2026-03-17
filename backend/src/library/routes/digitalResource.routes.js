import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { digitalResourceController } from "../controllers/digitalResource.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";

const router = express.Router();
router.use(authenticate);
router.get('/', paginationRules, validateRequest, digitalResourceController.index);
router.get('/:id', uuidParam(), validateRequest, digitalResourceController.show);
router.get('/:id/access', uuidParam(), validateRequest, digitalResourceController.access);
router.get('/:id/preview', uuidParam(), validateRequest, digitalResourceController.preview);
router.get('/:id/download', uuidParam(), validateRequest, digitalResourceController.download);
router.post('/', digitalResourceController.store);
router.put('/:id', uuidParam(), validateRequest, digitalResourceController.update);
router.patch('/:id', uuidParam(), validateRequest, digitalResourceController.update);
router.delete('/:id', uuidParam(), validateRequest, digitalResourceController.destroy);
export default router;
