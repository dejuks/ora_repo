import { createCrudController } from "./createCrudController.js";
import { AcquisitionReceiptItemModel } from "../models/acquisitionReceiptItem.model.js";

export const acquisitionReceiptItemController = createCrudController(AcquisitionReceiptItemModel, "acquisition-receipt-item");
