import { createCrudController } from "./createCrudController.js";
import { LostItemReportModel } from "../models/lostItemReport.model.js";

export const lostItemReportController = createCrudController(LostItemReportModel, "lost-item-report");
