import { asyncHandler } from '../middleware/asyncHandler.js';
import { notFound } from '../utils/appError.js';
import { catalogSearchService } from '../services/catalogSearch.service.js';

export const catalogOpacController = {
  search: asyncHandler(async (req, res) => {
    const data = await catalogSearchService.search(req.query || {});
    res.json(data);
  }),
  details: asyncHandler(async (req, res) => {
    const data = await catalogSearchService.getDetails(req.params.id);
    if (!data) throw notFound('Catalog material not found');
    res.json(data);
  }),
  availability: asyncHandler(async (req, res) => {
    const data = await catalogSearchService.getAvailability(req.params.id);
    res.json(data);
  }),
};
