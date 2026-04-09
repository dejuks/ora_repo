
import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import physicalLibraryRoutes from './physicalLibrary.routes.js';
import digitalLibraryRoutes from './digitalLibrary.routes.js';
import portalLibraryRoutes from './portalLibrary.routes.js';
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
<<<<<<< HEAD

// Public OPAC access
router.use('/catalog', catalogRoutes);

// router.use(authenticate);
// router.use(resolveLibraryPermission);
=======
router.use(authenticate);
>>>>>>> origin/tbranch

// Canonical mounted routes
router.use('/physical-library', physicalLibraryRoutes);
router.use('/digital-library', digitalLibraryRoutes);
router.use('/portal', portalLibraryRoutes);

// Real top-level aliases used by frontend to avoid route-not-found errors
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

// Legacy convenience aliases still supported
router.get('/audit-logs', (req, res, next) => { req.params.resource = 'audit-logs'; return listResource(req, res, next); });
router.get('/audit-logs/security-alerts', async (req, res) => {
  req.params.resource = 'audit-logs';
  req.query = { ...(req.query || {}), search: req.query?.search || 'error' };
  return listResource(req, res);
});

export default router;
