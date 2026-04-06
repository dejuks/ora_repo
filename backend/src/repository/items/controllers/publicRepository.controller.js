import db from "../../../config/db.js";

/* helper: public visibility condition */
const PUBLIC_CONDITION = `
  status ILIKE 'approved'
  AND (
    access_level IS NULL
    OR access_level IN ('open', 'public')
  )
  AND (
    embargo_until IS NULL
    OR embargo_until <= CURRENT_DATE
  )
`;

/* SEARCH PUBLIC ITEMS */
export const searchPublicItems = async (req, res) => {
  try {
    const {
      query = "",
      item_type = "all",
      year = "all",
      sort = "recent",
      page = 1,
      limit = 10,
    } = req.query;

    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (safePage - 1) * safeLimit;

    let sql = `
      SELECT
        uuid,
        title,
        abstract,
        item_type,
        language,
        doi,
        handle,
        access_level,
        embargo_until,
        file_path,
        created_at,
        COALESCE(views, 0) AS views,
        COALESCE(downloads, 0) AS downloads
      FROM repository_items
      WHERE ${PUBLIC_CONDITION}
    `;

    let countSql = `
      SELECT COUNT(*)::int AS total
      FROM repository_items
      WHERE ${PUBLIC_CONDITION}
    `;

    const params = [];
    const conditions = [];

    if (query) {
      params.push(`%${query}%`);
      conditions.push(`
        (
          title ILIKE $${params.length}
          OR abstract ILIKE $${params.length}
          OR COALESCE(doi, '') ILIKE $${params.length}
        )
      `);
    }

    if (item_type !== "all") {
      params.push(item_type);
      conditions.push(`item_type = $${params.length}`);
    }

    if (year !== "all") {
      params.push(Number(year));
      conditions.push(`EXTRACT(YEAR FROM created_at) = $${params.length}`);
    }

    if (conditions.length) {
      sql += ` AND ${conditions.join(" AND ")}`;
      countSql += ` AND ${conditions.join(" AND ")}`;
    }

    sql += sort === "popular"
      ? ` ORDER BY COALESCE(views, 0) DESC, created_at DESC`
      : ` ORDER BY created_at DESC`;

    params.push(safeLimit);
    params.push(offset);

    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const countParams = params.slice(0, -2);

    const [itemsResult, countResult] = await Promise.all([
      db.query(sql, params),
      db.query(countSql, countParams),
    ]);

    res.json({
      success: true,
      items: itemsResult.rows,
      total: countResult.rows[0]?.total || 0,
      page: safePage,
      limit: safeLimit,
    });
  } catch (error) {
    console.error("searchPublicItems error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search public repository items",
    });
  }
};

/* GET SINGLE PUBLIC ITEM */
export const getPublicItem = async (req, res) => {
  try {
    const { uuid } = req.params;

    const { rows } = await db.query(
      `
      SELECT
        uuid,
        title,
        abstract,
        item_type,
        language,
        doi,
        handle,
        access_level,
        embargo_until,
        file_path,
        created_at,
        COALESCE(views, 0) AS views,
        COALESCE(downloads, 0) AS downloads
      FROM repository_items
      WHERE uuid = $1
        AND ${PUBLIC_CONDITION}
      `,
      [uuid]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not publicly accessible",
      });
    }

    res.json({
      success: true,
      item: rows[0],
    });
  } catch (error) {
    console.error("getPublicItem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public item",
    });
  }
};

/* TRACK VIEW */
export const trackView = async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await db.query(
      `
      UPDATE repository_items
      SET views = COALESCE(views, 0) + 1
      WHERE uuid = $1
        AND ${PUBLIC_CONDITION}
      RETURNING views
      `,
      [uuid]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not publicly accessible",
      });
    }

    res.json({
      success: true,
      views: result.rows[0].views,
    });
  } catch (error) {
    console.error("trackView error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track item view",
    });
  }
};

/* TRACK DOWNLOAD */
export const trackDownload = async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await db.query(
      `
      UPDATE repository_items
      SET downloads = COALESCE(downloads, 0) + 1
      WHERE uuid = $1
        AND ${PUBLIC_CONDITION}
      RETURNING downloads
      `,
      [uuid]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not publicly accessible",
      });
    }

    res.json({
      success: true,
      downloads: result.rows[0].downloads,
    });
  } catch (error) {
    console.error("trackDownload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track item download",
    });
  }
};

/* RATE */
export const rateItem = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const check = await db.query(
      `
      SELECT uuid
      FROM repository_items
      WHERE uuid = $1
        AND ${PUBLIC_CONDITION}
      `,
      [uuid]
    );

    if (!check.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not publicly accessible",
      });
    }

    await db.query(
      `
      INSERT INTO repository_ratings (item_uuid, rating)
      VALUES ($1, $2)
      `,
      [uuid, rating]
    );

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.error("rateItem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rate item",
    });
  }
};

/* PUBLIC STATS */
export const getPublicStats = async (_req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        COUNT(*)::int AS total_items,
        COALESCE(SUM(downloads), 0)::int AS total_downloads,
        COUNT(DISTINCT submitter_id)::int AS total_contributors
      FROM repository_items
      WHERE ${PUBLIC_CONDITION}
      `
    );

    res.json({
      success: true,
      totalItems: result.rows[0]?.total_items || 0,
      totalDownloads: result.rows[0]?.total_downloads || 0,
      totalContributors: result.rows[0]?.total_contributors || 0,
    });
  } catch (error) {
    console.error("getPublicStats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch repository stats",
    });
  }
};

/* RECENT ITEMS */
export const getRecentPublicItems = async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);

    const result = await db.query(
      `
      SELECT
        uuid,
        title,
        abstract,
        item_type,
        language,
        doi,
        handle,
        access_level,
        embargo_until,
        file_path,
        created_at,
        COALESCE(views, 0) AS views,
        COALESCE(downloads, 0) AS downloads
      FROM repository_items
      WHERE ${PUBLIC_CONDITION}
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    res.json({
      success: true,
      items: result.rows,
    });
  } catch (error) {
    console.error("getRecentPublicItems error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent public items",
    });
  }
};