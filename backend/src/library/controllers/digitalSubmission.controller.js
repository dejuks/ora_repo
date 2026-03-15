import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionModel } from "../models/digitalSubmission.model.js";
import { digitalSubmissionService } from "../services/digitalSubmission.service.js";
import { contentUploaderService } from "../services/contentUploader.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(DigitalSubmissionModel, "digital-submission");

export const digitalSubmissionController = {
  ...crud,

  workflow: asyncHandler(async (req, res) => {
    const result = await contentUploaderService.getWorkflow(req.params.id);
    return res.json(result);
  }),
  uploaderDashboard: asyncHandler(async (req, res) => {
    const result = await contentUploaderService.getDashboard(req.user?.uuid || null);
    return res.json(result);
  }),
  resubmit: asyncHandler(async (req, res) => {
    const result = await contentUploaderService.resubmit(req.params.id, req.user?.uuid || null, req.body || {}, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
  submit: asyncHandler(async (req, res) => {
    const result = await digitalSubmissionService.submit(req.params.id, req.user?.uuid || null, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
  review: asyncHandler(async (req, res) => {
    const result = await digitalSubmissionService.review(req.params.id, { ...req.body, reviewer_id: req.body.reviewer_id || req.user?.uuid || null }, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
  publish: asyncHandler(async (req, res) => {
    const result = await digitalSubmissionService.publish(req.params.id, req.user?.uuid || null, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
};
