import db from "../../config/db.js"; // your PostgreSQL connection

export const getPublications = async ({ search, limit = 10 }) => {
  let query = `SELECT * FROM publications`;
  let values = [];

  if (search) {
    query += ` WHERE slug ILIKE $1`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
  values.push(limit);

  const result = await db.query(query, values);

  return {
    rows: result.rows,
  };
};

export const insertLog = async (publicationId, data) => {
  const query = `
    INSERT INTO publication_logs 
    (publication_id, event_type, ip_address, user_agent, actor_id)
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [
    publicationId,
    data.event_type,
    data.ip_address,
    data.user_agent,
    data.actor_id,
  ];

  return await db.query(query, values);
};