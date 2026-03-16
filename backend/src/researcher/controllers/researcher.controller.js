import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

/* =====================================================
   REGISTER RESEARCHER (PUBLIC)
===================================================== */
export const registerResearcher = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      full_name,
      email,
      password,
      phone,
      affiliation,
      country,
      bio,
      research_interests,
      orcid,
      website
    } = req.body;

    if (!password || typeof password !== "string") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Password is required" });
    }

    const photo = req.file
      ? `/uploads/users/${req.file.filename}`
      : null;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* Create user */
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
      RETURNING uuid
      `,
      [email, full_name, false, hashedPassword, phone]
    );

    const userId = userResult.rows[0].uuid;

    /* Create profile */
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
        website,
        photo
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        userId,
        full_name,
        affiliation || null,
        country || null,
        bio || null,
        research_interests ? research_interests.split(",").map(i => i.trim()) : [],
        orcid || null,
        website || null,
        photo
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Researcher registered successfully"
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET PROFILE (PRIVATE) - FIXED
===================================================== */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.uuid;

    // Get user data
    const userResult = await pool.query(
      `
      SELECT 
        uuid,
        email,
        full_name,
        phone
      FROM users 
      WHERE uuid = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const user = userResult.rows[0];

    // Get profile data
    const profileResult = await pool.query(
      `
      SELECT 
        affiliation,
        country,
        bio,
        research_interests,
        orcid,
        website,
        photo
      FROM researcher_profiles 
      WHERE user_id = $1
      `,
      [userId]
    );

    let profile = {};
    if (profileResult.rows.length > 0) {
      profile = profileResult.rows[0];
    }

    // Combine data
    const combinedProfile = {
      uuid: user.uuid,
      id: user.uuid,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || "",
      affiliation: profile.affiliation || "",
      country: profile.country || "",
      bio: profile.bio || "",
      research_interests: Array.isArray(profile.research_interests) ? profile.research_interests : [],
      orcid: profile.orcid || "",
      website: profile.website || "",
      photo: profile.photo || null
    };

    res.json(combinedProfile);

  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to load profile",
      error: err.message 
    });
  }
};

/* =====================================================
   UPDATE PROFILE (PRIVATE) - FIXED
===================================================== */
export const updateProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const userId = req.user.uuid;

    const {
      full_name,
      phone,
      affiliation,
      country,
      bio,
      research_interests,
      orcid,
      website
    } = req.body;

    const photo = req.file
      ? `/uploads/users/${req.file.filename}`
      : null;

    // Update users table
    if (full_name || phone) {
      await client.query(
        `
        UPDATE users
        SET
          full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          updated_at = NOW()
        WHERE uuid = $3
        `,
        [full_name || null, phone || null, userId]
      );
    }

    // Check if profile exists
    const profileCheck = await client.query(
      `SELECT user_id FROM researcher_profiles WHERE user_id = $1`,
      [userId]
    );

    let researchInterestsArray = null;
    if (research_interests) {
      researchInterestsArray = typeof research_interests === 'string' 
        ? research_interests.split(",").map(i => i.trim()) 
        : research_interests;
    }

    if (profileCheck.rows.length === 0) {
      // Insert new profile
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
          website,
          photo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          userId,
          full_name || null,
          affiliation || null,
          country || null,
          bio || null,
          researchInterestsArray || [],
          orcid || null,
          website || null,
          photo || null
        ]
      );
    } else {
      // Update existing profile
      await client.query(
        `
        UPDATE researcher_profiles
        SET
          full_name = COALESCE($1, full_name),
          affiliation = COALESCE($2, affiliation),
          country = COALESCE($3, country),
          bio = COALESCE($4, bio),
          research_interests = COALESCE($5, research_interests),
          orcid = COALESCE($6, orcid),
          website = COALESCE($7, website),
          photo = COALESCE($8, photo),
          updated_at = NOW()
        WHERE user_id = $9
        `,
        [
          full_name || null,
          affiliation || null,
          country || null,
          bio || null,
          researchInterestsArray || null,
          orcid || null,
          website || null,
          photo || null,
          userId
        ]
      );
    }

    await client.query("COMMIT");
    
    res.json({ 
      success: true,
      message: "Profile updated successfully" 
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in updateProfile:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile",
      error: err.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET ALL RESEARCHERS (PUBLIC) - FIXED
===================================================== */
export const getResearchers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.uuid as id,
        u.uuid,
        u.full_name,
        u.email,
        r.affiliation,
        r.country,
        r.photo,
        r.research_interests
      FROM users u
      LEFT JOIN researcher_profiles r ON r.user_id = u.uuid
      ORDER BY u.full_name ASC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Error in getResearchers:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ResearcherModel.getAssignmentDetails(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      data: assignment,
    });

  } catch (error) {
    console.error("getAssignmentDetails error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//getAssignedReviews
export const getAssignedReviews = async (req, res) => {
  try {
    const researcherId = req.user.uuid;

    const reviews = await ResearcherModel.getAssignedReviews(researcherId);

    res.json({
      success: true,
      data: reviews,
    });

  } catch (error) {
    console.error("getAssignedReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* =====================================================
   GET MY GROUPS (PRIVATE) - FIXED
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
        CASE WHEN g.created_by = $1 THEN true ELSE false END as is_owner,
        (
          SELECT COUNT(*) 
          FROM group_members gm2 
          WHERE gm2.group_id = g.uuid
        ) as member_count
      FROM groups g
      JOIN group_members gm ON gm.group_id = g.uuid
      WHERE gm.user_id = $1
      ORDER BY g.created_at DESC
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
   CREATE RESEARCH GROUP (PRIVATE) - FIXED
===================================================== */
export const createResearchGroup = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userId = req.user.uuid;
    const { name, description, privacy } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: "Group name is required" 
      });
    }

    const groupResult = await client.query(
      `
      INSERT INTO groups (name, description, created_by, privacy, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING uuid as id, uuid, name, description, created_by, privacy, created_at
      `,
      [name, description || null, userId, privacy || 'public']
    );

    const group = groupResult.rows[0];

    // Auto add owner as member
    await client.query(
      `
      INSERT INTO group_members (group_id, user_id, role, joined_at)
      VALUES ($1, $2, 'owner', NOW())
      `,
      [group.uuid, userId]
    );

    await client.query("COMMIT");

    // Add member_count to response
    group.member_count = 1;
    group.is_owner = true;

    res.status(201).json(group);

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in createResearchGroup:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   INVITE TO GROUP (PRIVATE) - COMPLETE FIX
===================================================== */
export const inviteToGroup = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const inviterId = req.user.uuid;
    const { group_id, researcher_ids, message } = req.body;

    console.log("BACKEND - Received invite request:", { 
      group_id, 
      researcher_ids, 
      message,
      inviterId 
    });

    // Validate required fields
    if (!group_id) {
      return res.status(400).json({ 
        success: false,
        message: "group_id is required" 
      });
    }

    if (!researcher_ids || !Array.isArray(researcher_ids)) {
      return res.status(400).json({ 
        success: false,
        message: "researcher_ids must be an array" 
      });
    }

    if (researcher_ids.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one researcher_id is required" 
      });
    }

    // Check if group exists
    const groupCheck = await client.query(
      `SELECT * FROM groups WHERE uuid = $1`,
      [group_id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Group not found" 
      });
    }

    const group = groupCheck.rows[0];
    console.log("Group found:", group);

    // Check if user is group owner
    if (group.created_by !== inviterId) {
      return res.status(403).json({ 
        success: false,
        message: "Only group owner can invite members" 
      });
    }

    const invitations = [];

    for (const researcherId of researcher_ids) {
      console.log(`Processing invitation for researcher: ${researcherId}`);

      // Check if user exists
      const userCheck = await client.query(
        `SELECT uuid, full_name, email FROM users WHERE uuid = $1`,
        [researcherId]
      );

      if (userCheck.rows.length === 0) {
        console.log(`User ${researcherId} not found, skipping`);
        continue;
      }

      // Check if already a member
      const memberCheck = await client.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [group_id, researcherId]
      );

      if (memberCheck.rows.length > 0) {
        console.log(`User ${researcherId} is already a member, skipping`);
        continue;
      }

      // Check if already invited
      const inviteCheck = await client.query(
        `SELECT * FROM group_invitations 
         WHERE group_id = $1 AND invitee_user_id = $2 AND status = 'pending'`,
        [group_id, researcherId]
      );

      if (inviteCheck.rows.length > 0) {
        console.log(`User ${researcherId} already has pending invitation, skipping`);
        continue;
      }

      try {
        // Create invitation
        const result = await client.query(
          `
          INSERT INTO group_invitations (
            uuid,
            group_id,
            inviter_id,
            invitee_user_id,
            message,
            status,
            created_at
          )
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW())
          RETURNING uuid as id, group_id, inviter_id, invitee_user_id, message, status, created_at
          `,
          [group_id, inviterId, researcherId, message || null]
        );

        console.log(`Created invitation:`, result.rows[0]);

        // Get researcher details
        const researcher = await client.query(
          `
          SELECT 
            u.uuid as id,
            u.full_name,
            u.email,
            r.affiliation,
            r.photo
          FROM users u
          LEFT JOIN researcher_profiles r ON r.user_id = u.uuid
          WHERE u.uuid = $1
          `,
          [researcherId]
        );

        invitations.push({
          ...result.rows[0],
          researcher: researcher.rows[0] || null
        });
      } catch (err) {
        console.error(`Error creating invitation for ${researcherId}:`, err);
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: `Successfully sent ${invitations.length} invitation(s)`,
      invitations
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in inviteToGroup:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET GROUP INVITES (PRIVATE)
===================================================== */
export const getGroupInvites = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uuid;

    // Check if user is group owner
    const groupCheck = await pool.query(
      `SELECT created_by FROM groups WHERE uuid = $1`,
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Group not found" 
      });
    }

    if (groupCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Only group owner can view invites" 
      });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        gi.*,
        jsonb_build_object(
          'full_name', u.full_name,
          'email', u.email,
          'affiliation', r.affiliation,
          'photo', r.photo
        ) as researcher
      FROM group_invitations gi
      JOIN users u ON u.uuid = gi.invitee_user_id
      LEFT JOIN researcher_profiles r ON r.user_id = gi.invitee_user_id
      WHERE gi.group_id = $1 AND gi.status = 'pending'
      ORDER BY gi.created_at DESC
      `,
      [groupId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error in getGroupInvites:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =====================================================
   CANCEL INVITE (PRIVATE)
===================================================== */
export const cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.uuid;

    // Check if user is the inviter
    const inviteCheck = await pool.query(
      `SELECT * FROM group_invitations WHERE id = $1 AND inviter_id = $2`,
      [inviteId, userId]
    );

    if (inviteCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Invitation not found or you don't have permission" 
      });
    }

    await pool.query(
      `DELETE FROM group_invitations WHERE id = $1`,
      [inviteId]
    );

    res.json({ 
      success: true,
      message: "Invitation cancelled successfully" 
    });

  } catch (error) {
    console.error("Error in cancelInvite:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =====================================================
   RESEND INVITE (PRIVATE)
===================================================== */
export const resendInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.uuid;

    // Check if user is the inviter
    const inviteCheck = await pool.query(
      `SELECT * FROM group_invitations WHERE id = $1 AND inviter_id = $2`,
      [inviteId, userId]
    );

    if (inviteCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Invitation not found or you don't have permission" 
      });
    }

    await pool.query(
      `UPDATE group_invitations SET created_at = NOW() WHERE id = $1`,
      [inviteId]
    );

    res.json({ 
      success: true,
      message: "Invitation resent successfully" 
    });

  } catch (error) {
    console.error("Error in resendInvite:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Placeholder functions
/* =====================================================
   GET MY CONNECTIONS (FIXED)
===================================================== */
export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        c.uuid as id,
        c.status,
        c.created_at as connected_at,
        CASE 
          WHEN c.requester_id = $1 THEN c.receiver_id
          ELSE c.requester_id
        END as researcher_id,
        CASE 
          WHEN c.requester_id = $1 THEN u2.full_name
          ELSE u1.full_name
        END as researcher_name,
        CASE 
          WHEN c.requester_id = $1 THEN r2.affiliation
          ELSE r1.affiliation
        END as affiliation,
        CASE 
          WHEN c.requester_id = $1 THEN r2.photo
          ELSE r1.photo
        END as photo,
        CASE 
          WHEN c.requester_id = $1 THEN u2.email
          ELSE u1.email
        END as email
      FROM connections c
      JOIN users u1 ON u1.uuid = c.requester_id
      JOIN users u2 ON u2.uuid = c.receiver_id
      LEFT JOIN researcher_profiles r1 ON r1.user_id = c.requester_id
      LEFT JOIN researcher_profiles r2 ON r2.user_id = c.receiver_id
      WHERE (c.requester_id = $1 OR c.receiver_id = $1) 
        AND c.status = 'accepted'
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      connections: rows
    });

  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch connections",
      error: error.message 
    });
  }
};

export const getMyPublications = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        p.uuid,
        p.title,
        p.authors,
        p.journal,
        p.year,
        p.doi,
        p.abstract,
        p.file_url,
        p.created_at,
        p.updated_at,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count
      FROM publications p
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as like_count
        FROM publication_likes
        GROUP BY publication_id
      ) l ON l.publication_id = p.uuid
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as comment_count
        FROM publication_comments
        GROUP BY publication_id
      ) c ON c.publication_id = p.uuid
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [userId]
    );

    // Return as array directly
    res.json(rows);

  } catch (error) {
    console.error("Error getting my publications:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export const getMyEvents = async (req, res) => {
  res.json({ 
    success: true,
    events: [] 
  });
};

/* =====================================================
   GET MY GROUP INVITATIONS (PRIVATE)
   Get all pending group invitations for the current user
===================================================== */
export const getMyGroupInvitations = async (req, res) => {
  try {
    const userId = req.user.uuid;

    console.log("Fetching group invitations for user:", userId);

    const { rows } = await pool.query(
      `
      SELECT 
        gi.uuid as id,
        gi.uuid,
        gi.group_id,
        gi.inviter_id,
        gi.message,
        gi.status,
        gi.created_at,
        g.name as group_name,
        g.description as group_description,
        u.full_name as inviter_name,
        u.email as inviter_email
      FROM group_invitations gi
      JOIN groups g ON g.uuid = gi.group_id
      JOIN users u ON u.uuid = gi.inviter_id
      WHERE gi.invitee_user_id = $1 AND gi.status = 'pending'
      ORDER BY gi.created_at DESC
      `,
      [userId]
    );

    console.log(`Found ${rows.length} pending invitations for user ${userId}`);
    res.json(rows);

  } catch (error) {
    console.error("Error in getMyGroupInvitations:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* =====================================================
   ACCEPT GROUP INVITATION (PRIVATE)
===================================================== */
export const acceptGroupInvitation = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { invitationId } = req.params;
    const userId = req.user.uuid;

    console.log("Accepting group invitation:", { invitationId, userId });

    // Get the invitation
    const invitationResult = await client.query(
      `
      SELECT * FROM group_invitations 
      WHERE uuid = $1 AND invitee_user_id = $2 AND status = 'pending'
      `,
      [invitationId, userId]
    );

    if (invitationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Invitation not found or already processed" 
      });
    }

    const invitation = invitationResult.rows[0];

    // Check if user is already a member
    const memberCheck = await client.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [invitation.group_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      // Add user as member
      await client.query(
        `
        INSERT INTO group_members (uuid, group_id, user_id, role, joined_at)
        VALUES (gen_random_uuid(), $1, $2, 'member', NOW())
        `,
        [invitation.group_id, userId]
      );
    }

    // Update invitation status to accepted
    await client.query(
      `
      UPDATE group_invitations 
      SET status = 'accepted', updated_at = NOW()
      WHERE uuid = $1
      `,
      [invitationId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Group invitation accepted successfully",
      group_id: invitation.group_id
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error accepting group invitation:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   REJECT GROUP INVITATION (PRIVATE)
===================================================== */
export const rejectGroupInvitation = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { invitationId } = req.params;
    const userId = req.user.uuid;

    console.log("Rejecting group invitation:", { invitationId, userId });

    // Get the invitation
    const invitationResult = await client.query(
      `
      SELECT * FROM group_invitations 
      WHERE uuid = $1 AND invitee_user_id = $2 AND status = 'pending'
      `,
      [invitationId, userId]
    );

    if (invitationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Invitation not found or already processed" 
      });
    }

    // Update invitation status to rejected
    await client.query(
      `
      UPDATE group_invitations 
      SET status = 'rejected', updated_at = NOW()
      WHERE uuid = $1
      `,
      [invitationId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Group invitation rejected successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error rejecting group invitation:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   SEARCH RESEARCHERS
===================================================== */
export const searchResearchers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user?.uuid || null;

    if (!q) {
      return res.json([]);
    }

    const { rows } = await pool.query(
      `
      SELECT 
        u.uuid,
        u.full_name,
        u.email,
        r.affiliation,
        r.country,
        r.photo,
        r.research_interests
      FROM users u
      LEFT JOIN researcher_profiles r ON r.user_id = u.uuid
      WHERE ($1::uuid IS NULL OR u.uuid != $1)
        AND (
          u.full_name ILIKE $2 OR
          u.email ILIKE $2 OR
          r.affiliation ILIKE $2 OR
          r.research_interests::text ILIKE $2
        )
      ORDER BY u.full_name ASC
      LIMIT 20
      `,
      [userId, `%${q}%`]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error searching researchers:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   LEAVE GROUP
===================================================== */
export const leaveGroup = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { groupId } = req.params;
    const userId = req.user.uuid;

    // Check if user is owner
    const groupCheck = await client.query(
      `SELECT created_by FROM groups WHERE uuid = $1`,
      [groupId]
    );

    if (groupCheck.rows.length > 0 && groupCheck.rows[0].created_by === userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Group owner cannot leave the group. Delete the group instead." 
      });
    }

    await client.query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Left group successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error leaving group:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   DELETE GROUP - FIXED with proper cascade
===================================================== */
export const deleteGroup = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { groupId } = req.params;
    const userId = req.user.uuid;

    console.log("Deleting group:", { groupId, userId });

    // Check if group exists and user is owner
    const groupCheck = await client.query(
      `SELECT * FROM groups WHERE uuid = $1`,
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    const group = groupCheck.rows[0];

    // Check if user is the owner
    if (group.created_by !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the group owner can delete the group" 
      });
    }

    // 1. Delete all group post comments first
    await client.query(
      `
      DELETE FROM group_post_comments 
      WHERE post_id IN (
        SELECT uuid FROM group_posts WHERE group_id = $1
      )
      `,
      [groupId]
    );

    // 2. Delete all group post likes
    await client.query(
      `
      DELETE FROM group_post_likes 
      WHERE post_id IN (
        SELECT uuid FROM group_posts WHERE group_id = $1
      )
      `,
      [groupId]
    );

    // 3. Delete all group posts
    await client.query(
      `DELETE FROM group_posts WHERE group_id = $1`,
      [groupId]
    );

    // 4. Delete all group invitations
    await client.query(
      `DELETE FROM group_invitations WHERE group_id = $1`,
      [groupId]
    );

    // 5. Delete all group members
    await client.query(
      `DELETE FROM group_members WHERE group_id = $1`,
      [groupId]
    );

    // 6. Finally delete the group
    await client.query(
      `DELETE FROM groups WHERE uuid = $1`,
      [groupId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Group deleted successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting group:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to delete group"
    });
  } finally {
    client.release();
  }
};
/* =====================================================
   GROUP POSTS (FORUM)
===================================================== */
export const getGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uuid;

    // Check if user is member
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You must be a member to view posts" 
      });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        gp.*,
        u.full_name as author_name,
        u.email as author_email,
        r.photo as author_photo,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM group_posts gp
      JOIN users u ON u.uuid = gp.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = gp.user_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
        FROM group_post_likes
        GROUP BY post_id
      ) l ON l.post_id = gp.uuid
      LEFT JOIN (
        SELECT post_id, COUNT(*) as comment_count
        FROM group_post_comments
        GROUP BY post_id
      ) c ON c.post_id = gp.uuid
      LEFT JOIN group_post_likes ul ON ul.post_id = gp.uuid AND ul.user_id = $1
      WHERE gp.group_id = $2
      ORDER BY gp.created_at DESC
      `,
      [userId, groupId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting group posts:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
/* =====================================================
   CREATE GROUP POST - FIXED for FormData/JSON
===================================================== */
export const createGroupPost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { groupId } = req.params;
    const userId = req.user.uuid;
    
    // Handle both JSON and FormData
    let content;
    
    if (req.body && typeof req.body === 'object') {
      // If sent as JSON
      content = req.body.content;
    }
    
    // If content is still undefined, try to get it from FormData
    if (!content && req.body) {
      content = req.body.content;
    }

    console.log("Creating group post:", { groupId, userId, content });

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: "Post content is required" 
      });
    }

    // Check if user is member
    const memberCheck = await client.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You must be a member to create posts" 
      });
    }

    const result = await client.query(
      `
      INSERT INTO group_posts (uuid, group_id, user_id, content, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      RETURNING *
      `,
      [groupId, userId, content]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating group post:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const deleteGroupPost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { postId } = req.params;
    const userId = req.user.uuid;

    const checkResult = await client.query(
      `SELECT user_id FROM group_posts WHERE uuid = $1`,
      [postId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own posts" 
      });
    }

    await client.query(
      `DELETE FROM group_posts WHERE uuid = $1`,
      [postId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting group post:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const likePost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { postId } = req.params;
    const userId = req.user.uuid;

    const checkResult = await client.query(
      `SELECT * FROM group_post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query(
        `
        INSERT INTO group_post_likes (uuid, post_id, user_id, created_at)
        VALUES (gen_random_uuid(), $1, $2, NOW())
        `,
        [postId, userId]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Post liked successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error liking post:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const unlikePost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { postId } = req.params;
    const userId = req.user.uuid;

    await client.query(
      `DELETE FROM group_post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Post unliked successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error unliking post:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const commentOnPost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { postId } = req.params;
    const userId = req.user.uuid;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment content is required" 
      });
    }

    const result = await client.query(
      `
      INSERT INTO group_post_comments (uuid, post_id, user_id, content, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      RETURNING *
      `,
      [postId, userId, content]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error commenting on post:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT 
        pc.*,
        u.full_name as user_name,
        u.email as user_email,
        r.photo as user_photo
      FROM group_post_comments pc
      JOIN users u ON u.uuid = pc.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = pc.user_id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC
      `,
      [postId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting post comments:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getReviewerWorkspace = async(req,res)=>{

} 

export const respondInvitation=async(req,res)=>{

}
export const startReview = async(req,res)=>{

}
export const submitReview = async(req,res)=>{
  
}

// Add these to your researcher.controller.js file
/* ==============================
   PUBLICATIONS CONTROLLERS - COMPLETE FIX
============================== */
export const createPublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const userId = req.user.uuid;
    const { title, authors, journal, year, doi, abstract } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }
    
    if (!authors) {
      return res.status(400).json({ 
        success: false, 
        message: "Authors are required" 
      });
    }

    // Handle file upload if present
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/publications/${req.file.filename}`;
    }

    // Parse authors - handle both string and array
    let authorsArray = [];
    if (authors) {
      if (Array.isArray(authors)) {
        authorsArray = authors;
      } else if (typeof authors === 'string') {
        // Remove any quotes and split by commas
        const cleanAuthors = authors.replace(/["']/g, '');
        authorsArray = cleanAuthors.split(',').map(a => a.trim()).filter(a => a.length > 0);
      }
    }

    // Parse year
    let parsedYear = null;
    if (year) {
      parsedYear = parseInt(year);
      if (isNaN(parsedYear)) {
        parsedYear = null;
      }
    }

    // Insert publication into database
    const result = await client.query(
      `
      INSERT INTO publications (
        uuid,
        user_id,
        title,
        authors,
        journal,
        year,
        doi,
        abstract,
        file_url,
        created_at,
        updated_at
      )
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING 
        uuid,
        title,
        authors,
        journal,
        year,
        doi,
        abstract,
        file_url,
        created_at,
        updated_at
      `,
      [
        userId,
        title.trim(),
        authorsArray,
        journal || null,
        parsedYear,
        doi || null,
        abstract || null,
        fileUrl
      ]
    );

    const publication = result.rows[0];

    // Get user details for response
    const userResult = await client.query(
      `
      SELECT 
        u.full_name as user_name,
        u.email as user_email,
        rp.photo as user_photo,
        rp.affiliation as user_affiliation
      FROM users u
      LEFT JOIN researcher_profiles rp ON rp.user_id = u.uuid
      WHERE u.uuid = $1
      `,
      [userId]
    );

    await client.query("COMMIT");

    // Combine publication with user details
    const responseData = {
      ...publication,
      user_uuid: userId,
      user_name: userResult.rows[0]?.user_name,
      user_email: userResult.rows[0]?.user_email,
      user_photo: userResult.rows[0]?.user_photo,
      user_affiliation: userResult.rows[0]?.user_affiliation,
      like_count: 0,
      comment_count: 0,
      is_liked: false
    };

    res.status(201).json({
      success: true,
      message: "Publication created successfully",
      data: responseData
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create publication"
    });
  } finally {
    client.release();
  }
};


export const updatePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;
    const { title, authors, journal, year, doi, abstract } = req.body;
    
    // Check if publication exists and belongs to user
    const checkResult = await client.query(
      `SELECT * FROM publications WHERE uuid = $1 AND user_id = $2`,
      [publicationId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Publication not found or you don't have permission to edit it" 
      });
    }

    // Handle file upload if present
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/publications/${req.file.filename}`;
    }

    // Parse authors
    let authorsArray = null;
    if (authors) {
      if (Array.isArray(authors)) {
        authorsArray = authors;
      } else if (typeof authors === 'string') {
        authorsArray = authors.split(',').map(a => a.trim());
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      updateValues.push(title.trim());
      paramIndex++;
    }
    if (authorsArray !== null) {
      updateFields.push(`authors = $${paramIndex}`);
      updateValues.push(authorsArray);
      paramIndex++;
    }
    if (journal !== undefined) {
      updateFields.push(`journal = $${paramIndex}`);
      updateValues.push(journal || null);
      paramIndex++;
    }
    if (year !== undefined) {
      updateFields.push(`year = $${paramIndex}`);
      updateValues.push(year ? parseInt(year) : null);
      paramIndex++;
    }
    if (doi !== undefined) {
      updateFields.push(`doi = $${paramIndex}`);
      updateValues.push(doi || null);
      paramIndex++;
    }
    if (abstract !== undefined) {
      updateFields.push(`abstract = $${paramIndex}`);
      updateValues.push(abstract || null);
      paramIndex++;
    }
    if (fileUrl !== null) {
      updateFields.push(`file_url = $${paramIndex}`);
      updateValues.push(fileUrl);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length > 1) {
      const query = `
        UPDATE publications
        SET ${updateFields.join(', ')}
        WHERE uuid = $${paramIndex}
        RETURNING *
      `;
      
      updateValues.push(publicationId);
      
      await client.query(query, updateValues);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication updated successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const deletePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;

    // Check if publication exists and belongs to user
    const checkResult = await client.query(
      `SELECT * FROM publications WHERE uuid = $1 AND user_id = $2`,
      [publicationId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Publication not found or you don't have permission to delete it" 
      });
    }

    // Delete related likes first
    await client.query(
      `DELETE FROM publication_likes WHERE publication_id = $1`,
      [publicationId]
    );

    // Delete related comments
    await client.query(
      `DELETE FROM publication_comments WHERE publication_id = $1`,
      [publicationId]
    );

    // Delete publication
    await client.query(
      `DELETE FROM publications WHERE uuid = $1`,
      [publicationId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication deleted successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const getAllPublications = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        p.uuid,
        p.title,
        p.authors,
        p.journal,
        p.year,
        p.doi,
        p.abstract,
        p.file_url,
        p.created_at,
        p.updated_at,
        u.uuid as user_uuid,
        u.full_name as user_name,
        u.email as user_email,
        rp.photo as user_photo,
        rp.affiliation as user_affiliation,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM publications p
      JOIN users u ON u.uuid = p.user_id
      LEFT JOIN researcher_profiles rp ON rp.user_id = p.user_id
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as like_count
        FROM publication_likes
        GROUP BY publication_id
      ) l ON l.publication_id = p.uuid
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as comment_count
        FROM publication_comments
        GROUP BY publication_id
      ) c ON c.publication_id = p.uuid
      LEFT JOIN publication_likes ul ON ul.publication_id = p.uuid AND ul.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [userId]
    );

    // Return as array directly (not wrapped in an object)
    res.json(rows);

  } catch (error) {
    console.error("Error getting all publications:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getPublicationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        p.uuid,
        p.title,
        p.authors,
        p.journal,
        p.year,
        p.doi,
        p.abstract,
        p.file_url,
        p.created_at,
        p.updated_at,
        u.full_name as user_name,
        u.email as user_email,
        rp.photo as user_photo,
        rp.affiliation as user_affiliation,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM publications p
      JOIN users u ON u.uuid = p.user_id
      LEFT JOIN researcher_profiles rp ON rp.user_id = p.user_id
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as like_count
        FROM publication_likes
        GROUP BY publication_id
      ) l ON l.publication_id = p.uuid
      LEFT JOIN (
        SELECT publication_id, COUNT(*) as comment_count
        FROM publication_comments
        GROUP BY publication_id
      ) c ON c.publication_id = p.uuid
      LEFT JOIN publication_likes ul ON ul.publication_id = p.uuid AND ul.user_id = $2
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [userId, currentUserId]
    );

    res.json({
      success: true,
      publications: rows
    });

  } catch (error) {
    console.error("Error getting publications by user:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const likePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;

    // Check if already liked
    const checkResult = await client.query(
      `SELECT * FROM publication_likes WHERE publication_id = $1 AND user_id = $2`,
      [publicationId, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query(
        `
        INSERT INTO publication_likes (uuid, publication_id, user_id, created_at)
        VALUES (gen_random_uuid(), $1, $2, NOW())
        `,
        [publicationId, userId]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication liked successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error liking publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};


export const unlikePublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;

    await client.query(
      `DELETE FROM publication_likes WHERE publication_id = $1 AND user_id = $2`,
      [publicationId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Publication unliked successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error unliking publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

export const commentOnPublication = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { publicationId } = req.params;
    const userId = req.user.uuid;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment content is required" 
      });
    }

    const result = await client.query(
      `
      INSERT INTO publication_comments (uuid, publication_id, user_id, content, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      RETURNING *
      `,
      [publicationId, userId, content.trim()]
    );

    // Get user details for the comment
    const userResult = await client.query(
      `
      SELECT 
        u.full_name as user_name,
        u.email as user_email,
        rp.photo as user_photo
      FROM users u
      LEFT JOIN researcher_profiles rp ON rp.user_id = u.uuid
      WHERE u.uuid = $1
      `,
      [userId]
    );

    await client.query("COMMIT");

    const comment = {
      ...result.rows[0],
      user_name: userResult.rows[0]?.user_name,
      user_email: userResult.rows[0]?.user_email,
      user_photo: userResult.rows[0]?.user_photo
    };

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error commenting on publication:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};


export const getPublicationComments = async (req, res) => {
  try {
    const { publicationId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT 
        pc.uuid,
        pc.publication_id,
        pc.user_id,
        pc.content,
        pc.created_at,
        u.full_name as user_name,
        u.email as user_email,
        rp.photo as user_photo
      FROM publication_comments pc
      JOIN users u ON u.uuid = pc.user_id
      LEFT JOIN researcher_profiles rp ON rp.user_id = pc.user_id
      WHERE pc.publication_id = $1
      ORDER BY pc.created_at ASC
      `,
      [publicationId]
    );

    res.json({
      success: true,
      comments: rows
    });

  } catch (error) {
    console.error("Error getting publication comments:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   SEND CONNECTION REQUEST
===================================================== */
export const sendConnectionRequest = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const requesterId = req.user.uuid;
    const { researcherId } = req.params;

    if (!researcherId) {
      return res.status(400).json({ 
        success: false, 
        message: "Researcher ID is required" 
      });
    }

    if (requesterId === researcherId) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot send a connection request to yourself" 
      });
    }

    // Check if connection already exists
    const existingConnection = await client.query(
      `
      SELECT * FROM connections 
      WHERE (requester_id = $1 AND receiver_id = $2)
         OR (requester_id = $2 AND receiver_id = $1)
      `,
      [requesterId, researcherId]
    );

    if (existingConnection.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "Connection already exists or request already sent" 
      });
    }

    // Create connection request
    const result = await client.query(
      `
      INSERT INTO connections (uuid, requester_id, receiver_id, status, created_at)
      VALUES (gen_random_uuid(), $1, $2, 'pending', NOW())
      RETURNING uuid
      `,
      [requesterId, researcherId]
    );

    // Get receiver details
    const receiver = await client.query(
      `
      SELECT full_name FROM users WHERE uuid = $1
      `,
      [researcherId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      request_id: result.rows[0].uuid,
      researcher_name: receiver.rows[0]?.full_name || "Researcher"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error sending connection request:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send connection request",
      error: error.message 
    });
  } finally {
    client.release();
  }
};


/* =====================================================
   GET PENDING CONNECTION REQUESTS (Received)
===================================================== */
export const getPendingConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        c.uuid as id,
        c.requester_id as sender_id,
        c.status,
        c.created_at,
        u.full_name as sender_name,
        r.affiliation as sender_affiliation,
        r.photo as sender_photo,
        u.email as sender_email
      FROM connections c
      JOIN users u ON u.uuid = c.requester_id
      LEFT JOIN researcher_profiles r ON r.user_id = c.requester_id
      WHERE c.receiver_id = $1 AND c.status = 'pending'
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      requests: rows
    });

  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch pending requests",
      error: error.message 
    });
  }
};


/* =====================================================
   GET SENT CONNECTION REQUESTS
===================================================== */
export const getSentConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        c.uuid as id,
        c.receiver_id as receiver_id,
        c.status,
        c.created_at,
        u.full_name as receiver_name,
        r.affiliation as receiver_affiliation,
        r.photo as receiver_photo,
        u.email as receiver_email
      FROM connections c
      JOIN users u ON u.uuid = c.receiver_id
      LEFT JOIN researcher_profiles r ON r.user_id = c.receiver_id
      WHERE c.requester_id = $1 AND c.status = 'pending'
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      requests: rows
    });

  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch sent requests",
      error: error.message 
    });
  }
};


/* =====================================================
   ACCEPT CONNECTION REQUEST
===================================================== */
export const acceptConnectionRequest = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { requestId } = req.params;
    const userId = req.user.uuid;

    console.log("Accepting request:", { requestId, userId });

    // First check if the request exists and is pending
    const checkRequest = await client.query(
      `
      SELECT * FROM connections 
      WHERE uuid = $1 AND receiver_id = $2 AND status = 'pending'
      `,
      [requestId, userId]
    );

    if (checkRequest.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Connection request not found or already processed" 
      });
    }

    // Update the connection status to accepted
    const result = await client.query(
      `
      UPDATE connections 
      SET status = 'accepted', updated_at = NOW()
      WHERE uuid = $1 AND receiver_id = $2 AND status = 'pending'
      RETURNING uuid, requester_id, receiver_id, status, created_at, updated_at
      `,
      [requestId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Connection request accepted successfully",
      connection: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error accepting connection request:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to accept connection request",
      error: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   REJECT CONNECTION REQUEST
===================================================== */
export const rejectConnectionRequest = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { requestId } = req.params;
    const userId = req.user.uuid;

    console.log("Rejecting request:", { requestId, userId });

    // Check if the request exists and is pending
    const checkRequest = await client.query(
      `
      SELECT * FROM connections 
      WHERE uuid = $1 AND receiver_id = $2 AND status = 'pending'
      `,
      [requestId, userId]
    );

    if (checkRequest.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Connection request not found or already processed" 
      });
    }

    // Update the connection status to rejected
    const result = await client.query(
      `
      UPDATE connections 
      SET status = 'rejected', updated_at = NOW()
      WHERE uuid = $1 AND receiver_id = $2 AND status = 'pending'
      RETURNING uuid, requester_id, receiver_id, status, created_at, updated_at
      `,
      [requestId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Connection request rejected successfully",
      connection: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error rejecting connection request:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reject connection request",
      error: error.message 
    });
  } finally {
    client.release();
  }
};
/* =====================================================
   CHECK CONNECTION STATUS
===================================================== */
export const checkConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.uuid;
    const { researcherId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT *
      FROM connections
      WHERE (requester_id = $1 AND receiver_id = $2)
         OR (requester_id = $2 AND receiver_id = $1)
      `,
      [userId, researcherId]
    );

    let status = null;
    if (rows.length > 0) {
      const connection = rows[0];
      if (connection.status === 'accepted') {
        status = { 
          status: 'connected', 
          since: connection.created_at,
          connection_id: connection.uuid 
        };
      } else if (connection.status === 'pending') {
        if (connection.requester_id === userId) {
          status = { 
            status: 'pending_sent', 
            since: connection.created_at,
            request_id: connection.uuid 
          };
        } else {
          status = { 
            status: 'pending_received', 
            since: connection.created_at,
            request_id: connection.uuid 
          };
        }
      } else if (connection.status === 'rejected') {
        status = { 
          status: 'rejected', 
          since: connection.updated_at 
        };
      }
    }

    res.json({
      success: true,
      status,
      connection: rows[0] || null
    });

  } catch (error) {
    console.error("Error checking connection status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check connection status",
      error: error.message 
    });
  }
};


/* =====================================================
   REMOVE CONNECTION
===================================================== */
export const removeConnection = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { connectionId } = req.params;
    const userId = req.user.uuid;

    // Verify the connection belongs to the user
    const checkResult = await client.query(
      `
      SELECT * FROM connections 
      WHERE uuid = $1 AND (requester_id = $2 OR receiver_id = $2)
      `,
      [connectionId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection not found" 
      });
    }

    await client.query(
      `DELETE FROM connections WHERE uuid = $1`,
      [connectionId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Connection removed successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error removing connection:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove connection",
      error: error.message 
    });
  } finally {
    client.release();
  }
};

/* ==============================
   MESSAGES CONTROLLERS
============================== */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.uuid;
    // TODO: Implement get conversations logic
    res.json({ 
      success: true, 
      conversations: [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // TODO: Implement get messages logic
    res.json({ 
      success: true, 
      messages: [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.uuid;
    // TODO: Implement send message logic
    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully",
      data: { sender_id, receiver_id, content }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // TODO: Implement mark messages as read logic
    res.json({ 
      success: true, 
      message: `Messages in conversation ${conversationId} marked as read` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    // TODO: Implement delete message logic
    res.json({ 
      success: true, 
      message: `Message ${messageId} deleted` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.uuid;
    // TODO: Implement get unread message count logic
    res.json({ 
      success: true, 
      count: 0 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==============================
   PROJECT UPDATES CONTROLLERS
============================== */
export const getProjectUpdates = async (req, res) => {
  try {
    const { groupId } = req.params;
    // TODO: Implement get project updates logic
    res.json({ 
      success: true, 
      updates: [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProjectUpdate = async (req, res) => {
  try {
    const { groupId } = req.params;
    const updateData = req.body;
    // TODO: Implement create project update logic
    res.status(201).json({ 
      success: true, 
      message: "Project update created successfully",
      data: { groupId, ...updateData }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProjectUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const updateData = req.body;
    // TODO: Implement update project update logic
    res.json({ 
      success: true, 
      message: `Project update ${updateId} updated successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProjectUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    // TODO: Implement delete project update logic
    res.json({ 
      success: true, 
      message: `Project update ${updateId} deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProjectUpdates = async (req, res) => {
  try {
    // TODO: Implement get all project updates logic
    res.json({ 
      success: true, 
      updates: [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};