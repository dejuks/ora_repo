import express from 'express';
import physicalLibraryController from '../controllers/physicalLibrary.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  physicalLibraryListValidation, physicalLibraryIdValidation, createPhysicalLibraryValidation, updatePhysicalLibraryValidation,
  addCopyValidation, updateCopyValidation, copyIdValidation, borrowValidation, returnValidation, renewValidation,
  placeHoldValidation, cancelHoldValidation, fineValidation, inventoryAuditValidation, receiveAcquisitionValidation, reportQueryValidation,
} from '../validation/physicalLibrary.validation.js';

const router = express.Router();
router.get('/', physicalLibraryListValidation, validateRequest, (req, res) => physicalLibraryController.index(req, res));
router.get('/reports/usage', reportQueryValidation, validateRequest, (req, res) => physicalLibraryController.usageReport(req, res));
router.get('/reports/inventory', (req, res) => physicalLibraryController.inventoryReport(req, res));
router.post('/borrow', borrowValidation, validateRequest, (req, res) => physicalLibraryController.borrowItem(req, res));
router.post('/return', returnValidation, validateRequest, (req, res) => physicalLibraryController.returnItem(req, res));
router.post('/renew', renewValidation, validateRequest, (req, res) => physicalLibraryController.renewLoan(req, res));
router.post('/holds', placeHoldValidation, validateRequest, (req, res) => physicalLibraryController.placeHold(req, res));
router.patch('/holds/:holdId/cancel', cancelHoldValidation, validateRequest, (req, res) => physicalLibraryController.cancelHold(req, res));
router.post('/fines', fineValidation, validateRequest, (req, res) => physicalLibraryController.createFine(req, res));
router.post('/inventory-audits', inventoryAuditValidation, validateRequest, (req, res) => physicalLibraryController.inventoryAudit(req, res));
router.post('/receive-acquisition', receiveAcquisitionValidation, validateRequest, (req, res) => physicalLibraryController.receiveAcquisition(req, res));
router.get('/:id', physicalLibraryIdValidation, validateRequest, (req, res) => physicalLibraryController.show(req, res));
router.post('/', createPhysicalLibraryValidation, validateRequest, (req, res) => physicalLibraryController.store(req, res));
router.put('/:id', updatePhysicalLibraryValidation, validateRequest, (req, res) => physicalLibraryController.update(req, res));
router.patch('/:id', updatePhysicalLibraryValidation, validateRequest, (req, res) => physicalLibraryController.update(req, res));
router.delete('/:id', physicalLibraryIdValidation, validateRequest, (req, res) => physicalLibraryController.destroy(req, res));
router.get('/:id/copies', physicalLibraryIdValidation, validateRequest, (req, res) => physicalLibraryController.listCopies(req, res));
router.post('/:id/copies', addCopyValidation, validateRequest, (req, res) => physicalLibraryController.addCopy(req, res));
router.patch('/copies/:copyId', updateCopyValidation, validateRequest, (req, res) => physicalLibraryController.updateCopy(req, res));
router.delete('/copies/:copyId', copyIdValidation, validateRequest, (req, res) => physicalLibraryController.removeCopy(req, res));
router.patch('/copies/:copyId/missing', copyIdValidation, validateRequest, (req, res) => physicalLibraryController.markMissing(req, res));
router.patch('/copies/:copyId/damaged', copyIdValidation, validateRequest, (req, res) => physicalLibraryController.markDamaged(req, res));
export default router;
