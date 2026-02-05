import pool from "../../../config/db.js";

export const RepositoryItem = {
  create(data, userId) {
    return pool.query(
      `INSERT INTO repository_items
      (
        title,
        abstract,
        item_type,
        language,
        doi,
        handle,
        access_level,
        embargo_until,
        file_path,
        submitter_id,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        data.title,
        data.abstract,
        data.item_type,
        data.language,
        data.doi || null,
        data.handle || null,
        data.access_level,
        data.embargo_until || null,
        data.file_path || null,
        userId, 
        data.status 
      ]
    );
  },

  findAll() {
    return pool.query(`SELECT * FROM repository_items ORDER BY created_at DESC`);
  },

  findById(uuid) {
    return pool.query(`SELECT * FROM repository_items WHERE uuid = $1`, [uuid]);
  },

   update(uuid, data) {
  return pool.query(
    `UPDATE repository_items SET
      title = $1,
      abstract = $2,
      item_type = $3,
      language = $4,
      access_level = $5,
      status = $6,
      embargo_until = $7,
      file_path = $8,
      correction_note = $9,
      updated_at = NOW()
    WHERE uuid = $10
    RETURNING *`,
    [
      data.title,
      data.abstract,
      data.item_type,
      data.language,
      data.access_level,
      data.status,
      data.embargo_until || null,
      data.file_path || null,
      data.correction_note || null,
      uuid,
    ]
  );
}
,
findByStatusAndUser(status, userId) {
  return pool.query(
    `SELECT * FROM repository_items WHERE status=$1 AND submitter_id=$2 ORDER BY created_at DESC`,
    [status, userId]
  );
},
  delete(id) {
    return pool.query(`DELETE FROM repository_items WHERE id = $1`, [id]);
  },
  // Find items by status (for curator queue)
findByStatus(status) {
  return pool.query(
    `SELECT * FROM repository_items WHERE status = $1 ORDER BY created_at DESC`,
    [status]
  );
}
,
// Update status (approve/reject/revision) with optional reason/comment
updateStatus(uuid, status, rejection_reason = null, curator_comment = null) {
  return pool.query(
    `UPDATE repository_items
       SET status = $1,
           rejection_reason = $2,
           curator_comment = $3,
           updated_at = CURRENT_TIMESTAMP
     WHERE uuid = $4
     RETURNING *`,
    [status, rejection_reason, curator_comment, uuid]
  );
}
,
findDuplicate({ title, doi, handle }) {
    return pool.query(
      `
      SELECT 
        ri.uuid,
        ri.title,
        ri.doi,
        ri.handle,
        ri.created_at,
        u.full_name AS owner_name,
        u.email AS owner_email
      FROM repository_items ri
      JOIN users u ON u.uuid = ri.submitter_id
      WHERE
        LOWER(ri.title) = LOWER($1::text)
        OR ( $2::text IS NOT NULL AND ri.doi = $2::text )
        OR ( $3::text IS NOT NULL AND ri.handle = $3::text )
      LIMIT 1
      `,
      [
        title,
        doi ?? null,
        handle ?? null
      ]
    );
  },

updateMetadata(uuid, data) {
  return pool.query(
    `UPDATE repository_items SET
      suggested_title = $1,
      suggested_abstract = $2,
      keywords = $3
     WHERE uuid = $4
     RETURNING *`,
    [data.suggested_title, data.suggested_abstract, data.keywords, uuid]
  );
},
findByAuthorAndStatuses(userId, statuses = []) {
  return pool.query(
    `
    SELECT *
    FROM repository_items
    WHERE submitter_id = $1
      AND status = ANY($2::text[])
    ORDER BY created_at DESC
    `,
    [userId, statuses]
  );
}
,
// RepositoryItem model search method
search: async ({ query = "", filterLetter = "", page = 1, limit = 10 }) => {
  try {
    const offset = (page - 1) * limit;
    let params = [];
    let conditions = [];
    let paramCount = 1;

    if (query.trim() !== "") {
      params.push(`%${query.trim()}%`);
      conditions.push(`(title ILIKE $${paramCount} OR abstract ILIKE $${paramCount})`);
      paramCount++;
    }

    if (filterLetter.trim() !== "") {
      params.push(`${filterLetter.trim()}%`);
      conditions.push(`title ILIKE $${paramCount}`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const dataQuery = `
      SELECT id, title, abstract, item_type, language, access_level, status, created_at
      FROM repository_items
      ${whereClause}
      ORDER BY title ASC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    // Add limit and offset to params
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM repository_items
      ${whereClause}
    `;

    // For count query, we need to pass params without limit/offset
    const countParams = params.slice(0, params.length - 2);
    
    const dataResult = await pool.query(dataQuery, params);
    const countResult = await pool.query(countQuery, countParams.length > 0 ? countParams : []);

    const total = parseInt(countResult.rows[0].total, 10);

    return {
      items: dataResult.rows,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      currentPage: page
    };
  } catch (err) {
    console.error("Postgres search error:", err);
    throw err;
  }
},
findByUUID(uuid) {
  return pool.query(
    `
    SELECT
      uuid,
      title,
      abstract,
      item_type,
      status,
      file_path,
      created_at,
      submitter_id
    FROM repository_items
    WHERE uuid = $1
    `,
    [uuid]
  );
},


  /* ---------- REVIEWER ---------- */
  getReviewerNewQueue() {
    return pool.query(
      `
      SELECT uuid, title, abstract, item_type, created_at
      FROM repository_items
      WHERE status = 'submitted'
      ORDER BY created_at DESC
      `
    );
  },

  claim(uuid, reviewerId) {
    return pool.query(
      `
      UPDATE repository_items
      SET status = 'under_review',
          reviewer_id = $2,
          claimed_at = NOW()
      WHERE uuid = $1 AND status = 'submitted'
      RETURNING *
      `,
      [uuid, reviewerId]
    );
  },

  bulkClaim(uuids, reviewerId) {
    return pool.query(
      `
      UPDATE repository_items
      SET status = 'under_review',
          reviewer_id = $2,
          claimed_at = NOW()
      WHERE uuid = ANY($1)
        AND status = 'submitted'
      RETURNING uuid
      `,
      [uuids, reviewerId]
    );
  },
  // Check status
 getStatusByUUID(uuid) {
  return pool.query(
    `SELECT status FROM repository_items WHERE uuid = $1`,
    [uuid]
  );
}
,
// Update revision comment only
 updateRevisionComment(uuid, comment, userId) {
  return pool.query(
    `
    UPDATE repository_items
    SET curator_comment = $1,
        updated_by = $2,
        updated_at = NOW()
    WHERE uuid = $3
    RETURNING *
    `,
    [comment, userId, uuid]
  );
}

};

