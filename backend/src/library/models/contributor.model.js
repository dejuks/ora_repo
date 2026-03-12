import { BaseModel } from "./base.model.js";

export const ContributorModel = new BaseModel({
  table: "contributors",
  primaryKey: "contributor_id",
  allowedColumns: ['full_name', 'organization_name', 'contributor_type', 'bio', 'email', 'orcid'],
  searchableColumns: ['full_name', 'organization_name', 'email'],
});
