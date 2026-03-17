import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionStatusHistoryModel } from "../models/digitalSubmissionStatusHistory.model.js";

export const digitalSubmissionStatusHistoryController = createCrudController(DigitalSubmissionStatusHistoryModel, "digital-submission-status-history");
