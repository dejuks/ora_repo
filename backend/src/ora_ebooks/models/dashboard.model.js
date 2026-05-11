import pool from "../../config/db.js";
// const pool = db.getPool();
export async function getCurrentUser(userId) {
  const query = `
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.profile_image,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'role_id', r.role_id,
            'role_name', r.role_name
          )
        ) FILTER (WHERE r.role_id IS NOT NULL),
        '[]'
      ) AS roles

    FROM users u

    LEFT JOIN user_roles ur
      ON ur.user_id = u.user_id

    LEFT JOIN roles r
      ON r.role_id = ur.role_id

    WHERE u.user_id = $1

    GROUP BY u.user_id
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
}