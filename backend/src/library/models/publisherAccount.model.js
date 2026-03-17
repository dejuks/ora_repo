import { BaseModel } from "./base.model.js";

export const PublisherAccountModel = new BaseModel({
  table: "publisher_accounts",
  primaryKey: "publisher_account_id",
  allowedColumns: ["publisher_id", "user_id", "account_status", "api_key", "permissions_json", "last_access_at", "notes"],
  searchableColumns: ["account_status", "notes"],
});
