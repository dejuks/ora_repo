import { BaseModel } from "./base.model.js";

export const FineWaiverModel = new BaseModel({
  table: "fine_waivers",
  primaryKey: "waiver_id",
  allowedColumns: ['fine_id', 'approved_by', 'amount', 'reason', 'waived_at'],
});
