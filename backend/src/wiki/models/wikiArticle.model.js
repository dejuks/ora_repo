// models/wikiArticle.model.js
import pool from "../../config/db.js";
import slugify from "slugify";

// Generate slug from title
const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};


// CREATE: Create new article
export const createArticle = async (articleData, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const slug = generateSlug(articleData.title);
    
    // Check if slug exists
    const existingArticle = await client.query(
      "SELECT id FROM wiki_articles WHERE slug = $1",
      [slug]
    );

    if (existingArticle.rows.length > 0) {
      throw new Error("Article with similar title already exists");
    }

    // Insert article
    const articleResult = await client.query(
      `
      INSERT INTO wiki_articles (
        title,
        slug,
        status,
        created_by,
        view_count,
        is_featured,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
      `,
      [
        articleData.title,
        slug,
        articleData.status || 'draft',
        userId,
        0,
        articleData.is_featured || false
      ]
    );

    const article = articleResult.rows[0];

    // Create first revision
    const revisionResult = await client.query(
      `
      INSERT INTO wiki_revisions (
        article_id,
        content,
        summary,
        version,
        edited_by,
        is_current,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
      `,
      [
        article.id,
        articleData.content || '',
        articleData.summary || 'Initial creation',
        1,
        userId,
        true
      ]
    );

    // Update article with current revision ID
    await client.query(
      `
      UPDATE wiki_articles 
      SET current_revision_id = $1 
      WHERE id = $2
      `,
      [revisionResult.rows[0].id, article.id]
    );

    // Add categories if provided
    if (articleData.categories && articleData.categories.length > 0) {
      for (const categoryId of articleData.categories) {
        await client.query(
          `
          INSERT INTO wiki_article_categories (article_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [article.id, categoryId]
        );
      }
    }

    // Record contribution
    await client.query(
      `
      INSERT INTO wiki_user_contributions (
        user_id,
        article_id,
        revision_id,
        action,
        contribution_type,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [userId, article.id, revisionResult.rows[0].id, 'create', 'article']
    );

    await client.query("COMMIT");

    // Fetch complete article with details
    return await getArticleById(article.id);

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// READ: Get article by ID with all details
export const getArticleById = async (articleId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        a.*,
        u.username as author_username,
        u.full_name as author_name,
        wp.display_name as author_display_name,
        wp.avatar_url as author_avatar,
        r.content,
        r.summary as revision_summary,
        r.version,
        r.created_at as last_revision_date,
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
        ) as categories,
        (
          SELECT COUNT(*) FROM wiki_revisions WHERE article_id = a.id
        ) as total_revisions
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_profiles wp ON a.created_by = wp.user_id
      LEFT JOIN wiki_revisions r ON a.current_revision_id = r.id
      WHERE a.id = $1
      `,
      [articleId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error in getArticleById:", error);
    throw error;
  } finally {
    client.release();
  }
};

// READ: Get article by slug
export const getArticleBySlug = async (slug) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        a.*,
        u.username as author_username,
        r.content,
        r.summary,
        r.version
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_revisions r ON a.current_revision_id = r.id
      WHERE a.slug = $1
      `,
      [slug]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error in getArticleBySlug:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAllArticles = async (filters = {}) => {
  const client = await pool.connect();

  try {
    // Main query for all articles
    let query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.status,
        a.view_count,
        a.is_featured,
        a.created_at,
        a.updated_at,
        a.created_by,
        u.full_name as author_name,
        COALESCE(r.revision_count, 0) as revision_count,
        c.categories,
        LEFT(COALESCE(rev.content,''), 200) as excerpt
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_profiles wp ON a.created_by = wp.user_id
      LEFT JOIN (
        SELECT article_id, COUNT(*) as revision_count
        FROM wiki_revisions
        GROUP BY article_id
      ) r ON a.id = r.article_id
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('id', c.id, 'name', c.name)) as categories
        FROM wiki_article_categories ac
        JOIN wiki_categories c ON ac.category_id = c.id
        WHERE ac.article_id = a.id
      ) c ON true
      LEFT JOIN wiki_revisions rev ON a.current_revision_id = rev.id
    `;

    const queryParams = [];

    // Apply filters
    if (filters.status) {
      query += ` AND a.status = $${queryParams.length + 1}`;
      queryParams.push(filters.status);
    }

    if (filters.author) {
      query += ` AND a.created_by = $${queryParams.length + 1}`;
      queryParams.push(filters.author);
    }

    if (filters.is_featured !== undefined && filters.is_featured !== null) {
      query += ` AND a.is_featured = $${queryParams.length + 1}`;
      queryParams.push(filters.is_featured);
    }

    if (filters.search) {
      query += ` AND (a.title ILIKE $${queryParams.length + 1} OR COALESCE(rev.content,'') ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${filters.search}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    // Execute main query
    const result = await client.query(query, queryParams);

    return result.rows || [];

  } catch (err) {
    console.error("Error in getAllArticles:", err);
    return [];
  } finally {
    client.release();
  }
};
// GET articles by user ID
export const getUserArticles = async (userId) => {
  const client = await pool.connect();
  
  try {
    console.log("📊 Fetching articles for user:", userId);
    
    const query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.status,
        a.view_count,
        a.is_featured,
        a.created_at,
        a.updated_at,
        a.created_by,
        (
          SELECT COUNT(*) 
          FROM wiki_revisions 
          WHERE article_id = a.id
        ) as edit_count,
        COALESCE(a.view_count, 0) as views,
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
        ) as categories,
        (
          SELECT content 
          FROM wiki_revisions 
          WHERE article_id = a.id 
          ORDER BY version DESC 
          LIMIT 1
        ) as latest_content
      FROM wiki_articles a
      WHERE a.created_by = $1
      ORDER BY a.created_at DESC
    `;
    
    const result = await client.query(query, [userId]);
    
    console.log(`✅ Found ${result.rows.length} articles for user ${userId}`);
    
    return result.rows;
  } catch (error) {
    console.error("❌ Error in getUserArticles:", error);
    throw error;
  } finally {
    client.release();
  }
};

// GET user edits/revisions
export const getUserEdits = async (userId, limit = 20) => {
  const client = await pool.connect();
  
  try {
    const query = `
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
      LIMIT $2
    `;
    
    const result = await client.query(query, [userId, limit]);
    
    return result.rows;
  } catch (error) {
    console.error("❌ Error in getUserEdits:", error);
    throw error;
  } finally {
    client.release();
  }
};

// GET user contributions (combined articles and edits)
export const getUserContributions = async (userId) => {
  try {
    const articles = await getUserArticles(userId);
    const edits = await getUserEdits(userId, 20);
    
    return {
      articles,
      edits
    };
  } catch (error) {
    console.error("❌ Error in getUserContributions:", error);
    throw error;
  }
};

// GET user stats
export const getUserStats = async (userId) => {
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
    
    const totalArticles = parseInt(articleStats.rows[0]?.total_articles) || 0;
    const totalEdits = parseInt(editStats.rows[0]?.total_edits) || 0;
    const totalContributions = totalArticles + totalEdits;
    const totalViews = parseInt(articleStats.rows[0]?.total_views) || 0;
    
    // Determine rank title
    let rankTitle = 'New Contributor';
    if (totalContributions > 100) rankTitle = 'Expert Contributor';
    else if (totalContributions > 50) rankTitle = 'Senior Contributor';
    else if (totalContributions > 20) rankTitle = 'Regular Contributor';
    else if (totalContributions > 5) rankTitle = 'Active Contributor';
    
    return {
      totalArticles,
      publishedArticles: parseInt(articleStats.rows[0]?.published_articles) || 0,
      draftArticles: parseInt(articleStats.rows[0]?.draft_articles) || 0,
      underReviewArticles: parseInt(articleStats.rows[0]?.under_review_articles) || 0,
      archivedArticles: parseInt(articleStats.rows[0]?.archived_articles) || 0,
      totalEdits,
      totalViews,
      articlesThisMonth: parseInt(articleStats.rows[0]?.articles_last_30_days) || 0,
      articlesThisWeek: parseInt(articleStats.rows[0]?.articles_last_7_days) || 0,
      todayArticles: parseInt(articleStats.rows[0]?.articles_today) || 0,
      todayEdits: parseInt(editStats.rows[0]?.edits_today) || 0,
      editsThisMonth: parseInt(editStats.rows[0]?.edits_last_30_days) || 0,
      editsThisWeek: parseInt(editStats.rows[0]?.edits_last_7_days) || 0,
      totalContributions,
      rank: rankTitle
    };
  } catch (error) {
    console.error("❌ Error in getUserStats:", error);
    throw error;
  } finally {
    client.release();
  }
};

// GET user activity
export const getUserActivity = async (userId, limit = 20) => {
  const client = await pool.connect();
  
  try {
    const query = `
      (SELECT 
        'create' as type,
        'Created article' as action,
        title as details,
        created_at,
        id as target_id,
        slug as target_slug,
        created_by
      FROM wiki_articles
      WHERE created_by = $1)
      
      UNION ALL
      
      (SELECT 
        'edit' as type,
        'Edited article' as action,
        CONCAT('Edited "', a.title, '"') as details,
        r.created_at,
        a.id as target_id,
        a.slug as target_slug,
        r.edited_by
      FROM wiki_revisions r
      JOIN wiki_articles a ON r.article_id = a.id
      WHERE r.edited_by = $1)
      
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await client.query(query, [userId, limit]);
    
    return result.rows;
  } catch (error) {
    console.error("❌ Error in getUserActivity:", error);
    throw error;
  } finally {
    client.release();
  }
};

// UPDATE: Update article
export const updateArticle = async (articleId, updateData, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // Get current article
    const currentArticle = await client.query(
      "SELECT * FROM wiki_articles WHERE id = $1",
      [articleId]
    );

    if (!currentArticle.rows[0]) {
      throw new Error("Article not found");
    }

    // Update slug if title changed
    let slug = currentArticle.rows[0].slug;
    if (updateData.title && updateData.title !== currentArticle.rows[0].title) {
      slug = generateSlug(updateData.title);
      
      // Check if new slug exists
      const existingArticle = await client.query(
        "SELECT id FROM wiki_articles WHERE slug = $1 AND id != $2",
        [slug, articleId]
      );

      if (existingArticle.rows.length > 0) {
        throw new Error("Article with similar title already exists");
      }
    }

    // Update article
    await client.query(
      `
      UPDATE wiki_articles 
      SET 
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        status = COALESCE($3, status),
        is_featured = COALESCE($4, is_featured),
        updated_at = NOW()
      WHERE id = $5
      `,
      [
        updateData.title,
        slug,
        updateData.status,
        updateData.is_featured,
        articleId
      ]
    );

    // Create new revision if content changed
    if (updateData.content) {
      // Get latest version number
      const versionResult = await client.query(
        "SELECT COALESCE(MAX(version), 0) as max_version FROM wiki_revisions WHERE article_id = $1",
        [articleId]
      );
      const newVersion = versionResult.rows[0].max_version + 1;

      // Insert new revision
      const revisionResult = await client.query(
        `
        INSERT INTO wiki_revisions (
          article_id,
          content,
          summary,
          version,
          edited_by,
          is_current,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
        `,
        [
          articleId,
          updateData.content,
          updateData.summary || 'Updated article',
          newVersion,
          userId,
          true
        ]
      );

      // Update article with new current revision
      await client.query(
        "UPDATE wiki_articles SET current_revision_id = $1 WHERE id = $2",
        [revisionResult.rows[0].id, articleId]
      );

      // Record contribution
      await client.query(
        `
        INSERT INTO wiki_user_contributions (
          user_id,
          article_id,
          revision_id,
          action,
          contribution_type,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        `,
        [userId, articleId, revisionResult.rows[0].id, 'edit', 'article']
      );
    }

    // Update categories if provided
    if (updateData.categories) {
      // Remove old categories
      await client.query(
        "DELETE FROM wiki_article_categories WHERE article_id = $1",
        [articleId]
      );

      // Add new categories
      for (const categoryId of updateData.categories) {
        await client.query(
          "INSERT INTO wiki_article_categories (article_id, category_id) VALUES ($1, $2)",
          [articleId, categoryId]
        );
      }
    }

    await client.query("COMMIT");

    return await getArticleById(articleId);

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getAllByAdminArticles = async (filters = {}) => {
  const client = await pool.connect();

  try {
    let query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.status,
        a.view_count,
        a.is_featured,
        a.created_at,
        a.updated_at,
        a.created_by,
        a.is_deleted,
        u.full_name as author_name,
        COALESCE(r.revision_count, 0) as revision_count,
        c.categories,
        LEFT(COALESCE(rev.content,''), 200) as excerpt
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_profiles wp ON a.created_by = wp.user_id
      LEFT JOIN (
        SELECT article_id, COUNT(*) as revision_count
        FROM wiki_revisions
        GROUP BY article_id
      ) r ON a.id = r.article_id
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object('id', c.id, 'name', c.name)
        ) as categories
        FROM wiki_article_categories ac
        JOIN wiki_categories c ON ac.category_id = c.id
        WHERE ac.article_id = a.id
      ) c ON true
      LEFT JOIN wiki_revisions rev ON a.current_revision_id = rev.id
      WHERE a.is_deleted IS NOT TRUE
    `;

    const queryParams = [];

    // Apply filters
    if (filters.status) {
      query += ` AND a.status = $${queryParams.length + 1}`;
      queryParams.push(filters.status);
    }

    if (filters.author) {
      query += ` AND a.created_by = $${queryParams.length + 1}`;
      queryParams.push(filters.author);
    }

    if (filters.is_featured !== undefined && filters.is_featured !== null) {
      query += ` AND a.is_featured = $${queryParams.length + 1}`;
      queryParams.push(filters.is_featured);
    }

    if (filters.search) {
      query += ` AND (a.title ILIKE $${queryParams.length + 1} 
                  OR COALESCE(rev.content,'') ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${filters.search}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await client.query(query, queryParams);

    return result.rows || [];

  } catch (err) {
    console.error("Error in getAllArticles:", err);
    return [];
  } finally {
    client.release();
  }
};

// DELETE: Soft delete article (archive)
// Soft delete (archive) an article
export const deleteArticle = async (id, userId) => {
  try {
    const query = `
      UPDATE wiki_articles
      SET deleted_at = NOW(),
          deleted_by = $2,
          is_deleted=true
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, userId]); // use pool
    return result.rows[0];
  } catch (error) {
    console.error("Soft delete error:", error);
    throw error;
  }
};

// DELETE: Permanently delete article (admin only)
export const permanentlyDeleteArticle = async (articleId, userId) => {
  const client = await client.connect();
  
  try {
    await client.query("BEGIN");

    // Record in audit log before deletion
    await client.query(
      `
      INSERT INTO wiki_audit_logs (
        user_id,
        action,
        target_type,
        target_id,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [userId, 'permanent_delete', 'article', articleId]
    );

    // Delete article (cascades to revisions, categories, etc.)
    await client.query(
      "DELETE FROM wiki_articles WHERE id = $1",
      [articleId]
    );

    await client.query("COMMIT");

    return { id: articleId, deleted: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// RESTORE: Restore archived article
export const restoreArticle = async (articleId, userId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      UPDATE wiki_articles 
      SET status = 'draft', updated_at = NOW() 
      WHERE id = $1 AND status = 'archived'
      RETURNING id
      `,
      [articleId]
    );

    // Record in audit log
    await client.query(
      `
      INSERT INTO wiki_audit_logs (
        user_id,
        action,
        target_type,
        target_id,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [userId, 'restore', 'article', articleId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error in restoreArticle:", error);
    throw error;
  } finally {
    client.release();
  }
};

// INCREMENT VIEW COUNT
export const incrementViewCount = async (articleId) => {
  const client = await pool.connect();
  
  try {
    await client.query(
      "UPDATE wiki_articles SET view_count = view_count + 1 WHERE id = $1",
      [articleId]
    );
  } catch (error) {
    console.error("Error in incrementViewCount:", error);
    throw error;
  } finally {
    client.release();
  }
};

// GET ARTICLE REVISIONS
export const getArticleRevisions = async (articleId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        r.*,
        u.username as editor_username,
        wp.display_name as editor_name
      FROM wiki_revisions r
      LEFT JOIN users u ON r.edited_by = u.uuid
      LEFT JOIN wiki_profiles wp ON r.edited_by = wp.user_id
      WHERE r.article_id = $1
      ORDER BY r.version DESC
      `,
      [articleId]
    );

    return result.rows;
  } catch (error) {
    console.error("Error in getArticleRevisions:", error);
    throw error;
  } finally {
    client.release();
  }
};

// GET popular articles
export const getPopularArticles = async (limit = 10) => {
  const client = await pool.connect();
  
  try {
    console.log(`Fetching ${limit} popular articles...`);
    
    const result = await client.query(
      `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.view_count,
        a.created_at,
        a.updated_at,
        a.status,
        u.uuid as author_id,
        u.username as author_username,
        u.full_name as author_name,
        wp.display_name as author_display_name,
        wp.avatar_url as author_avatar,
        wp.reputation_points as author_reputation,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name
            )
          ), '[]'::json)
          FROM wiki_article_categories ac
          JOIN wiki_categories c ON ac.category_id = c.id
          WHERE ac.article_id = a.id
        ) as categories,
        (
          SELECT COUNT(*) FROM wiki_revisions WHERE article_id = a.id
        ) as revision_count,
        SUBSTRING(r.content, 1, 200) as excerpt
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_profiles wp ON a.created_by = wp.user_id
      LEFT JOIN wiki_revisions r ON a.current_revision_id = r.id
      WHERE a.status = 'published'
      ORDER BY a.view_count DESC NULLS LAST
      LIMIT $1
      `,
      [limit]
    );

    console.log(`Found ${result.rows.length} popular articles`);

    // Add rank to each article
    const articles = result.rows.map((article, index) => ({
      ...article,
      rank: index + 1,
      view_count: article.view_count || 0,
      categories: article.categories || []
    }));

    return articles;
  } catch (err) {
    console.error("Error in getPopularArticles:", err);
    throw err;
  } finally {
    client.release();
  }
};

// GET recent articles
export const getRecentArticles = async (limit = 10) => {
  const client = await pool.connect();
  
  try {
    console.log(`Fetching ${limit} recent articles...`);
    
    const result = await client.query(
      `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.view_count,
        a.created_at,
        a.updated_at,
        a.status,
        u.uuid as author_id,
        u.username as author_username,
        u.full_name as author_name,
        wp.display_name as author_display_name,
        wp.avatar_url as author_avatar,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name
            )
          ), '[]'::json)
          FROM wiki_article_categories ac
          JOIN wiki_categories c ON ac.category_id = c.id
          WHERE ac.article_id = a.id
        ) as categories,
        (
          SELECT COUNT(*) FROM wiki_revisions WHERE article_id = a.id
        ) as revision_count,
        SUBSTRING(r.content, 1, 200) as excerpt
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_profiles wp ON a.created_by = wp.user_id
      LEFT JOIN wiki_revisions r ON a.current_revision_id = r.id
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    console.log(`Found ${result.rows.length} recent articles`);

    return result.rows;
  } catch (err) {
    console.error("Error in getRecentArticles:", err);
    throw err;
  } finally {
    client.release();
  }
};

// GET wiki statistics
export const getWikiStatistics = async () => {
  const client = await pool.connect();
  
  try {
    const articlesResult = await client.query(`
      SELECT COUNT(*) as total 
      FROM wiki_articles 
      WHERE status = 'published'
    `);
 const articlesDraftToday = await client.query(`
  SELECT COUNT(*) as total 
  FROM wiki_articles 
  WHERE status = 'draft' 
  AND DATE(created_at) = CURRENT_DATE
`);
    const usersResult = await client.query(`
      SELECT COUNT(DISTINCT created_by) as total
      FROM wiki_articles
    `);
    
    const editsResult = await client.query(`
      SELECT COUNT(*) as total
      FROM wiki_revisions
    `);

    // Get draft articles count with month-by-month breakdown
const articleByMonth = await client.query(`
  SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS total
  FROM wiki_articles
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
  GROUP BY month
  ORDER BY month DESC
`);

const wikimediaUplaoded = await client.query(`
  SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS total
  FROM wiki_media
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
  GROUP BY month
  ORDER BY month DESC
`);

const wikimediaUploadedFilesize = await client.query(`
  SELECT 
    ROUND(
      SUM(file_size::BIGINT)::NUMERIC / 1024 / 1024,
      2
    ) AS total
  FROM wiki_media
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
`);
// Articles this week
const articlesThisWeek = await client.query(`
  SELECT COUNT(*) AS total
  FROM wiki_articles
  WHERE created_at >= date_trunc('week', CURRENT_DATE)
`);
    
    return {
      totalArticles: parseInt(articlesResult.rows[0]?.total) || 0,
      totalAuthors: parseInt(usersResult.rows[0]?.total) || 0,
      totalEdits: parseInt(editsResult.rows[0]?.total) || 0,
      articlesDraftToday: parseInt(articlesDraftToday.rows[0]?.total) || 0,
      articleByMonth: parseInt(articleByMonth.rows[0]?.total) || 0,
      articlesThisWeek: parseInt(articlesThisWeek.rows[0]?.total) || 0,
      wikimediaUplaoded: parseInt(wikimediaUplaoded.rows[0]?.total) || 0,
wikimediaUploadedfilesize: parseFloat(wikimediaUploadedFilesize.rows[0]?.total) || 0,    };
  } catch (err) {
    console.error("Error in getWikiStatistics:", err);
    throw err;
  } finally {
    client.release();
  }
};