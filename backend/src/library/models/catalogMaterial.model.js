import { BaseModel } from "./base.model.js";

export const CatalogMaterialModel = new BaseModel({
  table: "catalog_materials",
  primaryKey: "material_id",
  allowedColumns: ['material_type_id', 'category_id', 'publisher_id', 'language_id', 'title', 'subtitle', 'edition', 'isbn', 'issn', 'publication_year', 'publication_place', 'abstract', 'description', 'table_of_contents', 'keywords', 'classification_code', 'call_number', 'material_format', 'is_reference_only', 'is_active', 'created_by', 'updated_by'],
  searchableColumns: ['title', 'subtitle', 'isbn', 'issn', 'call_number'],
});
