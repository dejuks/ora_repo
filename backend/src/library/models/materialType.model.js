import { BaseModel } from "./base.model.js";

export const MaterialTypeModel = new BaseModel({
  table: "material_types",
  primaryKey: "material_type_id",
  allowedColumns: ['code', 'name', 'is_borrowable', 'is_digital_allowed', 'is_physical_allowed', 'description'],
});
