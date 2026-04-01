// routes/public.routes.js
import express from "express";
import { ebookWorkflowService } from "../services/ebookWorkflow.service.js";

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// ==================== PUBLIC EBOOK ENDPOINTS ====================

/**
 * GET /public/ebooks
 * List all published ebooks with filtering
 */
router.get('/ebooks', asyncHandler(async (req, res) => {
  const { limit = 20, page = 1, search, category, language, sort } = req.query;
  
  const catalog = await ebookWorkflowService.publicCatalog({
    limit: parseInt(limit),
    page: parseInt(page),
    search,
    category,
    language,
    sort
  });
  
  res.json(catalog);
}));

/**
 * GET /public/ebooks/trending
 * Get trending ebooks (most downloaded and highly rated)
 */
router.get('/ebooks/trending', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  // Get trending books based on downloads and rating
  const trending = await ebookWorkflowService.getTrendingEbooks({
    limit: parseInt(limit)
  });
  
  res.json({ rows: trending, total: trending.length });
}));

/**
 * GET /public/ebooks/new-releases
 * Get new releases (most recently published)
 */
router.get('/ebooks/new-releases', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const releases = await ebookWorkflowService.getNewReleases({
    limit: parseInt(limit)
  });
  
  res.json({ rows: releases, total: releases.length });
}));

/**
 * GET /public/ebooks/featured
 * Get featured ebooks (curated by editors)
 */
router.get('/ebooks/featured', asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;
  
  const featured = await ebookWorkflowService.getFeaturedEbooks({
    limit: parseInt(limit)
  });
  
  res.json({ rows: featured, total: featured.length });
}));

/**
 * GET /public/ebooks/:id
 * Get single publication by ID or slug
 */
router.get('/ebooks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  let publication;
  
  // Try to find by ID first, then by slug
  if (!isNaN(id)) {
    publication = await ebookWorkflowService.getPublicationById(parseInt(id));
  } else {
    publication = await ebookWorkflowService.getPublicationBySlug(id);
  }
  
  if (!publication) {
    const error = new Error('Publication not found');
    error.status = 404;
    throw error;
  }
  
  // Log public access
  await ebookWorkflowService.logPublicAccess(publication.publication_id, {
    event_type: 'view',
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    actor_id: null,
  });
  
  res.json(publication);
}));

/**
 * POST /public/ebooks/:id/track-download
 * Track download (no auth required)
 */
router.post('/ebooks/:id/track-download', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format } = req.body;
  
  await ebookWorkflowService.logPublicAccess(id, {
    event_type: 'download',
    format: format || 'pdf',
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    actor_id: null,
  });
  
  res.json({ success: true });
}));

/**
 * GET /public/ebooks/:id/download
 * Download ebook file
 */
router.get('/ebooks/:id/download', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'pdf' } = req.query;
  
  const fileInfo = await ebookWorkflowService.getEbookFile(id, format);
  
  if (!fileInfo || !fileInfo.file_path) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }
  
  res.setHeader('Content-Type', fileInfo.mime_type || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
  
  res.sendFile(fileInfo.file_path);
}));

/**
 * GET /public/ebooks/:id/stream
 * Stream ebook for online reading
 */
router.get('/ebooks/:id/stream', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'pdf' } = req.query;
  
  const fileInfo = await ebookWorkflowService.getEbookFile(id, format);
  
  if (!fileInfo || !fileInfo.file_path) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }
  
  const streamUrl = `/public/ebooks/${id}/download?format=${format}&stream=true`;
  
  res.json({ stream_url: streamUrl });
}));

/**
 * GET /public/ebooks/:id/similar
 * Get similar publications
 */
router.get('/ebooks/:id/similar', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;
  
  const similar = await ebookWorkflowService.getSimilarPublications(id, {
    limit: parseInt(limit)
  });
  
  res.json(similar);
}));

/**
 * GET /public/ebooks/:id/share-metadata
 * Get share metadata
 */
router.get('/ebooks/:id/share-metadata', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const metadata = await ebookWorkflowService.getShareMetadata(id);
  
  res.json(metadata);
}));

// ==================== PUBLIC CATEGORY ENDPOINTS ====================

/**
 * GET /public/categories
 * Get all categories with counts
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await ebookWorkflowService.getAllCategories();
  
  res.json(categories);
}));

/**
 * GET /public/categories/:slug/ebooks
 * Get ebooks by category
 */
router.get('/categories/:slug/ebooks', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { limit = 20, page = 1 } = req.query;
  
  const publications = await ebookWorkflowService.getPublicationsByCategory(slug, {
    limit: parseInt(limit),
    page: parseInt(page)
  });
  
  res.json(publications);
}));

// ==================== PUBLIC AUTHOR ENDPOINTS ====================

/**
 * GET /public/authors
 * Get all authors with stats
 */
router.get('/authors', asyncHandler(async (req, res) => {
  const { limit = 20, page = 1, sort = 'downloads' } = req.query;
  
  const authors = await ebookWorkflowService.getAllAuthors({
    limit: parseInt(limit),
    page: parseInt(page),
    sort
  });
  
  res.json(authors);
}));

/**
 * GET /public/authors/top
 * Get top authors
 */
router.get('/authors/top', asyncHandler(async (req, res) => {
  const { limit = 10, sortBy = 'downloads' } = req.query;
  
  const authors = await ebookWorkflowService.getTopAuthors({
    limit: parseInt(limit),
    sortBy
  });
  
  res.json(authors);
}));

/**
 * GET /public/authors/:id
 * Get author details
 */
router.get('/authors/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const author = await ebookWorkflowService.getAuthorDetails(id);
  
  if (!author) {
    const error = new Error('Author not found');
    error.status = 404;
    throw error;
  }
  
  res.json(author);
}));

/**
 * GET /public/authors/:id/ebooks
 * Get author's publications
 */
router.get('/authors/:id/ebooks', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 20, page = 1 } = req.query;
  
  const publications = await ebookWorkflowService.getPublicationsByAuthor(id, {
    limit: parseInt(limit),
    page: parseInt(page)
  });
  
  res.json(publications);
}));

// ==================== PUBLIC SEARCH ENDPOINTS ====================

/**
 * GET /public/search
 * Search publications
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit = 20, page = 1, category, language } = req.query;
  
  if (!q) {
    return res.json({ rows: [], total: 0 });
  }
  
  const results = await ebookWorkflowService.searchPublications(q, {
    limit: parseInt(limit),
    page: parseInt(page),
    category,
    language
  });
  
  res.json(results);
}));

// ==================== PUBLIC TAG ENDPOINTS ====================

/**
 * GET /public/tags/popular
 * Get popular tags
 */
router.get('/tags/popular', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  const tags = await ebookWorkflowService.getPopularTags({
    limit: parseInt(limit)
  });
  
  res.json(tags);
}));

/**
 * GET /public/tags/:tag/ebooks
 * Get ebooks by tag
 */
router.get('/tags/:tag/ebooks', asyncHandler(async (req, res) => {
  const { tag } = req.params;
  const { limit = 20, page = 1 } = req.query;
  
  const publications = await ebookWorkflowService.getPublicationsByTag(tag, {
    limit: parseInt(limit),
    page: parseInt(page)
  });
  
  res.json(publications);
}));

// ==================== PUBLIC STATS ENDPOINTS ====================

/**
 * GET /public/stats
 * Get public statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await ebookWorkflowService.getPublicStats();
  
  res.json(stats);
}));

/**
 * GET /public/language-stats
 * Get language statistics
 */
router.get('/language-stats', asyncHandler(async (req, res) => {
  const stats = await ebookWorkflowService.getLanguageStats();
  
  res.json(stats);
}));

/**
 * GET /public/timeline
 * Get publication timeline
 */
router.get('/timeline', asyncHandler(async (req, res) => {
  const timeline = await ebookWorkflowService.getPublicationTimeline();
  
  res.json(timeline);
}));

/**
 * GET /public/activity
 * Get recent activity
 */
router.get('/activity', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  const activity = await ebookWorkflowService.getRecentActivity({
    limit: parseInt(limit)
  });
  
  res.json(activity);
}));

/**
 * GET /public/reading-stats
 * Get reading statistics
 */
router.get('/reading-stats', asyncHandler(async (req, res) => {
  const stats = await ebookWorkflowService.getReadingStats();
  
  res.json(stats);
}));

// ==================== PUBLIC NEWSLETTER ENDPOINTS ====================

/**
 * POST /public/newsletter/subscribe
 * Subscribe to newsletter (public)
 */
router.post('/newsletter/subscribe', asyncHandler(async (req, res) => {
  const { email, preferences } = req.body;
  
  if (!email) {
    const error = new Error('Email is required');
    error.status = 400;
    throw error;
  }
  
  const result = await ebookWorkflowService.subscribeNewsletter(email, {
    preferences,
    source: 'public_website',
    ip_address: req.ip
  });
  
  res.json({ success: true, message: 'Subscribed successfully!' });
}));

export default router;