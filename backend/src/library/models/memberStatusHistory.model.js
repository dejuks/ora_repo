import { BaseModel } from "./base.model.js";

export const MemberStatusHistoryModel = new BaseModel({
  table: "member_status_history",
  primaryKey: "history_id",
  allowedColumns: ['member_id', 'old_status', 'new_status', 'reason', 'changed_by', 'changed_at'],
});
