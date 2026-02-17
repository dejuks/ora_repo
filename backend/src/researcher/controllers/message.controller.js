import pool from "../../config/db.js";

/* =====================================================
   SEND MESSAGE
===================================================== */
export const sendMessage = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const senderId = req.user.uuid;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Receiver ID and content are required" 
      });
    }

    if (senderId === receiver_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot send message to yourself" 
      });
    }

    // Find or create conversation
    let conversationResult = await client.query(
      `
      SELECT uuid FROM conversations
      WHERE (user1_id = $1 AND user2_id = $2)
         OR (user1_id = $2 AND user2_id = $1)
      `,
      [senderId, receiver_id]
    );

    let conversationId;
    if (conversationResult.rows.length === 0) {
      // Create new conversation
      const newConversation = await client.query(
        `
        INSERT INTO conversations (uuid, user1_id, user2_id, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
        RETURNING uuid
        `,
        [senderId, receiver_id]
      );
      conversationId = newConversation.rows[0].uuid;
    } else {
      conversationId = conversationResult.rows[0].uuid;
      
      // Update conversation timestamp
      await client.query(
        `UPDATE conversations SET updated_at = NOW() WHERE uuid = $1`,
        [conversationId]
      );
    }

    // Create message
    const messageResult = await client.query(
      `
      INSERT INTO messages (uuid, conversation_id, sender_id, content, is_read, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
      RETURNING *
      `,
      [conversationId, senderId, content]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: messageResult.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error sending message:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET CONVERSATIONS
===================================================== */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT 
        c.uuid as id,
        c.uuid,
        c.user1_id,
        c.user2_id,
        c.created_at,
        c.updated_at as last_message_time,
        CASE 
          WHEN c.user1_id = $1 THEN u2.uuid
          ELSE u1.uuid
        END as participant_id,
        CASE 
          WHEN c.user1_id = $1 THEN u2.full_name
          ELSE u1.full_name
        END as participant_name,
        CASE 
          WHEN c.user1_id = $1 THEN r2.affiliation
          ELSE r1.affiliation
        END as participant_affiliation,
        CASE 
          WHEN c.user1_id = $1 THEN r2.photo
          ELSE r1.photo
        END as participant_photo,
        (
          SELECT content FROM messages 
          WHERE conversation_id = c.uuid 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*) FROM messages 
          WHERE conversation_id = c.uuid 
            AND sender_id != $1 
            AND is_read = false
        ) as unread_count
      FROM conversations c
      JOIN users u1 ON u1.uuid = c.user1_id
      JOIN users u2 ON u2.uuid = c.user2_id
      LEFT JOIN researcher_profiles r1 ON r1.user_id = c.user1_id
      LEFT JOIN researcher_profiles r2 ON r2.user_id = c.user2_id
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.updated_at DESC
      `,
      [userId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   GET MESSAGES
===================================================== */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.uuid;

    // Verify user is part of conversation
    const verifyResult = await pool.query(
      `
      SELECT * FROM conversations 
      WHERE uuid = $1 AND (user1_id = $2 OR user2_id = $2)
      `,
      [conversationId, userId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have access to this conversation" 
      });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.email as sender_email,
        r.photo as sender_photo
      FROM messages m
      JOIN users u ON u.uuid = m.sender_id
      LEFT JOIN researcher_profiles r ON r.user_id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   MARK MESSAGES AS READ
===================================================== */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.uuid;

    await pool.query(
      `
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE conversation_id = $1 
        AND sender_id != $2 
        AND is_read = false
      `,
      [conversationId, userId]
    );

    res.json({
      success: true,
      message: "Messages marked as read"
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   GET UNREAD MESSAGE COUNT
===================================================== */
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const { rows } = await pool.query(
      `
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON c.uuid = m.conversation_id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
        AND m.sender_id != $1
        AND m.is_read = false
      `,
      [userId]
    );

    res.json({
      success: true,
      count: parseInt(rows[0].count)
    });

  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* =====================================================
   DELETE MESSAGE
===================================================== */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.uuid;

    // Verify user is sender
    const checkResult = await pool.query(
      `SELECT sender_id FROM messages WHERE uuid = $1`,
      [messageId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Message not found" 
      });
    }

    if (checkResult.rows[0].sender_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own messages" 
      });
    }

    await pool.query(
      `DELETE FROM messages WHERE uuid = $1`,
      [messageId]
    );

    res.json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};