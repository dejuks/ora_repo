import pool from "../../../config/db.js";

/* =========================
   CREATE GROUP
========================= */
export const createGroup = async (data) => {
  const { name, description, created_by } = data;

  const query = `
    INSERT INTO groups (name, description, created_by)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [name, description, created_by];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

/* =========================
   GET ALL GROUPS
========================= */
export const getAllGroups = async () => {
  const { rows } = await pool.query(
    `SELECT g.*, u.full_name AS creator_name
     FROM groups g
     LEFT JOIN users u ON g.created_by = u.uuid
     ORDER BY g.created_at DESC`
  );
  return rows;
};

/* =========================
   GET GROUP BY UUID
========================= */
export const getGroupById = async (uuid) => {
  const { rows } = await pool.query(
    "SELECT * FROM groups WHERE uuid = $1",
    [uuid]
  );
  return rows[0];
};

/* =========================
   UPDATE GROUP
========================= */
export const updateGroup = async (uuid, data) => {
  const { name, description } = data;

  const query = `
    UPDATE groups
    SET name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE uuid = $3
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    name,
    description,
    uuid,
  ]);

  return rows[0];
};

/* =========================
   DELETE GROUP
========================= */
export const deleteGroup = async (uuid) => {
  await pool.query("DELETE FROM groups WHERE uuid = $1", [uuid]);
};
