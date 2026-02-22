// models/WikiArticle.js
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
      WHERE a.status = $1
      `,
      [articleId]
    );

    return result.rows[0];
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
  } finally {
    client.release();
  }
};

// READ: Get all articles with pagination and filters
export const getAllArticles = async (filters = {}, page = 1, limit = 10) => {
  const client = await pool.connect();
  
  try {
    const offset = (page - 1) * limit;
    
    // First, get total count - FIXED with proper error handling
    let countQuery = `SELECT COUNT(*) as total FROM wiki_articles WHERE 1=1`;
    const countParams = [];
    
    if (filters.status) {
      countQuery += ` AND status = $${countParams.length + 1}`;
      countParams.push(filters.status);
    }
    
    // Execute count query
    let total = 0;
    try {
      const countResult = countParams.length > 0 
        ? await client.query(countQuery, countParams)
        : await client.query(countQuery);
      
      total = countResult.rows[0]?.total ? parseInt(countResult.rows[0].total) : 0;
    } catch (countErr) {
      console.error("Count query error:", countErr);
      total = 0;
    }

    // Main query for articles
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
        u.username as author_username,
        u.full_name as author_name,
        wp.display_name as author_display_name,
        wp.avatar_url as author_avatar,
        (
          SELECT COUNT(*) FROM wiki_revisions WHERE article_id = a.id
        ) as revision_count,
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
          LIMIT 3
        ) as categories,
        LEFT(r.content, 200) as excerpt
      FROM wiki_articles a
      LEFT JOIN users u ON a.created_by = u.uuid
      LEFT JOIN wiki_profiles wp ON a.created_by = wp.user_id
      LEFT JOIN wiki_revisions r ON a.current_revision_id = r.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Apply filters to main query
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
      query += ` AND (a.title ILIKE $${queryParams.length + 1} OR r.content ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${filters.search}%`);
    }

    // Add pagination
    query += ` ORDER BY a.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Execute main query
    const result = await client.query(query, queryParams);

    return {
      articles: result.rows || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

  } catch (err) {
    console.error("Error in getAllArticles:", err);
    // Return empty result on error
    return {
      articles: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  } finally {
    client.release();
  }
};

// READ: Get articles by user
export const getUserArticles = async (userId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        a.*,
        (
          SELECT COUNT(*) FROM wiki_revisions WHERE article_id = a.id
        ) as revision_count
      FROM wiki_articles a
      WHERE a.created_by = $1
      ORDER BY a.created_at DESC
      `,
      [userId]
    );

    return result.rows;
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

// DELETE: Soft delete article (archive)
export const deleteArticle = async (articleId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // Update article status to archived
    await client.query(
      `
      UPDATE wiki_articles 
      SET status = 'archived', updated_at = NOW() 
      WHERE id = $1
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
      [userId, 'delete', 'article', articleId]
    );

    await client.query("COMMIT");

    return { id: articleId, status: 'archived' };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// DELETE: Permanently delete article (admin only)
export const permanentlyDeleteArticle = async (articleId, userId) => {
  const client = await pool.connect();
  
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
  } finally {
    client.release();
  }
};
export const getPopularArticles = async (limit = 10) => {
  const client = await pool.connect();
  
  try {
    console.log(`Fetching ${limit} popular articles...`); // Debug log
    
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

    console.log(`Found ${result.rows.length} popular articles`); // Debug log

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
    throw err; // Re-throw to be caught by controller
  } finally {
    client.release();
  }
};



export const getWikiStatistics = async () => {
  const client = await pool.connect();
  
  try {
    const articlesResult = await client.query(`
      SELECT COUNT(*) as total 
      FROM wiki_articles 
      WHERE status = 'published'
    `);
    
    return {
      totalArticles: parseInt(articlesResult.rows[0]?.total) || 0
    };
  } catch (err) {
    console.error("Error in getWikiStatistics:", err);
    throw err;
  } finally {
    client.release();
  }
};