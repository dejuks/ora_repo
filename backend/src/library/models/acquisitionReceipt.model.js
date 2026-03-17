import { BaseModel } from "./base.model.js";

export const AcquisitionReceiptModel = new BaseModel({
  table: "acquisitions_receipts",
  primaryKey: "receipt_id",
  allowedColumns: ['purchase_order_id', 'received_by', 'receipt_number', 'received_date', 'note'],
});
