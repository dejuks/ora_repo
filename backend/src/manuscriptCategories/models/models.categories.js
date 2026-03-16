import pool from "../../config/db.js";

const ManuscriptCategoryies = {

  async findAll() {
    const result = await pool.query(
      `SELECT * FROM categories ORDER BY id ASC`
    );
    return result.rows;
  }
}
export default ManuscriptCategoryies;