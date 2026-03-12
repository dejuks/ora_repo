import { BaseModel } from "./base.model.js";

export const VendorModel = new BaseModel({
  table: "vendors",
  primaryKey: "vendor_id",
  allowedColumns: ['name', 'contact_person', 'email', 'phone', 'address', 'website', 'tax_id', 'is_active'],
});
