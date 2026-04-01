import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { inventoryController } from '../controllers/inventory.controller.js';

const router = express.Router();
// router.use(authenticate);

router.post('/audit', asyncHandler(inventoryController.createAudit));
router.get('/report', asyncHandler(inventoryController.report));

export default router;
