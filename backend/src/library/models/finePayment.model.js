import { BaseModel } from "./base.model.js";

export const FinePaymentModel = new BaseModel({
  table: "fine_payments",
  primaryKey: "payment_id",
  allowedColumns: ['fine_id', 'received_by', 'amount', 'payment_method', 'reference_no', 'note', 'paid_at'],
});
