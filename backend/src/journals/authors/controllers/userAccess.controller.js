import { assignAuthorRole } from "../models/userAccess.model.js";

export const assignAuthorRoleController = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID required" });
    }

    await assignAuthorRole(user_id);

    res.status(201).json({
      message: "Author role assigned successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to assign author role"
    });
  }
};
