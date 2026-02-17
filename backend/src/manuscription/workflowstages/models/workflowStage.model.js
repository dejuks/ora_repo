import pool from "../../../config/db.js"

const WorkflowStage = {

  async create(name, stage_order) {
    const result = await pool.query(
      `INSERT INTO workflow_stages (name, stage_order)
       VALUES ($1, $2)
       RETURNING *`,
      [name, stage_order]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT * FROM workflow_stages ORDER BY stage_order ASC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM workflow_stages WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async update(id, name, stage_order) {
    const result = await pool.query(
      `UPDATE workflow_stages
       SET name = $1, stage_order = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [name, stage_order, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query(
      `DELETE FROM workflow_stages WHERE id = $1`,
      [id]
    );
    return true;
  }
};

export default WorkflowStage;
