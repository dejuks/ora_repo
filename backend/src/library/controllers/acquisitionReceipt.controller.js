import { createCrudController } from "./createCrudController.js";
import { AcquisitionReceiptModel } from "../models/acquisitionReceipt.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(AcquisitionReceiptModel, "acquisition-receipt");

const normalizePayload = (body = {}, userUuid = null) => ({
  purchase_order_id: body.purchase_order_id || null,
  received_by: body.received_by || userUuid || null,
  receipt_number: body.receipt_number || null,
  received_date: body.received_date,
  note: body.note || null,
});

export const acquisitionReceiptController = {
  ...crud,
  store: asyncHandler(async (req, res) => {
    const row = await AcquisitionReceiptModel.create(normalizePayload(req.body || {}, req.user?.uuid || null));
    return res.status(201).json(row);
  }),
  update: asyncHandler(async (req, res) => {
    const row = await AcquisitionReceiptModel.update(req.params.id, normalizePayload(req.body || {}, req.user?.uuid || null));
    return res.json(row);
  }),
};
