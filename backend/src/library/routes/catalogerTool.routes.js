import express from 'express';
import { catalogerToolController } from '../controllers/catalogerTool.controller.js';

const router = express.Router();

router.get('/classification/suggest', catalogerToolController.suggestClassification);
router.post('/materials/:id/classify', catalogerToolController.applyClassification);
router.post('/copies/:id/generate-barcode', catalogerToolController.generateBarcode);
router.post('/copies/generate-missing', catalogerToolController.generateMissingBarcodes);

export default router;
