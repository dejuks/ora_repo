import { BaseModel } from "./base.model.js";

export const PublisherPackageModel = new BaseModel({
  table: "publisher_packages",
  primaryKey: "package_id",
  allowedColumns: [
    "publisher_id", "publisher_account_id", "package_name", "package_code", "package_type", "description",
    "external_reference", "delivery_method", "package_status", "license_start_date", "license_end_date",
    "uploaded_by", "received_at", "processed_at", "metadata_json", "stored_name", "original_name",
    "file_path", "mime_type", "file_size_bytes", "checksum_sha256"
  ],
  searchableColumns: ["package_name", "package_code", "package_type", "external_reference", "description", "package_status"],
});
