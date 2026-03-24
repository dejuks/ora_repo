import { EbookBaseModel } from "./base.model.js";

export const EbookReviewModel = new EbookBaseModel({
  table: "ebook_reviews",
  primaryKey: "review_id",
  allowedColumns: [
    "assignment_id",
    "submission_id",
    "reviewer_id",
    "round_no",
    "originality_score",
    "quality_score",
    "relevance_score",
    "recommendation",
    "comments_for_author",
    "confidential_comments",
    "submitted_at",
  ],
  searchableColumns: [
    "recommendation",
    "comments_for_author",
    "confidential_comments",
  ],
});