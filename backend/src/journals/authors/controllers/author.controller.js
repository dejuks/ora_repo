import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../../config/db.js";
import dotenv from "dotenv";
dotenv.config();

// REGISTER
export const registerAuthor = async (req, res) => {
  const { firstName, lastName, institution, country, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO authors 
      (first_name, last_name, institution, country, email, password)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, first_name, last_name, email`,
      [firstName, lastName, institution, country, email, hashedPassword]
    );

    res.status(201).json({ message: "Author registered successfully", author: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const loginAuthor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM authors WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Author not found" });

    const author = result.rows[0];
    const valid = await bcrypt.compare(password, author.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: author.id, email: author.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, institution, country, email FROM authors WHERE id=$1",
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const { firstName, lastName, institution, country } = req.body;

  try {
    await pool.query(
      `UPDATE authors 
       SET first_name=$1, last_name=$2, institution=$3, country=$4, updated_at=NOW()
       WHERE id=$5`,
      [firstName, lastName, institution, country, req.user.id]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ACCOUNT
export const deleteAuthor = async (req, res) => {
  try {
    await pool.query("DELETE FROM authors WHERE id=$1", [req.user.id]);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
