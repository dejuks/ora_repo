import { BaseModel } from "./base.model.js";

export const LibraryBranchModel = new BaseModel({
  table: "library_branches",
  primaryKey: "branch_id",
  allowedColumns: ['code', 'name', 'description', 'address', 'phone', 'email', 'is_active'],
});
