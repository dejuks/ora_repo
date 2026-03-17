import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { loanController } from "../controllers/loan.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";
import { borrowRules, returnRules, renewRules } from "../validators/workflow.validators.js";

const router = express.Router();
router.use(authenticate);
router.get('/', paginationRules, validateRequest, loanController.index);
router.get('/:id', uuidParam(), validateRequest, loanController.show);
router.post('/', loanController.store);
router.post('/borrow', borrowRules, validateRequest, loanController.borrow);
router.post('/:id/return', returnRules, validateRequest, loanController.returnLoan);
router.post('/:id/renew', renewRules, validateRequest, loanController.renew);
router.put('/:id', uuidParam(), validateRequest, loanController.update);
router.patch('/:id', uuidParam(), validateRequest, loanController.update);
router.delete('/:id', uuidParam(), validateRequest, loanController.destroy);
export default router;
