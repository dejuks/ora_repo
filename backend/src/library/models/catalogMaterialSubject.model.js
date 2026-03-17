import { BaseModel } from "./base.model.js";

export const CatalogMaterialSubjectModel = new BaseModel({
  table: "catalog_material_subjects",
  primaryKey: "material_subject_id",
  allowedColumns: ['material_id', 'subject_id'],
});
