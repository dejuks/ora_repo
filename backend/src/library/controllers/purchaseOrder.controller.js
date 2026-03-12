import { createCrudController } from "./createCrudController.js";
import { PurchaseOrderModel } from "../models/purchaseOrder.model.js";

export const purchaseOrderController = createCrudController(PurchaseOrderModel, "purchase-order");
