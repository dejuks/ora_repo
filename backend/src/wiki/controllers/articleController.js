// controllers/articleController.js
import pool from "../../config/db.js";

// Import your model functions
import {
  createArticle,
  getArticleById,
  getArticleBySlug,
  getAllArticles,
  getUserArticles as getArticlesByUserId,
  updateArticle,
  deleteArticle,
  permanentlyDeleteArticle,
  restoreArticle,
  incrementViewCount,
  getArticleRevisions,
  getWikiStatistics,
  getPopularArticles as getPopularArticlesModel,
  getRecentArticles as getRecentArticlesModel  // FIXED: renamed import
} from "../models/wikiArticle.model.js";

// ============================================
// EXISTING FUNCTIONS
// ============================================

export const createNewArticle = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    
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


export const getMyArticles = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const articles = await getArticlesByUserId(userId);

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

export const permanentlyDeleteArticleHandler = async (req, res) => {
  try {
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
    
    const articles = await getPopularArticlesModel(limit);

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

// FIXED: This function now uses the correctly imported getRecentArticlesModel
export const getRecentArticles = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const articles = await getRecentArticlesModel(limit);
    res.json({ 
      success: true, 
      data: articles 
    });
  } catch (error) {
    console.error("❌ Get recent articles error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to get recent articles" 
    });
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

export const getLanguageStats = async (req, res) => {
  try {
    const languages = [
      { code: "om", name: "Afaan Oromoo", count: 12345 },
      { code: "en", name: "English", count: 8901 },
      { code: "am", name: "አማርኛ", count: 3456 }
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

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
// ============================================
// DASHBOARD FUNCTIONS - Add these to your articleController.js
// ============================================

/**
 * Get user activity feed
 * GET /api/wiki/articles/user/activity
 */
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    
    console.log("📊 Getting activity for user:", userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const client = await pool.connect();
    
    try {
      const query = `
        (SELECT 
          'create' as type,
          'Created article' as action,
          title as details,
          created_at,
          id as target_id,
          slug as target_slug
        FROM wiki_articles
        WHERE created_by = $1)
        
        UNION ALL
        
        (SELECT 
          'edit' as type,
          'Edited article' as action,
          CONCAT('Edited "', a.title, '"') as details,
          r.created_at,
          a.id as target_id,
          a.slug as target_slug
        FROM wiki_revisions r
        JOIN wiki_articles a ON r.article_id = a.id
        WHERE r.edited_by = $1)
        
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const result = await client.query(query, [userId, limit]);
      
      console.log(`✅ Found ${result.rows.length} activity items`);
      
      // Format the activity data for the frontend
      const formattedActivity = result.rows.map(item => ({
        ...item,
        // Ensure consistent structure for frontend
        type: item.type || 'activity',
        action: item.action || 'Unknown action',
        details: item.details || '',
        created_at: item.created_at,
        article: item.target_slug ? {
          id: item.target_id,
          slug: item.target_slug
        } : null
      }));
      
      res.json({
        success: true,
        data: formattedActivity
      });
    } catch (dbError) {
      console.error("❌ Database error in getUserActivity:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while fetching activity",
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Get user activity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your activity",
      error: error.message
    });
  }
};


//getAdminUserActivity
export const getAdminUserActivity = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    
    // console.log("📊 Getting activity for user:", userId);
    
    // if (!userId) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "User not authenticated"
    //   });
    // }
    
    const client = await pool.connect();
    
    try {
      const query = `
        (SELECT 
          'create' as type,
          'Created article' as action,
          title as details,
          created_at,
          id as target_id,
          slug as target_slug
        FROM wiki_articles)
        
        UNION ALL
        
        (SELECT 
          'edit' as type,
          'Edited article' as action,
          CONCAT('Edited "', a.title, '"') as details,
          r.created_at,
          a.id as target_id,
          a.slug as target_slug
        FROM wiki_revisions r
        JOIN wiki_articles a ON r.article_id = a.id
        WHERE r.edited_by = $1)
        
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const result = await client.query(query, [userId, limit]);
      
      console.log(`✅ Found ${result.rows.length} activity items`);
      
      // Format the activity data for the frontend
      const formattedActivity = result.rows.map(item => ({
        ...item,
        // Ensure consistent structure for frontend
        type: item.type || 'activity',
        action: item.action || 'Unknown action',
        details: item.details || '',
        created_at: item.created_at,
        article: item.target_slug ? {
          id: item.target_id,
          slug: item.target_slug
        } : null
      }));
      
      res.json({
        success: true,
        data: formattedActivity
      });
    } catch (dbError) {
      console.error("❌ Database error in getUserActivity:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while fetching activity",
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Get user activity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your activity",
      error: error.message
    });
  }
};

/**
 * Get user contributions (articles and edits)
 * GET /api/wiki/articles/user/contributions
 */
export const getUserContributions = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    
    console.log("📊 Getting contributions for user:", userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const client = await pool.connect();
    
    try {
      // Get articles created by user
      const articlesQuery = `
        SELECT 
          a.id,
          a.title,
          a.slug,
          a.status,
          COALESCE(a.view_count, 0) as views,
          a.created_at,
          a.updated_at,
          (
            SELECT COUNT(*) 
            FROM wiki_revisions 
            WHERE article_id = a.id
          ) as edit_count,
          (
            SELECT json_agg(
              json_build_object(
                'id', c.id,
                'name', c.name
              )
            )
            FROM wiki_article_categories ac
            JOIN wiki_categories c ON ac.category_id = c.id
            WHERE ac.article_id = a.id
          ) as categories
        FROM wiki_articles a
        WHERE a.created_by = $1
        ORDER BY a.created_at DESC
      `;
      
      const articlesResult = await client.query(articlesQuery, [userId]);
      
      // Get edits/revisions by user
      const editsQuery = `
        SELECT 
          r.id,
          r.article_id,
          a.title as article_title,
          a.slug as article_slug,
          r.summary,
          r.version,
          r.created_at,
          r.is_current
        FROM wiki_revisions r
        JOIN wiki_articles a ON r.article_id = a.id
        WHERE r.edited_by = $1
        ORDER BY r.created_at DESC
        LIMIT 20
      `;
      
      const editsResult = await client.query(editsQuery, [userId]);
      
      console.log(`✅ Found ${articlesResult.rows.length} articles and ${editsResult.rows.length} edits`);
      
      res.json({
        success: true,
        data: {
          articles: articlesResult.rows,
          edits: editsResult.rows
        }
      });
    } catch (dbError) {
      console.error("❌ Database error in getUserContributions:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while fetching contributions",
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Get user contributions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your contributions",
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * GET /api/wiki/articles/user/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    
    console.log("📊 Getting stats for user:", userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const client = await pool.connect();
    
    try {
      // Get article stats
      const articleStats = await client.query(`
        SELECT 
          COUNT(*) as total_articles,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_articles,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_articles,
          COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_articles,
          COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_articles,
          COALESCE(SUM(view_count), 0) as total_views,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as articles_last_30_days,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as articles_last_7_days,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as articles_today
        FROM wiki_articles
        WHERE created_by = $1
      `, [userId]);
      
      // Get edit stats
      const editStats = await client.query(`
        SELECT 
          COUNT(*) as total_edits,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as edits_last_30_days,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as edits_last_7_days,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as edits_today
        FROM wiki_revisions
        WHERE edited_by = $1
      `, [userId]);
      
      // Get user rank
      const rankResult = await client.query(`
        WITH user_contributions AS (
          SELECT 
            u.uuid,
            (
              (SELECT COUNT(*) FROM wiki_articles WHERE created_by = u.uuid) +
              (SELECT COUNT(*) FROM wiki_revisions WHERE edited_by = u.uuid)
            ) as total_contributions
          FROM users u
        )
        SELECT COUNT(*) + 1 as rank
        FROM user_contributions
        WHERE total_contributions > (
          SELECT (
            (SELECT COUNT(*) FROM wiki_articles WHERE created_by = $1) +
            (SELECT COUNT(*) FROM wiki_revisions WHERE edited_by = $1)
          )
        )
      `, [userId]);
      
      const totalArticles = parseInt(articleStats.rows[0]?.total_articles) || 0;
      const totalEdits = parseInt(editStats.rows[0]?.total_edits) || 0;
      const totalContributions = totalArticles + totalEdits;
      const totalViews = parseInt(articleStats.rows[0]?.total_views) || 0;
      const rank = parseInt(rankResult.rows[0]?.rank) || 1;
      
      // Determine rank title
      let rankTitle = 'New Contributor';
      if (totalContributions > 100) rankTitle = 'Expert Contributor';
      else if (totalContributions > 50) rankTitle = 'Senior Contributor';
      else if (totalContributions > 20) rankTitle = 'Regular Contributor';
      else if (totalContributions > 5) rankTitle = 'Active Contributor';
      
      const stats = {
        totalArticles,
        totalEdits,
        totalUploads: 0, // You can implement this later if you have media uploads
        reputationPoints: totalContributions * 10,
        todayEdits: parseInt(editStats.rows[0]?.edits_today) || 0,
        todayArticles: parseInt(articleStats.rows[0]?.articles_today) || 0,
        todayUploads: 0,
        todayViews: 0, // Daily views would need a separate tracking mechanism
        articlesThisMonth: parseInt(articleStats.rows[0]?.articles_last_30_days) || 0,
        rank: rankTitle,
        rankNumber: rank,
        publishedArticles: parseInt(articleStats.rows[0]?.published_articles) || 0,
        draftArticles: parseInt(articleStats.rows[0]?.draft_articles) || 0,
        underReviewArticles: parseInt(articleStats.rows[0]?.under_review_articles) || 0,
        archivedArticles: parseInt(articleStats.rows[0]?.archived_articles) || 0,
        totalViews,
        editsThisMonth: parseInt(editStats.rows[0]?.edits_last_30_days) || 0,
        editsThisWeek: parseInt(editStats.rows[0]?.edits_last_7_days) || 0
      };
      
      console.log("✅ Stats retrieved:", stats);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (dbError) {
      console.error("❌ Database error in getUserStats:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while fetching stats",
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your stats",
      error: error.message
    });
  }
};



