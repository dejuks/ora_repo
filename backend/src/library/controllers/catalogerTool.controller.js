import { asyncHandler } from '../middleware/asyncHandler.js';
import { badRequest, notFound } from '../utils/appError.js';
import { applyClassification, generateBarcode, generateMissingBarcodes, suggestClassification } from '../services/cataloger.service.js';

export const catalogerToolController = {
  suggestClassification: asyncHandler(async (req, res) => {
    const { material_id: materialId, search } = req.query;
    const data = await suggestClassification({ materialId, search });
    return res.json(data);
  }),

  applyClassification: asyncHandler(async (req, res) => {
    const materialId = req.params.id;
    if (!materialId) throw badRequest('Material id is required');
    const row = await applyClassification(materialId, {
      ...req.body,
      updated_by: req.user?.uuid || req.user?.id || null,
    });
    if (!row) throw notFound('Catalog material not found');
    return res.json(row);
  }),

  generateBarcode: asyncHandler(async (req, res) => {
    const row = await generateBarcode(req.params.id, req.body || {});
    if (!row) throw notFound('Material copy not found');
    return res.json(row);
  }),

  generateMissingBarcodes: asyncHandler(async (req, res) => {
    const rows = await generateMissingBarcodes(req.body || {});
    return res.json({ rows, count: rows.length });
  }),
};
