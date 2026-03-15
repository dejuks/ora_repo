import { createCrudController } from "./createCrudController.js";
import { AcquisitionRequestModel } from "../models/acquisitionRequest.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(AcquisitionRequestModel, "acquisition-request");

const pickPayload = (body = {}) => ({
  material_type_id: body.material_type_id || null,
  title: body.title,
  author_text: body.author_text || null,
  publisher_text: body.publisher_text || null,
  publication_year: body.publication_year || null,
  isbn: body.isbn || null,
  quantity: body.quantity || 1,
  estimated_price: body.estimated_price || null,
  justification: body.justification || null,
  status: body.status || "draft",
  rejection_reason: body.rejection_reason || null,
  submitted_at: body.submitted_at || null,
  approved_at: body.approved_at || null,
});

export const acquisitionRequestController = {
  ...crud,

  store: asyncHandler(async (req, res) => {
    const payload = {
      ...pickPayload(req.body || {}),
      requested_by: req.user?.uuid || null,
    };
    const row = await AcquisitionRequestModel.create(payload);
    return res.status(201).json(row);
  }),

  update: asyncHandler(async (req, res) => {
    const existing = await AcquisitionRequestModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "acquisition-request not found" });
    }
    const payload = {
      ...pickPayload(req.body || {}),
      approved_by: req.body?.status === "approved" ? (req.user?.uuid || existing.approved_by || null) : (req.body?.approved_by ?? existing.approved_by ?? null),
      requested_by: existing.requested_by || req.user?.uuid || null,
      approved_at: req.body?.status === "approved" ? (req.body?.approved_at || new Date().toISOString()) : (req.body?.approved_at ?? existing.approved_at ?? null),
    };
    const row = await AcquisitionRequestModel.update(req.params.id, payload);
    return res.json(row);
  }),

  submit: asyncHandler(async (req, res) => {
    const row = await AcquisitionRequestModel.update(req.params.id, {
      status: "submitted",
      submitted_at: new Date().toISOString(),
      requested_by: req.user?.uuid || null,
    });
    return res.json(row);
  }),

  approve: asyncHandler(async (req, res) => {
    const row = await AcquisitionRequestModel.update(req.params.id, {
      status: "approved",
      approved_by: req.user?.uuid || null,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    });
    return res.json(row);
  }),

  reject: asyncHandler(async (req, res) => {
    const row = await AcquisitionRequestModel.update(req.params.id, {
      status: "rejected",
      approved_by: req.user?.uuid || null,
      rejection_reason: req.body?.rejection_reason || "Rejected",
    });
    return res.json(row);
  }),

  markOrdered: asyncHandler(async (req, res) => {
    const row = await AcquisitionRequestModel.update(req.params.id, {
      status: "ordered",
      approved_by: req.user?.uuid || null,
    });
    return res.json(row);
  }),
};
