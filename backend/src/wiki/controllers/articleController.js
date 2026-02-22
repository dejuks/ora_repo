// controllers/articleController.js
import {
  createArticle,
  getArticleById,
  getArticleBySlug,
  getAllArticles,
  getUserArticles,
  updateArticle,
  deleteArticle,
  permanentlyDeleteArticle,
  restoreArticle,
  incrementViewCount,
  getArticleRevisions,getWikiStatistics
} from "../models/wikiArticle.model.js";

// CREATE: Create new article
export const createNewArticle = async (req, res) => {
  try {
    // IMPORTANT: Get userId from req.user.uuid (matches researcher pattern)
    const userId = req.user?.uuid;
    
    console.log("🔍 User from auth:", req.user);
    console.log("🔍 User ID:", userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const articleData = req.body;

    // Validation
    if (!articleData.title) {
      return res.status(400).json({
        success: false,
        message: "Article title is required"
      });
    }

    console.log("✅ Creating article for user:", userId);

    const article = await createArticle(articleData, userId);

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

// READ: Get article by ID
// controllers/articleController.js

// READ: Get article by ID
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await getArticleById(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    // Increment view count
    await incrementViewCount(id);

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get article"
    });
  }
};

// READ: Get article by slug
export const getArticleBySlugHandler = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = await getArticleBySlug(slug);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    // Increment view count
    await incrementViewCount(article.id);

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error("Get article by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get article"
    });
  }
};

// READ: Get all articles with filters
export const getArticles = async (req, res) => {
  try {
    const {
      status,
      author,
      is_featured,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      status,
      author,
      is_featured: is_featured === 'true',
      search
    };

    const result = await getAllArticles(filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get articles"
    });
  }
};

// READ: Get current user's articles
export const getMyArticles = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const articles = await getUserArticles(userId);

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error("Get my articles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your articles"
    });
  }
};

// UPDATE: Update article
export const updateArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.uuid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Check if article exists
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    // Check permission (admin or author)
    if (existingArticle.created_by !== userId && req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this article"
      });
    }

    const updatedArticle = await updateArticle(id, updateData, userId);

    res.json({
      success: true,
      message: "Article updated successfully",
      data: updatedArticle
    });
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update article"
    });
  }
};

// DELETE: Soft delete article
export const deleteArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Check if article exists
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    // Check permission (admin or author)
    if (existingArticle.created_by !== userId && req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this article"
      });
    }

    const result = await deleteArticle(id, userId);

    res.json({
      success: true,
      message: "Article archived successfully",
      data: result
    });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete article"
    });
  }
};

// DELETE: Permanently delete article (admin only)
export const permanentlyDeleteArticleHandler = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can permanently delete articles"
      });
    }

    const { id } = req.params;
    const userId = req.user?.uuid;

    const result = await permanentlyDeleteArticle(id, userId);

    res.json({
      success: true,
      message: "Article permanently deleted",
      data: result
    });
  } catch (error) {
    console.error("Permanent delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete article"
    });
  }
};

// RESTORE: Restore archived article
export const restoreArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Check if user is admin or author
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    if (existingArticle.created_by !== userId && req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to restore this article"
      });
    }

    const result = await restoreArticle(id, userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Article is not archived or doesn't exist"
      });
    }

    res.json({
      success: true,
      message: "Article restored successfully",
      data: result
    });
  } catch (error) {
    console.error("Restore article error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore article"
    });
  }
};

// GET: Get article revisions
export const getRevisions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const revisions = await getArticleRevisions(id);

    res.json({
      success: true,
      data: revisions
    });
  } catch (error) {
    console.error("Get revisions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get revisions"
    });
  }
};

export const getPopularArticles = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    
    // Validate limit
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit parameter"
      });
    }

    const articles = await getPopularArticles(limit);

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error("❌ Get popular articles error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get popular articles"
    });
  }
};

export const getRecentArticles = async (req, res) => {
  try {
    const limit = req.query.limit || 6;
    const articles = await getRecentArticles(limit);
    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWikiStats = async (req, res) => {
  try {
    const stats = await getWikiStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get wiki stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get wiki statistics"
    });
  }
};

// GET: Daily statistics for charts
export const getDailyWikiStats = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const dailyStats = await getDailyStats(days);

    res.json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    console.error("Get daily stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get daily statistics"
    });
  }
};

// GET: Top contributors
export const getWikiTopContributors = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const contributors = await getTopContributors(limit);

    res.json({
      success: true,
      data: contributors
    });
  } catch (error) {
    console.error("Get top contributors error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get top contributors"
    });
  }
};

// GET: Language statistics
export const getLanguageStats = async (req, res) => {
  try {
    const languages = [
      { code: "om", name: "Afaan Oromoo", count: 12345 },
      { code: "en", name: "English", count: 8901 },
      { code: "am", name: "አማርኛ", count: 3456 },
      { code: "fr", name: "Français", count: 2123 },
      { code: "ar", name: "العربية", count: 1567 },
      { code: "sw", name: "Kiswahili", count: 890 }
    ];
    
    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error("Get language stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get language statistics"
    });
  }
};