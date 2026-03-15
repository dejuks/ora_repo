import { EbookBaseModel } from "./base.model.js";

export const EbookFinanceModel = new EbookBaseModel({
  table: "ebook_finance_clearances",
  primaryKey: "finance_id",
  allowedColumns: [
    "submission_id", "invoice_number", "currency_code", "amount_due", "amount_paid", "waiver_requested",
    "waiver_percentage", "waiver_reason", "payment_status", "payment_reference", "receipt_number",
    "reviewed_by", "review_note", "cleared_at"
  ],
  searchableColumns: ["invoice_number", "currency_code", "payment_status", "payment_reference", "receipt_number"],
});
