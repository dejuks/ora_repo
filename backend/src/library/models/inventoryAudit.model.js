import { BaseModel } from "./base.model.js";

export const InventoryAuditModel = new BaseModel({
  table: "inventory_audits",
  primaryKey: "audit_id",
  allowedColumns: ['branch_id', 'location_id', 'audit_name', 'status', 'started_by', 'completed_by', 'start_date', 'end_date', 'note'],
});
