import db from "../../../config/db.js";

/* SEARCH */

export const searchPublicItems = async (req, res) => {
  const { query = "", item_type = "all", year = "all", sort = "recent" } = req.query;

  let sql = `
    SELECT uuid, title, item_type, abstract, created_at,
           COALESCE(views,0) AS views,
           COALESCE(downloads,0) AS downloads,
           file_path
    FROM repository_items
    WHERE status ILIKE 'approved'
  `;

  const params = [];

  if (query) {
    params.push(`%${query}%`);
    sql += ` AND title ILIKE $${params.length}`;
  }

  if (item_type !== "all") {
    params.push(item_type);
    sql += ` AND item_type = $${params.length}`;
  }

  if (year !== "all") {
    params.push(year);
    sql += ` AND EXTRACT(YEAR FROM created_at) = $${params.length}`;
  }

  sql += sort === "popular"
    ? " ORDER BY views DESC"
    : " ORDER BY created_at DESC";

  const { rows } = await db.query(sql, params);
  res.json({ items: rows });
};

/* GET SINGLE ITEM */
export const getPublicItem = async (req, res) => {
  const { uuid } = req.params;

  const { rows } = await db.query(
    `SELECT *,
            COALESCE(views,0) AS views,
            COALESCE(downloads,0) AS downloads
     FROM repository_items
     WHERE uuid = $1 AND status ILIKE 'approved'`,
    [uuid]
  );

  if (!rows.length) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json(rows[0]);
};


/* TRACK VIEW */
export const trackView = async (req, res) => {
  const { uuid } = req.params;

  const result = await db.query(
    `UPDATE repository_items
     SET views = COALESCE(views,0) + 1
     WHERE uuid = $1
     RETURNING views`,
    [uuid]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ views: result.rows[0].views });
};



/* TRACK DOWNLOAD */
export const trackDownload = async (req, res) => {
  const { uuid } = req.params;

  const result = await db.query(
    `UPDATE repository_items
     SET downloads = COALESCE(downloads,0) + 1
     WHERE uuid = $1
     RETURNING downloads`,
    [uuid]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ downloads: result.rows[0].downloads });
};


/* RATE */
export const rateItem = async (req, res) => {
  const { uuid } = req.params;
  const { rating } = req.body;

  await db.query(
    `INSERT INTO repository_ratings (item_uuid, rating)
     VALUES ($1, $2)`,
    [uuid, rating]
  );

  res.sendStatus(201);
};
