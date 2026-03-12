// controllers/articleController.js
import pool from "../../config/db.js";
import { getClientIp } from '../../utils/ipHelper.js';
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

    // STEP 1: Extract IP address from request
    const ipAddress = getClientIp(req);
    
    // Optional: Anonymize IP for privacy
    // const ipAddress = anonymizeIp(getClientIp(req));
    
    console.log(`Creating article from IP: ${ipAddress}`); // For debugging

    const articleData = req.body;

    if (!articleData.title) {
      return res.status(400).json({
        success: false,
        message: "Article title is required"
      });
    }

    // STEP 2: Pass IP address to service function
    const article = await createArticle(articleData, userId, ipAddress);

    // Note: There's a bug in your response - success should be true
    res.status(201).json({
      success: true,  // Changed from false to true
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



export const protectArticleService = async (articleId, adminId, level, reason, expiresAt = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First, expire any existing active protections
    await client.query(
      `
      UPDATE wiki_article_protection
      SET is_active = false
      WHERE article_id = $1 AND is_active = true
      `,
      [articleId]
    );

    // Insert new protection
    const protectionResult = await client.query(
      `
      INSERT INTO wiki_article_protection (
        article_id,
        protection_level,
        protected_by,
        reason,
        expires_at,
        is_active,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
      `,
      [articleId, level, adminId, reason, expiresAt, true]
    );

    // Update the article with protection info
    await client.query(
      `
      UPDATE wiki_articles
      SET 
        protection_level = $1,
        protected_at = NOW(),
        protected_by = $2,
        protection_reason = $3,
        protection_expires = $4,
        updated_at = NOW()
      WHERE id = $5
      `,
      [level, adminId, reason, expiresAt, articleId]
    );

    // Log the protection action
    await client.query(
      `
      INSERT INTO wiki_article_history (
        article_id,
        user_id,
        action,
        details,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [
        articleId,
        adminId,
        'protect',
        JSON.stringify({ level, reason, expiresAt })
      ]
    );

    await client.query('COMMIT');

    return protectionResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error protecting article:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Remove protection from an article
 * @param {number} articleId - Article ID
 * @param {string} adminId - Admin user UUID
 * @param {string} reason - Reason for removing protection
 */
export const removeProtectionService = async (articleId, adminId, reason) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Expire current protection
    await client.query(
      `
      UPDATE wiki_article_protection
      SET is_active = false
      WHERE article_id = $1 AND is_active = true
      `,
      [articleId]
    );

    // Update the article
    await client.query(
      `
      UPDATE wiki_articles
      SET 
        protection_level = NULL,
        protected_at = NULL,
        protected_by = NULL,
        protection_reason = NULL,
        protection_expires = NULL,
        updated_at = NOW()
      WHERE id = $1
      `,
      [articleId]
    );

    // Log the removal action
    await client.query(
      `
      INSERT INTO wiki_article_history (
        article_id,
        user_id,
        action,
        details,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [
        articleId,
        adminId,
        'remove_protection',
        JSON.stringify({ reason })
      ]
    );

    await client.query('COMMIT');

    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error removing protection:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get active protection for an article
 * @param {number} articleId - Article ID
 */
export const getArticleProtectionService = async (articleId) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        ap.*,
        u.username as protected_by_name
      FROM wiki_article_protection ap
      LEFT JOIN users u ON ap.protected_by = u.uuid
      WHERE ap.article_id = $1 AND ap.is_active = true
      ORDER BY ap.created_at DESC
      LIMIT 1
      `,
      [articleId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching article protection:", error);
    throw error;
  }
};

/**
 * Check if article is protected for a user
 * @param {number} articleId - Article ID
 * @param {object} user - User object
 */
export const checkArticleAccessService = async (articleId, user) => {
  try {
    // Get article protection
    const protection = await getArticleProtectionService(articleId);
    
    if (!protection) {
      return { allowed: true, reason: null };
    }

    // Check if protection has expired
    if (protection.expires_at && new Date(protection.expires_at) < new Date()) {
      return { allowed: true, reason: null };
    }

    // Admin can always edit
    const isAdmin = user?.role === 'Wikipedia Administrator' || user?.role === 'sysop';
    if (isAdmin) {
      return { allowed: true, reason: null };
    }

    // Check protection level
    if (protection.protection_level === 'full') {
      return { 
        allowed: false, 
        reason: 'This article is fully protected and can only be edited by administrators.' 
      };
    }

    if (protection.protection_level === 'semi') {
      // Check if user is autoconfirmed (you can implement your own logic)
      const isAutoconfirmed = user?.account_age_days > 4; // Example: 4 days old
      
      if (!isAutoconfirmed) {
        return { 
          allowed: false, 
          reason: 'This article is semi-protected and can only be edited by autoconfirmed users.' 
        };
      }
    }

    return { allowed: true, reason: null };
  } catch (error) {
    console.error("Error checking article access:", error);
    throw error;
  }
};

/**
 * Get all protections (admin only)
 * @param {boolean} activeOnly - Only show active protections
 */
export const getAllProtectionsService = async (activeOnly = true) => {
  try {
    let query = `
      SELECT 
        ap.*,
        a.title as article_title,
        a.slug as article_slug,
        u.username as protected_by_name
      FROM wiki_article_protection ap
      LEFT JOIN wiki_articles a ON ap.article_id = a.id
      LEFT JOIN users u ON ap.protected_by = u.uuid
    `;
    
    if (activeOnly) {
      query += ` WHERE ap.is_active = true`;
    }
    
    query += ` ORDER BY ap.created_at DESC`;
    
    const result = await pool.query(query);
    
    return result.rows;
  } catch (error) {
    console.error("Error fetching protections:", error);
    throw error;
  }
};

/**
 * Auto-expire protections that have passed their expiration date
 */
export const expireProtectionsService = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Find expired protections
    const expired = await client.query(
      `
      SELECT article_id FROM wiki_article_protection
      WHERE is_active = true 
        AND expires_at IS NOT NULL 
        AND expires_at < NOW()
      `
    );

    // Expire them
    await client.query(
      `
      UPDATE wiki_article_protection
      SET is_active = false
      WHERE is_active = true 
        AND expires_at IS NOT NULL 
        AND expires_at < NOW()
      `
    );

    // Update articles
    for (const row of expired.rows) {
      await client.query(
        `
        UPDATE wiki_articles
        SET 
          protection_level = NULL,
          protected_at = NULL,
          protected_by = NULL,
          protection_reason = NULL,
          protection_expires = NULL
        WHERE id = $1
        `,
        [row.article_id]
      );
    }

    await client.query('COMMIT');

    return expired.rows.length;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error expiring protections:", error);
    throw error;
  } finally {
    client.release();
  }
};



// ============================================
// VANDALISM FUNCTIONS - FIXED
// ============================================

/**
 * Report vandalism (create a new report)
 * POST /api/wiki/articles/:id/report-vandalism
 */
// Simpler approach - store the details as a JSON object with a text field
export const reportVandalism = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    const userId = req.user?.uuid;
    const ipAddress = getClientIp(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required"
      });
    }

    const client = await pool.connect();
    
    try {
      const revisionQuery = await client.query(
        `SELECT current_revision_id FROM wiki_articles WHERE id = $1`,
        [id]
      );
      
      if (revisionQuery.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Article not found"
        });
      }
      
      const currentRevisionId = revisionQuery.rows[0]?.current_revision_id;

      // FIX: Create a proper JSON object from the details
      const reportDetails = {
        description: details || '',
        user_agent: req.headers['user-agent'],
        reported_at: new Date().toISOString()
      };

      const result = await client.query(
        `
        INSERT INTO wiki_vandalism_reports (
          article_id,
          revision_id,
          reported_by,
          report_reason,
          report_details,
          ip_address,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
        `,
        [id, currentRevisionId, userId, reason, reportDetails, ipAddress, 'pending']
      );

      res.status(201).json({
        success: true,
        message: "Vandalism reported successfully",
        data: result.rows[0]
      });
    } catch (dbError) {
      console.error("Database error in reportVandalism:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while reporting vandalism"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Report vandalism error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to report vandalism"
    });
  }
};

/**
 * Review vandalism report (admin only)
 * PUT /api/wiki/vandalism/reports/:id/review
 */
export const reviewVandalismReport = async (req, res) => {
  try {
    const { id } = req.params; // This is REPORT ID
    const { status, action } = req.body;
    const userId = req.user?.uuid;
    
    // Check if user is admin
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || 
                    req.user?.role === 'sysop' || 
                    req.user?.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update the vandalism report
      const updateQuery = `
        UPDATE wiki_vandalism_reports
        SET 
          status = $1,
          reviewed_by = $2,
          reviewed_at = NOW(),
          action_taken = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [status, userId, action, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vandalism report not found"
        });
      }

      const report = result.rows[0];

      // If action taken involves reverting or protecting the article
      if (status === 'action_taken' && action) {
        // Log the admin action in article history
        await client.query(
          `
          INSERT INTO wiki_article_history (
            article_id,
            user_id,
            action,
            details,
            created_at
          )
          VALUES ($1, $2, $3, $4, NOW())
          `,
          [
            report.article_id,
            userId,
            'vandalism_action',
            JSON.stringify({ reportId: id, action })
          ]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: "Report reviewed successfully",
        data: report
      });
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error("Database error in reviewVandalismReport:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while reviewing report"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Review vandalism report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to review report"
    });
  }
};

/**
 * Get vandalism reports (admin only)
 * GET /api/wiki/vandalism/reports?status=pending
 */
export const getVandalismReports = async (req, res) => {
  try {
    const { status = 'pending', limit = 50, offset = 0 } = req.query;
    
    // Check if user is admin
    const isAdmin = req.user?.role === 'Wikipedia Administrator' || 
                    req.user?.role === 'sysop' || 
                    req.user?.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          vr.*,
          a.title as article_title,
          a.slug as article_slug,
          u.username as reporter_name,
          ru.username as reviewer_name,
          r.version as revision_version
        FROM wiki_vandalism_reports vr
        LEFT JOIN wiki_articles a ON vr.article_id = a.id
        LEFT JOIN users u ON vr.reported_by = u.uuid
        LEFT JOIN users ru ON vr.reviewed_by = ru.uuid
        LEFT JOIN wiki_revisions r ON vr.revision_id = r.id
      `;
      
      const params = [];
      
      if (status && status !== 'all') {
        query += ` WHERE vr.status = $1`;
        params.push(status);
      }
      
      query += ` ORDER BY vr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), parseInt(offset));
      
      const result = await client.query(query, params);
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        status: status
      });
    } catch (dbError) {
      console.error("Database error in getVandalismReports:", dbError);
      res.status(500).json({
        success: false,
        message: "Database error while fetching reports"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Get vandalism reports error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reports"
    });
  }
};