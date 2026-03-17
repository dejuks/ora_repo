import { createCrudController } from "./createCrudController.js";
import { DigitalUsageLogModel } from "../models/digitalUsageLog.model.js";

export const digitalUsageLogController = createCrudController(DigitalUsageLogModel, "digital-usage-log");
