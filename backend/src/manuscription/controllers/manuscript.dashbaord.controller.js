// dashboard.controller.js
import pool from '../../config/db.js';

/* ===============================
   DASHBOARD STATISTICS
================================= */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.uuid;
    const userRole = req.user.role;

    // Base stats that everyone can see
    let stats = {};

    // 1. Overall manuscript statistics (filtered by role)
    let manuscriptStatsQuery = `
      SELECT 
        COUNT(*) as total_manuscripts,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
        COUNT(CASE WHEN status = 'screening' THEN 1 END) as screening_count,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_count,
        COUNT(CASE WHEN status = 'ae_recommendation' THEN 1 END) as ae_recommendation_count,
        COUNT(CASE WHEN status = 'eic_decision' THEN 1 END) as eic_decision_count,
        COUNT(CASE WHEN status = 'payment_pending' THEN 1 END) as payment_pending_count,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
      FROM manuscripts
    `;

    // For authors, only show their own manuscripts
    if (userRole === 'author') {
      manuscriptStatsQuery += ` WHERE created_by = $1`;
      const result = await pool.query(manuscriptStatsQuery, [userId]);
      stats.manuscripts = result.rows[0];
    } else {
      const result = await pool.query(manuscriptStatsQuery);
      stats.manuscripts = result.rows[0];
    }

    // 2. Recent activity (last 30 days)
    const recentActivity = await pool.query(`
      SELECT 
        COUNT(*) as total_activity,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days,
        COUNT(CASE WHEN status = 'published' AND published_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_publications
      FROM manuscripts
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ${userRole === 'author' ? 'AND created_by = $1' : ''}
    `, userRole === 'author' ? [userId] : []);

    stats.recentActivity = recentActivity.rows[0];

    // 3. Category distribution
    const categoryStats = await pool.query(`
      SELECT 
        c.id,
        c.name as category_name,
        COUNT(m.id) as manuscript_count,
        COUNT(CASE WHEN m.status = 'published' THEN 1 END) as published_count
      FROM categories c
      LEFT JOIN manuscripts m ON m.category_id = c.id
      ${userRole === 'author' ? 'AND m.created_by = $1' : ''}
      GROUP BY c.id, c.name
      ORDER BY manuscript_count DESC
    `, userRole === 'author' ? [userId] : []);

    stats.categories = categoryStats.rows;

    // 4. Files statistics
    const fileStats = await pool.query(`
      SELECT 
        COUNT(*) as total_files,
        SUM(COALESCE(file_size::bigint, 0)) as total_storage_used,
        ROUND(AVG(COALESCE(file_size::bigint, 0))::numeric, 2) as avg_file_size
      FROM files f
      ${userRole === 'author' ? 'WHERE uploaded_by = $1' : ''}
    `, userRole === 'author' ? [userId] : []);

    stats.files = fileStats.rows[0];

    // 5. Success rate for user's manuscripts (for authors) or overall (for others)
    if (userRole === 'author') {
      const successRate = await pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          CASE 
            WHEN COUNT(CASE WHEN status IN ('published', 'rejected') THEN 1 END) > 0 
            THEN ROUND(
              (COUNT(CASE WHEN status = 'published' THEN 1 END)::numeric / 
               COUNT(CASE WHEN status IN ('published', 'rejected') THEN 1 END) * 100)::numeric, 
              2
            )
            ELSE 0 
          END as acceptance_rate
        FROM manuscripts
        WHERE created_by = $1
          AND status IN ('published', 'rejected')
      `, [userId]);
      
      stats.successRate = successRate.rows[0];
    }

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET WORKFLOW METRICS
================================= */
export const getWorkflowMetrics = async (req, res) => {
  try {
    // Only allow editors and admins
    if (!['admin', 'eic', 'ae'].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { days = 30 } = req.query;

    // 1. Funnel data
    const funnelData = await pool.query(`
      WITH stage_counts AS (
        SELECT 
          COUNT(DISTINCT CASE WHEN status IN ('submitted', 'screening', 'under_review', 'ae_recommendation', 'eic_decision', 'published') THEN id END) as submitted,
          COUNT(DISTINCT CASE WHEN status IN ('screening', 'under_review', 'ae_recommendation', 'eic_decision', 'published') THEN id END) as screening,
          COUNT(DISTINCT CASE WHEN status IN ('under_review', 'ae_recommendation', 'eic_decision', 'published') THEN id END) as under_review,
          COUNT(DISTINCT CASE WHEN status IN ('ae_recommendation', 'eic_decision', 'published') THEN id END) as ae_recommendation,
          COUNT(DISTINCT CASE WHEN status IN ('eic_decision', 'published') THEN id END) as eic_decision,
          COUNT(DISTINCT CASE WHEN status = 'published' THEN id END) as published
        FROM manuscripts
        WHERE created_at >= NOW() - (INTERVAL '1 day' * $1)
      )
      SELECT * FROM stage_counts
    `, [days]);

    // 2. Average processing time by stage
    const processingTimes = await pool.query(`
      WITH stage_durations AS (
        SELECT 
          msh.manuscript_id,
          ws_prev.name as from_stage,
          ws_new.name as to_stage,
          EXTRACT(EPOCH FROM (msh.created_at - LAG(msh.created_at) OVER (
            PARTITION BY msh.manuscript_id 
            ORDER BY msh.created_at
          ))) / 86400 as days_in_stage
        FROM manuscript_stage_history msh
        JOIN workflow_stages ws_prev ON msh.previous_stage_id = ws_prev.id
        JOIN workflow_stages ws_new ON msh.new_stage_id = ws_new.id
        WHERE msh.created_at >= NOW() - INTERVAL '90 days'
      )
      SELECT 
        from_stage,
        to_stage,
        COUNT(*) as transition_count,
        ROUND(AVG(days_in_stage)::numeric, 2) as avg_days,
        ROUND(MIN(days_in_stage)::numeric, 2) as min_days,
        ROUND(MAX(days_in_stage)::numeric, 2) as max_days
      FROM stage_durations
      WHERE days_in_stage IS NOT NULL
      GROUP BY from_stage, to_stage
      ORDER BY avg_days DESC
    `);

    // 3. Current workload
    const workload = await pool.query(`
      SELECT 
        ws.name as stage_name,
        COUNT(m.id) as manuscript_count,
        ROUND((COUNT(m.id) * 100.0 / SUM(COUNT(m.id)) OVER ()), 2) as percentage
      FROM manuscripts m
      JOIN workflow_stages ws ON m.current_stage_id = ws.id
      WHERE m.status NOT IN ('published', 'rejected', 'draft')
      GROUP BY ws.id, ws.name
      ORDER BY manuscript_count DESC
    `);

    res.json({
      success: true,
      data: {
        funnel: funnelData.rows[0] || {},
        processingTimes: processingTimes.rows,
        workload: workload.rows
      }
    });

  } catch (error) {
    console.error("WORKFLOW METRICS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET REVIEWER PERFORMANCE
================================= */
export const getReviewerPerformance = async (req, res) => {
  try {
    // Only allow admins and EIC
    if (!['admin', 'eic'].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { period = 30 } = req.query;

    const performance = await pool.query(`
      WITH reviewer_metrics AS (
        SELECT 
          u.uuid,
          u.full_name,
          u.email,
          COUNT(DISTINCT ra.id) as total_assigned,
          COUNT(DISTINCT CASE WHEN ra.status = 'completed' THEN ra.id END) as completed_reviews,
          COUNT(DISTINCT CASE WHEN ra.status = 'accepted' THEN ra.id END) as accepted_reviews,
          COUNT(DISTINCT CASE WHEN ra.status = 'declined' THEN ra.id END) as declined_reviews,
          ROUND(AVG(EXTRACT(EPOCH FROM (ra.completed_at - ra.assigned_at))/86400)::numeric, 2) as avg_review_days,
          COUNT(DISTINCT m.id) as manuscripts_reviewed
        FROM users u
        LEFT JOIN review_assignments ra ON u.uuid = ra.reviewer_id 
          AND ra.assigned_at >= NOW() - (INTERVAL '1 day' * $1)
        LEFT JOIN manuscripts m ON ra.manuscript_id = m.id
        WHERE u.role = 'reviewer' AND u.is_active = true
        GROUP BY u.uuid, u.full_name, u.email
        HAVING COUNT(DISTINCT ra.id) > 0
      )
      SELECT 
        *,
        CASE 
          WHEN total_assigned > 0 
          THEN ROUND((completed_reviews::numeric / total_assigned * 100)::numeric, 2)
          ELSE 0 
        END as completion_rate,
        RANK() OVER (ORDER BY completed_reviews DESC, avg_review_days ASC) as rank
      FROM reviewer_metrics
      ORDER BY completed_reviews DESC, avg_review_days ASC
    `, [period]);

    res.json({
      success: true,
      data: performance.rows
    });

  } catch (error) {
    console.error("REVIEWER PERFORMANCE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET AUTHOR STATISTICS
================================= */
export const getAuthorStatistics = async (req, res) => {
  try {
    // Only allow admins and EIC
    if (!['admin', 'eic'].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const authorStats = await pool.query(`
      WITH author_metrics AS (
        SELECT 
          u.uuid,
          u.full_name,
          u.email,
          u.institution,
          u.orcid_id,
          COUNT(DISTINCT m.id) as total_manuscripts,
          COUNT(DISTINCT CASE WHEN m.status = 'published' THEN m.id END) as published_count,
          COUNT(DISTINCT CASE WHEN m.status = 'rejected' THEN m.id END) as rejected_count,
          COUNT(DISTINCT CASE WHEN m.status = 'under_review' THEN m.id END) as under_review_count,
          MAX(m.created_at) as last_submission,
          MIN(m.created_at) as first_submission,
          ROUND(AVG(EXTRACT(EPOCH FROM (
            COALESCE(m.published_at, m.updated_at) - m.created_at
          )/86400)::numeric), 2) as avg_processing_days
        FROM users u
        LEFT JOIN manuscripts m ON u.uuid = m.corresponding_author_id
        WHERE u.role = 'author' AND u.is_active = true
        GROUP BY u.uuid, u.full_name, u.email, u.institution, u.orcid_id
        HAVING COUNT(DISTINCT m.id) > 0
      )
      SELECT 
        *,
        CASE 
          WHEN total_manuscripts > 0 
          THEN ROUND((published_count::numeric / total_manuscripts * 100)::numeric, 2)
          ELSE 0 
        END as success_rate,
        RANK() OVER (ORDER BY published_count DESC, total_manuscripts DESC) as rank
      FROM author_metrics
      ORDER BY published_count DESC, total_manuscripts DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: authorStats.rows
    });

  } catch (error) {
    console.error("AUTHOR STATISTICS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET PUBLICATION TRENDS
================================= */
export const getPublicationTrends = async (req, res) => {
  try {
    const { groupBy = 'month', limit = 12 } = req.query;

    let interval;
    switch(groupBy) {
      case 'week':
        interval = 'week';
        break;
      case 'month':
        interval = 'month';
        break;
      case 'quarter':
        interval = 'quarter';
        break;
      case 'year':
        interval = 'year';
        break;
      default:
        interval = 'month';
    }

    const trends = await pool.query(`
      WITH time_series AS (
        SELECT 
          DATE_TRUNC($1, created_at) as period,
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as publications,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejections,
          ROUND(AVG(
            CASE 
              WHEN published_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (published_at - created_at))/86400
              ELSE NULL 
            END
          )::numeric, 2) as avg_publication_days
        FROM manuscripts
        WHERE created_at >= NOW() - (INTERVAL '1 year' * $2::integer)
        GROUP BY DATE_TRUNC($1, created_at)
        ORDER BY period DESC
        LIMIT $2
      )
      SELECT 
        TO_CHAR(period, 'YYYY-MM-DD') as period,
        total_submissions,
        publications,
        rejections,
        COALESCE(avg_publication_days, 0) as avg_publication_days,
        CASE 
          WHEN total_submissions > 0 
          THEN ROUND((publications::numeric / total_submissions * 100)::numeric, 2)
          ELSE 0 
        END as acceptance_rate
      FROM time_series
      ORDER BY period ASC
    `, [interval, parseInt(limit)]);

    res.json({
      success: true,
      data: trends.rows
    });

  } catch (error) {
    console.error("PUBLICATION TRENDS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET CATEGORY PERFORMANCE
================================= */
export const getCategoryPerformance = async (req, res) => {
  try {
    const performance = await pool.query(`
      SELECT 
        c.id,
        c.name as category_name,
        c.description,
        COUNT(DISTINCT m.id) as total_manuscripts,
        COUNT(DISTINCT CASE WHEN m.status = 'published' THEN m.id END) as published_count,
        COUNT(DISTINCT CASE WHEN m.status = 'rejected' THEN m.id END) as rejected_count,
        COUNT(DISTINCT ra.id) as total_reviews,
        ROUND(AVG(
          CASE 
            WHEN m.published_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (m.published_at - m.created_at))/86400
            ELSE NULL 
          END
        )::numeric, 2) as avg_publication_days,
        COUNT(DISTINCT u.uuid) as unique_authors
      FROM categories c
      LEFT JOIN manuscripts m ON c.id = m.category_id
      LEFT JOIN review_assignments ra ON m.id = ra.manuscript_id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      WHERE m.created_at >= NOW() - INTERVAL '1 year'
      GROUP BY c.id, c.name, c.description
      HAVING COUNT(DISTINCT m.id) > 0
      ORDER BY total_manuscripts DESC
    `);

    res.json({
      success: true,
      data: performance.rows
    });

  } catch (error) {
    console.error("CATEGORY PERFORMANCE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET ACTIVITY TIMELINE
================================= */
export const getActivityTimeline = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const timeline = await pool.query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - (INTERVAL '1 day' * $1),
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      )
      SELECT 
        d.date,
        COUNT(DISTINCT m.id) FILTER (WHERE DATE(m.created_at) = d.date) as new_submissions,
        COUNT(DISTINCT m.id) FILTER (WHERE DATE(m.published_at) = d.date) as publications,
        COUNT(DISTINCT m.id) FILTER (WHERE DATE(m.updated_at) = d.date AND m.status = 'rejected') as rejections,
        COUNT(DISTINCT ra.id) FILTER (WHERE DATE(ra.assigned_at) = d.date) as reviews_assigned,
        COUNT(DISTINCT ra.id) FILTER (WHERE DATE(ra.completed_at) = d.date) as reviews_completed
      FROM dates d
      LEFT JOIN manuscripts m ON DATE(m.created_at) = d.date OR DATE(m.published_at) = d.date OR DATE(m.updated_at) = d.date
      LEFT JOIN review_assignments ra ON DATE(ra.assigned_at) = d.date OR DATE(ra.completed_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `, [days]);

    res.json({
      success: true,
      data: timeline.rows
    });

  } catch (error) {
    console.error("ACTIVITY TIMELINE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET SYSTEM HEALTH
================================= */
export const getSystemHealth = async (req, res) => {
  try {
    // Only allow admins
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const health = {};

    // Database connections
    const dbStatus = await pool.query(`
      SELECT 
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections,
        current_setting('max_connections') as max_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    health.database = dbStatus.rows[0];

    // Storage usage
    const storage = await pool.query(`
      SELECT 
        pg_database_size(current_database()) as database_size,
        pg_size_pretty(pg_database_size(current_database())) as database_size_pretty,
        COALESCE(SUM(file_size::bigint), 0) as files_storage,
        COUNT(*) as total_files
      FROM files
    `);

    health.storage = storage.rows[0];

    // Recent activity
    const activity = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as manuscripts_24h,
        COUNT(*) FILTER (WHERE status = 'published' AND published_at >= NOW() - INTERVAL '24 hours') as publications_24h,
        COUNT(*) FILTER (WHERE status = 'submitted' AND created_at >= NOW() - INTERVAL '24 hours') as submissions_24h
      FROM manuscripts
    `);

    health.recentActivity = activity.rows[0];

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error("SYSTEM HEALTH ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET DASHBOARD MANUSCRIPTS (with filters)
================================= */
export const getDashboardManuscripts = async (req, res) => {
  try {
    const {
      status,
      category_id,
      search,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const queryParams = [];
    let paramIndex = 1;

    let whereClause = 'WHERE 1=1';
    
    // Filter by user role
    if (req.user.role === 'author') {
      whereClause += ` AND m.created_by = $${paramIndex}`;
      queryParams.push(req.user.uuid);
      paramIndex++;
    }

    // Apply filters
    if (status && status !== 'all') {
      whereClause += ` AND m.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (category_id) {
      whereClause += ` AND m.category_id = $${paramIndex}`;
      queryParams.push(category_id);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (m.title ILIKE $${paramIndex} OR m.abstract ILIKE $${paramIndex} OR m.keywords::text ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM manuscripts m
      ${whereClause}
    `, queryParams);

    // Get paginated results
    const result = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.abstract,
        m.status,
        m.keywords,
        m.authors,
        m.created_at,
        m.updated_at,
        m.submitted_at,
        m.published_at,
        ws.name as stage_name,
        c.name as category_name,
        c.id as category_id,
        u.full_name as author_name,
        u.email as author_email,
        (
          SELECT COUNT(*) 
          FROM files f 
          WHERE f.manuscript_id = m.id
        ) as files_count,
        (
          SELECT COALESCE(
            json_agg(json_build_object(
              'id', f.id,
              'file_type', f.file_type,
              'file_size', f.file_size,
              'uploaded_at', f.uploaded_at
            ) ORDER BY f.uploaded_at DESC),
            '[]'::json
          )
          FROM files f
          WHERE f.manuscript_id = m.id
          LIMIT 3
        ) as recent_files,
        (
          SELECT COUNT(*) 
          FROM review_assignments ra 
          WHERE ra.manuscript_id = m.id
        ) as reviews_count
      FROM manuscripts m
      LEFT JOIN workflow_stages ws ON m.current_stage_id = ws.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      ${whereClause}
      ORDER BY m.${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: {
        manuscripts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          total_pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      }
    });

  } catch (error) {
    console.error("DASHBOARD MANUSCRIPTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   EXPORT DASHBOARD DATA
================================= */
export const exportDashboardData = async (req, res) => {
  try {
    // Only allow admins and editors
    if (!['admin', 'eic', 'ae'].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { format = 'json', start_date, end_date } = req.query;

    let dateFilter = '';
    const queryParams = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND m.created_at BETWEEN $1 AND $2';
      queryParams.push(start_date, end_date);
    }

    const data = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.status,
        m.created_at,
        m.submitted_at,
        m.published_at,
        ws.name as current_stage,
        c.name as category,
        u.full_name as author_name,
        u.email as author_email,
        (
          SELECT COUNT(*) 
          FROM files f 
          WHERE f.manuscript_id = m.id
        ) as file_count,
        (
          SELECT COUNT(*) 
          FROM review_assignments ra 
          WHERE ra.manuscript_id = m.id
        ) as review_count
      FROM manuscripts m
      LEFT JOIN workflow_stages ws ON m.current_stage_id = ws.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.corresponding_author_id = u.uuid
      WHERE 1=1 ${dateFilter}
      ORDER BY m.created_at DESC
    `, queryParams);

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Title', 'Status', 'Created', 'Author', 'Category', 'Files', 'Reviews'];
      const csvRows = [];
      
      csvRows.push(headers.join(','));
      
      for (const row of data.rows) {
        const values = [
          row.id,
          `"${row.title.replace(/"/g, '""')}"`,
          row.status,
          row.created_at,
          `"${row.author_name}"`,
          row.category,
          row.file_count,
          row.review_count
        ];
        csvRows.push(values.join(','));
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard-export.csv');
      res.send(csvRows.join('\n'));
    } else {
      res.json({
        success: true,
        data: data.rows,
        count: data.rows.length
      });
    }

  } catch (error) {
    console.error("EXPORT DASHBOARD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};