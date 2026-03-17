import pool from "../../config/db.js";
import { notificationService } from "./notification.service.js";

export const maintenanceService = {
  async refreshOverdues(actorUserId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const overdueRes = await client.query(
        `UPDATE loans
         SET status = 'overdue'
         WHERE status = 'active' AND due_date < NOW()
         RETURNING loan_id, member_id, due_date`
      );
      for (const row of overdueRes.rows) {
        await notificationService.createForMember(row.member_id, {
          type: 'overdue',
          title: 'Loan overdue',
          message: `A library item became overdue on ${new Date(row.due_date).toISOString()}`,
          relatedEntityType: 'loan',
          relatedEntityId: row.loan_id,
        }, client);
      }
      await client.query('COMMIT');
      return { updated: overdueRes.rowCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async expireHolds() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const expired = await client.query(
        `UPDATE hold_requests
         SET status = 'expired'
         WHERE status = 'ready_for_pickup' AND expiry_at IS NOT NULL AND expiry_at < NOW()
         RETURNING hold_id, copy_id`
      );
      for (const row of expired.rows) {
        if (row.copy_id) {
          const nextQueued = await client.query(
            `SELECT * FROM hold_requests WHERE copy_id IS NULL AND status = 'queued' ORDER BY requested_at ASC LIMIT 1`
          );
          if (nextQueued.rows[0]) {
            await client.query(
              `UPDATE hold_requests SET copy_id = $1, status = 'ready_for_pickup', ready_at = NOW(), expiry_at = NOW() + INTERVAL '3 day' WHERE hold_id = $2`,
              [row.copy_id, nextQueued.rows[0].hold_id]
            );
            await client.query(`UPDATE material_copies SET status = 'reserved' WHERE copy_id = $1`, [row.copy_id]);
          } else {
            await client.query(`UPDATE material_copies SET status = 'available' WHERE copy_id = $1`, [row.copy_id]);
          }
        }
      }
      await client.query('COMMIT');
      return { expired: expired.rowCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
