import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const createPublicResearcher = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 🔐 HASH PASSWORD */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    /* 1️⃣ CREATE USER */
    const userResult = await client.query(
      `
      INSERT INTO users (
        email,
        full_name,
        is_verified,
        password,
        phone
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING uuid,email
      `,
      [
        data.email,
        data.full_name,
        false,
        hashedPassword, // 👈 encrypted password
        data.phone
      ]
    );

    const user_id = userResult.rows[0].uuid;

    /* 2️⃣ CREATE PROFILE */
    await client.query(
      `
      INSERT INTO researcher_profiles (
        user_id,
        full_name,
        affiliation,
        country,
        bio,
        research_interests,
        orcid,
        website
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        user_id,
        data.full_name,
        data.affiliation,
        data.country,
        data.bio,
        data.research_interests
          ? data.research_interests.split(",")
          : [],
        data.orcid,
        data.website
      ]
    );

    await client.query("COMMIT");

    return userResult.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 Get all researchers
export const getResearchers = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.uuid, u.email, r.full_name, r.affiliation, r.country, r.research_interests
      FROM users u
      JOIN researcher_profiles r ON u.uuid = r.user_id
    `);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Get my groups
export const getMyGroups = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT g.id, g.name, g.description
      FROM research_groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
    `, [userId]);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Get my connections
export const getMyConnections = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.uuid, u.email, r.full_name
      FROM connections c
      JOIN users u ON c.connected_user_id = u.uuid
      JOIN researcher_profiles r ON u.uuid = r.user_id
      WHERE c.user_id = $1
    `, [userId]);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Get my publications
export const getMyPublications = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT p.id, p.title, p.journal, p.published_at
      FROM publications p
      WHERE p.user_id = $1
    `, [userId]);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Get my events
export const getMyEvents = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT e.id, e.title, e.date, e.location
      FROM events e
      JOIN event_attendees ea ON e.id = ea.event_id
      WHERE ea.user_id = $1
    `, [userId]);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Create a research group
export const createResearchGroup = async (groupData) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      INSERT INTO research_groups (name, description, owner_id)
      VALUES ($1,$2,$3)
      RETURNING *
    `, [groupData.name, groupData.description, groupData.ownerId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Invite to group
export const inviteToGroup = async (inviteData) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      INSERT INTO group_invites (group_id, inviter_id, invitee_email)
      VALUES ($1,$2,$3)
      RETURNING *
    `, [inviteData.group_id, inviteData.inviterId, inviteData.invitee_email]);
    return res.rows[0];
  } finally {
    client.release();
  }
};
