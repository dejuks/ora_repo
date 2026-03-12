import pool from "../../config/db.js";

/* =====================================================
   CREATE PROJECT UPDATE
===================================================== */
export const createProjectUpdate = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { groupId } = req.params;
    const userId = req.user.uuid;
    const { title, content, status } = req.body;

    console.log("Backend - Creating project update:", {
      groupId,
      userId,
      title,
      content,
      status
    });

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Content is required" 
      });
    }

    // Check if user is member of the group
    const memberCheck = await client.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You must be a member of the group to post updates" 
      });
    }

    // Create the update
    const result = await client.query(
      `
      INSERT INTO project_updates (
        uuid,
        group_id,
        user_id,
        title,
        content,
        status,
        created_at,
        updated_at
      )
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
      `,
      [groupId, userId, title.trim(), content.trim(), status || 'in_progress']
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Project update created successfully",
      update: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating project update:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET PROJECT UPDATES FOR A GROUP
===================================================== */
export const getProjectUpdates = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uuid;

    // Check if user is member of the group
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You must be a member to view updates" 
      });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        pu.*,
        u.full_name as author_name,
        u.email as author_email,
        r.photo as author_photo
      FROM project_updates pu
      JOIN users u ON u.uuid = pu.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = pu.user_id
      WHERE pu.group_id = $1
      ORDER BY pu.created_at DESC
      `,
      [groupId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting project updates:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   UPDATE PROJECT UPDATE
===================================================== */
export const updateProjectUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const userId = req.user.uuid;
    const { title, content, status } = req.body;

    // Check if user owns this update
    const checkResult = await pool.query(
      `SELECT user_id FROM project_updates WHERE uuid = $1`,
      [updateId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Update not found" 
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only update your own updates" 
      });
    }

    const result = await pool.query(
      `
      UPDATE project_updates
      SET 
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        status = COALESCE($3, status),
        updated_at = NOW()
      WHERE uuid = $4
      RETURNING *
      `,
      [title, content, status, updateId]
    );

    res.json({
      success: true,
      message: "Update updated successfully",
      update: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating project update:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   DELETE PROJECT UPDATE
===================================================== */
export const deleteProjectUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const userId = req.user.uuid;

    // Check if user owns this update
    const checkResult = await pool.query(
      `SELECT user_id FROM project_updates WHERE uuid = $1`,
      [updateId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Update not found" 
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own updates" 
      });
    }

    await pool.query(
      `DELETE FROM project_updates WHERE uuid = $1`,
      [updateId]
    );

    res.json({
      success: true,
      message: "Update deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting project update:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   GET ALL PROJECT UPDATES (for user's groups)
===================================================== */
export const getAllProjectUpdates = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        pu.*,
        u.full_name as author_name,
        u.email as author_email,
        r.photo as author_photo,
        g.name as group_name,
        g.uuid as group_id
      FROM project_updates pu
      JOIN group_members gm ON gm.group_id = pu.group_id
      JOIN users u ON u.uuid = pu.user_id
      LEFT JOIN researcher_profiles r ON r.user_id = pu.user_id
      JOIN groups g ON g.uuid = pu.group_id
      WHERE gm.user_id = $1
      ORDER BY pu.created_at DESC
      `,
      [userId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting all project updates:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};