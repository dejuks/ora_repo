import pool from '../../config/db.js';
import { notFound } from '../utils/appError.js';

async function markOverdueLoans(client = pool) {
  await client.query(
    `UPDATE loans
     SET status = 'overdue', updated_at = NOW()
     WHERE status = 'active' AND due_date < NOW()`
  );
}

async function getMemberOverviewByMemberId(memberId) {
  await markOverdueLoans();

  const memberRes = await pool.query(
    `SELECT lm.*, lb.name AS branch_name, mt.name AS member_type_name, u.full_name, u.email
     FROM library_members lm
     LEFT JOIN library_branches lb ON lb.branch_id = lm.branch_id
     LEFT JOIN member_types mt ON mt.member_type_id = lm.member_type_id
     LEFT JOIN users u ON u.uuid = lm.user_id
     WHERE lm.member_id = $1
     LIMIT 1`,
    [memberId]
  );
  const member = memberRes.rows[0];
  if (!member) throw notFound('Member not found');

  const [activeLoansRes, loanHistoryRes, holdsRes, finesRes, paymentsRes] = await Promise.all([
    pool.query(
      `SELECT l.*, mc.accession_number, mc.barcode, cm.title AS material_title, lb.name AS branch_name
       FROM loans l
       JOIN material_copies mc ON mc.copy_id = l.copy_id
       JOIN catalog_materials cm ON cm.material_id = mc.material_id
       LEFT JOIN library_branches lb ON lb.branch_id = mc.branch_id
       WHERE l.member_id = $1 AND l.status IN ('active','overdue')
       ORDER BY l.due_date ASC, l.loan_date DESC`,
      [memberId]
    ),
    pool.query(
      `SELECT l.*, mc.accession_number, mc.barcode, cm.title AS material_title, lb.name AS branch_name
       FROM loans l
       JOIN material_copies mc ON mc.copy_id = l.copy_id
       JOIN catalog_materials cm ON cm.material_id = mc.material_id
       LEFT JOIN library_branches lb ON lb.branch_id = mc.branch_id
       WHERE l.member_id = $1
       ORDER BY COALESCE(l.return_date, l.loan_date) DESC
       LIMIT 100`,
      [memberId]
    ),
    pool.query(
      `SELECT h.*, mc.accession_number, cm.title AS material_title
       FROM hold_requests h
       JOIN catalog_materials cm ON cm.material_id = h.material_id
       LEFT JOIN material_copies mc ON mc.copy_id = h.copy_id
       WHERE h.member_id = $1
       ORDER BY h.requested_at DESC`,
      [memberId]
    ),
    pool.query(
      `SELECT f.*, mc.accession_number, cm.title AS material_title,
              GREATEST(COALESCE(f.amount,0) - COALESCE(f.paid_amount,0) - COALESCE(f.waived_amount,0), 0) AS outstanding_amount
       FROM fines f
       LEFT JOIN material_copies mc ON mc.copy_id = f.copy_id
       LEFT JOIN catalog_materials cm ON cm.material_id = mc.material_id
       WHERE f.member_id = $1
       ORDER BY f.created_at DESC`,
      [memberId]
    ),
    pool.query(
      `SELECT fp.*, f.member_id
       FROM fine_payments fp
       JOIN fines f ON f.fine_id = fp.fine_id
       WHERE f.member_id = $1
       ORDER BY fp.paid_at DESC
       LIMIT 100`,
      [memberId]
    ),
  ]);

  const fines = finesRes.rows;
  const activeLoans = activeLoansRes.rows;
  const loanHistory = loanHistoryRes.rows;
  const holds = holdsRes.rows;
  const payments = paymentsRes.rows;

  const outstandingBalance = fines.reduce((sum, row) => sum + Number(row.outstanding_amount || 0), 0);
  const dueSoon = activeLoans.filter((row) => {
    const due = new Date(row.due_date);
    const diff = due.getTime() - Date.now();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });

  return {
    member,
    summary: {
      active_loans: activeLoans.filter((row) => row.status === 'active').length,
      overdue_loans: activeLoans.filter((row) => row.status === 'overdue').length,
      holds: holds.filter((row) => ['queued', 'ready_for_pickup'].includes(row.status)).length,
      fines_open: fines.filter((row) => ['unpaid', 'partial'].includes(row.status)).length,
      outstanding_balance: outstandingBalance,
      due_soon: dueSoon.length,
    },
    activeLoans,
    loanHistory,
    holds,
    fines,
    finePayments: payments,
    dueSoon,
  };
}

export const circulationService = {
  async getSummary() {
    await markOverdueLoans();

    const [countsRes, dueSoonRes, readyHoldsRes, activeLoansRes, openFinesRes] = await Promise.all([
      pool.query(
        `SELECT
            (SELECT COUNT(*)::int FROM loans WHERE status = 'active') AS active_loans,
            (SELECT COUNT(*)::int FROM loans WHERE status = 'overdue') AS overdue_loans,
            (SELECT COUNT(*)::int FROM hold_requests WHERE status = 'ready_for_pickup') AS ready_holds,
            (SELECT COALESCE(SUM(GREATEST(amount - paid_amount - waived_amount, 0)), 0)::numeric FROM fines WHERE status IN ('unpaid','partial')) AS outstanding_fine_balance`
      ),
      pool.query(
        `SELECT l.loan_id, l.member_id, lm.member_code, u.full_name AS member_name,
                cm.title AS material_title, mc.accession_number, lb.name AS branch_name,
                l.loan_date, l.due_date, l.status, l.renewal_count
         FROM loans l
         JOIN library_members lm ON lm.member_id = l.member_id
         LEFT JOIN users u ON u.uuid = lm.user_id
         JOIN material_copies mc ON mc.copy_id = l.copy_id
         JOIN catalog_materials cm ON cm.material_id = mc.material_id
         LEFT JOIN library_branches lb ON lb.branch_id = mc.branch_id
         WHERE l.status IN ('active','overdue')
           AND l.due_date <= NOW() + INTERVAL '3 day'
         ORDER BY l.due_date ASC
         LIMIT 25`
      ),
      pool.query(
        `SELECT h.hold_id, h.member_id, lm.member_code, u.full_name AS member_name,
                cm.title AS material_title, mc.accession_number, h.ready_at, h.expiry_at, h.status
         FROM hold_requests h
         JOIN library_members lm ON lm.member_id = h.member_id
         LEFT JOIN users u ON u.uuid = lm.user_id
         JOIN catalog_materials cm ON cm.material_id = h.material_id
         LEFT JOIN material_copies mc ON mc.copy_id = h.copy_id
         WHERE h.status = 'ready_for_pickup'
         ORDER BY h.ready_at DESC NULLS LAST
         LIMIT 25`
      ),
      pool.query(
        `SELECT l.loan_id, l.member_id, lm.member_code, u.full_name AS member_name,
                cm.title AS material_title, mc.accession_number, lb.name AS branch_name,
                l.loan_date, l.due_date, l.status, l.renewal_count
         FROM loans l
         JOIN library_members lm ON lm.member_id = l.member_id
         LEFT JOIN users u ON u.uuid = lm.user_id
         JOIN material_copies mc ON mc.copy_id = l.copy_id
         JOIN catalog_materials cm ON cm.material_id = mc.material_id
         LEFT JOIN library_branches lb ON lb.branch_id = mc.branch_id
         WHERE l.status IN ('active','overdue')
         ORDER BY l.due_date ASC, l.loan_date DESC
         LIMIT 50`
      ),
      pool.query(
        `SELECT f.fine_id, f.member_id, lm.member_code, u.full_name AS member_name,
                f.reason, f.amount, f.paid_amount, f.waived_amount, f.status,
                GREATEST(COALESCE(f.amount,0)-COALESCE(f.paid_amount,0)-COALESCE(f.waived_amount,0),0) AS outstanding_amount,
                cm.title AS material_title
         FROM fines f
         JOIN library_members lm ON lm.member_id = f.member_id
         LEFT JOIN users u ON u.uuid = lm.user_id
         LEFT JOIN material_copies mc ON mc.copy_id = f.copy_id
         LEFT JOIN catalog_materials cm ON cm.material_id = mc.material_id
         WHERE f.status IN ('unpaid','partial')
         ORDER BY outstanding_amount DESC, f.created_at DESC
         LIMIT 50`
      ),
    ]);

    return {
      summary: countsRes.rows[0] || {},
      dueSoon: dueSoonRes.rows,
      readyHolds: readyHoldsRes.rows,
      activeLoans: activeLoansRes.rows,
      openFines: openFinesRes.rows,
    };
  },

  async getMemberOverview(memberId) {
    return getMemberOverviewByMemberId(memberId);
  },

  async getMyOverview(userId) {
    const memberRes = await pool.query(
      `SELECT member_id FROM library_members WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const member = memberRes.rows[0];
    if (!member) throw notFound('Library member profile not found for the current user');
    return getMemberOverviewByMemberId(member.member_id);
  },
};
