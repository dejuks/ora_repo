import express from "express";
import { libraryAuditLogController } from "../controllers/libraryAuditLog.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";

const router = express.Router();

router.get('/security-alerts', libraryAuditLogController.securityAlerts);
router.get('/', paginationRules, validateRequest, libraryAuditLogController.index);
router.get('/:id', uuidParam(), validateRequest, libraryAuditLogController.show);
router.post('/', validateRequest, libraryAuditLogController.store);
router.put('/:id', uuidParam(), validateRequest, libraryAuditLogController.update);
router.patch('/:id', uuidParam(), validateRequest, libraryAuditLogController.update);
router.delete('/:id', uuidParam(), validateRequest, libraryAuditLogController.destroy);

export default router;
