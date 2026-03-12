import pool from '../../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for receipt upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  }
}).single('receipt');

/* =====================================================
   GET PAYMENT BY MANUSCRIPT ID
===================================================== */
export const getPaymentByManuscript = async (req, res) => {
  try {
    const { manuscriptId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.manuscript_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.payment_type,
        p.payment_reference,
        p.due_date,
        p.status,
        p.notes,
        p.phone_number,
        p.bank_name,
        p.account_number,
        p.transaction_reference,
        p.receipt_path,
        p.created_at,
        p.paid_at,
        u.full_name as created_by_name,
        u.email as created_by_email,
        m.title as manuscript_title,
        m.current_stage_id
      FROM payments p
      LEFT JOIN users u ON u.uuid = p.created_by
      JOIN manuscripts m ON m.id = p.manuscript_id
      WHERE p.manuscript_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1
      `,
      [manuscriptId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "No payment found for this manuscript" 
      });
    }

    const payment = result.rows[0];
    
    // Add receipt URL if exists
    if (payment.receipt_path) {
      payment.receipt_url = `http://localhost:5000/${payment.receipt_path}`;
    }

    res.json({
      success: true,
      payment: payment
    });

  } catch (err) {
    console.error("Get payment error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

/* =====================================================
   GET OVERDUE PAYMENTS
===================================================== */
export const getOverduePayments = async (req, res) => {
  try {
    // Update overdue status first
    await pool.query(
      `
      UPDATE payments 
      SET status = 'overdue',
          updated_at = NOW()
      WHERE status = 'pending' 
      AND due_date < CURRENT_DATE
      `
    );

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.payment_reference,
        p.amount,
        p.currency,
        p.due_date,
        p.author_name,
        p.author_email,
        p.manuscript_title,
        p.phone_number,
        p.payment_method
      FROM payments p
      WHERE p.status = 'overdue'
      ORDER BY p.due_date ASC
      `
    );

    res.json({
      success: true,
      overdue_payments: result.rows,
    });
  } catch (err) {
    console.error("Get overdue payments error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =====================================================
   GET PAYMENT BY ID
===================================================== */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.manuscript_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.payment_type,
        p.payment_reference,
        p.due_date,
        p.status,
        p.transaction_reference,
        p.bank_name,
        p.account_number,
        p.phone_number,
        p.receipt_path,
        p.created_at,
        p.paid_at,
        p.notes,
        p.author_name,
        p.author_email,
        p.manuscript_title,
        u.full_name as created_by_name,
        u.email as created_by_email,
        m.title as manuscript_title,
        m.current_stage_id
      FROM payments p
      LEFT JOIN users u ON u.uuid = p.created_by
      LEFT JOIN manuscripts m ON m.id = p.manuscript_id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    const payment = result.rows[0];
    if (payment.receipt_path) {
      payment.receipt_url = `http://localhost:5000/${payment.receipt_path}`;
    }

    res.json({
      success: true,
      payment: payment,
    });
  } catch (err) {
    console.error("Get payment by id error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
/* =====================================================
   GET PAYMENT STATISTICS
===================================================== */
export const getPaymentStats = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END), 0) as total_outstanding,
        COALESCE(AVG(amount), 0) as average_amount
      FROM payments
      `
    );

    res.json({
      success: true,
      stats: result.rows[0],
    });
  } catch (err) {
    console.error("Get payment stats error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
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
   CREATE PAYMENT ORDER
===================================================== */
export const createPayment = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      manuscript_id,
      amount,
      currency,
      payment_method,
      payment_type,
      due_date,
      notes,
      phone_number,
      bank_name,
      account_number,
      author_name,
      author_email,
      manuscript_title,
    } = req.body;

    const eicId = req.user.uuid;

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await client.query(
      `
      INSERT INTO payments (
        manuscript_id,
        amount,
        currency,
        payment_method,
        payment_type,
        payment_reference,
        due_date,
        status,
        notes,
        phone_number,
        bank_name,
        account_number,
        created_by,
        created_at,
        author_name,
        author_email,
        manuscript_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, NOW(), $13, $14, $15)
      RETURNING id, payment_reference, amount, due_date, status
      `,
      [
        manuscript_id,
        amount,
        currency || "ETB",
        payment_method,
        payment_type || "publication_fee",
        paymentReference,
        due_date,
        notes || null,
        phone_number || null,
        bank_name || null,
        account_number || null,
        eicId,
        author_name || null,
        author_email || null,
        manuscript_title || null,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      payment: result.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create payment error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
/* =====================================================
   UPLOAD PAYMENT RECEIPT
===================================================== */
export const uploadPaymentReceipt = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // Handle file upload with multer
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false,
          error: err.message 
        });
      }

      const { payment_id, manuscript_id } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ 
          success: false,
          error: "No file uploaded" 
        });
      }

      if (!payment_id || !manuscript_id) {
        return res.status(400).json({ 
          success: false,
          error: "Payment ID and Manuscript ID are required" 
        });
      }

      // Update payment with receipt path and mark as paid
      const updateResult = await client.query(
        `
        UPDATE payments 
        SET receipt_path = $2,
            status = 'paid',
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, status, receipt_path
        `,
        [payment_id, file.path]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: "Payment not found" 
        });
      }

      // Find PUBLISHED stage ID from workflow_stages
      const stageResult = await client.query(
        `SELECT id FROM workflow_stages WHERE name = 'PUBLISHED'  LIMIT 1`
      );
      
      const publishedStageId = stageResult.rows[0]?.id || 7;

      // Update manuscript to published stage
      await client.query(
        `
        UPDATE manuscripts 
        SET current_stage_id = $2,
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        `,
        [manuscript_id, publishedStageId]
      );

      // Record in stage history
      try {
        await client.query(
          `
          INSERT INTO manuscript_stage_history (
            manuscript_id,
            new_stage_id,
            changed_by,
            changed_at,
            comment
          ) VALUES ($1, $2, $3, NOW(), $4)
          `,
          [
            manuscript_id,
            publishedStageId,
            req.user.uuid,
            JSON.stringify({ 
              payment_id, 
              receipt_path: file.path 
            })
          ]
        );
      } catch (historyErr) {
        console.log("Stage history error:", historyErr.message);
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Payment receipt uploaded and manuscript published",
        payment_id: payment_id,
        receipt_path: file.path,
        receipt_url: `http://localhost:5000/${file.path}`
      });

    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Upload receipt error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET ALL PAYMENTS (for admin)
===================================================== */
export const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.manuscript_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.payment_reference,
        p.due_date,
        p.status,
        p.created_at,
        p.paid_at,
        m.title as manuscript_title,
        u.full_name as author_name
      FROM payments p
      JOIN manuscripts m ON m.id = p.manuscript_id
      JOIN users u ON u.uuid = m.corresponding_author_id
      ORDER BY p.created_at DESC
      `
    );

    res.json({
      success: true,
      payments: result.rows
    });

  } catch (err) {
    console.error("Get all payments error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

