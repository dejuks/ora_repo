import { BaseModel } from "./base.model.js";

export const MemberTypeModel = new BaseModel({
  table: "member_types",
  primaryKey: "member_type_id",
  allowedColumns: ['code', 'name', 'description', 'max_active_loans', 'max_hold_requests', 'loan_period_days', 'renewal_limit', 'fine_per_day', 'grace_period_days', 'can_access_digital', 'can_download_digital', 'is_active'],
});
