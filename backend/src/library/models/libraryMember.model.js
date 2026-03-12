import { BaseModel } from "./base.model.js";

export const LibraryMemberModel = new BaseModel({
  table: "library_members",
  primaryKey: "member_id",
  allowedColumns: ['user_id', 'member_type_id', 'member_code', 'branch_id', 'department', 'program', 'admission_year', 'expiry_date', 'status', 'notes'],
  searchableColumns: ['member_code', 'department', 'program'],
});
