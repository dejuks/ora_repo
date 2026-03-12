import { createCrudController } from "./createCrudController.js";
import { FineModel } from "../models/fine.model.js";
import { fineService } from "../services/fine.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(FineModel, "fine");

export const fineController = {
  ...crud,
  pay: asyncHandler(async (req, res) => {
    const result = await fineService.payFine(req.params.id, { ...req.body, received_by: req.body.received_by || req.user?.uuid || null }, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
  waive: asyncHandler(async (req, res) => {
    const result = await fineService.waiveFine(req.params.id, { ...req.body, approved_by: req.body.approved_by || req.user?.uuid || null }, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
};
