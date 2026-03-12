// src/ebooks/routes/auth.routes.js  (or your current file)
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../../config/db.js";

const r = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

// ✅ default role for Ebook Author (change env anytime)
const DEFAULT_EBOOK_AUTHOR_ROLE_ID =
  process.env.EBOOK_AUTHOR_ROLE_ID || "60ac2e7a-39a5-4ff6-80e2-6d95423ec1d8";

/**
 * POST /api/ebook/register
 * body: { full_name, email, password, phone?, gender?, dob?, module_id }
 */
r.post("/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      full_name,
      email,
      password,
      phone = null,
      gender = null,
      dob = null,
      module_id,
    } = req.body;

    if (!full_name || !email || !password || !module_id) {
      return res.status(422).json({
        success: false,
        message: "full_name, email, password, module_id are required",
      });
    }

    if (password.length < 6) {
      return res.status(422).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    await client.query("BEGIN");

    // check existing email
    const exists = await client.query(
      `SELECT uuid FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`,
      [email]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const insert = await client.query(
      `
      INSERT INTO users
      (full_name,email,phone,password,gender,dob,module_id)
      VALUES ($1,LOWER($2),$3,$4,$5,$6,$7)
      RETURNING uuid,full_name,email,module_id
      `,
      [full_name, email, phone, password_hash, gender, dob, module_id]
    );

    const user = insert.rows[0];

    // ✅ Assign default role in user_roles table
    // CREATE TABLE user_roles (user_id UUID, role_id UUID, PRIMARY KEY(user_id, role_id))
    await client.query(
      `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
      `,
      [user.uuid, DEFAULT_EBOOK_AUTHOR_ROLE_ID]
    );

    await client.query("COMMIT");

    // ✅ Ensure JWT contains `uuid` because your authenticate middleware reads decoded.uuid
    const token = jwt.sign(
      { uuid: user.uuid, id: user.uuid, email: user.email, module_id: user.module_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: { token, user },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({
      success: false,
      message: e.message,
    });
  } finally {
    client.release();
  }
});

/**
 * POST /api/ebook/login
 * body: { email, password }
 */
r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "email and password required",
      });
    }

    const result = await pool.query(
      `
      SELECT uuid,full_name,email,password,module_id
      FROM users
      WHERE LOWER(email)=LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Ensure JWT contains `uuid` because your authenticate middleware reads decoded.uuid
    const token = jwt.sign(
      { uuid: user.uuid, id: user.uuid, email: user.email, module_id: user.module_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.uuid,
          full_name: user.full_name,
          email: user.email,
          module_id: user.module_id,
        },
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

export default r;