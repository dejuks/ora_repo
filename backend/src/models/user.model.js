import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const User = {

  findAll: async () => {
    const res = await pool.query(
      `SELECT uuid, full_name, email, phone, gender, dob, module_id
       FROM users
       ORDER BY full_name`
    );
    return res.rows;
  },

  findById: async (uuid) => {
    const res = await pool.query(
      `SELECT uuid, full_name, email, phone, gender, dob, module_id
       FROM users
       WHERE uuid = $1`,
      [uuid]
    );
    return res.rows[0];
  },

  create: async (data) => {
    const { full_name, email, phone, password, gender, dob, module_id } = data;

    if (!password) {
      throw new Error("Password is required");
    }

    const hash = await bcrypt.hash(password, 10);

    const res = await pool.query(
      `INSERT INTO users
        (full_name, email, phone, password, gender, dob, module_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING uuid, full_name, email, phone, gender, dob, module_id`,
      [full_name, email, phone, hash, gender, dob, module_id]
    );

    return res.rows[0];
  },

  update: async (uuid, data) => {
    const { full_name, email, phone, gender, dob, module_id } = data;

    const res = await pool.query(
      `UPDATE users SET
        full_name = $1,
        email = $2,
        phone = $3,
        gender = $4,
        dob = $5,
        module_id = $6
       WHERE uuid = $7
       RETURNING uuid, full_name, email, phone, gender, dob, module_id`,
      [full_name, email, phone, gender, dob, module_id, uuid]
    );

    return res.rows[0];
  },

  delete: async (uuid) => {
    await pool.query("DELETE FROM users WHERE uuid = $1", [uuid]);
    return true;
  },
};
