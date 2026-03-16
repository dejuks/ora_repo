import express from "express";
import {
  createProjectUpdate,
  getProjectUpdates,
  updateProjectUpdate,
  deleteProjectUpdate,
  getAllProjectUpdates
} from "../controllers/update.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all project updates for user's groups
router.get('/all', getAllProjectUpdates);

// Get updates for a specific group
router.get('/groups/:groupId', getProjectUpdates);

// Create a new update in a group
router.post('/groups/:groupId', createProjectUpdate);

// Update and delete specific updates
router.put('/:updateId', updateProjectUpdate);
router.delete('/:updateId', deleteProjectUpdate);

export default router;