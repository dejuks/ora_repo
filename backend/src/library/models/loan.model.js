import { BaseModel } from "./base.model.js";

export const LoanModel = new BaseModel({
  table: "loans",
  primaryKey: "loan_id",
  allowedColumns: ['member_id', 'copy_id', 'issued_by', 'returned_to', 'policy_id', 'loan_date', 'due_date', 'return_date', 'renewal_count', 'status', 'remarks'],
});
