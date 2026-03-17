import { createCrudController } from "./createCrudController.js";
import { InventoryAuditModel } from "../models/inventoryAudit.model.js";

export const inventoryAuditController = createCrudController(InventoryAuditModel, "inventory-audit");
