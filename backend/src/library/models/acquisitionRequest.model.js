import { BaseModel } from "./base.model.js";

export const AcquisitionRequestModel = new BaseModel({
  table: "acquisition_requests",
  primaryKey: "request_id",
  allowedColumns: ['requested_by', 'approved_by', 'material_type_id', 'title', 'author_text', 'publisher_text', 'publication_year', 'isbn', 'quantity', 'estimated_price', 'justification', 'status', 'rejection_reason', 'submitted_at', 'approved_at'],
});
