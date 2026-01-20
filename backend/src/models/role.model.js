import pool from "../config/db.js";

export const Role = {
  // Get all roles
  findAll: async () => {
    const res = await pool.query(
      `SELECT uuid, name, module_id, created_at
       FROM roles
       ORDER BY name`
    );
    return res.rows;
  },

  // Get role by UUID
  findById: async (uuid) => {
    const res = await pool.query(
      `SELECT uuid, name, module_id, created_at
       FROM roles
       WHERE uuid=$1`,
      [uuid]
    );
    return res.rows[0];
  },

  // Create role
  create: async (name, module_id) => {
    const moduleToStore = module_id || null;
    const res = await pool.query(
      `INSERT INTO roles (name, module_id)
       VALUES ($1, $2)
       RETURNING uuid, name, module_id, created_at`,
      [name, moduleToStore]
    );
    return res.rows[0];
  },

  // Update role
  update: async (uuid, name, module_id) => {
    const moduleToStore = module_id || null;
    const res = await pool.query(
      `UPDATE roles
       SET name=$1, module_id=$2
       WHERE uuid=$3
       RETURNING uuid, name, module_id, created_at`,
      [name, moduleToStore, uuid]
    );
    return res.rows[0];
  },

  // Delete role
  delete: async (uuid) => {
    await pool.query("DELETE FROM roles WHERE uuid=$1", [uuid]);
    return true;
  },
};
