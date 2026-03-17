import { BaseModel } from "./base.model.js";

export const LibrarySubjectModel = new BaseModel({
  table: "library_subjects",
  primaryKey: "subject_id",
  allowedColumns: ['code', 'name', 'description'],
  searchableColumns: ['name', 'code'],
});
