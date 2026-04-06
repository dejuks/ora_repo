import  pool  from "../../config/db.js";

export const createAuthorWithUser = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert user
    const userResult = await client.query(
      `INSERT INTO users (uuid, full_name, email, password, module_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING uuid`,
      [
        data.full_name,
        data.email,
        data.password,
        "aeca9002-e3e1-498d-a9da-34066db00744",
      ]
    );

    const userId = userResult.rows[0].uuid;

    // 2. Insert role
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)`,
      [userId, "a95222ac-33a6-4800-bbf6-15b0859bbfc7"]
    );

    // 3. Insert author profile
    await client.query(
      `INSERT INTO ora_ebook_authors (
        id, user_id, full_name, phone, affiliation, bio, profile_image
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6
      )`,
      [
        userId,
        data.full_name,
        data.phone,
        data.affiliation,
        data.bio,
        data.profile_image,
      ]
    );

    await client.query("COMMIT");

    return { success: true, userId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};