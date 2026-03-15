import { BaseModel } from "./base.model.js";

export const DigitalCollectionModel = new BaseModel({
  table: "digital_collections",
  primaryKey: "collection_id",
  allowedColumns: ["name", "slug", "description", "visibility", "is_active", "created_by", "updated_by"],
  searchableColumns: ["name", "slug", "description"],
});
