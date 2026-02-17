import pool from "../config/db.js";
import bcrypt from "bcrypt";

const JOURNAL_MODULE_ID = "991aefe2-d96c-4712-a5c4-3be6b56dfe68";
const AUTHOR_ROLE_ID = "1d67d32d-dcee-4302-8369-26ca00385a09";

const JournalUser = {

  createJournalAuthor: async (data) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const hash = await bcrypt.hash(data.password, 10);

      // 1️⃣ Insert into users
      const userRes = await client.query(
        `INSERT INTO users
        (full_name,email,phone,password,gender,dob,module_id,photo)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING uuid, full_name, email, phone, module_id`,
        [
          data.full_name,
          data.email,
          data.phone,
          hash,
          data.gender || null,
          data.dob || null,
          JOURNAL_MODULE_ID,
          data.photo || null,
        ]
      );

      const newUser = userRes.rows[0];

      // 2️⃣ Insert into user_roles
      await client.query(
        `INSERT INTO user_roles (user_id, role_id)
         VALUES ($1, $2)`,
        [newUser.uuid, AUTHOR_ROLE_ID]
      );

      await client.query("COMMIT");

      return newUser;

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

export default JournalUser;
