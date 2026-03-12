import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionModel } from "../models/digitalSubmission.model.js";
import { digitalSubmissionService } from "../services/digitalSubmission.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(DigitalSubmissionModel, "digital-submission");

export const digitalSubmissionController = {
  ...crud,
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
