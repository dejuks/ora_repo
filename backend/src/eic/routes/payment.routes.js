import express from 'express';
import {
     getAllPayments,
  getPaymentById,
  getPaymentByManuscript,
  uploadPaymentReceipt,
  updatePaymentStatus,
  getPaymentStats,
  getOverduePayments,createPayment,generateManuscriptInvoice

 } from '../controllers/payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.get('/manuscript/:manuscriptId/generate-invoice',generateManuscriptInvoice);
router.put("/manuscript/update/:id/status", updatePaymentStatus);

// Public routes (authenticated users)
router.get("/manuscript/all", getAllPayments);
router.get("/stats", getPaymentStats);
router.get("/overdue", getOverduePayments);
router.get("/:id", getPaymentById);
router.get("/manuscript/:manuscriptId", getPaymentByManuscript);
// Get payment details by manuscript ID
router.get('/manuscript/:manuscriptId',getPaymentByManuscript);
// generate-invoice
// Upload payment receipt
router.post('/upload-receipt', uploadPaymentReceipt);

// // Routes that require specific roles
router.post("/create", createPayment);
router.patch("/:id/status", updatePaymentStatus);
// router.delete("/:id",  deletePayment);

export default router;