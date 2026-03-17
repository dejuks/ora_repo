import { BaseModel } from "./base.model.js";

export const DigitalSubmissionContributorModel = new BaseModel({
  table: "digital_submission_contributors",
  primaryKey: "submission_contributor_id",
  allowedColumns: ['submission_id', 'contributor_id', 'role_name', 'sequence_no'],
});
