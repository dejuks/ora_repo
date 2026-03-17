import pool from "../../config/db.js";
import { writeLibraryAuditLog } from "../utils/audit.js";
import { notificationService } from "./notification.service.js";
import { badRequest, notFound } from "../utils/appError.js";

export const loanService = {
  async borrow({ member_id, copy_id, issued_by, remarks = null, loan_date = null, due_date = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const memberRes = await client.query(
        `SELECT lm.*, mt.max_active_loans, mt.loan_period_days, mt.renewal_limit, mt.fine_per_day, mt.grace_period_days
         FROM library_members lm
         JOIN member_types mt ON mt.member_type_id = lm.member_type_id
         WHERE lm.member_id = $1 FOR UPDATE`,
        [member_id]
      );
      const member = memberRes.rows[0];
      if (!member) throw notFound('Member not found');
      if (member.status !== 'active') throw badRequest('Member is not active');
      if (member.expiry_date && new Date(member.expiry_date) < new Date()) throw badRequest('Member membership has expired');

      const copyRes = await client.query(
        `SELECT mc.*, cm.material_id, cm.title, cm.is_reference_only, cm.material_type_id
         FROM material_copies mc
         JOIN catalog_materials cm ON cm.material_id = mc.material_id
         WHERE mc.copy_id = $1 FOR UPDATE`,
        [copy_id]
      );
      const copy = copyRes.rows[0];
      if (!copy) throw notFound('Copy not found');
      if (copy.status !== 'available') throw badRequest('Copy is not available');
      if (!copy.is_circulation_allowed) throw badRequest('Copy is not allowed for circulation');
      if (copy.is_reference_only) throw badRequest('Reference only items cannot be borrowed');

      const policyRes = await client.query(
        `SELECT * FROM circulation_policies
         WHERE member_type_id = $1 AND material_type_id = $2 AND is_active = TRUE
         LIMIT 1`,
        [member.member_type_id, copy.material_type_id]
      );
      const policy = policyRes.rows[0];
      const maxActiveLoans = policy?.max_active_loans ?? member.max_active_loans;
      const loanPeriodDays = policy?.loan_period_days ?? member.loan_period_days ?? 14;

      const activeLoansRes = await client.query(
        `SELECT COUNT(*)::int AS count FROM loans WHERE member_id = $1 AND status IN ('active', 'overdue')`,
        [member_id]
      );
      if (activeLoansRes.rows[0].count >= maxActiveLoans) throw badRequest('Member has reached the maximum active loans');

      const openFineRes = await client.query(
        `SELECT COUNT(*)::int AS count FROM fines WHERE member_id = $1 AND status IN ('unpaid', 'partial')`,
        [member_id]
      );
      if (openFineRes.rows[0].count > 0) throw badRequest('Member has outstanding fines');

      const effectiveLoanDate = loan_date ? new Date(loan_date) : new Date();
      const effectiveDueDate = due_date ? new Date(due_date) : new Date(effectiveLoanDate.getTime() + loanPeriodDays * 86400000);
      if (effectiveDueDate <= effectiveLoanDate) throw badRequest('due_date must be after loan_date');

      const loanInsert = await client.query(
        `INSERT INTO loans (member_id, copy_id, issued_by, policy_id, loan_date, due_date, status, remarks)
         VALUES ($1,$2,$3,$4,$5,$6,'active',$7)
         RETURNING *`,
        [member_id, copy_id, issued_by || null, policy?.policy_id || null, effectiveLoanDate, effectiveDueDate, remarks]
      );

      await client.query(`UPDATE material_copies SET status = 'borrowed' WHERE copy_id = $1`, [copy_id]);
      await notificationService.createForMember(member_id, {
        type: 'loan_issued',
        title: 'Library item borrowed',
        message: `${copy.title} was issued to your account. Due on ${effectiveDueDate.toISOString().slice(0,10)}.`,
        relatedEntityType: 'loan',
        relatedEntityId: loanInsert.rows[0].loan_id,
      }, client);

      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: issued_by || null, action: 'borrow', entityType: 'loan', entityId: loanInsert.rows[0].loan_id, newValues: loanInsert.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return loanInsert.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  },

  async returnLoan(loanId, { returned_to, return_date = null, note = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const loanRes = await client.query(
        `SELECT l.*, mc.copy_id, mc.material_id, cm.title, cp.fine_per_day, cp.grace_period_days
         FROM loans l
         JOIN material_copies mc ON mc.copy_id = l.copy_id
         JOIN catalog_materials cm ON cm.material_id = mc.material_id
         LEFT JOIN circulation_policies cp ON cp.policy_id = l.policy_id
         WHERE l.loan_id = $1 FOR UPDATE`,
        [loanId]
      );
      const loan = loanRes.rows[0];
      if (!loan) throw notFound('Loan not found');
      if (!['active', 'overdue'].includes(loan.status)) throw badRequest('Loan is not open');

      const effectiveReturnDate = return_date ? new Date(return_date) : new Date();
      const loanUpdateRes = await client.query(
        `UPDATE loans SET return_date = $1, returned_to = $2, status = 'returned', remarks = COALESCE($3, remarks)
         WHERE loan_id = $4 RETURNING *`,
        [effectiveReturnDate, returned_to || null, note, loanId]
      );

      const holdRes = await client.query(
        `SELECT * FROM hold_requests
         WHERE material_id = $1 AND status = 'queued'
         ORDER BY queue_position NULLS LAST, requested_at ASC
         LIMIT 1`,
        [loan.material_id]
      );
      if (holdRes.rows[0]) {
        const hold = holdRes.rows[0];
        await client.query(
          `UPDATE hold_requests SET copy_id = $1, status = 'ready_for_pickup', ready_at = NOW(), expiry_at = NOW() + INTERVAL '3 day' WHERE hold_id = $2`,
          [loan.copy_id, hold.hold_id]
        );
        await client.query(`UPDATE material_copies SET status = 'reserved' WHERE copy_id = $1`, [loan.copy_id]);
        await notificationService.createForMember(hold.member_id, {
          type: 'hold_ready',
          title: 'Reserved item is ready',
          message: `${loan.title} is ready for pickup.`,
          relatedEntityType: 'hold_request',
          relatedEntityId: hold.hold_id,
        }, client);
      } else {
        await client.query(`UPDATE material_copies SET status = 'available' WHERE copy_id = $1`, [loan.copy_id]);
      }

      const finePerDay = Number(loan.fine_per_day || 0);
      const gracePeriod = Number(loan.grace_period_days || 0);
      const diffDays = Math.ceil((effectiveReturnDate - new Date(loan.due_date)) / 86400000);
      if (diffDays > gracePeriod && finePerDay > 0) {
        const fineAmount = (diffDays - gracePeriod) * finePerDay;
        await client.query(
          `INSERT INTO fines (member_id, loan_id, copy_id, reason, amount, status, assessed_by, note)
           VALUES ($1,$2,$3,'overdue',$4,'unpaid',$5,$6)`,
          [loan.member_id, loan.loan_id, loan.copy_id, fineAmount, returned_to || null, 'Auto-generated overdue fine']
        );
        await notificationService.createForMember(loan.member_id, {
          type: 'fine_created',
          title: 'Overdue fine created',
          message: `An overdue fine of ${fineAmount} has been added to your account.`,
          relatedEntityType: 'loan',
          relatedEntityId: loan.loan_id,
        }, client);
      }

      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: returned_to || null, action: 'return', entityType: 'loan', entityId: loanId, newValues: loanUpdateRes.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return loanUpdateRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  },

  async renewLoan(loanId, { renewed_by, note = null, new_due_date = null }, reqMeta = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const loanRes = await client.query(
        `SELECT l.*, mc.material_id, cp.renewal_limit, cp.loan_period_days, cp.allow_renewal
         FROM loans l
         JOIN material_copies mc ON mc.copy_id = l.copy_id
         LEFT JOIN circulation_policies cp ON cp.policy_id = l.policy_id
         WHERE l.loan_id = $1 FOR UPDATE`,
        [loanId]
      );
      const loan = loanRes.rows[0];
      if (!loan) throw notFound('Loan not found');
      if (!['active', 'overdue'].includes(loan.status)) throw badRequest('Loan cannot be renewed');
      if (loan.allow_renewal === false) throw badRequest('Renewal is not allowed by policy');
      const renewalLimit = Number(loan.renewal_limit ?? 1);
      if (Number(loan.renewal_count || 0) >= renewalLimit) throw badRequest('Renewal limit reached');

      const holdRes = await client.query(`SELECT COUNT(*)::int AS count FROM hold_requests WHERE material_id = $1 AND status IN ('queued', 'ready_for_pickup')`, [loan.material_id]);
      if (holdRes.rows[0].count > 0) throw badRequest('Loan cannot be renewed because there is an active hold');

      const oldDueDate = new Date(loan.due_date);
      const effectiveNewDueDate = new_due_date ? new Date(new_due_date) : new Date(oldDueDate.getTime() + Number(loan.loan_period_days || 14) * 86400000);
      if (effectiveNewDueDate <= oldDueDate) throw badRequest('new_due_date must be after the current due date');

      const updatedLoan = await client.query(
        `UPDATE loans SET due_date = $1, renewal_count = renewal_count + 1, status = 'active', remarks = COALESCE($2, remarks)
         WHERE loan_id = $3 RETURNING *`,
        [effectiveNewDueDate, note, loanId]
      );

      await client.query(`INSERT INTO loan_renewals (loan_id, renewed_by, old_due_date, new_due_date, renewal_no, note) VALUES ($1,$2,$3,$4,$5,$6)`, [loanId, renewed_by || null, oldDueDate, effectiveNewDueDate, Number(loan.renewal_count || 0) + 1, note]);
      await notificationService.createForMember(loan.member_id, {
        type: 'loan_renewed',
        title: 'Loan renewed',
        message: `Your library loan has been renewed to ${effectiveNewDueDate.toISOString().slice(0,10)}.`,
        relatedEntityType: 'loan',
        relatedEntityId: loanId,
      }, client);
      await client.query('COMMIT');
      await writeLibraryAuditLog({ actorUserId: renewed_by || null, action: 'renew', entityType: 'loan', entityId: loanId, newValues: updatedLoan.rows[0], ipAddress: reqMeta.ipAddress || null, userAgent: reqMeta.userAgent || null });
      return updatedLoan.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  },
};
