import { BaseModel } from "./base.model.js";

export const FineModel = new BaseModel({
  table: "fines",
  primaryKey: "fine_id",
  allowedColumns: ['member_id', 'loan_id', 'copy_id', 'reason', 'amount', 'paid_amount', 'waived_amount', 'status', 'assessed_by', 'due_date', 'note'],
});
