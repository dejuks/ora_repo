import { BaseModel } from "./base.model.js";

export const CatalogMaterialContributorModel = new BaseModel({
  table: "catalog_material_contributors",
  primaryKey: "material_contributor_id",
  allowedColumns: ['material_id', 'contributor_id', 'role_name', 'sequence_no'],
});
