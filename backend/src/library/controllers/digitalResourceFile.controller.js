import path from "path";
import fs from "fs";
import { createCrudController } from "./createCrudController.js";
import { DigitalResourceFileModel } from "../models/digitalResourceFile.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sha256File } from "../utils/fileChecksum.js";
import { badRequest, notFound } from "../utils/appError.js";
import pool from "../../config/db.js";

const crud = createCrudController(DigitalResourceFileModel, "digital-resource-file");

export const digitalResourceFileController = {
  ...crud,
  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('File is required');
    const resourceId = req.params.resourceId || req.body.digital_resource_id;
    if (!resourceId) throw badRequest('digital_resource_id is required');
    const row = await DigitalResourceFileModel.create({
      digital_resource_id: resourceId,
      file_role: req.body.file_role || 'main',
      original_name: req.file.originalname,
      stored_name: req.file.filename,
      file_path: path.relative(process.cwd(), req.file.path).replace(/\\/g, '/'),
      mime_type: req.file.mimetype,
      file_size_bytes: req.file.size,
      checksum_sha256: await sha256File(req.file.path),
      version_no: Number(req.body.version_no || 1),
      is_current: req.body.is_current === undefined ? true : String(req.body.is_current) === 'true',
      uploaded_by: req.user?.uuid || null,
    });
    return res.status(201).json(row);
  }),
  download: asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`SELECT drf.*, dr.digital_resource_id FROM digital_resource_files drf JOIN digital_resources dr ON dr.digital_resource_id = drf.digital_resource_id WHERE drf.file_id = $1 LIMIT 1`, [req.params.id]);
    const file = rows[0];
    if (!file) throw notFound('Digital resource file not found');
    const abs = path.join(process.cwd(), file.file_path);
    if (!fs.existsSync(abs)) throw notFound('File missing on disk');
    return res.download(abs, file.original_name);
  }),
};
