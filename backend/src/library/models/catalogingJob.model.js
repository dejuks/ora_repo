import { BaseModel } from "./base.model.js";

export const CatalogingJobModel = new BaseModel({
  table: "cataloging_jobs",
  primaryKey: "cataloging_job_id",
  allowedColumns: ['receipt_item_id', 'assigned_to', 'status', 'note', 'started_at', 'completed_at'],
});
