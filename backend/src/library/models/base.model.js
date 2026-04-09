import pool from '../../config/db.js';

export class BaseModel {
  constructor({ table, primaryKey }) {
    this.table = table;
    this.primaryKey = primaryKey;
  }

  async findById(id, client = pool) {
    const { rows } = await client.query(
      `SELECT * FROM ${this.table} WHERE ${this.primaryKey} = $1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async delete(id, client = pool) {
    const result = await client.query(
      `DELETE FROM ${this.table} WHERE ${this.primaryKey} = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
}

export default pool;
