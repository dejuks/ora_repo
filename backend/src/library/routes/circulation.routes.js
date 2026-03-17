import express from 'express';
import { circulationController } from '../controllers/circulation.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { uuidParam } from '../validators/common.validators.js';

const router = express.Router();

router.get('/summary', circulationController.summary);
router.get('/my/overview', circulationController.myOverview);
router.get('/member/:memberId/overview', uuidParam('memberId'), validateRequest, circulationController.memberOverview);

export default router;
