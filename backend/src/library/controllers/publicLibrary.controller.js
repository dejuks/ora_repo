import pool from '../../config/db.js';
import { ok, fail } from '../utils/responseFormatter.js';

const publishedBaseSql = `
  WITH contributor_map AS (
    SELECT
      cmc.material_id,
      STRING_AGG(c.full_name, ', ' ORDER BY cmc.sequence_no, c.full_name) AS authors
    FROM catalog_material_contributors cmc
    JOIN contributors c ON c.contributor_id = cmc.contributor_id
    GROUP BY cmc.material_id
  ),
  latest_submission AS (
    SELECT DISTINCT ON (title)
      title,
      submission_id,
      status,
      published_at,
      submitted_at,
      access_level
    FROM digital_submissions
    ORDER BY title, submitted_at DESC NULLS LAST, created_at DESC NULLS LAST, submission_id DESC
  ),
  physical_items AS (
    SELECT
      cm.material_id,
      cm.title,
      cm.subtitle,
      cm.description,
      cm.abstract,
      cm.publication_year,
      cm.material_format,
      cm.created_at,
      cm.updated_at,
      cm.is_active,
      mt.name AS material_type_name,
      lc.name AS category_name,
      p.name AS publisher_name,
      l.name AS language_name,
      COALESCE(contributor_map.authors, 'Unknown Author') AS authors,
      COUNT(mc.copy_id)::int AS total_copies,
      COUNT(CASE WHEN mc.status = 'available' THEN 1 END)::int AS available_copies,
      0::int AS total_files,
      'public'::text AS access_level,
      'published'::text AS publication_status,
      COALESCE(cm.updated_at, cm.created_at) AS published_at,
      'physical'::text AS library_source
    FROM catalog_materials cm
    JOIN material_types mt ON mt.material_type_id = cm.material_type_id
    LEFT JOIN library_categories lc ON lc.category_id = cm.category_id
    LEFT JOIN publishers p ON p.publisher_id = cm.publisher_id
    LEFT JOIN languages l ON l.language_id = cm.language_id
    LEFT JOIN contributor_map ON contributor_map.material_id = cm.material_id
    LEFT JOIN material_copies mc ON mc.material_id = cm.material_id
    WHERE cm.material_format = 'physical'
      AND cm.is_active = TRUE
    GROUP BY cm.material_id, mt.name, lc.name, p.name, l.name, contributor_map.authors
    HAVING COUNT(CASE WHEN mc.status = 'available' THEN 1 END) > 0
  ),
  digital_items AS (
    SELECT
      cm.material_id,
      cm.title,
      cm.subtitle,
      cm.description,
      cm.abstract,
      cm.publication_year,
      cm.material_format,
      cm.created_at,
      cm.updated_at,
      cm.is_active,
      mt.name AS material_type_name,
      lc.name AS category_name,
      p.name AS publisher_name,
      l.name AS language_name,
      COALESCE(contributor_map.authors, 'Unknown Author') AS authors,
      0::int AS total_copies,
      0::int AS available_copies,
      COUNT(drf.file_id)::int AS total_files,
      COALESCE(dr.access_level, latest_submission.access_level, 'public')::text AS access_level,
      COALESCE(latest_submission.status, 'published')::text AS publication_status,
      COALESCE(latest_submission.published_at, cm.updated_at, cm.created_at) AS published_at,
      'digital'::text AS library_source
    FROM catalog_materials cm
    JOIN material_types mt ON mt.material_type_id = cm.material_type_id
    LEFT JOIN library_categories lc ON lc.category_id = cm.category_id
    LEFT JOIN publishers p ON p.publisher_id = cm.publisher_id
    LEFT JOIN languages l ON l.language_id = cm.language_id
    LEFT JOIN contributor_map ON contributor_map.material_id = cm.material_id
    JOIN digital_resources dr ON dr.material_id = cm.material_id
    LEFT JOIN digital_resource_files drf ON drf.digital_resource_id = dr.digital_resource_id AND drf.is_current = TRUE
    LEFT JOIN latest_submission ON latest_submission.title = cm.title
    WHERE cm.material_format = 'digital'
      AND cm.is_active = TRUE
      AND dr.is_active = TRUE
      AND COALESCE(dr.access_level, latest_submission.access_level, 'public') = 'public'
      AND COALESCE(latest_submission.status, 'published') = 'published'
      AND (dr.embargo_until IS NULL OR dr.embargo_until <= CURRENT_DATE)
      AND (dr.license_start_date IS NULL OR dr.license_start_date <= CURRENT_DATE)
      AND (dr.license_end_date IS NULL OR dr.license_end_date >= CURRENT_DATE)
    GROUP BY cm.material_id, mt.name, lc.name, p.name, l.name, contributor_map.authors, dr.access_level, latest_submission.access_level, latest_submission.status, latest_submission.published_at
  ),
  published_items AS (
    SELECT * FROM physical_items
    UNION ALL
    SELECT * FROM digital_items
  )
`;

class PublicLibraryController {
  async index(req, res) {
    try {
      const search = String(req.query.search || '').trim();
      const category = String(req.query.category || '').trim();
      const format = String(req.query.format || '').trim();
      const perPage = Math.min(Math.max(Number(req.query.per_page) || 12, 1), 100);
      const currentPage = Math.max(Number(req.query.page) || 1, 1);
      const offset = (currentPage - 1) * perPage;

      const values = [];
      const filters = [];

      if (search) {
        values.push(`%${search}%`);
        const i = values.length;
        filters.push(`(title ILIKE $${i} OR COALESCE(description, '') ILIKE $${i} OR COALESCE(abstract, '') ILIKE $${i} OR COALESCE(authors, '') ILIKE $${i} OR COALESCE(category_name, '') ILIKE $${i})`);
      }
      if (category) {
        values.push(category);
        filters.push(`COALESCE(category_name, '') = $${values.length}`);
      }
      if (format) {
        values.push(format);
        filters.push(`library_source = $${values.length}`);
      }

      const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

      const countSql = `${publishedBaseSql}
        SELECT COUNT(*)::int AS total
        FROM published_items
        ${whereClause}
      `;

      const listSql = `${publishedBaseSql}
        SELECT *
        FROM published_items
        ${whereClause}
        ORDER BY published_at DESC NULLS LAST, created_at DESC NULLS LAST, title ASC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      const [countRes, listRes] = await Promise.all([
        pool.query(countSql, values),
        pool.query(listSql, [...values, perPage, offset]),
      ]);

      const total = countRes.rows[0]?.total || 0;
      const rows = listRes.rows.map((row) => ({
        ...row,
        status: row.publication_status,
        source_type: row.library_source,
      }));

      return ok(
        res,
        rows,
        'Published library contents fetched successfully',
        200,
        {
          current_page: currentPage,
          per_page: perPage,
          total,
          last_page: Math.max(Math.ceil(total / perPage), 1),
        }
      );
    } catch (error) {
      console.error('Public library list error:', error);
      return fail(res, error.message || 'Failed to fetch published library contents', 500);
    }
  }

  async show(req, res) {
    try {
      const sql = `${publishedBaseSql}
        SELECT *
        FROM published_items
        WHERE material_id = $1
        LIMIT 1
      `;
      const result = await pool.query(sql, [req.params.id]);
      const row = result.rows[0];
      if (!row) {
        return fail(res, 'Published library item not found', 404);
      }
      return ok(res, { ...row, status: row.publication_status, source_type: row.library_source }, 'Published library item fetched successfully');
    } catch (error) {
      console.error('Public library detail error:', error);
      return fail(res, error.message || 'Failed to fetch published library item', 500);
    }
  }

  async categories(req, res) {
    try {
      const sql = `${publishedBaseSql}
        SELECT COALESCE(category_name, 'Uncategorized') AS name, COUNT(*)::int AS count
        FROM published_items
        GROUP BY COALESCE(category_name, 'Uncategorized')
        ORDER BY count DESC, name ASC
      `;
      const result = await pool.query(sql);
      return ok(res, result.rows, 'Published library categories fetched successfully');
    } catch (error) {
      console.error('Public library categories error:', error);
      return fail(res, error.message || 'Failed to fetch published library categories', 500);
    }
  }
}

export default new PublicLibraryController();
