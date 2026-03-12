import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { holdRequestController } from "../controllers/holdRequest.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";
import { holdCreateRules, holdCancelRules, holdFulfillRules } from "../validators/workflow.validators.js";

const router = express.Router();
router.use(authenticate);
router.get('/', paginationRules, validateRequest, holdRequestController.index);
router.get('/:id', uuidParam(), validateRequest, holdRequestController.show);
router.post('/', holdCreateRules, validateRequest, holdRequestController.createHold);
router.post('/:id/cancel', holdCancelRules, validateRequest, holdRequestController.cancelHold);
router.post('/:id/fulfill', holdFulfillRules, validateRequest, holdRequestController.fulfillHold);
router.put('/:id', uuidParam(), validateRequest, holdRequestController.update);
router.patch('/:id', uuidParam(), validateRequest, holdRequestController.update);
router.delete('/:id', uuidParam(), validateRequest, holdRequestController.destroy);
export default router;
