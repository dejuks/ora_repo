import { createCrudController } from "./createCrudController.js";
import { HoldRequestModel } from "../models/holdRequest.model.js";
import { holdService } from "../services/hold.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(HoldRequestModel, "hold-request");

export const holdRequestController = {
  ...crud,
  createHold: asyncHandler(async (req, res) => {
    const result = await holdService.createHold(req.body, { actorUserId: req.user?.uuid || null, ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.status(201).json(result);
  }),
  cancelHold: asyncHandler(async (req, res) => {
    const result = await holdService.cancelHold(req.params.id, req.body, { actorUserId: req.user?.uuid || null, ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
  fulfillHold: asyncHandler(async (req, res) => {
    const result = await holdService.fulfillHold(req.params.id, req.body, { actorUserId: req.user?.uuid || null, ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
};
