import { BaseModel } from "./base.model.js";

export const AcquisitionReceiptItemModel = new BaseModel({
  table: "acquisitions_receipt_items",
  primaryKey: "receipt_item_id",
  allowedColumns: ['receipt_id', 'po_item_id', 'received_quantity', 'accepted_quantity', 'rejected_quantity', 'condition_note'],
});
