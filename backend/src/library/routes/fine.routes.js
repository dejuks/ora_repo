import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { fineController } from "../controllers/fine.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";
import { finePaymentRules, fineWaiverRules } from "../validators/workflow.validators.js";

const router = express.Router();
router.use(authenticate);
router.get('/', paginationRules, validateRequest, fineController.index);
router.get('/:id', uuidParam(), validateRequest, fineController.show);
router.post('/', fineController.store);
router.post('/:id/pay', finePaymentRules, validateRequest, fineController.pay);
router.post('/:id/waive', fineWaiverRules, validateRequest, fineController.waive);
router.put('/:id', uuidParam(), validateRequest, fineController.update);
router.patch('/:id', uuidParam(), validateRequest, fineController.update);
router.delete('/:id', uuidParam(), validateRequest, fineController.destroy);
export default router;
