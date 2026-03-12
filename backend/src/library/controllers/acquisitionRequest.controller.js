import { createCrudController } from "./createCrudController.js";
import { AcquisitionRequestModel } from "../models/acquisitionRequest.model.js";

export const acquisitionRequestController = createCrudController(AcquisitionRequestModel, "acquisition-request");
