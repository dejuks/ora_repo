import { BaseModel } from "./base.model.js";

export const PurchaseOrderItemModel = new BaseModel({
  table: "purchase_order_items",
  primaryKey: "po_item_id",
  allowedColumns: ['purchase_order_id', 'title', 'author_text', 'isbn', 'quantity', 'unit_price', 'total_price', 'material_type_id'],
});
