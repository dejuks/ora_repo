import { BaseModel } from "./base.model.js";

export const PurchaseOrderModel = new BaseModel({
  table: "purchase_orders",
  primaryKey: "purchase_order_id",
  allowedColumns: ['request_id', 'vendor_id', 'po_number', 'ordered_by', 'approved_by', 'order_date', 'expected_delivery_date', 'total_amount', 'status', 'note'],
});
