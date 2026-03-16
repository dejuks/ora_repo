import pool from "../../config/db.js";

export const getPendingResearchers = async () => {
  const res = await pool.query("SELECT id, full_name, email FROM users WHERE role_id=1 AND is_verified=false");
  return res.rows;
};

export const approveResearcher = async (userId) => {
  const res = await pool.query("UPDATE users SET is_verified=true WHERE id=$1 AND role_id=1", [userId]);
  return res.rowCount;
};
