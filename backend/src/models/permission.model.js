import pool from "../config/db.js";

export const Permission = {
  findAll: async () => {
    const res = await pool.query(
      "SELECT uuid, name FROM permissions ORDER BY name"
    );
    return res.rows;
  },

  create: async (name) => {
    const res = await pool.query(
      "INSERT INTO permissions (name) VALUES ($1) RETURNING *",
      [name]
    );
    return res.rows[0];
  },

  delete: async (uuid) => {
    await pool.query("DELETE FROM permissions WHERE uuid=$1", [uuid]);
    return true;
  }
};
