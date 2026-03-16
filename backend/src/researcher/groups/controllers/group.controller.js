import * as GroupModel from "../models/group.model.js";

/* CREATE */
export const createGroup = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      privacy: req.body.privacy || 'public',
      created_by: req.user.uuid,
    };

    const group = await GroupModel.createGroup(data);
    
    // Auto add creator as owner member
    await GroupModel.addGroupMember(group.uuid, req.user.uuid, 'owner');

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET ALL - FIXED */
export const getGroups = async (req, res) => {
  try {
    const groups = await GroupModel.getAllGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET ONE */
export const getGroup = async (req, res) => {
  try {
    const group = await GroupModel.getGroupById(req.params.uuid);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* UPDATE */
export const updateGroup = async (req, res) => {
  try {
    const group = await GroupModel.updateGroup(
      req.params.uuid,
      req.body
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DELETE */
export const deleteGroup = async (req, res) => {
  try {
    await GroupModel.deleteGroup(req.params.uuid);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/* =====================================================
   GET GROUP MEMBERS - FIXED - Allow owners, admins, moderators
===================================================== */
export const getGroupMembers = async (req, res) => {
  try {
    const { uuid } = req.params;
    const userId = req.user.uuid;

    console.log(`Fetching members for group: ${uuid} by user: ${userId}`);

    // Check if group exists
    const group = await GroupModel.getGroupById(uuid);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if user is owner, admin, or moderator
    const isOwner = (group.created_by === userId);
    const memberRole = await GroupModel.getMemberRole(uuid, userId);
    const isAdminOrModerator = memberRole && (memberRole === 'admin' || memberRole === 'moderator');
    
    if (!isOwner && !isAdminOrModerator) {
      console.log(`User ${userId} is not owner/admin/moderator of group ${uuid}. Role: ${memberRole}`);
      return res.status(403).json({ 
        success: false, 
        message: "Only group owners, admins, and moderators can view all members" 
      });
    }

    console.log(`Access granted - isOwner: ${isOwner}, role: ${memberRole}`);
    const members = await GroupModel.getGroupMembers(uuid);
    
    console.log(`Found ${members.length} members for group ${uuid}`);
    
    res.json({
      success: true,
      data: members,
      count: members.length
    });

  } catch (error) {
    console.error("Error in getGroupMembers:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
/* =====================================================
   GET GROUP MEMBERS - PUBLIC ACCESS (NO PERMISSION REQUIRED)
   This endpoint bypasses all permission checks
===================================================== */
/* =====================================================
   GET GROUP MEMBERS - PUBLIC ACCESS (NO PERMISSION REQUIRED)
   任何人都可以查看群组成员，无需任何权限
===================================================== */
export const getGroupMembersPublic = async (req, res) => {
  try {
    const { uuid } = req.params;
    
    console.log(`[PUBLIC CONTROLLER] Fetching members for group: ${uuid}`);
    
    // Check if group exists
    const group = await GroupModel.getGroupById(uuid);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }
    
    // Get members without any permission checks
    const members = await GroupModel.getGroupMembersPublic(uuid);
    
    res.status(200).json({
      success: true,
      data: members,
      count: members.length,
      group: {
        uuid: group.uuid,
        name: group.name,
        privacy: group.privacy
      }
    });

  } catch (error) {
    console.error("[PUBLIC CONTROLLER] Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch group members"
    });
  }
};


/* UPDATE MEMBER ROLE */
export const updateMemberRole = async (req, res) => {
  try {
    const { uuid, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.uuid;

    // Check if group exists
    const group = await GroupModel.getGroupById(uuid);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if current user is owner
    const isOwner = await GroupModel.isGroupOwner(uuid, currentUserId);
    if (!isOwner) {
      return res.status(403).json({ 
        success: false, 
        message: "Only group owner can update member roles" 
      });
    }

    // Cannot change owner's role
    if (group.created_by === userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot change group owner's role" 
      });
    }

    const validRoles = ['admin', 'moderator', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid role. Must be one of: admin, moderator, member" 
      });
    }

    const updatedMember = await GroupModel.updateMemberRole(uuid, userId, role);
    
    res.json({
      success: true,
      message: `Member role updated to ${role} successfully`,
      data: updatedMember
    });

  } catch (error) {
    console.error("Error in updateMemberRole:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* REMOVE MEMBER FROM GROUP */
export const removeMember = async (req, res) => {
  try {
    const { uuid, userId } = req.params;
    const currentUserId = req.user.uuid;

    // Check if group exists
    const group = await GroupModel.getGroupById(uuid);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if current user is owner or removing themselves
    const isOwner = await GroupModel.isGroupOwner(uuid, currentUserId);
    
    if (!isOwner && currentUserId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to remove this member" 
      });
    }

    // Cannot remove the owner
    if (group.created_by === userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot remove the group owner" 
      });
    }

    await GroupModel.removeMember(uuid, userId);
    
    res.json({
      success: true,
      message: "Member removed successfully"
    });

  } catch (error) {
    console.error("Error in removeMember:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* GET MEMBERS COUNT - FIXED */
export const getMembersCount = async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const count = await GroupModel.getMembersCount(uuid);
    
    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error("Error in getMembersCount:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* CHECK MEMBERSHIP STATUS */
export const checkMembershipStatus = async (req, res) => {
  try {
    const { uuid } = req.params;
    const userId = req.user.uuid;

    const isMember = await GroupModel.isGroupMember(uuid, userId);
    const isOwner = await GroupModel.isGroupOwner(uuid, userId);
    
    let memberData = null;
    if (isMember) {
      memberData = await GroupModel.getGroupMemberById(uuid, userId);
    }

    res.json({
      success: true,
      isMember,
      isOwner,
      memberData
    });

  } catch (error) {
    console.error("Error in checkMembershipStatus:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   GROUP INVITATIONS CONTROLLERS
===================================================== */

/* INVITE TO GROUP */
export const inviteToGroup = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { researcher_ids, message } = req.body;
    
    // Check if group exists and user is owner
    const group = await GroupModel.getGroupById(uuid);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    if (group.created_by !== req.user.uuid) {
      return res.status(403).json({ message: "Only group owner can invite" });
    }
    
    // Create invitations
    const invitations = await GroupModel.createInvitations(uuid, researcher_ids, message);
    
    res.status(201).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET GROUP INVITES */
export const getGroupInvites = async (req, res) => {
  try {
    const { uuid } = req.params;
    const invites = await GroupModel.getGroupInvites(uuid);
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   MY GROUPS - FIXED
===================================================== */
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.uuid;
    const groups = await GroupModel.getMyGroups(userId);
    res.json(groups);
  } catch (error) {
    console.error("Error in getMyGroups:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   PLACEHOLDER FUNCTIONS
===================================================== */
export const getMyPublications = async (req, res) => {
  res.json([]);
};

export const getMyEvents = async (req, res) => {
  res.json([]);
};

/* =====================================================
   ADMIN - GET ALL GROUPS
===================================================== */
export const getAllGroupsAdmin = async (req, res) => {
  try {
    const groups = await GroupModel.getAllGroupsAdmin();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   ADMIN - UPDATE GROUP STATUS
===================================================== */
export const updateGroupStatus = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status, comment } = req.body;

    const validStatus = ['active', 'inactive', 'ban', 'others'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const updated = await GroupModel.updateGroupStatus(uuid, status, comment);

    res.json({
      success: true,
      message: "Group status updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   ADMIN - VIEW GROUP DETAILS
===================================================== */
export const getGroupDetailsAdmin = async (req, res) => {
  try {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required"
      });
    }

    const members = await GroupModel.getGroupMembersAdmin(uuid);
    const posts = await GroupModel.getGroupPostsAdmin(uuid);

    res.json({
      success: true,
      data: {
        members,
        posts
      }
    });

  } catch (error) {
    console.error("Admin Group Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
