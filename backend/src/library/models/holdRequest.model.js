import { BaseModel } from "./base.model.js";

export const HoldRequestModel = new BaseModel({
  table: "hold_requests",
  primaryKey: "hold_id",
  allowedColumns: ['member_id', 'material_id', 'copy_id', 'queue_position', 'status', 'requested_at', 'ready_at', 'expiry_at', 'fulfilled_at', 'cancelled_at', 'cancelled_reason'],
});
