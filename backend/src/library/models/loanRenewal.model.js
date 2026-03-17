import { BaseModel } from "./base.model.js";

export const LoanRenewalModel = new BaseModel({
  table: "loan_renewals",
  primaryKey: "renewal_id",
  allowedColumns: ['loan_id', 'renewed_by', 'old_due_date', 'new_due_date', 'renewal_no', 'note', 'renewed_at'],
});
