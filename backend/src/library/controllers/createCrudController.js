import { asyncHandler } from "../middleware/asyncHandler.js";
import { notFound } from "../utils/appError.js";

export const createCrudController = (model, resourceLabel) => ({
  index: asyncHandler(async (req, res) => {
    const result = await model.findAll(req.query || {});
    return res.json(result);
  }),

  show: asyncHandler(async (req, res) => {
    const row = await model.findById(req.params.id);
    if (!row) throw notFound(`${resourceLabel} not found`);
    return res.json(row);
  }),

  store: asyncHandler(async (req, res) => {
    const row = await model.create(req.body || {});
    return res.status(201).json(row);
  }),

  update: asyncHandler(async (req, res) => {
    const row = await model.update(req.params.id, req.body || {});
    if (!row) throw notFound(`${resourceLabel} not found`);
    return res.json(row);
  }),

  destroy: asyncHandler(async (req, res) => {
    const ok = await model.delete(req.params.id);
    if (!ok) throw notFound(`${resourceLabel} not found`);
    return res.json({ message: `${resourceLabel} deleted` });
  }),
});
