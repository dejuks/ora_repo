import pool from "../../config/db.js";

export const libraryReportService = {
  async summary() {
    const queries = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM catalog_materials`),
      pool.query(`SELECT COUNT(*)::int AS count FROM material_copies`),
      pool.query(`SELECT COUNT(*)::int AS count FROM loans WHERE status IN ('active', 'overdue')`),
      pool.query(`SELECT COUNT(*)::int AS count FROM hold_requests WHERE status IN ('queued', 'ready_for_pickup')`),
      pool.query(`SELECT COALESCE(SUM(amount - paid_amount - waived_amount), 0)::numeric AS balance FROM fines WHERE status IN ('unpaid', 'partial')`),
      pool.query(`SELECT COUNT(*)::int AS count FROM digital_submissions WHERE status IN ('submitted', 'under_review', 'correction_requested')`),
      pool.query(`SELECT COUNT(*)::int AS count FROM digital_resources WHERE is_active = TRUE`)
    ]);
    return {
      materials: queries[0].rows[0].count,
      copies: queries[1].rows[0].count,
      activeLoans: queries[2].rows[0].count,
      pendingHolds: queries[3].rows[0].count,
      outstandingFineBalance: queries[4].rows[0].balance,
      pendingDigitalSubmissions: queries[5].rows[0].count,
      activeDigitalResources: queries[6].rows[0].count,
    };
  },

  async overdueLoans() {
    const { rows } = await pool.query(`
      SELECT l.*, m.member_code, u.full_name, c.accession_number, cm.title
      FROM loans l
      JOIN library_members m ON m.member_id = l.member_id
      JOIN users u ON u.uuid = m.user_id
      JOIN material_copies c ON c.copy_id = l.copy_id
      JOIN catalog_materials cm ON cm.material_id = c.material_id
      WHERE l.status = 'overdue' OR (l.status = 'active' AND l.due_date < NOW())
      ORDER BY l.due_date ASC
    `);
    return rows;
  },
};
