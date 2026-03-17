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
      SELECT l.*, m.member_code, COALESCE(u.full_name, u.name, u.email) AS full_name, c.accession_number, cm.title
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

  async usageReport() {
    const [overviewRes, branchesRes, monthlyRes, topDigitalRes, pipelineRes] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM catalog_materials WHERE COALESCE(is_active, TRUE) = TRUE) AS active_materials,
          (SELECT COUNT(*)::int FROM library_members WHERE status = 'active') AS active_members,
          (SELECT COUNT(*)::int FROM loans WHERE loan_date >= NOW() - INTERVAL '30 days') AS loans_last_30_days,
          (SELECT COUNT(*)::int FROM digital_usage_logs WHERE created_at >= NOW() - INTERVAL '30 days') AS digital_events_last_30_days,
          (SELECT COUNT(*)::int FROM digital_submissions WHERE status IN ('submitted','under_review','correction_requested')) AS pending_digital_submissions,
          (SELECT COALESCE(SUM(amount - paid_amount - waived_amount), 0)::numeric FROM fines WHERE status IN ('unpaid','partial')) AS outstanding_fine_balance
      `),
      pool.query(`
        SELECT
          lb.name AS branch_name,
          COUNT(DISTINCT mc.copy_id)::int AS copy_count,
          COUNT(DISTINCT l.loan_id) FILTER (WHERE l.status IN ('active','overdue'))::int AS active_loans
        FROM library_branches lb
        LEFT JOIN material_copies mc ON mc.branch_id = lb.branch_id
        LEFT JOIN loans l ON l.copy_id = mc.copy_id AND l.status IN ('active','overdue')
        GROUP BY lb.name
        ORDER BY lb.name
      `),
      pool.query(`
        WITH months AS (
          SELECT TO_CHAR(date_trunc('month', d)::date, 'YYYY-MM') AS month, date_trunc('month', d)::date AS month_start
          FROM generate_series(date_trunc('month', NOW()) - INTERVAL '5 months', date_trunc('month', NOW()), INTERVAL '1 month') AS d
        )
        SELECT
          m.month,
          COALESCE(l.loan_count, 0)::int AS loan_count,
          COALESCE(d.digital_count, 0)::int AS digital_count
        FROM months m
        LEFT JOIN (
          SELECT TO_CHAR(date_trunc('month', loan_date), 'YYYY-MM') AS month, COUNT(*)::int AS loan_count
          FROM loans
          GROUP BY 1
        ) l ON l.month = m.month
        LEFT JOIN (
          SELECT TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*)::int AS digital_count
          FROM digital_usage_logs
          GROUP BY 1
        ) d ON d.month = m.month
        ORDER BY m.month_start
      `),
      pool.query(`
        SELECT
          COALESCE(cm.title, 'Untitled') AS title,
          COUNT(*)::int AS usage_count,
          COUNT(*) FILTER (WHERE dul.action = 'view')::int AS view_count,
          COUNT(*) FILTER (WHERE dul.action = 'download')::int AS download_count
        FROM digital_usage_logs dul
        LEFT JOIN digital_resources dr ON dr.digital_resource_id = dul.digital_resource_id
        LEFT JOIN catalog_materials cm ON cm.material_id = dr.material_id
        GROUP BY cm.title
        ORDER BY usage_count DESC, title ASC
        LIMIT 10
      `),
      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM acquisition_requests
        GROUP BY status
        ORDER BY status
      `),
    ])

    return {
      overview: overviewRes.rows[0] || {},
      branches: branchesRes.rows,
      monthlyActivity: monthlyRes.rows,
      topDigitalResources: topDigitalRes.rows,
      acquisitionPipeline: pipelineRes.rows,
    };
  },

  async loansReport() {
    const [overviewRes, dueSoonRes, monthlyRes, recentRes, topRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status IN ('active','overdue'))::int AS active_loans,
          COUNT(*) FILTER (WHERE status = 'overdue' OR (status = 'active' AND due_date < NOW()))::int AS overdue_loans,
          COUNT(*) FILTER (WHERE return_date >= NOW() - INTERVAL '30 days')::int AS returns_last_30_days,
          COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(return_date, NOW()) - loan_date)) / 86400)::numeric, 1), 0)::numeric AS avg_loan_days
        FROM loans
      `),
      pool.query(`
        SELECT
          l.loan_id,
          COALESCE(u.full_name, u.name, u.email) AS full_name,
          cm.title,
          l.due_date,
          CASE
            WHEN l.status = 'overdue' OR (l.status = 'active' AND l.due_date < NOW()) THEN 'overdue'
            ELSE l.status
          END AS status
        FROM loans l
        JOIN library_members m ON m.member_id = l.member_id
        JOIN users u ON u.uuid = m.user_id
        JOIN material_copies mc ON mc.copy_id = l.copy_id
        JOIN catalog_materials cm ON cm.material_id = mc.material_id
        WHERE l.status IN ('active','overdue')
          AND l.due_date <= NOW() + INTERVAL '7 days'
        ORDER BY l.due_date ASC
        LIMIT 25
      `),
      pool.query(`
        WITH months AS (
          SELECT TO_CHAR(date_trunc('month', d)::date, 'YYYY-MM') AS month, date_trunc('month', d)::date AS month_start
          FROM generate_series(date_trunc('month', NOW()) - INTERVAL '5 months', date_trunc('month', NOW()), INTERVAL '1 month') AS d
        )
        SELECT
          m.month,
          COALESCE(lo.loan_count, 0)::int AS loan_count,
          COALESCE(re.return_count, 0)::int AS return_count
        FROM months m
        LEFT JOIN (
          SELECT TO_CHAR(date_trunc('month', loan_date), 'YYYY-MM') AS month, COUNT(*)::int AS loan_count
          FROM loans
          GROUP BY 1
        ) lo ON lo.month = m.month
        LEFT JOIN (
          SELECT TO_CHAR(date_trunc('month', return_date), 'YYYY-MM') AS month, COUNT(*)::int AS return_count
          FROM loans
          WHERE return_date IS NOT NULL
          GROUP BY 1
        ) re ON re.month = m.month
        ORDER BY m.month_start
      `),
      pool.query(`
        SELECT
          l.loan_id,
          COALESCE(u.full_name, u.name, u.email) AS full_name,
          cm.title,
          l.loan_date,
          l.due_date,
          l.status
        FROM loans l
        JOIN library_members m ON m.member_id = l.member_id
        JOIN users u ON u.uuid = m.user_id
        JOIN material_copies mc ON mc.copy_id = l.copy_id
        JOIN catalog_materials cm ON cm.material_id = mc.material_id
        ORDER BY COALESCE(l.loan_date, l.created_at) DESC
        LIMIT 25
      `),
      pool.query(`
        SELECT
          cm.title,
          COUNT(*)::int AS borrow_count,
          COUNT(*) FILTER (WHERE l.status = 'overdue' OR (l.status = 'returned' AND l.return_date > l.due_date))::int AS overdue_count
        FROM loans l
        JOIN material_copies mc ON mc.copy_id = l.copy_id
        JOIN catalog_materials cm ON cm.material_id = mc.material_id
        GROUP BY cm.title
        ORDER BY borrow_count DESC, cm.title ASC
        LIMIT 10
      `),
    ])
    return {
      overview: overviewRes.rows[0] || {},
      dueSoon: dueSoonRes.rows,
      monthlyTrend: monthlyRes.rows,
      recentLoans: recentRes.rows,
      topBorrowed: topRes.rows,
    };
  },
};
