import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { digitalCollectionController } from "../controllers/digitalCollection.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";

const router = express.Router();
// router.use(authenticate);

router.get('/', paginationRules, validateRequest, digitalCollectionController.index);
router.get('/:id', uuidParam(), validateRequest, digitalCollectionController.show);
router.get('/:id/resources', uuidParam(), validateRequest, digitalCollectionController.resources);
router.post('/', digitalCollectionController.store);
router.post('/:id/resources', uuidParam(), validateRequest, digitalCollectionController.addResource);
router.put('/:id', uuidParam(), validateRequest, digitalCollectionController.update);
router.patch('/:id', uuidParam(), validateRequest, digitalCollectionController.update);
router.delete('/:id/resources/:resourceId', uuidParam(), uuidParam('resourceId'), validateRequest, digitalCollectionController.removeResource);
router.delete('/:id', uuidParam(), validateRequest, digitalCollectionController.destroy);

export default router;
