import { assignRolesToUser, getUserRoles } from "../services/userRole.service.js";

// Assign roles to a user
export const assignRoles = async (req, res) => {
  const { roles } = req.body; // array of role UUIDs
  const { uuid } = req.params;

  try {
    const result = await assignRolesToUser(uuid, roles);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const assignPublic = async (req, res) => {
  const { roles } = req.body; // array of role UUIDs
  const { uuid } = req.params;

  try {
    const result = await assignRolesToUser(uuid, roles);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get roles for a specific user
export const fetchUserRoles = async (req, res) => {
  const { uuid } = req.params;

  try {
    const roles = await getUserRoles(uuid);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
