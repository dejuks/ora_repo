import { BaseModel } from "./base.model.js";

export const LanguageModel = new BaseModel({
  table: "languages",
  primaryKey: "language_id",
  allowedColumns: ['code', 'name'],
});
