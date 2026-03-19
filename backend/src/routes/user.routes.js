import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { uploadUserPhoto } from "../middleware/upload.middleware.js";
import { authenticate } from '../middleware/auth.middleware.js';
import pool from '../config/db.js'; // Make sure to import your database pool

const router = express.Router();

// User CRUD routes
router.get("/", authenticate, getUsers);
router.get("/:uuid", authenticate, getUserById);
router.post("/", uploadUserPhoto.single("photo"), createUser);
router.put("/:uuid", authenticate, uploadUserPhoto.single("photo"), updateUser);
router.delete("/:uuid", authenticate, deleteUser);

// Get user roles by user ID
router.get('/:userId/roles', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT r.uuid, r.name
      FROM roles r
      INNER JOIN user_roles ur ON r.uuid = ur.role_id
      WHERE ur.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user roles"
    });
  }
});

// Get all roles
router.get('/roles/all', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY name');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles"
    });
  }
});

export default router;