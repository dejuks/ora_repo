import { BaseModel } from "./base.model.js";

export const LibraryAuditLogModel = new BaseModel({
  table: "library_audit_logs",
  primaryKey: "audit_log_id",
  allowedColumns: ['actor_user_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address', 'user_agent', 'created_at'],
});
