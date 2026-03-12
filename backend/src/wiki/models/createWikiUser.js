// models/WikiUser.js
import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

// Constants for module and role IDs
const WIKI_MODULE_ID = '643dd068-b8d7-4cc1-bb14-ec42f11180fc';
const AUTHOR_ROLE_ID = '0b913c33-a8aa-4bad-9319-eb3d80d87018';

export const createWikiAuthor = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 🔐 HASH PASSWORD */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    /* 1️⃣ CREATE USER WITH MODULE ID */
    const userResult = await client.query(
      `
      INSERT INTO users (
        username,
        email,
        password,
        full_name,
        preferred_language,
        module_id,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING uuid, username, email, full_name, created_at
      `,
      [
        data.username,           // $1
        data.email,              // $2
        hashedPassword,          // $3
        data.full_name || null,  // $4
        data.language || 'om',   // $5
        WIKI_MODULE_ID,          // $6
        true                     // $7 (is_active)
        // Removed extra parameters: data.bio, 'registered_editor'
      ]
    );

    const user_id = userResult.rows[0].uuid;

    /* 2️⃣ CREATE WIKI PROFILE */
    await client.query(
      `
      INSERT INTO wiki_profiles (
        user_id,
        display_name,
        bio,
        avatar_url,
        website,
        location,
        reputation_points,
        total_articles,
        total_edits,
        total_uploads,
        edit_count_today,
        last_edit_reset,
        is_verified,
        is_blocked,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      `,
      [
        user_id,                 // $1
        data.username,           // $2 (display_name)
        data.bio || null,        // $3
        data.avatar_url || null, // $4
        data.website || null,    // $5
        data.location || null,   // $6
        0,                       // $7 (reputation_points)
        0,                       // $8 (total_articles)
        0,                       // $9 (total_edits)
        0,                       // $10 (total_uploads)
        0,                       // $11 (edit_count_today)
        new Date(),              // $12 (last_edit_reset)
        false,                   // $13 (is_verified)
        false                    // $14 (is_blocked)
      ]
    );

    /* 3️⃣ CREATE USER ROLE (AUTHOR) */
    await client.query(
      `
      INSERT INTO user_roles (
        user_id,
        role_id,
        assigned_at
      )
      VALUES ($1, $2, NOW())
      `,
      [
        user_id,                 // $1
        AUTHOR_ROLE_ID
      ]
    );

    await client.query("COMMIT");

    // Fetch complete user data with profile
    const completeUser = await getWikiAuthorById(user_id);

    return completeUser;

  } catch (err) {
    await client.query("ROLLBACK");
    
    // Handle unique constraint violations
    if (err.code === '23505') {
      if (err.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      } else if (err.constraint === 'users_email_key') {
        throw new Error('Email already registered');
      }
    }
    console.error('Database error:', err);
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 Get wiki author by ID with profile
export const getWikiAuthorById = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        u.uuid,
        u.username,
        u.email,
        u.full_name,
        u.preferred_language,
        u.module_id,
        u.is_active,
        u.created_at,
        u.updated_at,
        wp.display_name,
        wp.avatar_url,
        wp.website,
        wp.location,
        wp.reputation_points,
        wp.total_articles,
        wp.total_edits,
        wp.total_uploads,
        wp.edit_count_today,
        wp.is_verified as profile_verified,
        wp.is_blocked,
        json_agg(
          json_build_object(
            'role_id', ur.role_id,
            'assigned_at', ur.assigned_at
          )
        ) as roles
      FROM users u
      LEFT JOIN wiki_profiles wp ON u.uuid = wp.user_id
      LEFT JOIN user_roles ur ON u.uuid = ur.user_id
      WHERE u.uuid = $1
      GROUP BY u.uuid, wp.display_name, wp.avatar_url, wp.website, wp.location,
               wp.reputation_points, wp.total_articles, wp.total_edits, 
               wp.total_uploads, wp.edit_count_today, wp.is_verified, wp.is_blocked
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Get user by email
export const getUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Get user by username
export const getUserByUsername = async (username) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM users WHERE username = $1
    `, [username]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// 🔹 Get all wiki authors
export const getAllWikiAuthors = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        u.uuid,
        u.username,
        u.email,
        u.full_name,
        u.bio,
        u.preferred_language,
        u.is_active,
        u.created_at,
        wp.display_name,
        wp.avatar_url,
        wp.reputation_points,
        wp.total_articles,
        wp.total_edits,
        wp.total_uploads,
        wp.is_verified,
        wp.is_blocked
      FROM users u
      JOIN user_roles ur ON u.uuid = ur.user_id
      LEFT JOIN wiki_profiles wp ON u.uuid = wp.user_id
      WHERE ur.role_id = $1 AND ur.module_id = $2
      ORDER BY wp.reputation_points DESC
    `, [AUTHOR_ROLE_ID, WIKI_MODULE_ID]);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Update wiki author
export const updateWikiAuthor = async (userId, data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update users table
    const userResult = await client.query(`
      UPDATE users 
      SET 
        full_name = COALESCE($1, full_name),
        bio = COALESCE($2, bio),
        preferred_language = COALESCE($3, preferred_language),
        updated_at = NOW()
      WHERE uuid = $4
      RETURNING uuid, username, email, full_name, bio, preferred_language
    `, [data.full_name, data.bio, data.language, userId]);

    // Update wiki profile
    await client.query(`
      UPDATE wiki_profiles 
      SET 
        display_name = COALESCE($1, display_name),
        bio = COALESCE($2, bio),
        avatar_url = COALESCE($3, avatar_url),
        website = COALESCE($4, website),
        location = COALESCE($5, location),
        updated_at = NOW()
      WHERE user_id = $6
    `, [data.display_name, data.bio, data.avatar_url, data.website, data.location, userId]);

    await client.query("COMMIT");
    return userResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 Delete wiki author (soft delete)
export const deleteWikiAuthor = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE users 
      SET is_active = false, 
          updated_at = NOW() 
      WHERE uuid = $1
      RETURNING uuid
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Get author statistics
export const getAuthorStatistics = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        wp.*,
        (SELECT COUNT(*) FROM wiki_articles WHERE created_by = $1) as articles_created,
        (SELECT COUNT(*) FROM wiki_revisions WHERE edited_by = $1) as total_revisions,
        (SELECT COUNT(*) FROM wiki_media WHERE uploaded_by = $1) as media_uploads
      FROM wiki_profiles wp
      WHERE wp.user_id = $1
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Increment article count
export const incrementArticleCount = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        total_articles = total_articles + 1,
        reputation_points = reputation_points + 10,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Increment edit count
export const incrementEditCount = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        total_edits = total_edits + 1,
        edit_count_today = edit_count_today + 1,
        reputation_points = reputation_points + 2,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Increment upload count
export const incrementUploadCount = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        total_uploads = total_uploads + 1,
        reputation_points = reputation_points + 5,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};
// models/WikiUser.js - Check that updateLastLogin is exported

// 🔹 Update last login
export const updateLastLogin = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users 
      SET last_login_at = NOW() 
      WHERE uuid = $1
    `, [userId]);
  } finally {
    client.release();
  }
};