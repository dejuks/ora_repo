import db from "../../../config/db.js"; // adjust path if needed

export const assignAuthorRole = async (userId) => {

  const authorRoleId = "1d67d32d-dcee-4302-8369-26ca00385a09";

  await db.query(
    `INSERT INTO user_roles (user_id, role_id)
     VALUES ($1, $2)`,
    [userId, authorRoleId]
  );
};
