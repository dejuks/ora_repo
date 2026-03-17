import { EbookBaseModel } from "./base.model.js";

export const EbookSubmissionModel = new EbookBaseModel({
  table: "ebook_submissions",
  primaryKey: "submission_id",
  allowedColumns: [
    "author_id", "title", "subtitle", "abstract", "keywords", "category", "language", "publication_year",
    "target_audience", "requires_bpc", "bpc_amount", "status", "current_version_no", "editor_id",
    "assigned_reviewer_count", "final_decision", "final_decision_note", "submitted_at", "accepted_at"
  ],
  searchableColumns: ["title", "subtitle", "abstract", "category", "language", "status", "final_decision"],
});
