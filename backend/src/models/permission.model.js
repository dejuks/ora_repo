import pool from "../config/db.js";

export const Permission = {
  findAll: async () => {
    const res = await pool.query(`
      SELECT uuid, name, module_group
      FROM permissions
      ORDER BY module_group, name
    `);
    return res.rows;
  },

  create: async (name, module_group) => {
    const res = await pool.query(
      `
      INSERT INTO permissions (name, module_group)
      VALUES ($1, $2)
      RETURNING uuid, name, module_group
      `,
      [name, module_group || "System Wide"]
    );

    return res.rows[0];
  },

  update: async (uuid, name, module_group) => {
    const res = await pool.query(
      `
      UPDATE permissions
      SET
        name = $1,
        module_group = $2
      WHERE uuid = $3
      RETURNING uuid, name, module_group
      `,
      [name, module_group || "System Wide", uuid]
    );

    return res.rows[0] || null;
  },

  delete: async (uuid) => {
    await pool.query(
      `
      DELETE FROM permissions
      WHERE uuid = $1
      `,
      [uuid]
    );
    return true;
  },
};