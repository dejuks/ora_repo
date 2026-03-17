import { BaseModel } from "./base.model.js";

export const DigitalSubmissionPublicationModel = new BaseModel({
  table: "digital_submission_publications",
  primaryKey: "publication_id",
  allowedColumns: ['submission_id', 'material_id', 'digital_resource_id', 'published_by', 'published_at'],
});
