import { BaseModel } from "./base.model.js";

export const DamageReportModel = new BaseModel({
  table: "damage_reports",
  primaryKey: "damage_report_id",
  allowedColumns: ['copy_id', 'loan_id', 'reported_by', 'severity', 'description', 'estimated_cost', 'resolved', 'resolved_note', 'resolved_at'],
});
