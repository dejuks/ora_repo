import pool from '../../config/db.js';

export const getLibraryAuditOverview = async ({ search = '', action = '', entityType = '', days = 30, limit = 100 } = {}) => {
  const values = [];
  const where = [];

  if (search) {
    values.push(`%${search}%`);
    where.push(`(
      action ILIKE $${values.length}
      OR entity_type ILIKE $${values.length}
      OR COALESCE(user_agent, '') ILIKE $${values.length}
      OR COALESCE(entity_id::text, '') ILIKE $${values.length}
    )`);
  }
  if (action) {
    values.push(action);
    where.push(`action = $${values.length}`);
  }
  if (entityType) {
    values.push(entityType);
    where.push(`entity_type = $${values.length}`);
  }
  if (days) {
    values.push(Number(days));
    where.push(`created_at >= NOW() - ($${values.length}::int * INTERVAL '1 day')`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  values.push(Number(limit) || 100);

  const sql = `
    SELECT l.*, u.full_name AS actor_name, u.email AS actor_email
    FROM library_audit_logs l
    LEFT JOIN users u ON u.uuid = l.actor_user_id
    ${whereSql}
    ORDER BY l.created_at DESC
    LIMIT $${values.length}
  `;
  const { rows } = await pool.query(sql, values);
  return rows;
};

export const getSecurityAlerts = async () => {
  const [deletes, failed, recent] = await Promise.all([
    pool.query(`
      SELECT actor_user_id, COUNT(*)::int AS count
      FROM library_audit_logs
      WHERE action ILIKE '%delete%' AND created_at >= NOW() - INTERVAL '1 day'
      GROUP BY actor_user_id
      HAVING COUNT(*) >= 3
      ORDER BY count DESC
    `),
    pool.query(`
      SELECT actor_user_id, COUNT(*)::int AS count
      FROM library_audit_logs
      WHERE action IN ('auth.login.failed', 'auth.unauthorized', 'permission.denied')
        AND created_at >= NOW() - INTERVAL '1 day'
      GROUP BY actor_user_id
      HAVING COUNT(*) >= 3
      ORDER BY count DESC
    `),
    pool.query(`
      SELECT action, entity_type, created_at, actor_user_id, entity_id
      FROM library_audit_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `),
  ]);

  const alerts = [];
  deletes.rows.forEach((row) => {
    alerts.push({
      level: 'warning',
      type: 'delete_spike',
      actor_user_id: row.actor_user_id,
      count: row.count,
      message: `User ${row.actor_user_id || 'unknown'} performed ${row.count} delete actions in the last 24 hours.`,
    });
  });
  failed.rows.forEach((row) => {
    alerts.push({
      level: 'critical',
      type: 'auth_failures',
      actor_user_id: row.actor_user_id,
      count: row.count,
      message: `User ${row.actor_user_id || 'unknown'} triggered ${row.count} failed/unauthorized actions in the last 24 hours.`,
    });
  });

  return {
    alerts,
    recent_activity: recent.rows,
    totals: {
      critical: alerts.filter((a) => a.level === 'critical').length,
      warning: alerts.filter((a) => a.level === 'warning').length,
      total: alerts.length,
    },
  };
};
