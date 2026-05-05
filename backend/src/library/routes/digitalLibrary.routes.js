import express from 'express';
import digitalLibraryController from '../controllers/digitalLibrary.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  digitalLibraryListValidation, digitalLibraryIdValidation, createDigitalLibraryValidation, updateDigitalLibraryValidation,
  submissionValidation, submissionIdValidation, accessRightsValidation, licenseValidation, trackUsageValidation, usageReportValidation,
} from '../validation/digitalLibrary.validation.js';

const router = express.Router();
router.get('/', digitalLibraryListValidation, validateRequest, (req, res) => digitalLibraryController.index(req, res));
router.post('/submissions', submissionValidation, validateRequest, (req, res) => digitalLibraryController.submitForApproval(req, res));
router.patch('/submissions/:submissionId/approve', submissionIdValidation, validateRequest, (req, res) => digitalLibraryController.approveResource(req, res));
router.patch('/submissions/:submissionId/reject', submissionIdValidation, validateRequest, (req, res) => digitalLibraryController.rejectResource(req, res));
router.patch('/submissions/:submissionId/publish', submissionIdValidation, validateRequest, (req, res) => digitalLibraryController.publishResource(req, res));
router.patch('/submissions/:submissionId/unpublish', submissionIdValidation, validateRequest, (req, res) => digitalLibraryController.unpublishResource(req, res));
router.get('/reports/usage', usageReportValidation, validateRequest, (req, res) => digitalLibraryController.usageReport(req, res));
router.get('/:id', digitalLibraryIdValidation, validateRequest, (req, res) => digitalLibraryController.show(req, res));
router.post('/', createDigitalLibraryValidation, validateRequest, (req, res) => digitalLibraryController.store(req, res));
router.put('/:id', updateDigitalLibraryValidation, validateRequest, (req, res) => digitalLibraryController.update(req, res));
router.patch('/:id', updateDigitalLibraryValidation, validateRequest, (req, res) => digitalLibraryController.update(req, res));
router.delete('/:id', digitalLibraryIdValidation, validateRequest, (req, res) => digitalLibraryController.destroy(req, res));
router.patch('/:id/access-rights', accessRightsValidation, validateRequest, (req, res) => digitalLibraryController.assignAccessRights(req, res));
router.patch('/:id/license', licenseValidation, validateRequest, (req, res) => digitalLibraryController.updateLicense(req, res));
router.post('/:id/usage', trackUsageValidation, validateRequest, (req, res) => digitalLibraryController.trackUsage(req, res));
router.get('/:id/usage-report', usageReportValidation, validateRequest, (req, res) => digitalLibraryController.usageReport(req, res));
export default router;
