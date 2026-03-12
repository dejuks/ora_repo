import pool from "../config/db.js";

// Assign roles to user (replace existing roles)
export const assignRolesToUser = async (userId, roleIds = []) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Remove existing roles
    await client.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);

    // Insert new roles
    for (const roleId of roleIds) {
      await client.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [userId, roleId]
      );
    }

    await client.query("COMMIT");
    return { message: "Roles updated successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Get roles of a specific user
export const getUserRoles = async (userId) => {
  const res = await pool.query(
    `SELECT r.uuid, r.name
     FROM user_roles ur
     JOIN roles r ON r.uuid = ur.role_id
     WHERE ur.user_id = $1`,
    [userId]
  );
  return res.rows;
};
