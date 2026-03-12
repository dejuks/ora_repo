import { BaseModel } from "./base.model.js";

export const DigitalSubmissionReviewModel = new BaseModel({
  table: "digital_submission_reviews",
  primaryKey: "review_id",
  allowedColumns: ['submission_id', 'reviewer_id', 'decision', 'comments', 'internal_note', 'reviewed_at'],
});
