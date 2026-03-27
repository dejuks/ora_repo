import  pool  from "../../../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const register = async (req, res) => {

  // ✅ Static values
  const module_id = "87efa5b1-59dd-4c1e-8168-c82a519cb167";
  const role_id = "3265477a-07c7-4a54-aad9-f7844aa908a4";

  const {
    fullName,
    email,
    password,
    country,
    phone,
    academicAffiliation,
    department,
    researchInterest
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 1. INSERT USER
    await client.query(
      `INSERT INTO users (uuid, full_name, email, module_id, password)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, fullName, email, module_id, hashedPassword]
    );

    // ✅ 2. INSERT REPOSITORY AUTHOR
    await client.query(
      `INSERT INTO repository_author 
       (user_id, country, phone, academic_affiliation, department, research_interest)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, country, phone, academicAffiliation, department, researchInterest]
    );

    // ✅ 3. INSERT USER ROLE
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)`,
      [userId, role_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "User registered successfully",
      user_id: userId
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });

  } finally {
    client.release();
  }
};

export const getAuthors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email,
             ra.country, ra.phone, ra.academic_affiliation,
             ra.department, ra.research_interest
      FROM users u
      JOIN repository_authors ra ON u.id = ra.user_id
      ORDER BY ra.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email,
              ra.country, ra.phone, ra.academic_affiliation,
              ra.department, ra.research_interest
       FROM users u
       JOIN repository_authors ra ON u.id = ra.user_id
       WHERE u.id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
};
export const updateAuthor = async (req, res) => {
  const { id } = req.params;

  const {
    fullName,
    country,
    phone,
    academicAffiliation,
    department,
    researchInterest
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE users SET full_name = $1 WHERE id = $2`,
      [fullName, id]
    );

    await client.query(
      `UPDATE repository_authors 
       SET country=$1, phone=$2, academic_affiliation=$3,
           department=$4, research_interest=$5
       WHERE user_id=$6`,
      [country, phone, academicAffiliation, department, researchInterest, id]
    );

    await client.query("COMMIT");

    res.json({ message: "Updated successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json(err);
  } finally {
    client.release();
  }
};
export const deleteAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};