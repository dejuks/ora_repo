import pool from "../../../config/db.js";

/* GET ALL */
export const getStatuses = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM manuscript_statuses ORDER BY sort_order"
  );
  res.json(result.rows);
};

/* GET ONE */
export const getStatus = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "SELECT * FROM manuscript_statuses WHERE id=$1",
    [id]
  );
  res.json(result.rows[0]);
};

/* CREATE */
export const createStatus = async (req, res) => {
  const { code, label, description, sort_order, is_active } = req.body;

  const result = await pool.query(
    `INSERT INTO manuscript_statuses
     (code, label, description, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [code, label, description, sort_order ?? 0, is_active ?? true]
  );

  res.status(201).json(result.rows[0]);
};

/* UPDATE */
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { code, label, description, sort_order, is_active } = req.body;

  const result = await pool.query(
    `UPDATE manuscript_statuses SET
      code=$1,
      label=$2,
      description=$3,
      sort_order=$4,
      is_active=$5
     WHERE id=$6
     RETURNING *`,
    [code, label, description, sort_order, is_active, id]
  );

  res.json(result.rows[0]);
};

/* DELETE */
export const deleteStatus = async (req, res) => {
  const { id } = req.params;
  await pool.query(
    "DELETE FROM manuscript_statuses WHERE id=$1",
    [id]    
  );
  res.json({ message: "Deleted successfully" });
};
