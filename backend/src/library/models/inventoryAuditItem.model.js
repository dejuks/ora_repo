import { BaseModel } from "./base.model.js";

export const InventoryAuditItemModel = new BaseModel({
  table: "inventory_audit_items",
  primaryKey: "audit_item_id",
  allowedColumns: ['audit_id', 'copy_id', 'expected_location_id', 'found_location_id', 'was_found', 'condition_note', 'discrepancy_note', 'checked_by', 'checked_at'],
});
