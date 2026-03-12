import path from "path";
import { createCrudController } from "./createCrudController.js";
import { DigitalResourceModel } from "../models/digitalResource.model.js";
import pool from "../../config/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest, notFound, forbidden } from "../utils/appError.js";

const crud = createCrudController(DigitalResourceModel, "digital-resource");

const resolveAccess = async (resourceId, userId) => {
  const resourceRes = await pool.query(`SELECT * FROM digital_resources WHERE digital_resource_id = $1 LIMIT 1`, [resourceId]);
  const resource = resourceRes.rows[0];
  if (!resource || !resource.is_active) throw notFound('Digital resource not found');
  let member = null;
  if (userId) {
    const memberRes = await pool.query(`SELECT * FROM library_members WHERE user_id = $1 LIMIT 1`, [userId]);
    member = memberRes.rows[0] || null;
  }
  let allowed = resource.access_level === 'public' || (!!userId && resource.access_level !== 'public');
  let rule = null;
  if (member) {
    const ruleRes = await pool.query(`SELECT * FROM digital_access_rules WHERE digital_resource_id = $1 AND member_type_id = $2 LIMIT 1`, [resourceId, member.member_type_id]);
    rule = ruleRes.rows[0] || null;
    if (rule) allowed = rule.allow_view === true;
  }
  return { resource, member, rule, allowed };
};

export const digitalResourceController = {
  ...crud,
  access: asyncHandler(async (req, res) => {
    const userId = req.user?.uuid || null;
    const { resource, member, allowed } = await resolveAccess(req.params.id, userId);
    await pool.query(`INSERT INTO digital_usage_logs (digital_resource_id, user_id, member_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5,$6)`, [req.params.id, userId, member?.member_id || null, allowed ? 'view' : 'denied', req.ip, req.get('user-agent')]);
    if (!allowed) throw forbidden('Access denied');
    const filesRes = await pool.query(`SELECT * FROM digital_resource_files WHERE digital_resource_id = $1 AND is_current = TRUE ORDER BY file_role`, [req.params.id]);
    return res.json({ resource, files: filesRes.rows });
  }),
  download: asyncHandler(async (req, res) => {
    const userId = req.user?.uuid || null;
    const { resource, member, allowed, rule } = await resolveAccess(req.params.id, userId);
    if (!allowed) throw forbidden('Access denied');
    if (resource.is_downloadable === false || (rule && rule.allow_download === false)) throw badRequest('Download is not allowed for this resource');
    const fileRes = await pool.query(`SELECT * FROM digital_resource_files WHERE digital_resource_id = $1 AND is_current = TRUE ORDER BY CASE WHEN file_role = 'main' THEN 0 ELSE 1 END, uploaded_at DESC LIMIT 1`, [req.params.id]);
    const file = fileRes.rows[0];
    if (!file) throw notFound('No downloadable file found');
    await pool.query(`INSERT INTO digital_usage_logs (digital_resource_id, file_id, user_id, member_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4,'download',$5,$6)`, [req.params.id, file.file_id, userId, member?.member_id || null, req.ip, req.get('user-agent')]);
    return res.download(path.join(process.cwd(), file.file_path), file.original_name);
  }),
};
