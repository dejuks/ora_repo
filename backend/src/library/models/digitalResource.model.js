import { BaseModel } from "./base.model.js";

export const DigitalResourceModel = new BaseModel({
  table: "digital_resources",
  primaryKey: "digital_resource_id",
  allowedColumns: ['material_id', 'publisher_id', 'access_level', 'drm_required', 'license_start_date', 'license_end_date', 'embargo_until', 'is_downloadable', 'is_streamable', 'is_active', 'created_by', 'updated_by'],
  searchableColumns: ['access_level'],
});
