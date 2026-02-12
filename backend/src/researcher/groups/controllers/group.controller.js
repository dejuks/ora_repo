import * as GroupModel from "../models/group.model.js";

/* CREATE */
export const createGroup = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      created_by: req.user.uuid, // 🔥 from token
    };

    const group = await GroupModel.createGroup(data);

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET ALL */
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
   GET MY GROUPS (PRIVATE) - FIXED
===================================================== */
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        g.uuid as id,
        g.name,
        g.description,
        g.created_at,
        g.created_by,
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
    res.status(500).json({ message: error.message });
  }
};
export const getMyPublications = async (req, res) => {
  try {
    const publications = await GroupModel.getPublicationsByResearcher(req.user.uuid);
    res.json(publications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getMyEvents = async (req, res) => {
  try {
    const events = await GroupModel.getEventsByResearcher(req.user.uuid);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 
