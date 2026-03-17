import { asyncHandler } from '../middleware/asyncHandler.js';
import { circulationService } from '../services/circulation.service.js';

export const circulationController = {
  summary: asyncHandler(async (_req, res) => {
    const result = await circulationService.getSummary();
    return res.json(result);
  }),

  memberOverview: asyncHandler(async (req, res) => {
    const result = await circulationService.getMemberOverview(req.params.memberId);
    return res.json(result);
  }),

  myOverview: asyncHandler(async (req, res) => {
    const result = await circulationService.getMyOverview(req.user?.uuid);
    return res.json(result);
  }),
};
