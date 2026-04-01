import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { maintenanceController } from "../controllers/maintenance.controller.js";

const router = express.Router();
// router.use(authenticate);
router.post('/refresh-overdues', maintenanceController.refreshOverdues);
router.post('/expire-holds', maintenanceController.expireHolds);
export default router;
