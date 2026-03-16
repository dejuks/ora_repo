import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const User = {
  findAll: async () => {
    const res = await pool.query(`
      SELECT uuid, full_name, email, phone, gender, dob, module_id, photo
      FROM users ORDER BY full_name
    `);
    return res.rows;
  },

  findById: async (uuid) => {
    const res = await pool.query(
      `SELECT uuid, full_name, email, phone, gender, dob, module_id, photo
       FROM users WHERE uuid=$1`,
      [uuid]
    );
    return res.rows[0];
  },

  create: async (data) => {
  try {

    // 1️⃣ Check if email already exists
    const existingUser = await pool.query(
      `SELECT uuid FROM users WHERE email = $1`,
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("EMAIL_EXISTS");
    }

    // 2️⃣ Hash password
    const hash = await bcrypt.hash(data.password, 10);

    // 3️⃣ Insert user
    const res = await pool.query(
      `INSERT INTO users
      (full_name, email, phone, password, gender, dob, module_id, photo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING uuid, full_name, email, phone, gender, dob, module_id, photo`,
      [
        data.full_name,
        data.email,
        data.phone,
        hash,
        data.gender,
        data.dob,
        data.module_id,
        data.photo,
      ]
    );

    return res.rows[0];

  } catch (error) {
    throw error;
  }
},

  update: async (uuid, data) => {
    const res = await pool.query(
      `UPDATE users SET
        full_name=$1,
        email=$2,
        phone=$3,
        gender=$4,
        dob=$5,
        module_id=$6,
        photo=COALESCE($7, photo)
       WHERE uuid=$8
       RETURNING uuid, full_name, email, phone, gender, dob, module_id, photo`,
      [
        data.full_name,
        data.email,
        data.phone,
        data.gender,
        data.dob,
        data.module_id,
        data.photo,
        uuid,
      ]
    );
    return res.rows[0];
  },

  delete: async (uuid) => {
    await pool.query("DELETE FROM users WHERE uuid=$1", [uuid]);
  },
};
