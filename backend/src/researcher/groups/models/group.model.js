import pool from "../../../config/db.js";

/* CREATE GROUP */
export const createGroup = async (data) => {
  const { name, description, created_by, privacy = 'public' } = data;
  const { rows } = await pool.query(
    `INSERT INTO groups (uuid, name, description, created_by, privacy, created_at, updated_at) 
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) 
     RETURNING *`,
    [name, description, created_by, privacy]
  );
  return rows[0];
};

/* GET ALL GROUPS WITH MEMBER COUNT - FIXED */
export const getAllGroups = async () => {
  const { rows } = await pool.query(
    `SELECT 
        g.uuid,
        g.name,
        g.description,
        g.created_by,
        g.privacy,
        g.created_at,
        g.updated_at,
        u.full_name AS creator_name,
        u.email AS creator_email,
        COALESCE(mem.member_count, 0) AS member_count
      FROM groups g
      LEFT JOIN users u ON g.created_by = u.uuid
      LEFT JOIN (
        SELECT group_id, COUNT(*) as member_count
        FROM group_members
        GROUP BY group_id
      ) mem ON mem.group_id = g.uuid
      ORDER BY g.created_at DESC`
  );
  return rows;
};

/* GET SINGLE GROUP WITH MEMBER COUNT */
export const getGroupById = async (uuid) => {
  const { rows } = await pool.query(
    `SELECT 
        g.*,
        u.full_name AS creator_name,
        u.email AS creator_email,
        COALESCE(mem.member_count, 0) AS member_count
      FROM groups g
      LEFT JOIN users u ON g.created_by = u.uuid
      LEFT JOIN (
        SELECT group_id, COUNT(*) as member_count
        FROM group_members
        GROUP BY group_id
      ) mem ON mem.group_id = g.uuid
      WHERE g.uuid = $1`,
    [uuid]
  );
  return rows[0];
};

/* UPDATE GROUP */
export const updateGroup = async (uuid, data) => {
  const { name, description, privacy } = data;
  const { rows } = await pool.query(
    `UPDATE groups 
     SET name = COALESCE($1, name), 
         description = COALESCE($2, description), 
         privacy = COALESCE($3, privacy),
         updated_at = NOW() 
     WHERE uuid = $4 
     RETURNING *`,
    [name, description, privacy, uuid]
  );
  return rows[0];
};

/* DELETE GROUP */
export const deleteGroup = async (uuid) => {
  await pool.query(`DELETE FROM groups WHERE uuid = $1`, [uuid]);
};

/* =====================================================
   GROUP MEMBERS FUNCTIONS
===================================================== */

/* ADD MEMBER TO GROUP */
export const addGroupMember = async (groupId, userId, role = 'member') => {
  const { rows } = await pool.query(
    `INSERT INTO group_members (uuid, group_id, user_id, role, joined_at) 
     VALUES (gen_random_uuid(), $1, $2, $3, NOW()) 
     RETURNING *`,
    [groupId, userId, role]
  );
  return rows[0];
};

/* GET GROUP MEMBERS WITH FULL DETAILS - FIXED */
export const getGroupMembers = async (groupId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      gm.uuid,
      gm.user_id,
      gm.role,
      gm.joined_at,
      u.uuid as user_uuid,
      u.full_name,
      u.email,
      COALESCE(r.affiliation, '') as affiliation,
      COALESCE(r.photo, '') as photo,
      COALESCE(r.research_interests, ARRAY[]::TEXT[]) as research_interests,
      COALESCE(r.country, '') as country,
      COALESCE(r.bio, '') as bio,
      COALESCE(r.orcid, '') as orcid,
      COALESCE(r.website, '') as website
    FROM group_members gm
    INNER JOIN users u ON u.uuid = gm.user_id
    LEFT JOIN researcher_profiles r ON r.user_id = gm.user_id
    WHERE gm.group_id = $1
    ORDER BY 
      CASE 
        WHEN gm.role = 'owner' THEN 1
        WHEN gm.role = 'admin' THEN 2
        WHEN gm.role = 'moderator' THEN 3
        ELSE 4
      END,
      u.full_name ASC
    `,
    [groupId]
  );
  
  console.log(`Model: Found ${rows.length} members for group ${groupId}`);
  return rows;
};

/* GET GROUP MEMBER BY ID */
export const getGroupMemberById = async (groupId, userId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      gm.*,
      u.full_name,
      u.email,
      r.affiliation,
      r.photo
    FROM group_members gm
    JOIN users u ON u.uuid = gm.user_id
    LEFT JOIN researcher_profiles r ON r.user_id = gm.user_id
    WHERE gm.group_id = $1 AND gm.user_id = $2
    `,
    [groupId, userId]
  );
  return rows[0];
};

/* UPDATE MEMBER ROLE */
export const updateMemberRole = async (groupId, userId, role) => {
  const { rows } = await pool.query(
    `
    UPDATE group_members 
    SET role = $1, updated_at = NOW()
    WHERE group_id = $2 AND user_id = $3
    RETURNING *
    `,
    [role, groupId, userId]
  );
  return rows[0];
};

/* REMOVE MEMBER FROM GROUP */
export const removeMember = async (groupId, userId) => {
  await pool.query(
    `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
};

/* CHECK IF USER IS GROUP OWNER */
export const isGroupOwner = async (groupId, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM groups WHERE uuid = $1 AND created_by = $2`,
    [groupId, userId]
  );
  return rows.length > 0;
};

/* GET MEMBER ROLE - NEW */
export const getMemberRole = async (groupId, userId) => {
  const { rows } = await pool.query(
    `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return rows.length > 0 ? rows[0].role : null;
}; 
/* CHECK IF USER IS GROUP ADMIN OR MODERATOR */
export const isGroupAdminOrModerator = async (groupId, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND (role = 'admin' OR role = 'moderator')`,
    [groupId, userId]
  );
  return rows.length > 0;
};
/* CHECK IF USER IS GROUP MEMBER */
export const isGroupMember = async (groupId, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return rows.length > 0;
};

/* =====================================================
   GET GROUP MEMBERS - PUBLIC ACCESS (NO PERMISSION CHECKS)
   This function bypasses all permission checks -任何人都可以访问
===================================================== */
export const getGroupMembersPublic = async (groupId) => {
  console.log(`[PUBLIC MODEL] Fetching members for group: ${groupId}`);
  
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        gm.uuid,
        gm.user_id,
        gm.role,
        gm.joined_at,
        u.uuid as user_uuid,
        u.full_name,
        u.email,
        COALESCE(r.affiliation, '') as affiliation,
        COALESCE(r.photo, '') as photo,
        COALESCE(r.research_interests, ARRAY[]::TEXT[]) as research_interests,
        COALESCE(r.country, '') as country,
        COALESCE(r.bio, '') as bio,
        COALESCE(r.orcid, '') as orcid,
        COALESCE(r.website, '') as website
      FROM group_members gm
      INNER JOIN users u ON u.uuid = gm.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = gm.user_id
      WHERE gm.group_id = $1
      ORDER BY 
        CASE 
          WHEN gm.role = 'owner' THEN 1
          WHEN gm.role = 'admin' THEN 2
          WHEN gm.role = 'moderator' THEN 3
          ELSE 4
        END,
        u.full_name ASC
      `,
      [groupId]
    );
    
    console.log(`[PUBLIC MODEL] Found ${rows.length} members for group ${groupId}`);
    return rows;
  } catch (error) {
    console.error("[PUBLIC MODEL] Error:", error);
    throw error;
  }
};

/* =====================================================
   GET ALL GROUP MEMBERS - NO PERMISSION CHECK
   Use this for admin/global view without any role verification
===================================================== */
export const getAllGroupMembersDirect = async (groupId) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        gm.uuid,
        gm.user_id,
        gm.role,
        gm.joined_at,
        u.uuid as user_uuid,
        u.full_name,
        u.email,
        COALESCE(r.affiliation, '') as affiliation,
        COALESCE(r.photo, '') as photo,
        COALESCE(r.research_interests, ARRAY[]::TEXT[]) as research_interests,
        COALESCE(r.country, '') as country,
        COALESCE(r.bio, '') as bio,
        COALESCE(r.orcid, '') as orcid,
        COALESCE(r.website, '') as website
      FROM group_members gm
      INNER JOIN users u ON u.uuid = gm.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = gm.user_id
      WHERE gm.group_id = $1
      ORDER BY 
        CASE 
          WHEN gm.role = 'owner' THEN 1
          WHEN gm.role = 'admin' THEN 2
          WHEN gm.role = 'moderator' THEN 3
          ELSE 4
        END,
        u.full_name ASC
      `,
      [groupId]
    );
    
    console.log(`Direct query: Found ${rows.length} members for group ${groupId}`);
    return rows;
  } catch (error) {
    console.error("Error in getAllGroupMembersDirect:", error);
    throw error;
  }
};
/* GET MEMBERS COUNT - FIXED */
export const getMembersCount = async (groupId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) as count FROM group_members WHERE group_id = $1`,
    [groupId]
  );
  return parseInt(rows[0].count);
};

/* =====================================================
   GET MY GROUPS (PRIVATE) - WITH STATUS HANDLING
===================================================== */
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        g.uuid as id,
        g.uuid,
        g.name,
        g.description,
        g.created_at,
        g.created_by,
        g.privacy,
        g.status,
        CASE WHEN g.created_by = $1 THEN true ELSE false END as is_owner,
        (
          SELECT COUNT(*) 
          FROM group_members gm2 
          WHERE gm2.group_id = g.uuid
        ) as member_count
      FROM groups g
      JOIN group_members gm ON gm.group_id = g.uuid
      WHERE gm.user_id = $1
      ORDER BY 
        CASE 
          WHEN g.status = 'banned' THEN 2
          ELSE 1
        END,
        g.created_at DESC
      `,
      [userId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error in getMyGroups:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =====================================================
   GROUP INVITATIONS FUNCTIONS
===================================================== */

/* CREATE INVITATIONS */
export const createInvitations = async (groupId, researcherIds, message) => {
  const results = [];
  for (const researcherId of researcherIds) {
    const { rows } = await pool.query(
      `INSERT INTO group_invitations (uuid, group_id, inviter_id, invitee_user_id, message, status, created_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW()) 
       RETURNING *`,
      [groupId, researcherId, message]
    );
    results.push(rows[0]);
  }
  return results;
};

/* GET GROUP INVITES */
export const getGroupInvites = async (groupId) => {
  const { rows } = await pool.query(
    `SELECT gi.*, u.full_name as researcher_name, u.email as researcher_email
     FROM group_invitations gi
     LEFT JOIN users u ON gi.invitee_user_id = u.uuid
     WHERE gi.group_id = $1 AND gi.status = 'pending'`,
    [groupId]
  );
  return rows;
};


/* =====================================================
   ADMIN - UPDATE GROUP STATUS
===================================================== */
export const updateGroupStatus = async (groupId, status, comment) => {
  const { rows } = await pool.query(
    `
    UPDATE groups
    SET status = $1,
        status_comment = $2,
        updated_at = NOW()
    WHERE uuid = $3
    RETURNING *
    `,
    [status, comment || null, groupId]
  );

  return rows[0];
};

/* GET ALL GROUPS (ADMIN VIEW) */
export const getAllGroupsAdmin = async () => {
  const { rows } = await pool.query(
    `
    SELECT 
      g.*,
      u.full_name AS creator_name,
      COALESCE(mem.member_count, 0) AS member_count
    FROM groups g
    LEFT JOIN users u ON g.created_by = u.uuid
    LEFT JOIN (
        SELECT group_id, COUNT(*) as member_count
        FROM group_members
        GROUP BY group_id
    ) mem ON mem.group_id = g.uuid
    ORDER BY g.created_at DESC
    `
  );

  return rows;
};

/* =====================================================
   ADMIN - GET GROUP MEMBERS
===================================================== */
export const getGroupMembersAdmin = async (groupId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      gm.*,
      u.full_name,
      u.email
    FROM group_members gm
    JOIN users u ON u.uuid = gm.user_id
    WHERE gm.group_id = $1
    ORDER BY gm.joined_at DESC
    `,
    [groupId]
  );

  return rows;
};

/* =====================================================
   ADMIN - GET GROUP POSTS
===================================================== */
export const getGroupPostsAdmin = async (groupId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      gp.*,
      u.full_name AS author_name
    FROM group_posts gp
    JOIN users u ON u.uuid = gp.user_id
    WHERE gp.group_id = $1
    ORDER BY gp.created_at DESC
    `,
    [groupId]
  );

  console.log("POSTS FOUND:", rows); // add this

  return rows;
};


