import pool from "../../config/db.js";

const Journal = {
  create: async ({ title, issn, description }) => {
    const query = `
      INSERT INTO journals (id, title, issn, description)
      VALUES (gen_random_uuid(), $1, $2, $3)
      RETURNING *;
    `;
    const values = [title, issn, description];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT * FROM journals ORDER BY created_at DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM journals WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  update: async (id, { title, issn, description }) => {
    const query = `
      UPDATE journals
      SET title = $1, issn = $2, description = $3, created_at = now()
      WHERE id = $4
      RETURNING *;
    `;
    const values = [title, issn, description, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  delete: async (id) => {
    await pool.query(`DELETE FROM journals WHERE id = $1`, [id]);
    return true;
  }
};

export default Journal;
