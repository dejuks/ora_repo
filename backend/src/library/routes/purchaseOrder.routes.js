import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";
import { purchaseOrderController } from "../controllers/purchaseOrder.controller.js";

const router = express.Router();
// router.use(authenticate);

router.get('/', paginationRules, validateRequest, purchaseOrderController.index);
router.post('/', purchaseOrderController.store);
router.post('/:id/receive', uuidParam('id'), validateRequest, purchaseOrderController.receive);
router.get('/:id', uuidParam('id'), validateRequest, purchaseOrderController.show);
router.put('/:id', uuidParam('id'), purchaseOrderController.update);
router.patch('/:id', uuidParam('id'), purchaseOrderController.update);
router.delete('/:id', uuidParam('id'), validateRequest, purchaseOrderController.destroy);

export default router;
