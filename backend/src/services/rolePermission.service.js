import pool from "../config/db.js";

export const assignPermissionToRole = async (roleId, permissionId) => {
  await pool.query(
    "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [roleId, permissionId]
  );
};

export const removePermissionFromRole = async (roleId, permissionId) => {
  await pool.query(
    "DELETE FROM role_permissions WHERE role_id=$1 AND permission_id=$2",
    [roleId, permissionId]
  );
};

export const getRolePermissions = async (roleId) => {
  const res = await pool.query(`
    SELECT p.uuid, p.name
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id=p.uuid
    WHERE rp.role_id=$1
  `, [roleId]);

  return res.rows;
};
