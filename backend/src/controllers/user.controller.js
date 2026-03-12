import { User } from "../models/user.model.js";
import pool from "../config/db.js";

export const getUsers = async (_, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.uuid);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const photo = req.file ? `/uploads/users/${req.file.filename}` : null;

    const payload = {
      ...req.body,
      photo,
    };

    const user = await User.create(payload);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("createUser error:", error);

    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error: "Email already registered",
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error: "Email already registered",
      });
    }

    if (error.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: "Invalid UUID or invalid input format",
        error: error.message,
      });
    }

    if (error.code === "23502") {
      return res.status(400).json({
        success: false,
        message: "Required field is missing",
        error: error.detail || error.message,
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Invalid related record reference",
        error: error.detail || error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const photo = req.file ? `/uploads/users/${req.file.filename}` : null;

    const user = await User.update(req.params.uuid, {
      ...req.body,
      photo,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.uuid);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

export const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT r.uuid, r.name
      FROM roles r
      INNER JOIN user_roles ur ON r.uuid = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.name
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user roles",
      error: error.message,
    });
  }
};

export const getAllRolesForUsers = async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles ORDER BY name");
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};