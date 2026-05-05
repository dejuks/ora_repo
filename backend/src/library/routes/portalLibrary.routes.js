
import express from 'express';
import {
  adminDashboard,
  librarianSummary,
  memberOverview,
  overdueLoans,
  listResource,
  getResource,
  createResource,
  updateResource,
  removeResource,
  fulfillHold,
  payFine,
} from '../controllers/portalLibrary.controller.js';

const router = express.Router();

// Canonical portal routes
router.get('/admin/dashboard', adminDashboard);
router.get('/librarian/summary', librarianSummary);
router.get('/member/overview', memberOverview);
router.get('/reports/overdue-loans', overdueLoans);
router.patch('/holds/:holdId/fulfill', fulfillHold);
router.post('/fines/:fineId/pay', payFine);
router.get('/resources/:resource', listResource);
router.get('/resources/:resource/:id', getResource);
router.post('/resources/:resource', createResource);
router.patch('/resources/:resource/:id', updateResource);
router.put('/resources/:resource/:id', updateResource);
router.delete('/resources/:resource/:id', removeResource);

// Backward-compatible aliases to prevent frontend 404s
router.get('/dashboard/admin', adminDashboard);
router.get('/summary/librarian', librarianSummary);
router.get('/overview/member', memberOverview);
router.get('/overdue-loans', overdueLoans);
router.patch('/hold-requests/:holdId/fulfill', fulfillHold);
router.post('/fine-payments/:fineId/pay', payFine);
router.get('/crud/:resource', listResource);
router.get('/crud/:resource/:id', getResource);
router.post('/crud/:resource', createResource);
router.patch('/crud/:resource/:id', updateResource);
router.put('/crud/:resource/:id', updateResource);
router.delete('/crud/:resource/:id', removeResource);

export default router;
