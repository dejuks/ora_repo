import { BaseModel } from "./base.model.js";

export const LibraryCategoryModel = new BaseModel({
  table: "library_categories",
  primaryKey: "category_id",
  allowedColumns: ['parent_category_id', 'code', 'name', 'description'],
  searchableColumns: ['name', 'code'],
});
