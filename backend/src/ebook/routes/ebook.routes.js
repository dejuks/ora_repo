import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { uploadEbookFile } from "../middleware/upload.middleware.js";
import { ebookSubmissionController, ebookReviewAssignmentController, ebookPublicationController } from "../controllers/ebook.controller.js";
import { ebookWorkflowService } from "../services/ebookWorkflow.service.js";

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);

router.get('/submissions', authorize('ebook.submission.view'), ebookSubmissionController.index);
router.get('/submissions/:id', authorize('ebook.submission.view'), ebookSubmissionController.show);
router.get('/submissions/:id/workflow', authorize('ebook.workflow.view'), ebookSubmissionController.workflow);
router.post('/submissions', authorize('ebook.submission.create'), uploadEbookFile.single('file'), ebookSubmissionController.store);
router.put('/submissions/:id', authorize('ebook.submission.update'), ebookSubmissionController.update);
router.patch('/submissions/:id', authorize('ebook.submission.update'), ebookSubmissionController.update);
router.delete('/submissions/:id', authorize('ebook.submission.delete'), ebookSubmissionController.destroy);
router.post('/submissions/:id/submit', authorize('ebook.submission.submit'), ebookSubmissionController.submit);
router.post('/submissions/:id/resubmit', authorize('ebook.submission.resubmit'), ebookSubmissionController.resubmit);
router.post('/submissions/:id/screening', authorize('ebook.editor.screen'), ebookSubmissionController.screening);
router.post('/submissions/:id/assign-reviewer', authorize('ebook.reviewer.assign'), ebookSubmissionController.assignReviewer);
router.post('/submissions/:id/decision', authorize('ebook.decision.make'), ebookSubmissionController.editorialDecision);
router.post('/submissions/:id/finance', authorize('ebook.finance.clear'), ebookSubmissionController.upsertFinance);
router.post('/submissions/:id/production', authorize('ebook.production.manage'), ebookSubmissionController.upsertProduction);
router.post('/submissions/:id/publish', authorize('ebook.publication.release'), ebookSubmissionController.publish);
router.post('/submissions/:id/files/upload', authorize('ebook.file.upload'), uploadEbookFile.single('file'), asyncHandler(async (req, res) => {
  res.status(201).json(await ebookWorkflowService.uploadFile(req.params.id, req.user?.uuid, req.file, req.body.file_role || 'manuscript'));
}));

router.get('/reviewer-options', authorize('ebook.reviewer.assign'), ebookSubmissionController.reviewerOptions);

router.get('/dashboard/author', authorize('ebook.dashboard.author'), ebookSubmissionController.authorDashboard);
router.get('/dashboard/editor', authorize('ebook.dashboard.editor'), ebookSubmissionController.editorDashboard);
router.get('/dashboard/reviewer', authorize('ebook.dashboard.reviewer'), ebookSubmissionController.reviewerDashboard);
router.get('/dashboard/finance', authorize('ebook.dashboard.finance'), ebookSubmissionController.financeDashboard);
router.get('/dashboard/production', authorize('ebook.dashboard.production'), ebookSubmissionController.productionDashboard);

router.get('/review-assignments', authorize('ebook.review.assignment.view'), ebookReviewAssignmentController.index);
router.get('/review-assignments/:id', authorize('ebook.review.assignment.view'), ebookReviewAssignmentController.show);
router.post('/review-assignments/:id/respond', authorize('ebook.review.respond'), ebookReviewAssignmentController.respond);
router.post('/review-assignments/:id/submit-review', authorize('ebook.review.submit'), ebookReviewAssignmentController.submitReview);

router.get('/publications', authorize('ebook.publication.view'), ebookPublicationController.index);
router.get('/publications/:id', authorize('ebook.publication.view'), ebookPublicationController.show);

export default router;
