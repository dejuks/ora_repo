import pool from "../../config/db.js";

export const WikiArticle = {

  create: async ({ title, slug, language, status, created_by }) => {
    const query = `
      INSERT INTO wiki_articles
      (title, slug, language, status, created_by)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`;
    return pool.query(query, [title, slug, language, status, created_by]);
  },

  findAll: async () => {
    return pool.query(`SELECT * FROM wiki_articles ORDER BY created_at DESC`);
  },

  findById: async (id) => {
    return pool.query(`SELECT * FROM wiki_articles WHERE id=$1`, [id]);
  },

  update: async (id, data) => {
    const query = `
      UPDATE wiki_articles
      SET title=$1,
          slug=$2,
          language=$3,
          status=$4,
          updated_at=NOW()
      WHERE id=$5
      RETURNING *`;
    return pool.query(query, [
      data.title,
      data.slug,
      data.language,
      data.status,
      id,
    ]);
  },

  delete: async (id) => {
    return pool.query(
      `DELETE FROM wiki_articles WHERE id=$1 RETURNING *`,
      [id]
    );
  },
};
