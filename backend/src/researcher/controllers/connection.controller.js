import pool from "../../config/db.js";

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
        message: "You cannot send a coxnnection request to yourself" 
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
   ACCEPT CONNECTION REQUEST - FIXED
===================================================== */
export const acceptConnectionRequest = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { requestId } = req.params;
    const userId = req.user.uuid;

    console.log("Accepting request:", { requestId, userId }); // Debug log

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

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Failed to update connection request" 
      });
    }

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
   REJECT CONNECTION REQUEST - FIXED
===================================================== */
export const rejectConnectionRequest = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { requestId } = req.params;
    const userId = req.user.uuid;

    console.log("Rejecting request:", { requestId, userId }); // Debug log

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

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Failed to reject connection request" 
      });
    }

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
   GET MY CONNECTIONS
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