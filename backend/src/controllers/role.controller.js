import { Role } from "../models/role.model.js";

// Get all roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
};

// Get role by UUID
export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.uuid);
    res.json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch role" });
  }
};

// Create role
export const createRole = async (req, res) => {
  try {
    const { name, module_id } = req.body;
    const role = await Role.create(name, module_id);
    res.status(201).json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create role" });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { name, module_id } = req.body;
    const role = await Role.update(req.params.uuid, name, module_id);
    res.json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    await Role.delete(req.params.uuid);
    res.json({ message: "Role deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete role" });
  }
};
