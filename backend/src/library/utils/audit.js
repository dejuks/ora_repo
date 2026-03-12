import pool from "../../config/db.js";

export const writeLibraryAuditLog = async ({ actorUserId = null, action, entityType, entityId = null, oldValues = null, newValues = null, ipAddress = null, userAgent = null }) => {
  try {
    await pool.query(
      `INSERT INTO library_audit_logs (actor_user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [actorUserId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Failed to write library audit log:', error.message);
  }
};
