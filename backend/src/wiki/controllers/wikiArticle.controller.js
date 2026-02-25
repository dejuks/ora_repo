import { 
  createArticle,
  getArticles as getArticlesService,
  getArticleBySlug as getArticleBySlugService,
  getArticleById as getArticleByIdService,
  updateArticle as updateArticleService,
  deleteArticle as deleteArticleService,
  restoreArticle as restoreArticleService,
  permanentlyDeleteArticle as permanentlyDeleteArticleService,
  getArticleRevisions as getArticleRevisionsService,
  getRevisionById as getRevisionByIdService,
  revertToRevision as revertToRevisionService,
  getPendingReviews as getPendingReviewsService,
  reviewArticle as reviewArticleService,
  getVandalismReports as getVandalismReportsService
} from '../models/wikiArticle.model.js';
import { getClientIp } from '../../utils/ipHelper.js';

// Get all articles with filters
export const getArticles = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      author: req.query.author,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };
    
    const articles = await getArticlesService(filters);
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error("❌ Get articles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles"
    });
  }
};

// Get article by slug (public)
export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const ipAddress = getClientIp(req);
    
    const article = await getArticleBySlugService(slug, ipAddress);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error("❌ Get article by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article"
    });
  }
};

// Get article by ID
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await getArticleByIdService(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error("❌ Get article by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article"
    });
  }
};

// Create new article
export const createNewArticle = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    const ipAddress = getClientIp(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const articleData = req.body;

    if (!articleData.title) {
      return res.status(400).json({
        success: false,
        message: "Article title is required"
      });
    }

    const article = await createArticle(articleData, userId, ipAddress);

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article
    });

  } catch (error) {
    console.error("❌ Create article error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create article"
    });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;
    const ipAddress = getClientIp(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const articleData = req.body;
    
    const article = await updateArticleService(id, articleData, userId, ipAddress);

    res.json({
      success: true,
      message: "Article updated successfully",
      data: article
    });

  } catch (error) {
    console.error("❌ Update article error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update article"
    });
  }
};

// Soft delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || req.user?.role === 'sysop';
    
    await deleteArticleService(id, userId, isAdmin);

    res.json({
      success: true,
      message: "Article deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete article error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete article"
    });
  }
};

// Admin: Restore article
export const restoreArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || req.user?.role === 'sysop';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    
    await restoreArticleService(id, userId);

    res.json({
      success: true,
      message: "Article restored successfully"
    });

  } catch (error) {
    console.error("❌ Restore article error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to restore article"
    });
  }
};

// Admin: Permanently delete article
export const permanentlyDeleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || req.user?.role === 'sysop';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    
    await permanentlyDeleteArticleService(id);

    res.json({
      success: true,
      message: "Article permanently deleted"
    });

  } catch (error) {
    console.error("❌ Permanent delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to permanently delete article"
    });
  }
};

// Get article revisions
export const getArticleRevisions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const revisions = await getArticleRevisionsService(id);
    
    res.json({
      success: true,
      data: revisions
    });

  } catch (error) {
    console.error("❌ Get revisions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revisions"
    });
  }
};

// Get specific revision
export const getRevisionById = async (req, res) => {
  try {
    const { articleId, revisionId } = req.params;
    
    const revision = await getRevisionByIdService(articleId, revisionId);
    
    if (!revision) {
      return res.status(404).json({
        success: false,
        message: "Revision not found"
      });
    }
    
    res.json({
      success: true,
      data: revision
    });

  } catch (error) {
    console.error("❌ Get revision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revision"
    });
  }
};

// Revert to revision
export const revertToRevision = async (req, res) => {
  try {
    const { articleId, revisionId } = req.params;
    const userId = req.user?.uuid;
    const ipAddress = getClientIp(req);
    
    const article = await revertToRevisionService(articleId, revisionId, userId, ipAddress);
    
    res.json({
      success: true,
      message: "Article reverted successfully",
      data: article
    });

  } catch (error) {
    console.error("❌ Revert error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to revert article"
    });
  }
};

// Get pending reviews
export const getPendingReviews = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || req.user?.role === 'sysop';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    
    const reviews = await getPendingReviewsService();
    
    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error("❌ Get pending reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending reviews"
    });
  }
};

// Review article
export const reviewArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;
    const userId = req.user?.uuid;
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || req.user?.role === 'sysop';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    
    await reviewArticleService(id, userId, action, comments);
    
    res.json({
      success: true,
      message: `Article ${action} successfully`
    });

  } catch (error) {
    console.error("❌ Review article error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to review article"
    });
  }
};

// Get vandalism reports
export const getVandalismReports = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || req.user?.role === 'sysop';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    
    const reports = await getVandalismReportsService(status);
    
    res.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("❌ Get vandalism reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vandalism reports"
    });
  }
};
