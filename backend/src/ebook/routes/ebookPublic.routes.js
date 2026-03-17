import express from "express";
import { ebookWorkflowService } from "../services/ebookWorkflow.service.js";

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/publications', asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.publicCatalog(req.query || {}));
}));

router.get('/publications/:slug', asyncHandler(async (req, res) => {
  const catalog = await ebookWorkflowService.publicCatalog({ search: req.params.slug, limit: 20 });
  const row = catalog.rows.find((item) => item.slug === req.params.slug) || null;
  if (!row) {
    const error = new Error('Publication not found');
    error.status = 404;
    throw error;
  }
  await ebookWorkflowService.logPublicAccess(row.publication_id, {
    event_type: 'view',
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    actor_id: null,
  });
  res.json(row);
}));

export default router;
