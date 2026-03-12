import { BaseModel } from "./base.model.js";

export const MaterialCopyModel = new BaseModel({
  table: "material_copies",
  primaryKey: "copy_id",
  allowedColumns: ['material_id', 'branch_id', 'location_id', 'accession_number', 'barcode', 'rfid_tag', 'copy_number', 'purchase_price', 'replacement_cost', 'acquisition_date', 'condition_note', 'status', 'is_circulation_allowed', 'withdrawn_reason'],
  searchableColumns: ['accession_number', 'barcode', 'rfid_tag'],
});
