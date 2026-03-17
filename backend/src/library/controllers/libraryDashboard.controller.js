import db from "../../config/db.js";

export const libraryDashboardController = {
  async librarian(req, res) {
    try {
      const { rows } = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM loans WHERE status IN ('active','overdue'))::int AS active_loans,
          (SELECT COUNT(*) FROM loans WHERE status = 'overdue')::int AS overdue_loans,
          (SELECT COUNT(*) FROM hold_requests WHERE status IN ('queued','ready_for_pickup'))::int AS holds_ready,
          (SELECT COUNT(*) FROM fines WHERE status IN ('unpaid','partial'))::int AS unpaid_fines
      `);
      return res.json({ success: true, data: rows[0] || {} });
    } catch (error) {
      console.error("Failed to load librarian dashboard:", error);
      return res.status(500).json({ success: false, message: "Failed to load librarian dashboard" });
    }
  },

  async manager(req, res) {
    try {
      const { rows } = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM catalog_materials)::int AS materials,
          (SELECT COUNT(*) FROM material_copies)::int AS copies,
          (SELECT COUNT(*) FROM acquisition_requests WHERE status = 'submitted')::int AS pending_requests,
          (SELECT COUNT(*) FROM loans WHERE status = 'overdue')::int AS overdue_items
      `);
      return res.json({ success: true, data: rows[0] || {} });
    } catch (error) {
      console.error("Failed to load manager dashboard:", error);
      return res.status(500).json({ success: false, message: "Failed to load manager dashboard" });
    }
  },

  async cataloger(req, res) {
    try {
      const { rows } = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM catalog_materials)::int AS total_titles,
          (SELECT COUNT(*) FROM material_copies)::int AS total_copies,
          (SELECT COUNT(*) FROM cataloging_jobs WHERE status = 'pending')::int AS pending_jobs,
          (SELECT COUNT(*) FROM cataloging_jobs WHERE status = 'in_progress')::int AS in_progress_jobs
      `);
      return res.json({ success: true, data: rows[0] || {} });
    } catch (error) {
      console.error("Failed to load cataloger dashboard:", error);
      return res.status(500).json({ success: false, message: "Failed to load cataloger dashboard" });
    }
  },

  async admin(req, res) {
    try {
      const { rows } = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM users)::int AS total_users,
          (SELECT COUNT(*) FROM library_members)::int AS total_members,
          (SELECT COUNT(*) FROM library_audit_logs)::int AS total_audit_logs,
          (SELECT COUNT(*) FROM library_notifications WHERE is_read = false)::int AS unread_notifications
      `);
      return res.json({ success: true, data: rows[0] || {} });
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      return res.status(500).json({ success: false, message: "Failed to load admin dashboard" });
    }
  },
};
