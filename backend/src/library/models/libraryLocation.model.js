import { BaseModel } from "./base.model.js";

export const LibraryLocationModel = new BaseModel({
  table: "library_locations",
  primaryKey: "location_id",
  allowedColumns: ['branch_id', 'parent_location_id', 'code', 'name', 'location_type', 'description', 'is_active'],
});
