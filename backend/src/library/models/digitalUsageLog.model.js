import { BaseModel } from "./base.model.js";

export const DigitalUsageLogModel = new BaseModel({
  table: "digital_usage_logs",
  primaryKey: "usage_log_id",
  allowedColumns: ['digital_resource_id', 'file_id', 'user_id', 'member_id', 'action', 'ip_address', 'user_agent', 'created_at'],
});
