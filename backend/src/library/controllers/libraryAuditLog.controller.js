import pool from "../../config/db.js";
import { createCrudController } from "./createCrudController.js";
import { LibraryAuditLogModel } from "../models/libraryAuditLog.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(LibraryAuditLogModel, "library-audit-log");

export const libraryAuditLogController = {
  ...crud,
  securityAlerts: asyncHandler(async (req, res) => {
    const alertsQuery = await pool.query(`
      WITH recent AS (
        SELECT *
        FROM library_audit_logs
        WHERE created_at >= NOW() - INTERVAL '30 days'
      ),
      delete_spikes AS (
        SELECT
          'warning'::text AS level,
          'delete_spike'::text AS type,
          actor_user_id,
          COUNT(*)::int AS count,
          'High number of delete actions detected in the last 30 days.'::text AS message
        FROM recent
        WHERE action ILIKE '%delete%'
        GROUP BY actor_user_id
        HAVING COUNT(*) >= 5
      ),
      denied_access AS (
        SELECT
          CASE WHEN COUNT(*) >= 10 THEN 'critical' ELSE 'warning' END AS level,
          'authorization_failure'::text AS type,
          actor_user_id,
          COUNT(*)::int AS count,
          'Repeated denied, forbidden, or unauthorized activity detected.'::text AS message
        FROM recent
        WHERE action ILIKE '%denied%' OR action ILIKE '%forbidden%' OR action ILIKE '%unauthor%'
        GROUP BY actor_user_id
        HAVING COUNT(*) >= 3
      )
      SELECT * FROM delete_spikes
      UNION ALL
      SELECT * FROM denied_access
      ORDER BY CASE WHEN level = 'critical' THEN 0 ELSE 1 END, count DESC
    `);

    const recentActivityQuery = await pool.query(`
      SELECT action, entity_type, entity_id, actor_user_id, created_at
      FROM library_audit_logs
      ORDER BY created_at DESC
      LIMIT 25
    `);

    const alerts = alertsQuery.rows;
    const totals = {
      total: alerts.length,
      critical: alerts.filter((row) => row.level === 'critical').length,
      warning: alerts.filter((row) => row.level === 'warning').length,
    };

    return res.json({
      alerts,
      recent_activity: recentActivityQuery.rows,
      totals,
    });
  }),
};
