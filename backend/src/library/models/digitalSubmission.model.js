import { BaseModel } from "./base.model.js";

export const DigitalSubmissionModel = new BaseModel({
  table: "digital_submissions",
  primaryKey: "submission_id",
  allowedColumns: ['submitted_by', 'publisher_id', 'material_type_id', 'category_id', 'language_id', 'title', 'subtitle', 'abstract', 'keywords', 'publication_year', 'isbn', 'issn', 'access_level', 'status', 'note', 'submitted_at', 'reviewed_at', 'approved_at', 'published_at'],
});
