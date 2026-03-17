import pool from "../../config/db.js";
import { writeLibraryAuditLog } from "../utils/audit.js";
import { notificationService } from "./notification.service.js";
import { badRequest, notFound } from "../utils/appError.js";

export const holdService = {
  async createHold({ member_id, material_id, copy_id = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existingRes = await client.query(`SELECT COUNT(*)::int AS count FROM hold_requests WHERE member_id = $1 AND material_id = $2 AND status IN ('queued', 'ready_for_pickup')`, [member_id, material_id]);
      if (existingRes.rows[0].count > 0) throw badRequest('Member already has an active hold for this material');
      const queueRes = await client.query(`SELECT COALESCE(MAX(queue_position), 0)::int AS max_position FROM hold_requests WHERE material_id = $1`, [material_id]);
      const queuePosition = queueRes.rows[0].max_position + 1;
      const insertRes = await client.query(`INSERT INTO hold_requests (member_id, material_id, copy_id, queue_position, status) VALUES ($1,$2,$3,$4,'queued') RETURNING *`, [member_id, material_id, copy_id, queuePosition]);
      await notificationService.createForMember(member_id, { type: 'hold_created', title: 'Hold placed', message: 'Your reservation has been added to the queue.', relatedEntityType: 'hold_request', relatedEntityId: insertRes.rows[0].hold_id }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: reqMeta.actorUserId || null, action: 'hold.create', entityType: 'hold_request', entityId: insertRes.rows[0].hold_id, newValues: insertRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return insertRes.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },

  async cancelHold(holdId, { cancelled_reason = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const find = await client.query(`SELECT * FROM hold_requests WHERE hold_id = $1 FOR UPDATE`, [holdId]);
      const hold = find.rows[0];
      if (!hold || !['queued','ready_for_pickup'].includes(hold.status)) throw notFound('Active hold not found');
      const { rows } = await client.query(`UPDATE hold_requests SET status = 'cancelled', cancelled_at = NOW(), cancelled_reason = COALESCE($1, cancelled_reason) WHERE hold_id = $2 RETURNING *`, [cancelled_reason, holdId]);
      if (hold.copy_id && hold.status === 'ready_for_pickup') {
        const next = await client.query(`SELECT * FROM hold_requests WHERE material_id = $1 AND status = 'queued' ORDER BY queue_position NULLS LAST, requested_at ASC LIMIT 1`, [hold.material_id]);
        if (next.rows[0]) {
          await client.query(`UPDATE hold_requests SET copy_id = $1, status = 'ready_for_pickup', ready_at = NOW(), expiry_at = NOW() + INTERVAL '3 day' WHERE hold_id = $2`, [hold.copy_id, next.rows[0].hold_id]);
        } else {
          await client.query(`UPDATE material_copies SET status = 'available' WHERE copy_id = $1`, [hold.copy_id]);
        }
      }
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: reqMeta.actorUserId || null, action: 'hold.cancel', entityType: 'hold_request', entityId: holdId, newValues: rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },

  async fulfillHold(holdId, { copy_id = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const holdRes = await client.query(`SELECT * FROM hold_requests WHERE hold_id = $1 FOR UPDATE`, [holdId]);
      const hold = holdRes.rows[0];
      if (!hold) throw notFound('Hold not found');
      if (!['ready_for_pickup','queued'].includes(hold.status)) throw badRequest('Hold cannot be fulfilled');
      const finalCopyId = copy_id || hold.copy_id;
      if (!finalCopyId) throw badRequest('copy_id is required to fulfill this hold');
      const result = await client.query(`UPDATE hold_requests SET status = 'fulfilled', fulfilled_at = NOW(), copy_id = $1 WHERE hold_id = $2 RETURNING *`, [finalCopyId, holdId]);
      await client.query(`UPDATE material_copies SET status = 'borrowed' WHERE copy_id = $1`, [finalCopyId]);
      await notificationService.createForMember(hold.member_id, { type: 'hold_fulfilled', title: 'Reserved item checked out', message: 'Your reserved item has been fulfilled.', relatedEntityType: 'hold_request', relatedEntityId: holdId }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: reqMeta.actorUserId || null, action: 'hold.fulfill', entityType: 'hold_request', entityId: holdId, newValues: result.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return result.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },
};
