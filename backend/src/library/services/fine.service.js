import pool from "../../config/db.js";
import { writeLibraryAuditLog } from "../utils/audit.js";
import { notificationService } from "./notification.service.js";
import { badRequest, notFound } from "../utils/appError.js";

export const fineService = {
  async payFine(fineId, { amount, payment_method = null, reference_no = null, note = null, received_by = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fineRes = await client.query(`SELECT * FROM fines WHERE fine_id = $1 FOR UPDATE`, [fineId]);
      const fine = fineRes.rows[0];
      if (!fine) throw notFound('Fine not found');
      const outstanding = Number(fine.amount) - Number(fine.paid_amount || 0) - Number(fine.waived_amount || 0);
      const payAmount = Number(amount || 0);
      if (payAmount <= 0) throw badRequest('Payment amount must be greater than zero');
      if (payAmount > outstanding) throw badRequest('Payment amount exceeds outstanding balance');
      await client.query(`INSERT INTO fine_payments (fine_id, received_by, amount, payment_method, reference_no, note) VALUES ($1,$2,$3,$4,$5,$6)`, [fineId, received_by, payAmount, payment_method, reference_no, note]);
      const newPaidAmount = Number(fine.paid_amount || 0) + payAmount;
      const newStatus = newPaidAmount + Number(fine.waived_amount || 0) >= Number(fine.amount) ? 'paid' : 'partial';
      const updateRes = await client.query(`UPDATE fines SET paid_amount = $1, status = $2 WHERE fine_id = $3 RETURNING *`, [newPaidAmount, newStatus, fineId]);
      await notificationService.createForMember(fine.member_id, { type: 'fine_paid', title: 'Fine payment received', message: `Payment of ${payAmount} has been recorded.`, relatedEntityType: 'fine', relatedEntityId: fineId }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: received_by, action: 'fine.pay', entityType: 'fine', entityId: fineId, newValues: updateRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return updateRes.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },

  async waiveFine(fineId, { amount, reason, approved_by = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fineRes = await client.query(`SELECT * FROM fines WHERE fine_id = $1 FOR UPDATE`, [fineId]);
      const fine = fineRes.rows[0];
      if (!fine) throw notFound('Fine not found');
      const outstanding = Number(fine.amount) - Number(fine.paid_amount || 0) - Number(fine.waived_amount || 0);
      const waiveAmount = Number(amount || 0);
      if (waiveAmount <= 0) throw badRequest('Waiver amount must be greater than zero');
      if (waiveAmount > outstanding) throw badRequest('Waiver amount exceeds outstanding balance');
      if (!reason) throw badRequest('Waiver reason is required');
      await client.query(`INSERT INTO fine_waivers (fine_id, approved_by, amount, reason) VALUES ($1,$2,$3,$4)`, [fineId, approved_by, waiveAmount, reason]);
      const newWaivedAmount = Number(fine.waived_amount || 0) + waiveAmount;
      const newStatus = Number(fine.paid_amount || 0) + newWaivedAmount >= Number(fine.amount) ? 'waived' : 'partial';
      const updateRes = await client.query(`UPDATE fines SET waived_amount = $1, status = $2 WHERE fine_id = $3 RETURNING *`, [newWaivedAmount, newStatus, fineId]);
      await notificationService.createForMember(fine.member_id, { type: 'fine_waived', title: 'Fine waiver applied', message: `Waiver of ${waiveAmount} has been applied to your fine.`, relatedEntityType: 'fine', relatedEntityId: fineId }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: approved_by, action: 'fine.waive', entityType: 'fine', entityId: fineId, newValues: updateRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return updateRes.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  },
};
