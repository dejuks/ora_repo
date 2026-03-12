import { BaseModel } from "./base.model.js";

export const LostItemReportModel = new BaseModel({
  table: "lost_item_reports",
  primaryKey: "lost_report_id",
  allowedColumns: ['copy_id', 'loan_id', 'reported_by', 'description', 'replacement_cost', 'resolved', 'resolved_note', 'resolved_at'],
});
