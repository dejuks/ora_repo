import pool from "../../config/db.js"; // your PG pool config

export class ManuscriptCategory {
  static async create({ name, description }) {
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *`;
    return pool.query(query, [name, description]);
  }

  static async findAll() {
    const query = `SELECT * FROM categories ORDER BY created_at DESC`;
    return pool.query(query);
  }

  static async findById(id) {
    const query = `SELECT * FROM categories WHERE id=$1`;
    return pool.query(query, [id]);
  }

  static async update(id, { name, description }) {
    const query = `
      UPDATE categories
      SET name=$1, description=$2, updated_at=now()
      WHERE id=$3
      RETURNING *`;
    return pool.query(query, [name, description, id]);
  }

  static async delete(id) {
    const query = `DELETE FROM categories WHERE id=$1 RETURNING *`;
    return pool.query(query, [id]);
  }
}
