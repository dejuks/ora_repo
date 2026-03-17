import pool from "../../config/db.js";
import { sha256File } from "../utils/fileChecksum.js";
import { writeLibraryAuditLog } from "../utils/audit.js";

const buildPackageFilters = ({ publisher_id, status, q } = {}, values = []) => {
  const clauses = [];
  if (publisher_id) {
    values.push(publisher_id);
    clauses.push(`pp.publisher_id = $${values.length}`);
  }
  if (status) {
    values.push(status);
    clauses.push(`pp.package_status = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    clauses.push(`(pp.package_name ILIKE $${values.length} OR COALESCE(pp.package_code,'') ILIKE $${values.length} OR COALESCE(p.name,'') ILIKE $${values.length})`);
  }
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
};

export const listPublisherPackages = async ({ publisher_id, status, q, limit = 100, offset = 0 } = {}) => {
  const values = [];
  const where = buildPackageFilters({ publisher_id, status, q }, values);
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  values.push(safeLimit, safeOffset);
  const { rows } = await pool.query(
    `SELECT pp.*, p.name AS publisher_name,
            COALESCE((SELECT COUNT(*)::int FROM digital_resources dr WHERE dr.publisher_id = pp.publisher_id AND dr.created_at >= COALESCE(pp.received_at, pp.created_at)), 0) AS related_resource_count,
            COALESCE((SELECT json_agg(l.*) FROM licenses l WHERE l.package_id = pp.package_id), '[]'::json) AS licenses
       FROM publisher_packages pp
       LEFT JOIN publishers p ON p.publisher_id = pp.publisher_id
       ${where}
       ORDER BY pp.created_at DESC
       LIMIT $${values.length-1} OFFSET $${values.length}`,
    values
  );
  return rows;
};

export const createPublisherPackage = async ({ payload, file, actorUserId, ipAddress, userAgent }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let checksum = null;
    if (file?.path) checksum = await sha256File(file.path);
    const metadataJson = payload.metadata_json ? (typeof payload.metadata_json === 'string' ? JSON.parse(payload.metadata_json) : payload.metadata_json) : {};
    const insertRes = await client.query(
      `INSERT INTO publisher_packages (
        publisher_id, publisher_account_id, package_name, package_code, package_type, description,
        external_reference, delivery_method, package_status, license_start_date, license_end_date,
        uploaded_by, received_at, metadata_json, stored_name, original_name, file_path, mime_type, file_size_bytes, checksum_sha256
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),$13,$14,$15,$16,$17,$18,$19)
      RETURNING *`,
      [
        payload.publisher_id || null,
        payload.publisher_account_id || null,
        payload.package_name,
        payload.package_code || null,
        payload.package_type || 'content_package',
        payload.description || null,
        payload.external_reference || null,
        payload.delivery_method || (file ? 'upload' : 'api'),
        payload.package_status || 'received',
        payload.license_start_date || null,
        payload.license_end_date || null,
        actorUserId || payload.uploaded_by || null,
        JSON.stringify(metadataJson || {}),
        file?.filename || null,
        file?.originalname || null,
        file?.path || null,
        file?.mimetype || null,
        file?.size || null,
        checksum,
      ]
    );
    const pkg = insertRes.rows[0];

    if (payload.license_name || payload.start_date || payload.end_date || payload.terms_text) {
      await client.query(
        `INSERT INTO licenses (
          publisher_id, package_id, license_name, license_type, access_scope, start_date, end_date,
          max_concurrent_users, max_downloads_per_user, drm_required, terms_text, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          payload.publisher_id || null,
          pkg.package_id,
          payload.license_name || `${payload.package_name} License`,
          payload.license_type || 'subscription',
          payload.access_scope || 'institution',
          payload.start_date || payload.license_start_date || null,
          payload.end_date || payload.license_end_date || null,
          payload.max_concurrent_users || null,
          payload.max_downloads_per_user || null,
          String(payload.drm_required) === 'true' || payload.drm_required === true,
          payload.terms_text || null,
          true,
        ]
      );
    }

    await writeLibraryAuditLog({ actorUserId, action: 'publisher_package.create', entityType: 'publisher_package', entityId: pkg.package_id, newValues: pkg, ipAddress, userAgent });
    await client.query('COMMIT');
    return pkg;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const createPublisherResource = async ({ payload, file, actorUserId, ipAddress, userAgent }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const checksum = file?.path ? await sha256File(file.path) : null;
    const materialRes = await client.query(
      `INSERT INTO catalog_materials (
        material_type_id, category_id, publisher_id, language_id, title, subtitle, isbn, issn,
        publication_year, abstract, description, keywords, material_format, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        payload.material_type_id,
        payload.category_id || null,
        payload.publisher_id || null,
        payload.language_id || null,
        payload.title,
        payload.subtitle || null,
        payload.isbn || null,
        payload.issn || null,
        payload.publication_year || null,
        payload.abstract || null,
        payload.description || null,
        payload.keywords ? (Array.isArray(payload.keywords) ? payload.keywords : String(payload.keywords).split(',').map((v) => v.trim()).filter(Boolean)) : null,
        payload.material_format || 'digital',
        actorUserId || null,
        actorUserId || null,
      ]
    );
    const material = materialRes.rows[0];

    const resourceRes = await client.query(
      `INSERT INTO digital_resources (
        material_id, publisher_id, access_level, drm_required, license_start_date, license_end_date,
        embargo_until, is_downloadable, is_streamable, is_active, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        material.material_id,
        payload.publisher_id || null,
        payload.access_level || 'registered_users',
        String(payload.drm_required) === 'true' || payload.drm_required === true,
        payload.license_start_date || null,
        payload.license_end_date || null,
        payload.embargo_until || null,
        !(String(payload.is_downloadable) === 'false' || payload.is_downloadable === false),
        String(payload.is_streamable) === 'true' || payload.is_streamable === true,
        true,
        actorUserId || null,
        actorUserId || null,
      ]
    );
    const resource = resourceRes.rows[0];

    if (payload.package_id) {
      await client.query(`UPDATE publisher_packages SET processed_at = NOW(), package_status = 'processed' WHERE package_id = $1`, [payload.package_id]);
    }

    let fileRow = null;
    if (file?.path) {
      const fr = await client.query(
        `INSERT INTO digital_resource_files (
          digital_resource_id, file_role, original_name, stored_name, file_path, mime_type,
          file_size_bytes, checksum_sha256, version_no, is_current, uploaded_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,TRUE,$9) RETURNING *`,
        [resource.digital_resource_id, payload.file_role || 'main', file.originalname, file.filename, file.path, file.mimetype, file.size || null, checksum, actorUserId || null]
      );
      fileRow = fr.rows[0];
    }

    if (payload.member_type_id) {
      await client.query(
        `INSERT INTO digital_access_rules (digital_resource_id, member_type_id, allow_view, allow_download, allow_print, max_downloads_per_user, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (digital_resource_id, member_type_id)
         DO UPDATE SET allow_view = EXCLUDED.allow_view, allow_download = EXCLUDED.allow_download, allow_print = EXCLUDED.allow_print,
                       max_downloads_per_user = EXCLUDED.max_downloads_per_user, note = EXCLUDED.note`,
        [
          resource.digital_resource_id,
          payload.member_type_id,
          !(String(payload.allow_view) === 'false' || payload.allow_view === false),
          !(String(payload.allow_download) === 'false' || payload.allow_download === false),
          String(payload.allow_print) === 'true' || payload.allow_print === true,
          payload.max_downloads_per_user || null,
          payload.access_note || 'Created from publisher package',
        ]
      );
    }

    await writeLibraryAuditLog({ actorUserId, action: 'publisher_resource.create', entityType: 'digital_resource', entityId: resource.digital_resource_id, newValues: { material, resource, file: fileRow }, ipAddress, userAgent });
    await client.query('COMMIT');
    return { material, resource, file: fileRow };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
