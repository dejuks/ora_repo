import { createCrudController } from "./createCrudController.js";
import { DamageReportModel } from "../models/damageReport.model.js";

export const damageReportController = createCrudController(DamageReportModel, "damage-report");
