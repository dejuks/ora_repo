import pool from "../config/db.js";

export const Module = {
  findAll: async () => {
    const res = await pool.query(`SELECT * FROM modules ORDER BY name ASC`);
    return res.rows;
  },

  findById: async (uuid) => {
    const res = await pool.query(`SELECT * FROM modules WHERE uuid = $1`, [uuid]);
    return res.rows[0];
  },

  create: async ({ name, description }) => {
    const res = await pool.query(
      `INSERT INTO modules (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    return res.rows[0];
  },

  update: async (uuid, { name, description }) => {
    const res = await pool.query(
      `UPDATE modules SET name = $1, description = $2, updated_at = now() WHERE uuid = $3 RETURNING *`,
      [name, description, uuid]
    );
    return res.rows[0];
  },

  delete: async (uuid) => {
    await pool.query(`DELETE FROM modules WHERE uuid = $1`, [uuid]);
    return true;
  },
};
