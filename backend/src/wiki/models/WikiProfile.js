// models/WikiProfile.js
import pool from "../../config/db.js";

// 🔹 Get profile by user ID
export const getProfileByUserId = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM wiki_profiles WHERE user_id = $1
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Update wiki profile
export const updateWikiProfile = async (userId, data) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        display_name = COALESCE($1, display_name),
        bio = COALESCE($2, bio),
        avatar_url = COALESCE($3, avatar_url),
        website = COALESCE($4, website),
        location = COALESCE($5, location),
        updated_at = NOW()
      WHERE user_id = $6
      RETURNING *
    `, [data.displayName, data.bio, data.avatarUrl, data.website, data.location, userId]);
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

// 🔹 Get top contributors
export const getTopContributors = async (limit = 10) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        wp.*,
        u.username,
        u.full_name
      FROM wiki_profiles wp
      JOIN users u ON wp.user_id = u.uuid
      WHERE u.is_active = true
      ORDER BY wp.reputation_points DESC
      LIMIT $1
    `, [limit]);
    return res.rows;
  } finally {
    client.release();
  }
};

// 🔹 Block user
export const blockUser = async (userId, blockedBy, reason, duration = null) => {
  const client = await pool.connect();
  try {
    const expiresAt = duration ? new Date(Date.now() + duration) : null;
    
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        is_blocked = true,
        blocked_reason = $1,
        blocked_by = $2,
        blocked_at = NOW(),
        blocked_until = $3,
        updated_at = NOW()
      WHERE user_id = $4
      RETURNING *
    `, [reason, blockedBy, expiresAt, userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Unblock user
export const unblockUser = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        is_blocked = false,
        blocked_reason = null,
        blocked_by = null,
        blocked_until = null,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Verify profile
export const verifyProfile = async (userId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        is_verified = true,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

// 🔹 Reset daily edit counts (run via cron job)
export const resetDailyEditCounts = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE wiki_profiles 
      SET 
        edit_count_today = 0,
        last_edit_reset = CURRENT_DATE
      WHERE last_edit_reset < CURRENT_DATE
      RETURNING user_id
    `);
    return res.rows;
  } finally {
    client.release();
  }
};