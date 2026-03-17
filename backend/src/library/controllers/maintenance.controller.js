import { asyncHandler } from "../middleware/asyncHandler.js";
import { maintenanceService } from "../services/maintenance.service.js";

export const maintenanceController = {
  refreshOverdues: asyncHandler(async (req, res) => {
    const result = await maintenanceService.refreshOverdues(req.user?.uuid || null);
    res.json(result);
  }),
  expireHolds: asyncHandler(async (req, res) => {
    const result = await maintenanceService.expireHolds();
    res.json(result);
  }),
};
