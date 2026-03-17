import { createCrudController } from "./createCrudController.js";
import { PurchaseOrderItemModel } from "../models/purchaseOrderItem.model.js";

export const purchaseOrderItemController = createCrudController(PurchaseOrderItemModel, "purchase-order-item");
