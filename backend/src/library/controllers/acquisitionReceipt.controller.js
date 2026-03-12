import { createCrudController } from "./createCrudController.js";
import { AcquisitionReceiptModel } from "../models/acquisitionReceipt.model.js";

export const acquisitionReceiptController = createCrudController(AcquisitionReceiptModel, "acquisition-receipt");
