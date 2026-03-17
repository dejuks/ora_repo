import { BaseModel } from "./base.model.js";

export const DigitalSubmissionStatusHistoryModel = new BaseModel({
  table: "digital_submission_status_history",
  primaryKey: "history_id",
  allowedColumns: ['submission_id', 'old_status', 'new_status', 'changed_by', 'reason', 'changed_at'],
});
