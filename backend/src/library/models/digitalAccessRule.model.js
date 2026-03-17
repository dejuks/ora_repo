import { BaseModel } from "./base.model.js";

export const DigitalAccessRuleModel = new BaseModel({
  table: "digital_access_rules",
  primaryKey: "rule_id",
  allowedColumns: ['digital_resource_id', 'member_type_id', 'allow_view', 'allow_download', 'allow_print', 'max_downloads_per_user', 'note'],
});
