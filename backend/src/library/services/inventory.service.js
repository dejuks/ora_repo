import pool from '../../config/db.js';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

async function insertAuditItems(client, auditId, items = [], checkedBy = null) {
  let created = 0;
  for (const item of items) {
    if (!item?.copy_id) continue;
    await client.query(
      `INSERT INTO inventory_audit_items (
        audit_id, copy_id, expected_location_id, found_location_id,
        was_found, condition_note, discrepancy_note, checked_by, checked_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (audit_id, copy_id) DO UPDATE SET
        expected_location_id = EXCLUDED.expected_location_id,
        found_location_id = EXCLUDED.found_location_id,
        was_found = EXCLUDED.was_found,
        condition_note = EXCLUDED.condition_note,
        discrepancy_note = EXCLUDED.discrepancy_note,
        checked_by = EXCLUDED.checked_by,
        checked_at = EXCLUDED.checked_at`,
      [
        auditId,
        item.copy_id,
        item.expected_location_id || null,
        item.found_location_id || null,
        item.was_found ?? null,
        item.condition_note || null,
        item.discrepancy_note || null,
        checkedBy,
        item.was_found === undefined ? null : (item.checked_at || new Date()),
      ]
    );
    created += 1;
  }
  return created;
}

export const inventoryService = {
  async createAudit(payload = {}, user = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const status = payload.status || 'in_progress';
      const creatorId = user?.uuid || null;
      const startDate = payload.start_date || new Date().toISOString().slice(0, 10);
      const { rows: auditRows } = await client.query(
        `INSERT INTO inventory_audits (
          branch_id, location_id, audit_name, status, started_by, start_date, end_date, note
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
        [
          payload.branch_id || null,
          payload.location_id || null,
          payload.audit_name || `Inventory Audit ${startDate}`,
          status,
          creatorId,
          startDate,
          payload.end_date || null,
          payload.note || null,
        ]
      );

      const audit = auditRows[0];
      let items = Array.isArray(payload.items) ? payload.items : [];

      if (!items.length) {
        const params = [];
        const where = [];
        if (payload.branch_id) {
          params.push(payload.branch_id);
          where.push(`mc.branch_id = $${params.length}`);
        }
        if (payload.location_id) {
          params.push(payload.location_id);
          where.push(`mc.location_id = $${params.length}`);
        }
        const sql = `
          SELECT mc.copy_id, mc.location_id AS expected_location_id, mc.status, cm.title, mc.accession_number, mc.barcode
          FROM material_copies mc
          LEFT JOIN catalog_materials cm ON cm.material_id = mc.material_id
          ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
          ORDER BY cm.title NULLS LAST, mc.accession_number NULLS LAST
          LIMIT 1000
        `;
        const { rows } = await client.query(sql, params);
        items = rows.map((row) => ({
          copy_id: row.copy_id,
          expected_location_id: row.expected_location_id,
          found_location_id: row.expected_location_id,
          was_found: null,
          condition_note: '',
          discrepancy_note: '',
        }));
      }

      const itemCount = await insertAuditItems(client, audit.audit_id, items, creatorId);

      await client.query('COMMIT');
      return {
        audit,
        item_count: itemCount,
        message: 'Inventory audit created successfully',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getReport() {
    const [summaryRes, auditStatusRes, copyStatusRes, recentAuditsRes, missingRes, damagedRes, branchRes] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM inventory_audits) AS total_audits,
          (SELECT COUNT(*)::int FROM inventory_audits WHERE status IN ('draft','in_progress')) AS open_audits,
          (SELECT COUNT(*)::int FROM inventory_audit_items WHERE was_found = FALSE) AS items_not_found,
          (SELECT COUNT(*)::int FROM inventory_audit_items WHERE discrepancy_note IS NOT NULL AND BTRIM(discrepancy_note) <> '') AS discrepancy_items,
          (SELECT COUNT(*)::int FROM lost_item_reports WHERE resolved = FALSE) AS unresolved_missing_items,
          (SELECT COUNT(*)::int FROM damage_reports WHERE resolved = FALSE) AS unresolved_damaged_items,
          (SELECT COUNT(*)::int FROM material_copies) AS total_copies
      `),
      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM inventory_audits
        GROUP BY status
        ORDER BY count DESC, status ASC
      `),
      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM material_copies
        GROUP BY status
        ORDER BY count DESC, status ASC
      `),
      pool.query(`
        SELECT ia.audit_id, ia.audit_name, ia.status, ia.start_date, ia.end_date,
               b.name AS branch_name, l.name AS location_name,
               COALESCE(stats.total_items, 0) AS total_items,
               COALESCE(stats.checked_items, 0) AS checked_items,
               COALESCE(stats.not_found_items, 0) AS not_found_items
        FROM inventory_audits ia
        LEFT JOIN library_branches b ON b.branch_id = ia.branch_id
        LEFT JOIN library_locations l ON l.location_id = ia.location_id
        LEFT JOIN (
          SELECT audit_id,
                 COUNT(*)::int AS total_items,
                 COUNT(*) FILTER (WHERE was_found IS NOT NULL)::int AS checked_items,
                 COUNT(*) FILTER (WHERE was_found = FALSE)::int AS not_found_items
          FROM inventory_audit_items
          GROUP BY audit_id
        ) stats ON stats.audit_id = ia.audit_id
        ORDER BY ia.created_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT lir.lost_report_id, lir.copy_id, lir.loan_id, lir.description, lir.replacement_cost,
               lir.reported_by, lir.resolved, lir.resolved_at,
               mc.accession_number, mc.barcode, cm.title, b.name AS branch_name
        FROM lost_item_reports lir
        LEFT JOIN material_copies mc ON mc.copy_id = lir.copy_id
        LEFT JOIN catalog_materials cm ON cm.material_id = mc.material_id
        LEFT JOIN library_branches b ON b.branch_id = mc.branch_id
        WHERE lir.resolved = FALSE
        ORDER BY lir.resolved ASC, lir.lost_report_id DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT dr.damage_report_id, dr.copy_id, dr.loan_id, dr.severity, dr.description,
               dr.estimated_cost, dr.reported_by, dr.resolved, dr.resolved_at,
               mc.accession_number, mc.barcode, cm.title, b.name AS branch_name
        FROM damage_reports dr
        LEFT JOIN material_copies mc ON mc.copy_id = dr.copy_id
        LEFT JOIN catalog_materials cm ON cm.material_id = mc.material_id
        LEFT JOIN library_branches b ON b.branch_id = mc.branch_id
        WHERE dr.resolved = FALSE
        ORDER BY CASE dr.severity WHEN 'severe' THEN 1 WHEN 'major' THEN 2 WHEN 'moderate' THEN 3 ELSE 4 END,
                 dr.damage_report_id DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT b.branch_id, b.name AS branch_name,
               COUNT(mc.copy_id)::int AS total_copies,
               COUNT(mc.copy_id) FILTER (WHERE mc.status = 'available')::int AS available_copies,
               COUNT(mc.copy_id) FILTER (WHERE mc.status = 'on_loan')::int AS on_loan_copies,
               COUNT(mc.copy_id) FILTER (WHERE mc.status = 'lost')::int AS lost_copies,
               COUNT(mc.copy_id) FILTER (WHERE mc.status = 'damaged')::int AS damaged_copies
        FROM library_branches b
        LEFT JOIN material_copies mc ON mc.branch_id = b.branch_id
        GROUP BY b.branch_id, b.name
        ORDER BY b.name ASC
      `),
    ]);

    const summary = summaryRes.rows[0] || {};
    const missingItems = missingRes.rows || [];
    const damagedItems = damagedRes.rows || [];

    const responseSummary = {
      totalAudits: toNumber(summary.total_audits),
      openAudits: toNumber(summary.open_audits),
      itemsNotFound: toNumber(summary.items_not_found),
      discrepancyItems: toNumber(summary.discrepancy_items),
      unresolvedMissingItems: toNumber(summary.unresolved_missing_items),
      unresolvedDamagedItems: toNumber(summary.unresolved_damaged_items),
      totalCopies: toNumber(summary.total_copies),
    };

    return {
      summary: responseSummary,
      overview: {
        total_copies: toNumber(summary.total_copies),
        available_copies: branchRes.rows.reduce((sum, row) => sum + toNumber(row.available_copies), 0),
        lost_copies: branchRes.rows.reduce((sum, row) => sum + toNumber(row.lost_copies), 0),
        damaged_copies: branchRes.rows.reduce((sum, row) => sum + toNumber(row.damaged_copies), 0),
      },
      auditStatus: auditStatusRes.rows,
      statusBreakdown: copyStatusRes.rows,
      copyStatus: copyStatusRes.rows,
      recentAudits: recentAuditsRes.rows.map((row) => ({ ...row, missing_items: toNumber(row.not_found_items) })),
      inventoryAudits: recentAuditsRes.rows.map((row) => ({ ...row, missing_items: toNumber(row.not_found_items) })),
      missingItems,
      damagedItems,
      openIssues: [
        ...missingItems.map((row) => ({
          issue_type: 'missing',
          issue_id: row.lost_report_id,
          title: row.title,
          accession_number: row.accession_number,
          created_at: row.created_at || null,
          note: row.description || '',
        })),
        ...damagedItems.map((row) => ({
          issue_type: 'damaged',
          issue_id: row.damage_report_id,
          title: row.title,
          accession_number: row.accession_number,
          created_at: row.created_at || null,
          note: row.description || '',
        })),
      ],
      branchDistribution: branchRes.rows.map((row) => ({
        branch_name: row.branch_name,
        copies: toNumber(row.total_copies),
        available: toNumber(row.available_copies),
        exceptions: toNumber(row.lost_copies) + toNumber(row.damaged_copies),
      })),
      branches: branchRes.rows,
    };
  },
};
