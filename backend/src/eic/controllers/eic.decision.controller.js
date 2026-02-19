import pool from "../../config/db.js";

/* =====================================================
   GET COMPLETED REVIEWS FOR EIC DECISION
   Manuscripts that have completed peer review
===================================================== */
export const getCompletedReviews = async (req, res) => {
  try {
    // First, let's check what statuses exist
    const statusCheck = await pool.query(`
      SELECT DISTINCT status FROM manuscripts
    `);
    console.log("Available statuses:", statusCheck.rows);

    const result = await pool.query(
      `
      SELECT 
        m.id,
        m.title,
        m.abstract,
        m.keywords,
        m.status,
        m.submitted_at,
        m.created_at,
        m.updated_at,
        m.recommendation as ae_recommendation,
        u.full_name as author_name,
        u.email as author_email,
        
        -- Review statistics
        (
          SELECT COUNT(*) 
          FROM review_assignments ra2 
          WHERE ra2.manuscript_id = m.id 
          AND ra2.review_status = 'submitted'
        ) as completed_reviews_count,
        
        (
          SELECT COUNT(*) 
          FROM review_assignments ra3 
          WHERE ra3.manuscript_id = m.id
        ) as total_reviews_count,
        
        -- Get all review recommendations (as JSON)
        (
          SELECT json_agg(
            json_build_object(
              'reviewer_name', rev.full_name,
              'recommendation', ra.review_recommendation,
              'comments', ra.review_comments,
              'submitted_at', ra.submitted_at
            )
          )
          FROM review_assignments ra
          JOIN users rev ON rev.uuid = ra.reviewer_id
          WHERE ra.manuscript_id = m.id 
          AND ra.review_status = 'submitted'
        ) as review_details,
        
        -- Get assigned editor info (as JSON)
        (
          SELECT row_to_json(editor_data)
          FROM (
            SELECT 
              ed.full_name as name,
              ed.email,
              ed.uuid
            FROM users ed
            WHERE ed.uuid = m.assigned_editor_id
          ) editor_data
        ) as assigned_editor

      FROM manuscripts m
      LEFT JOIN users u ON u.uuid = m.corresponding_author_id
      
      WHERE m.status IN ('under_review', 'completed')
        AND EXISTS (
          SELECT 1 
          FROM review_assignments ra 
          WHERE ra.manuscript_id = m.id 
          AND ra.review_status = 'completed'
        )
      ORDER BY m.updated_at DESC
      `
    );

    // Transform the data
    const transformedData = result.rows.map(row => ({
      id: row.id,
      uuid: row.uuid,
      title: row.title,
      abstract: row.abstract,
      keywords: row.keywords,
      status: row.status,
      status_label: getStatusLabel(row.status),
      submitted_at: row.submitted_at,
      created_at: row.created_at,
      author_name: row.author_name || 'Unknown',
      author_email: row.author_email,
      author_affiliation: row.author_affiliation,
      ae_recommendation: row.ae_recommendation,
      assigned_editor: row.assigned_editor,
      completed_reviews: parseInt(row.completed_reviews_count) || 0,
      total_reviews: parseInt(row.total_reviews_count) || 0,
      review_details: row.review_details || [],
      can_make_decision: parseInt(row.completed_reviews_count) > 0
    }));

    res.json(transformedData);
  } catch (err) {
    console.error("Get completed reviews error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to get friendly status label
const getStatusLabel = (status) => {
  const labels = {
    'submitted': 'Submitted',
    'screening': 'Initial Screening',
    'screened': 'Screened',
    'review': 'Under Review',
    'under_review': 'Under Review',
    'completed': 'Reviews Completed',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'revision_required': 'Revision Required',
    'published': 'Published'
  };
  return labels[status] || status;
};

/* =====================================================
   GET SINGLE MANUSCRIPT WITH ALL REVIEWS FOR DECISION
===================================================== */
export const getManuscriptForDecision = async (req, res) => {
  try {
    const { id } = req.params;

    // Get manuscript details
    const manuscriptResult = await pool.query(
      `
      SELECT 
        m.id,
        m.title,
        m.abstract,
        m.keywords,
        m.status,
        m.submitted_at,
        m.created_at,
        m.updated_at,
        m.recommendation as ae_recommendation,
        u.full_name as author_name,
        u.email as author_email,
        ae.full_name as assigned_editor_name,
        ae.email as assigned_editor_email,
        f.file_path as manuscript_file
      FROM manuscripts m
      LEFT JOIN users u ON u.uuid = m.corresponding_author_id
      LEFT JOIN users ae ON ae.uuid = m.assigned_editor_id
      LEFT JOIN files f ON f.manuscript_id = m.id
      WHERE m.id = $1 
      `,
      [id]
    );

    if (manuscriptResult.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    const manuscript = manuscriptResult.rows[0];

    // Get all completed reviews for this manuscript
    const reviewsResult = await pool.query(
      `
      SELECT 
        ra.id,
        ra.review_recommendation as recommendation,
        ra.review_comments as comments,
        ra.review_file_path as file_path,
        ra.submitted_at,
        ra.created_at,
        u.full_name as reviewer_name,
        u.email as reviewer_email
      FROM review_assignments ra
      JOIN users u ON u.uuid = ra.reviewer_id
      WHERE ra.manuscript_id = $1 
        AND ra.review_status = 'submitted'
      ORDER BY ra.submitted_at DESC
      `,
      [manuscript.id]
    );

    // Get decision history if any
    const decisionsResult = await pool.query(
      `
      SELECT 
        d.id,
        d.decision,
        d.decision_comment,
        d.decision_date,
        u.full_name as decided_by_name,
        u.email as decided_by_email
      FROM decisions d
      JOIN users u ON u.uuid = d.decision_by
      WHERE d.manuscript_id = $1
      ORDER BY d.decision_date DESC
      `,
      [manuscript.id]
    );

    // Calculate review summary
    const recommendations = {
      accept: 0,
      minor_revision: 0,
      major_revision: 0,
      reject: 0
    };

    reviewsResult.rows.forEach(review => {
      if (review.recommendation === 'accept') recommendations.accept++;
      else if (review.recommendation === 'minor_revision') recommendations.minor_revision++;
      else if (review.recommendation === 'major_revision') recommendations.major_revision++;
      else if (review.recommendation === 'reject') recommendations.reject++;
    });

    const response = {
      ...manuscript,
      reviews: reviewsResult.rows,
      decisions: decisionsResult.rows,
      review_summary: {
        total_completed: reviewsResult.rows.length,
        recommendations
      }
    };

    res.json(response);
  } catch (err) {
    console.error("Get manuscript for decision error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   MAKE FINAL DECISION ON MANUSCRIPT
===================================================== */
export const makeDecision = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { decision, decision_comment } = req.body;
    const eicId = req.user.uuid;

    // Validate decision
    const validDecisions = ['accept', 'reject', 'revision'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: "Invalid decision" });
    }

    // Check if manuscript exists
    const manuscriptCheck = await client.query(
      `
      SELECT id, status, title 
      FROM manuscripts 
      WHERE id = $1
      `,
      [id]
    );

    if (manuscriptCheck.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    const manuscript = manuscriptCheck.rows[0];

    // Check if manuscript already has a decision
    const decisionCheck = await client.query(
      `SELECT id FROM decisions WHERE manuscript_id = $1`,
      [manuscript.id]
    );

    if (decisionCheck.rows.length > 0) {
      return res.status(400).json({ error: "Decision already made for this manuscript" });
    }

    // Insert the decision
    await client.query(
      `
      INSERT INTO decisions (
        manuscript_id, 
        decision, 
        decision_by, 
        decision_comment, 
        decision_date
      ) VALUES ($1, $2, $3, $4, NOW())
      `,
      [manuscript.id, decision, eicId, decision_comment]
    );

    // Update manuscript status based on decision
    let newStatus;
    if (decision === 'accept') {
      newStatus = 'accepted';
    } else if (decision === 'reject') {
      newStatus = 'rejected';
    } else if (decision === 'revision') {
      newStatus = 'revision_required';
    }

    await client.query(
      `
      UPDATE manuscripts 
      SET status = $2, 
          updated_at = NOW(),
          decision_date = NOW()
      WHERE id = $1
      `,
      [manuscript.id, newStatus]
    );

    // Record in stage history if table exists
    try {
      await client.query(
        `
        INSERT INTO manuscript_stage_history (
          manuscript_id,
          stage,
          changed_by,
          changed_at,
          comments
        ) VALUES ($1, $2, $3, NOW(), $4)
        `,
        [manuscript.id, newStatus, eicId, `Decision made: ${decision}`]
      );
    } catch (historyErr) {
      console.log("Stage history table might not exist:", historyErr.message);
      // Continue even if stage history fails
    }

    await client.query("COMMIT");

    res.json({ 
      message: `Decision '${decision}' recorded successfully`,
      manuscript_id: manuscript.id,
      new_status: newStatus
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Make decision error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET DECISION HISTORY FOR MANUSCRIPT
===================================================== */
export const getDecisionHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        d.id,
        d.decision,
        d.decision_comment,
        d.decision_date,
        u.full_name as decided_by,
        u.email as decided_by_email,
        m.title as manuscript_title
      FROM decisions d
      JOIN users u ON u.uuid = d.decision_by
      JOIN manuscripts m ON m.id = d.manuscript_id
      WHERE d.manuscript_id = $1 
      ORDER BY d.decision_date DESC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get decision history error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET DECISION STATISTICS FOR EIC DASHBOARD
===================================================== */
export const getDecisionStats = async (req, res) => {
  try {
    const stats = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT m.id) as total_manuscripts,
        
        COUNT(DISTINCT CASE 
          WHEN m.status IN ('review', 'under_review', 'completed')
          AND EXISTS (
            SELECT 1 FROM review_assignments ra 
            WHERE ra.manuscript_id = m.id 
            AND ra.review_status = 'submitted'
          )
          THEN m.id 
        END) as pending_decision,
        
        COUNT(DISTINCT CASE 
          WHEN d.decision = 'accept' THEN m.id 
        END) as accepted_count,
        
        COUNT(DISTINCT CASE 
          WHEN d.decision = 'reject' THEN m.id 
        END) as rejected_count,
        
        COUNT(DISTINCT CASE 
          WHEN d.decision = 'revision' THEN m.id 
        END) as revision_count,
        
        ROUND(AVG(CASE 
          WHEN d.decision_date IS NOT NULL 
          THEN EXTRACT(DAY FROM (d.decision_date - m.submitted_at))
        END)) as avg_days_to_decision
        
      FROM manuscripts m
      LEFT JOIN decisions d ON d.manuscript_id = m.id
      `
    );

    res.json(stats.rows[0]);
  } catch (err) {
    console.error("Get decision stats error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET ALL DECISIONS (for reporting)
===================================================== */
export const getAllDecisions = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        d.id,
        d.decision,
        d.decision_comment,
        d.decision_date,
        m.title as manuscript_title,
        author.full_name as author_name,
        editor.full_name as decided_by_name,
        d.decision_by as decided_by_id
      FROM decisions d
      JOIN manuscripts m ON m.id = d.manuscript_id
      JOIN users author ON author.uuid = m.corresponding_author_id
      JOIN users editor ON editor.uuid = d.decision_by
      ORDER BY d.decision_date DESC
      LIMIT 100
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get all decisions error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   INITIATE PAYMENT FOR ACCEPTED MANUSCRIPT
===================================================== */
export const initiatePayment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const { manuscriptId } = req.params;
    const { amount, payment_method, due_date, notes } = req.body;
    const eicId = req.user.uuid;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!payment_method) { 
      return res.status(400).json({ error: "Payment method is required" });
    }

    if (!due_date) {
      return res.status(400).json({ error: "Due date is required" });
    }

    // Check if manuscript exists and is accepted
    const manuscriptCheck = await client.query(
      `
      SELECT id, title, status, corresponding_author_id
      FROM manuscripts 
      WHERE id = $1
      `,
      [manuscriptId]
    );

    if (manuscriptCheck.rows.length === 0) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    const manuscript = manuscriptCheck.rows[0];

    // Check if manuscript status is accepted
    if (manuscript.status !== 'accepted') {
      return res.status(400).json({ 
        error: "Manuscript must be accepted before creating payment",
        current_status: manuscript.status
      });
    }

    // Check if payment already exists
    const paymentCheck = await client.query(
      `SELECT id FROM payments WHERE manuscript_id = $1 AND status IN ('pending', 'paid')`,
      [manuscript.id]
    );

    if (paymentCheck.rows.length > 0) {
      return res.status(400).json({ error: "Payment already exists for this manuscript" });
    }

    // Insert payment record
    const paymentResult = await client.query(
      `
      INSERT INTO payments (
        manuscript_id,
        amount,
        payment_method,
        due_date,
        status,
        created_by,
        created_at
      ) VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
      RETURNING id, amount, payment_method, due_date, status, created_at
      `,
      [manuscript.id, amount, payment_method, due_date, eicId]
    );

    const payment = paymentResult.rows[0];

    // Update manuscript status to 'payment_pending'
    await client.query(
      `
      UPDATE manuscripts 
      SET status = 'payment_pending', 
          updated_at = NOW()
      WHERE id = $1
      `,
      [manuscript.id]
    );

    // Record in manuscript history if table exists
    try {
      await client.query(
        `
        INSERT INTO manuscript_stage_history (
          manuscript_id,
          stage,
          changed_by,
          changed_at,
          comments
        ) VALUES ($1, $2, $3, NOW(), $4)
        `,
        [manuscript.id, 'payment_pending', eicId, `Payment initiated: ${amount} ${payment_method}`]
      );
    } catch (historyErr) {
      console.log("Stage history table might not exist:", historyErr.message);
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      payment_id: payment.id,
      payment: {
        id: payment.id,
        amount: parseFloat(payment.amount),
        payment_method: payment.payment_method,
        due_date: payment.due_date,
        status: payment.status,
        created_at: payment.created_at
      }
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Initiate payment error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET PAYMENTS FOR A MANUSCRIPT
===================================================== */
export const getManuscriptPayments = async (req, res) => {
  try {
    const { manuscriptId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.amount,
        p.payment_method,
        p.due_date,
        p.status,
        p.created_at,
        p.paid_at,
        u.full_name as created_by_name
      FROM payments p
      LEFT JOIN users u ON u.uuid = p.created_by
      WHERE p.manuscript_id = $1
      ORDER BY p.created_at DESC
      `,
      [manuscriptId]
    );

    res.json({
      success: true,
      payments: result.rows
    });

  } catch (err) {
    console.error("Get manuscript payments error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET ALL PENDING PAYMENTS (for EIC dashboard)
===================================================== */
export const getPendingPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.amount,
        p.payment_method,
        p.due_date,
        p.status,
        p.created_at,
        p.paid_at,
        m.id as manuscript_id,
        m.title as manuscript_title,
        u.full_name as author_name,
        u.email as author_email
      FROM payments p
      JOIN manuscripts m ON m.id = p.manuscript_id
      JOIN users u ON u.uuid = m.corresponding_author_id
      WHERE p.status = 'pending'
      ORDER BY p.due_date ASC
      `
    );

    res.json({
      success: true,
      payments: result.rows
    });

  } catch (err) {
    console.error("Get pending payments error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   UPDATE PAYMENT STATUS (mark as paid)
===================================================== */
export const updatePaymentStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const { paymentId } = req.params;
    const { status } = req.body;
    const userId = req.user.uuid;

    // Validate status
    const validStatuses = ['paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check if payment exists
    const paymentCheck = await client.query(
      `
      SELECT p.*, m.corresponding_author_id
      FROM payments p
      JOIN manuscripts m ON m.id = p.manuscript_id
      WHERE p.id = $1
      `,
      [paymentId]
    );

    if (paymentCheck.rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = paymentCheck.rows[0];

    // Update payment
    await client.query(
      `
      UPDATE payments 
      SET status = $2,
          paid_at = CASE WHEN $2 = 'paid' THEN NOW() ELSE NULL END,
          updated_at = NOW()
      WHERE id = $1
      `,
      [paymentId, status]
    );

    // If payment is marked as paid, update manuscript status to 'published'
    if (status === 'paid') {
      await client.query(
        `
        UPDATE manuscripts 
        SET status = 'published',
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        `,
        [payment.manuscript_id]
      );

      // Record in manuscript history
      try {
        await client.query(
          `
          INSERT INTO manuscript_stage_history (
            manuscript_id,
            stage,
            changed_by,
            changed_at,
            comments
          ) VALUES ($1, $2, $3, NOW(), $4)
          `,
          [payment.manuscript_id, 'published', userId, 'Payment received, manuscript published']
        );
      } catch (historyErr) {
        console.log("Stage history error:", historyErr.message);
      }
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Payment marked as ${status}`,
      payment_id: paymentId,
      status: status
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update payment error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET PAYMENT STATISTICS
===================================================== */
export const getPaymentStats = async (req, res) => {
  try {
    const stats = await pool.query(
      `
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END), 0) as total_outstanding
      FROM payments
      `
    );

    res.json({
      success: true,
      stats: stats.rows[0]
    });

  } catch (err) {
    console.error("Get payment stats error:", err);
    res.status(500).json({ error: err.message });
  }
};