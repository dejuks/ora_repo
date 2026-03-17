import pool from '../../config/db.js';

function toInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const catalogSearchService = {
  async search(params = {}) {
    const page = toInt(params.page, 1);
    const limit = Math.min(toInt(params.limit, 20), 100);
    const offset = (page - 1) * limit;
    const values = [];
    const where = [`cm.is_active = TRUE`];

    const add = (sql, value) => {
      values.push(value);
      where.push(sql.replace('?', `$${values.length}`));
    };

    const search = String(params.search || '').trim();
    if (search) {
      values.push(search);
      const idx = values.length;
      where.push(`(
        cm.title ILIKE '%' || $${idx} || '%' OR
        cm.subtitle ILIKE '%' || $${idx} || '%' OR
        cm.isbn ILIKE '%' || $${idx} || '%' OR
        cm.issn ILIKE '%' || $${idx} || '%' OR
        cm.call_number ILIKE '%' || $${idx} || '%' OR
        cm.classification_code ILIKE '%' || $${idx} || '%' OR
        COALESCE(cm.abstract, '') ILIKE '%' || $${idx} || '%' OR
        EXISTS (
          SELECT 1 FROM unnest(COALESCE(cm.keywords, ARRAY[]::text[])) kw
          WHERE kw ILIKE '%' || $${idx} || '%'
        ) OR
        EXISTS (
          SELECT 1 FROM catalog_material_contributors cmc
          JOIN contributors c ON c.contributor_id = cmc.contributor_id
          WHERE cmc.material_id = cm.material_id AND c.full_name ILIKE '%' || $${idx} || '%'
        ) OR
        EXISTS (
          SELECT 1 FROM catalog_material_subjects cms
          JOIN library_subjects s ON s.subject_id = cms.subject_id
          WHERE cms.material_id = cm.material_id AND (s.name ILIKE '%' || $${idx} || '%' OR COALESCE(s.code,'') ILIKE '%' || $${idx} || '%')
        )
      )`);
    }

    if (params.material_type_id) add(`cm.material_type_id = ?`, params.material_type_id);
    if (params.category_id) add(`cm.category_id = ?`, params.category_id);
    if (params.publisher_id) add(`cm.publisher_id = ?`, params.publisher_id);
    if (params.language_id) add(`cm.language_id = ?`, params.language_id);
    if (params.material_format) add(`cm.material_format = ?`, params.material_format);
    if (params.branch_id) add(`EXISTS (SELECT 1 FROM material_copies mc2 WHERE mc2.material_id = cm.material_id AND mc2.branch_id = ?)` , params.branch_id);
    if (params.subject_id) add(`EXISTS (SELECT 1 FROM catalog_material_subjects cms WHERE cms.material_id = cm.material_id AND cms.subject_id = ?)` , params.subject_id);
    if (params.contributor_id) add(`EXISTS (SELECT 1 FROM catalog_material_contributors cmc WHERE cmc.material_id = cm.material_id AND cmc.contributor_id = ?)` , params.contributor_id);
    if (params.publication_year_from) add(`cm.publication_year >= ?`, Number(params.publication_year_from));
    if (params.publication_year_to) add(`cm.publication_year <= ?`, Number(params.publication_year_to));
    if (params.is_reference_only !== undefined && params.is_reference_only !== '') add(`cm.is_reference_only = ?`, String(params.is_reference_only) === 'true');
    if (params.has_digital !== undefined && params.has_digital !== '') add(`EXISTS (SELECT 1 FROM digital_resources dr WHERE dr.material_id = cm.material_id AND dr.is_active = TRUE) = ?`, String(params.has_digital) === 'true');
    if (params.available_only !== undefined && params.available_only !== '') {
      add(`EXISTS (
        SELECT 1 FROM material_copies mc3
        WHERE mc3.material_id = cm.material_id
          AND mc3.status = 'available'
          AND mc3.is_circulation_allowed = TRUE
      ) = ?`, String(params.available_only) === 'true');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
      SELECT
        cm.*,
        mt.name AS material_type_name,
        lc.name AS category_name,
        p.name AS publisher_name,
        lang.name AS language_name,
        COALESCE(cp.total_copies, 0)::int AS total_copies,
        COALESCE(cp.available_copies, 0)::int AS available_copies,
        COALESCE(cp.borrowed_copies, 0)::int AS borrowed_copies,
        COALESCE(cp.reserved_copies, 0)::int AS reserved_copies,
        COALESCE(dr.has_digital, FALSE) AS has_digital,
        dr.digital_resource_id,
        dr.access_level,
        dr.is_downloadable,
        dr.is_streamable
      FROM catalog_materials cm
      LEFT JOIN material_types mt ON mt.material_type_id = cm.material_type_id
      LEFT JOIN library_categories lc ON lc.category_id = cm.category_id
      LEFT JOIN publishers p ON p.publisher_id = cm.publisher_id
      LEFT JOIN languages lang ON lang.language_id = cm.language_id
      LEFT JOIN (
        SELECT material_id,
               COUNT(*) AS total_copies,
               COUNT(*) FILTER (WHERE status = 'available' AND is_circulation_allowed = TRUE) AS available_copies,
               COUNT(*) FILTER (WHERE status = 'borrowed') AS borrowed_copies,
               COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_copies
        FROM material_copies
        GROUP BY material_id
      ) cp ON cp.material_id = cm.material_id
      LEFT JOIN (
        SELECT DISTINCT ON (material_id)
               material_id,
               digital_resource_id,
               access_level,
               is_downloadable,
               is_streamable,
               TRUE AS has_digital
        FROM digital_resources
        WHERE is_active = TRUE
        ORDER BY material_id, created_at DESC
      ) dr ON dr.material_id = cm.material_id
      ${whereSql}
      ORDER BY cm.title ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `SELECT COUNT(*)::int AS total FROM catalog_materials cm ${whereSql}`;
    const [rowsRes, countRes] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values),
    ]);

    return {
      rows: rowsRes.rows,
      meta: {
        page,
        limit,
        total: countRes.rows[0]?.total || 0,
      },
    };
  },

  async getDetails(materialId) {
    const { rows } = await pool.query(
      `SELECT
         cm.*,
         mt.name AS material_type_name,
         lc.name AS category_name,
         p.name AS publisher_name,
         lang.name AS language_name,
         COALESCE((
           SELECT json_agg(json_build_object('contributor_id', c.contributor_id, 'full_name', c.full_name, 'role', cmc.role_name) ORDER BY c.full_name)
           FROM catalog_material_contributors cmc
           JOIN contributors c ON c.contributor_id = cmc.contributor_id
           WHERE cmc.material_id = cm.material_id
         ), '[]'::json) AS contributors,
         COALESCE((
           SELECT json_agg(json_build_object('subject_id', s.subject_id, 'name', s.name, 'code', s.code) ORDER BY s.name)
           FROM catalog_material_subjects cms
           JOIN library_subjects s ON s.subject_id = cms.subject_id
           WHERE cms.material_id = cm.material_id
         ), '[]'::json) AS subjects
       FROM catalog_materials cm
       LEFT JOIN material_types mt ON mt.material_type_id = cm.material_type_id
       LEFT JOIN library_categories lc ON lc.category_id = cm.category_id
       LEFT JOIN publishers p ON p.publisher_id = cm.publisher_id
       LEFT JOIN languages lang ON lang.language_id = cm.language_id
       WHERE cm.material_id = $1`,
      [materialId]
    );
    return rows[0] || null;
  },

  async getAvailability(materialId) {
    const [copiesRes, holdsRes, digitalRes] = await Promise.all([
      pool.query(
        `SELECT mc.*, lb.name AS branch_name, ll.name AS location_name
         FROM material_copies mc
         LEFT JOIN library_branches lb ON lb.branch_id = mc.branch_id
         LEFT JOIN library_locations ll ON ll.location_id = mc.location_id
         WHERE mc.material_id = $1
         ORDER BY lb.name NULLS LAST, mc.accession_number ASC`,
        [materialId]
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM hold_requests
         WHERE material_id = $1 AND status IN ('queued','ready_for_pickup')
         GROUP BY status`,
        [materialId]
      ),
      pool.query(
        `SELECT dr.digital_resource_id, dr.access_level, dr.is_downloadable, dr.is_streamable, dr.license_start_date, dr.license_end_date, dr.embargo_until
         FROM digital_resources dr
         WHERE dr.material_id = $1 AND dr.is_active = TRUE
         ORDER BY dr.created_at DESC`,
        [materialId]
      ),
    ]);
    return {
      copies: copiesRes.rows,
      holdsSummary: holdsRes.rows,
      digitalResources: digitalRes.rows,
    };
  },
};
