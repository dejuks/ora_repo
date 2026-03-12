import { BaseModel } from "./base.model.js";

export const DigitalSubmissionFileModel = new BaseModel({
  table: "digital_submission_files",
  primaryKey: "submission_file_id",
  allowedColumns: ['submission_id', 'file_role', 'original_name', 'stored_name', 'file_path', 'mime_type', 'file_size_bytes', 'checksum_sha256', 'uploaded_by', 'uploaded_at'],
});
