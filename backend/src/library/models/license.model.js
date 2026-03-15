import { BaseModel } from "./base.model.js";

export const LicenseModel = new BaseModel({
  table: "licenses",
  primaryKey: "license_id",
  allowedColumns: [
    "publisher_id", "package_id", "license_name", "license_type", "access_scope", "start_date", "end_date",
    "max_concurrent_users", "max_downloads_per_user", "drm_required", "terms_text", "is_active"
  ],
  searchableColumns: ["license_name", "license_type", "access_scope", "terms_text"],
});
