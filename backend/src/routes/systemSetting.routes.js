import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getSystemSettings, updateSystemSettings } from '../controllers/systemSetting.controller.js';

const router = express.Router();
router.use(authenticate);
router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);

export default router;
