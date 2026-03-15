import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const buildAuthPayload = (user) => {
  const token = jwt.sign(
    {
      uuid: user.uuid,
      module_id: user.module_id,
      roles: user.roles.map((r) => r.role_id),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      uuid: user.uuid,
      full_name: user.full_name,
      email: user.email,
      module_id: user.module_id,
      module_name: user.module_name,
      roles: user.roles,
    },
  };
};

export const login = async (email, password) => {
  const result = await pool.query(
    `
    SELECT 
      u.uuid,
      u.full_name,
      u.email,
      u.password,
      u.module_id,
      m.name AS module_name,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'role_id', r.uuid,
            'name', r.name,
            'role_name', r.name
          )
        ) FILTER (WHERE r.uuid IS NOT NULL),
        '[]'
      ) AS roles

    FROM users u
    LEFT JOIN modules m ON m.uuid = u.module_id
    LEFT JOIN user_roles ur ON ur.user_id = u.uuid
    LEFT JOIN roles r ON r.uuid = ur.role_id
    WHERE u.email = $1
    GROUP BY u.uuid, m.name
    `,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  return buildAuthPayload(user);
};

export const registerEbookAuthor = async ({
  full_name,
  email,
  password,
  phone = null,
  gender = null,
  dob = null,
}) => {
  if (!full_name || !email || !password) {
    const error = new Error("Full name, email, and password are required");
    error.status = 400;
    throw error;
  }

  const existing = await pool.query(`SELECT uuid FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
  if (existing.rows.length) {
    const error = new Error("An account with this email already exists");
    error.status = 409;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const moduleRes = await client.query(
      `SELECT uuid, name FROM modules WHERE uuid = $1 OR LOWER(name) LIKE '%ebook%' ORDER BY CASE WHEN uuid = $1 THEN 0 ELSE 1 END LIMIT 1`,
      ["aeca9002-e3e1-498d-a9da-34066db00744"]
    );
    const moduleRow = moduleRes.rows[0];
    if (!moduleRow) {
      const error = new Error("EBook module is not configured");
      error.status = 500;
      throw error;
    }

    const roleRes = await client.query(
      `SELECT uuid, name FROM roles WHERE UPPER(name) = 'EBOOK_AUTHOR' ORDER BY created_at ASC LIMIT 1`
    );
    const roleRow = roleRes.rows[0];
    if (!roleRow) {
      const error = new Error("EBOOK_AUTHOR role is not configured");
      error.status = 500;
      throw error;
    }

    const hash = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, phone, password, gender, dob, module_id, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING uuid, full_name, email, module_id`,
      [full_name, email, phone, hash, gender, dob, moduleRow.uuid, null]
    );
    const createdUser = userRes.rows[0];

    await client.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
      [createdUser.uuid, roleRow.uuid]
    );

    await client.query("COMMIT");

    const finalUser = {
      ...createdUser,
      module_name: moduleRow.name,
      roles: [{ role_id: roleRow.uuid, name: roleRow.name, role_name: roleRow.name }],
    };

    return {
      message: "EBook author account created successfully",
      ...buildAuthPayload(finalUser),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
