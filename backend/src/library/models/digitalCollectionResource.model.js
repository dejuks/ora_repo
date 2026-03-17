import { BaseModel } from "./base.model.js";

export const DigitalCollectionResourceModel = new BaseModel({
  table: "digital_collection_resources",
  primaryKey: "collection_resource_id",
  allowedColumns: ["collection_id", "digital_resource_id", "sort_order", "note", "added_by"],
  searchableColumns: ["note"],
});
