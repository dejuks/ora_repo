import { EbookBaseModel } from "./base.model.js";

export const EbookFileModel = new EbookBaseModel({
  table: "ebook_submission_files",
  primaryKey: "file_id",
  allowedColumns: [
    "submission_id", "version_no", "file_role", "original_name", "stored_name", "file_path", "mime_type",
    "file_size_bytes", "checksum_sha256", "uploaded_by", "is_active"
  ],
  searchableColumns: ["original_name", "file_role", "mime_type"],
});
