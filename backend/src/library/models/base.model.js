import pool from "../../config/db.js";

const isValidUuid = (value) => typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);

export class BaseModel {
  constructor({ table, primaryKey, allowedColumns = [], searchableColumns = [] }) {
    this.table = table;
    this.primaryKey = primaryKey;
    this.allowedColumns = allowedColumns;
    this.searchableColumns = searchableColumns;
  }

  sanitizePayload(payload = {}) {
    const clean = {};
    for (const key of this.allowedColumns) {
      if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
        clean[key] = payload[key];
      }
    }
    return clean;
  }

  buildSearchClause(search, values) {
    if (!search || !this.searchableColumns.length) return "";
    values.push(`%${search}%`);
    const idx = values.length;
    const clauses = this.searchableColumns.map((col) => `${col}::text ILIKE $${idx}`).join(' OR ');
    return ` WHERE (${clauses})`;
  }

  async findAll({ limit = 20, offset = 0, page, orderBy, search } = {}) {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.min(Math.max(Number(limit), 1), 500) : 20;
    const safeOffset = Number.isFinite(Number(offset)) ? Math.max(Number(offset), 0) : (page ? (Math.max(Number(page),1)-1)*safeLimit : 0);
    const orderColumn = this.allowedColumns.includes(orderBy) || orderBy === this.primaryKey ? orderBy : this.primaryKey;
    const values = [];
    const whereClause = this.buildSearchClause(search, values);
    const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table}${whereClause}`;
    const dataSql = `SELECT * FROM ${this.table}${whereClause} ORDER BY ${orderColumn} DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const countRes = await pool.query(countSql, values);
    const dataRes = await pool.query(dataSql, [...values, safeLimit, safeOffset]);
    return {
      rows: dataRes.rows,
      meta: {
        total: countRes.rows[0]?.total || 0,
        limit: safeLimit,
        offset: safeOffset,
        page: Math.floor(safeOffset / safeLimit) + 1,
      },
    };
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM ${this.table} WHERE ${this.primaryKey} = $1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async create(payload = {}, client = pool) {
    const data = this.sanitizePayload(payload);
    const keys = Object.keys(data);
    if (!keys.length) throw new Error(`No valid fields provided for ${this.table}`);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await client.query(sql, keys.map((k) => data[k]));
    return rows[0];
  }

  async update(id, payload = {}, client = pool) {
    const data = this.sanitizePayload(payload);
    const keys = Object.keys(data);
    if (!keys.length) return this.findById(id);
    const assignments = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map((k) => data[k]);
    values.push(id);
    const sql = `UPDATE ${this.table} SET ${assignments} WHERE ${this.primaryKey} = $${values.length} RETURNING *`;
    const { rows } = await client.query(sql, values);
    return rows[0] || null;
  }

  async delete(id, client = pool) {
    const { rowCount } = await client.query(`DELETE FROM ${this.table} WHERE ${this.primaryKey} = $1`, [id]);
    return rowCount > 0;
  }

  async exists(id) {
    if (!id) return false;
    const { rows } = await pool.query(`SELECT EXISTS(SELECT 1 FROM ${this.table} WHERE ${this.primaryKey} = $1) AS found`, [id]);
    return rows[0]?.found === true;
  }
}

export { pool, isValidUuid };
