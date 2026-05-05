import { BaseModel } from './base.model.js';
import pool from '../../config/db.js';

class DigitalLibraryModel extends BaseModel {
  constructor() {
    super({ table: 'catalog_materials', primaryKey: 'material_id' });
  }

  async listResources({ search = '', access_level = '', status = '', page = 1, per_page = 10 } = {}) {
    const limit = Math.min(Math.max(Number(per_page) || 10, 1), 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const offset = (currentPage - 1) * limit;
    const values = ['digital'];
    const filters = [`cm.material_format = $1`];
    if (String(search || '').trim()) {
      values.push(`%${String(search).trim()}%`);
      const i = values.length;
      filters.push(`(cm.title ILIKE $${i} OR cm.isbn ILIKE $${i} OR cm.description ILIKE $${i})`);
    }
    if (String(access_level || '').trim()) {
      values.push(String(access_level).trim());
      filters.push(`dr.access_level = $${values.length}`);
    }
    if (String(status || '').trim()) {
      values.push(String(status).trim());
      filters.push(`COALESCE(ds.status, 'published') = $${values.length}`);
    }
    const where = `WHERE ${filters.join(' AND ')}`;
    const countSql = `SELECT COUNT(DISTINCT cm.material_id)::int AS total FROM catalog_materials cm LEFT JOIN digital_resources dr ON dr.material_id = cm.material_id LEFT JOIN digital_submissions ds ON ds.title = cm.title ${where}`;
    const listSql = `
      SELECT
        cm.*,
        dr.digital_resource_id,
        dr.access_level,
        dr.drm_required,
        dr.is_downloadable,
        dr.is_streamable,
        dr.license_start_date,
        dr.license_end_date,
        dr.embargo_until,
        ds.submission_id,
        ds.status AS submission_status,
        COUNT(drf.file_id)::int AS total_files
      FROM catalog_materials cm
      LEFT JOIN digital_resources dr ON dr.material_id = cm.material_id
      LEFT JOIN digital_resource_files drf ON drf.digital_resource_id = dr.digital_resource_id
      LEFT JOIN LATERAL (
        SELECT * FROM digital_submissions s
        WHERE s.title = cm.title
        ORDER BY s.submitted_at DESC NULLS LAST, s.submission_id DESC
        LIMIT 1
      ) ds ON true
      ${where}
      GROUP BY cm.material_id, dr.digital_resource_id, ds.submission_id
      ORDER BY cm.created_at DESC NULLS LAST, cm.title ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    const countRes = await pool.query(countSql, values);
    const listRes = await pool.query(listSql, [...values, limit, offset]);
    const total = countRes.rows[0]?.total || 0;
    return { rows: listRes.rows, meta: { current_page: currentPage, per_page: limit, total, last_page: Math.max(Math.ceil(total / limit), 1) } };
  }

  async getResourceById(materialId, client = pool) {
    const materialRes = await client.query(`SELECT * FROM catalog_materials WHERE material_id = $1 AND material_format = 'digital' LIMIT 1`, [materialId]);
    const material = materialRes.rows[0];
    if (!material) return null;
    const resourceRes = await client.query(`SELECT * FROM digital_resources WHERE material_id = $1 LIMIT 1`, [materialId]);
    const resource = resourceRes.rows[0] || null;
    const files = resource ? (await client.query(`SELECT * FROM digital_resource_files WHERE digital_resource_id = $1 ORDER BY uploaded_at DESC NULLS LAST, file_id DESC`, [resource.digital_resource_id])).rows : [];
    const submission = (await client.query(`SELECT * FROM digital_submissions WHERE title = $1 ORDER BY submitted_at DESC NULLS LAST, submission_id DESC LIMIT 1`, [material.title])).rows[0] || null;
    const usage_summary = resource ? (await client.query(`SELECT COUNT(*)::int AS total_events, COUNT(CASE WHEN action = 'download' THEN 1 END)::int AS total_downloads, COUNT(CASE WHEN action = 'read' THEN 1 END)::int AS total_reads FROM digital_usage_logs WHERE digital_resource_id = $1`, [resource.digital_resource_id])).rows[0] : { total_events: 0, total_downloads: 0, total_reads: 0 };
    return { ...material, digital_resource: resource, files, submission, usage_summary };
  }

  async createMaterial(payload, client = pool) {
    const sql = `
      INSERT INTO catalog_materials (
        material_type_id, category_id, publisher_id, language_id,
        title, subtitle, edition, isbn, issn, publication_year,
        publication_place, abstract, description, table_of_contents,
        keywords, classification_code, call_number, material_format,
        is_reference_only, is_active, created_by, updated_by
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,$17,'digital',
        $18,$19,$20,$21
      ) RETURNING *
    `;
    const values = [
      payload.material_type_id, payload.category_id || null, payload.publisher_id || null, payload.language_id || null,
      payload.title, payload.subtitle || null, payload.edition || null, payload.isbn || null, payload.issn || null, payload.publication_year || null,
      payload.publication_place || null, payload.abstract || null, payload.description || null, payload.table_of_contents || null,
      payload.keywords || null, payload.classification_code || null, payload.call_number || null,
      payload.is_reference_only ?? false, payload.is_active ?? true, payload.created_by || null, payload.updated_by || null,
    ];
    const res = await client.query(sql, values);
    return res.rows[0];
  }

  async updateMaterial(materialId, payload, client = pool) {
    const allowed = ['material_type_id','category_id','publisher_id','language_id','title','subtitle','edition','isbn','issn','publication_year','publication_place','abstract','description','table_of_contents','keywords','classification_code','call_number','is_reference_only','is_active','updated_by'];
    const values = [];
    const fields = [];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        values.push(payload[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }
    if (!fields.length) return this.getResourceById(materialId, client);
    values.push(materialId);
    const res = await client.query(`UPDATE catalog_materials SET ${fields.join(', ')} WHERE material_id = $${values.length} AND material_format = 'digital' RETURNING *`, values);
    return res.rows[0] || null;
  }

  async upsertResource(materialId, payload, client = pool) {
    const existing = (await client.query(`SELECT * FROM digital_resources WHERE material_id = $1 LIMIT 1`, [materialId])).rows[0];
    if (existing) {
      const res = await client.query(`
        UPDATE digital_resources SET
          publisher_id = $1,
          access_level = $2,
          drm_required = $3,
          license_start_date = $4,
          license_end_date = $5,
          embargo_until = $6,
          is_downloadable = $7,
          is_streamable = $8,
          is_active = $9,
          updated_by = $10
        WHERE digital_resource_id = $11
        RETURNING *
      `, [payload.publisher_id || null, payload.access_level || 'public', payload.drm_required ?? false, payload.license_start_date || null, payload.license_end_date || null, payload.embargo_until || null, payload.is_downloadable ?? true, payload.is_streamable ?? false, payload.is_active ?? true, payload.updated_by || null, existing.digital_resource_id]);
      return res.rows[0];
    }
    const res = await client.query(`
      INSERT INTO digital_resources (
        material_id, publisher_id, access_level, drm_required,
        license_start_date, license_end_date, embargo_until,
        is_downloadable, is_streamable, is_active, created_by, updated_by
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,
        $8,$9,$10,$11,$12
      ) RETURNING *
    `, [materialId, payload.publisher_id || null, payload.access_level || 'public', payload.drm_required ?? false, payload.license_start_date || null, payload.license_end_date || null, payload.embargo_until || null, payload.is_downloadable ?? true, payload.is_streamable ?? false, payload.is_active ?? true, payload.created_by || null, payload.updated_by || null]);
    return res.rows[0];
  }

  async addFile(digitalResourceId, payload, client = pool) {
    const res = await client.query(`
      INSERT INTO digital_resource_files (
        digital_resource_id, file_role, original_name, stored_name, file_path,
        mime_type, file_size_bytes, checksum_sha256, version_label,
        is_current, uploaded_by
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,
        $10,$11
      ) RETURNING *
    `, [digitalResourceId, payload.file_role || 'main', payload.original_name, payload.stored_name, payload.file_path, payload.mime_type || null, payload.file_size_bytes || null, payload.checksum_sha256 || null, payload.version_label || null, payload.is_current ?? true, payload.uploaded_by || null]);
    return res.rows[0];
  }

  async createSubmission(payload, client = pool) {
    const res = await client.query(`
      INSERT INTO digital_submissions (
        submitted_by, publisher_id, material_type_id, category_id, language_id,
        title, subtitle, abstract, keywords, publication_year,
        isbn, issn, access_level, status, note, submitted_at
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,NOW()
      ) RETURNING *
    `, [payload.submitted_by || null, payload.publisher_id || null, payload.material_type_id, payload.category_id || null, payload.language_id || null, payload.title, payload.subtitle || null, payload.abstract || null, payload.keywords || null, payload.publication_year || null, payload.isbn || null, payload.issn || null, payload.access_level || 'public', payload.status || 'submitted', payload.note || null]);
    return res.rows[0];
  }

  async updateSubmissionStatus({ submission_id, status, reviewed_at = null, approved_at = null, published_at = null, note = null }, client = pool) {
    const res = await client.query(`
      UPDATE digital_submissions
      SET status = $1,
          reviewed_at = COALESCE($2, reviewed_at),
          approved_at = COALESCE($3, approved_at),
          published_at = COALESCE($4, published_at),
          note = COALESCE($5, note)
      WHERE submission_id = $6
      RETURNING *
    `, [status, reviewed_at, approved_at, published_at, note, submission_id]);
    return res.rows[0] || null;
  }

  async assignAccessRights({ material_id, access_level, is_downloadable = null, is_streamable = null, updated_by = null }, client = pool) {
    const res = await client.query(`
      UPDATE digital_resources
      SET access_level = $1,
          is_downloadable = COALESCE($2, is_downloadable),
          is_streamable = COALESCE($3, is_streamable),
          updated_by = $4
      WHERE material_id = $5
      RETURNING *
    `, [access_level, is_downloadable, is_streamable, updated_by, material_id]);
    return res.rows[0] || null;
  }

  async updateLicense({ material_id, drm_required = null, license_start_date = null, license_end_date = null, embargo_until = null, updated_by = null }, client = pool) {
    const res = await client.query(`
      UPDATE digital_resources
      SET drm_required = COALESCE($1, drm_required),
          license_start_date = COALESCE($2, license_start_date),
          license_end_date = COALESCE($3, license_end_date),
          embargo_until = COALESCE($4, embargo_until),
          updated_by = $5
      WHERE material_id = $6
      RETURNING *
    `, [drm_required, license_start_date, license_end_date, embargo_until, updated_by, material_id]);
    return res.rows[0] || null;
  }

  async trackUsage({ material_id, file_id = null, user_id = null, member_id = null, action = 'view', ip_address = null, user_agent = null }, client = pool) {
    const resource = (await client.query(`SELECT digital_resource_id FROM digital_resources WHERE material_id = $1 LIMIT 1`, [material_id])).rows[0];
    if (!resource) throw new Error('Digital resource not found');
    const res = await client.query(`
      INSERT INTO digital_usage_logs (digital_resource_id, file_id, user_id, member_id, action, ip_address, user_agent, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      RETURNING *
    `, [resource.digital_resource_id, file_id, user_id, member_id, action, ip_address, user_agent]);
    return res.rows[0];
  }

  async usageReport({ material_id = null, date_from = null, date_to = null } = {}, client = pool) {
    const values = [];
    const filters = [];
    if (material_id) {
      values.push(material_id);
      filters.push(`dr.material_id = $${values.length}`);
    }
    if (date_from) {
      values.push(date_from);
      filters.push(`dul.created_at >= $${values.length}`);
    }
    if (date_to) {
      values.push(date_to);
      filters.push(`dul.created_at <= $${values.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await client.query(`
      SELECT
        COUNT(*)::int AS total_events,
        COUNT(CASE WHEN dul.action = 'download' THEN 1 END)::int AS total_downloads,
        COUNT(CASE WHEN dul.action = 'read' THEN 1 END)::int AS total_reads,
        COUNT(DISTINCT dul.user_id)::int AS unique_users,
        COUNT(DISTINCT dul.member_id)::int AS unique_members
      FROM digital_usage_logs dul
      JOIN digital_resources dr ON dr.digital_resource_id = dul.digital_resource_id
      ${where}
    `, values);
    return res.rows[0];
  }

  async deleteMaterialAndDependencies(materialId, client = pool) {
    const resource = (await client.query(`SELECT digital_resource_id FROM digital_resources WHERE material_id = $1 LIMIT 1`, [materialId])).rows[0];
    if (resource) {
      await client.query(`DELETE FROM digital_usage_logs WHERE digital_resource_id = $1`, [resource.digital_resource_id]);
      await client.query(`DELETE FROM digital_resource_files WHERE digital_resource_id = $1`, [resource.digital_resource_id]);
      await client.query(`DELETE FROM digital_resources WHERE digital_resource_id = $1`, [resource.digital_resource_id]);
    }
    await client.query(`DELETE FROM digital_submissions WHERE title = (SELECT title FROM catalog_materials WHERE material_id = $1)`, [materialId]);
    return this.delete(materialId, client);
  }
}

export default new DigitalLibraryModel();
