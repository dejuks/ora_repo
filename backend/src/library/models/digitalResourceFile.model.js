import { BaseModel } from "./base.model.js";

export const DigitalResourceFileModel = new BaseModel({
  table: "digital_resource_files",
  primaryKey: "file_id",
  allowedColumns: ['digital_resource_id', 'file_role', 'original_name', 'stored_name', 'file_path', 'mime_type', 'file_size_bytes', 'checksum_sha256', 'version_no', 'is_current', 'uploaded_by', 'uploaded_at'],
});
