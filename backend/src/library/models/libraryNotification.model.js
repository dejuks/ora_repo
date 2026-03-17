import { BaseModel } from "./base.model.js";

export const LibraryNotificationModel = new BaseModel({
  table: "library_notifications",
  primaryKey: "notification_id",
  allowedColumns: ['user_id', 'member_id', 'notification_type', 'title', 'message', 'is_read', 'related_entity_type', 'related_entity_id', 'created_at', 'read_at'],
});
