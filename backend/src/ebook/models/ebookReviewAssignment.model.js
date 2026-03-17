import { EbookBaseModel } from "./base.model.js";

export const EbookReviewAssignmentModel = new EbookBaseModel({
  table: "ebook_review_assignments",
  primaryKey: "assignment_id",
  allowedColumns: [
    "submission_id", "reviewer_id", "assigned_by", "status", "due_date", "invitation_note", "response_note",
    "assigned_at", "accepted_at", "completed_at"
  ],
  searchableColumns: ["status", "invitation_note", "response_note"],
});
