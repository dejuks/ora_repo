import { EbookBaseModel } from "./base.model.js";

export const EbookWorkflowHistoryModel = new EbookBaseModel({
  table: "ebook_workflow_history",
  primaryKey: "history_id",
  allowedColumns: ["submission_id", "from_status", "to_status", "action", "note", "actor_id", "acted_at"],
  searchableColumns: ["from_status", "to_status", "action", "note"],
});
