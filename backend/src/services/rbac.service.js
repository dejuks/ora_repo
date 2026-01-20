import pool from "../config/db.js";

export const getUserPermissions = async (userId) => {
  const result = await pool.query(`
    SELECT p.name
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.uuid
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = $1
  `, [userId]);

  return result.rows.map(r => r.name);
};
