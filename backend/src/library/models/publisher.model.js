import { BaseModel } from "./base.model.js";

export const PublisherModel = new BaseModel({
  table: "publishers",
  primaryKey: "publisher_id",
  allowedColumns: ['name', 'city', 'country', 'website', 'contact_email', 'contact_phone', 'is_external_provider'],
  searchableColumns: ['name', 'city', 'country', 'contact_email'],
});
