import pool from "../../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const JournalSection = {
  async findByJournalId(journalId) {
    const { rows } = await pool.query(
      "SELECT * FROM journal_sections WHERE journal_id = $1",
      [journalId]
    );
    return rows;
  },

  async create({ journal_id, name, description }) {
    const { rows } = await pool.query(
      `INSERT INTO journal_sections (id, journal_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [uuidv4(), journal_id, name, description]
    );
    return rows[0];
  },

  async update(id, data) {
    const { name, description } = data;
    const { rows } = await pool.query(
      `UPDATE journal_sections
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM journal_sections WHERE id = $1", [id]);
    return true;
  },
};

export default JournalSection;
