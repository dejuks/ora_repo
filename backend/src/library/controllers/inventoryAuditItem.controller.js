import { createCrudController } from "./createCrudController.js";
import { InventoryAuditItemModel } from "../models/inventoryAuditItem.model.js";

export const inventoryAuditItemController = createCrudController(InventoryAuditItemModel, "inventory-audit-item");
