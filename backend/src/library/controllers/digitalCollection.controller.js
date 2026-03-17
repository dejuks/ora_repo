import slugify from "slugify";
import pool from "../../config/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createCrudController } from "./createCrudController.js";
import { DigitalCollectionModel } from "../models/digitalCollection.model.js";
import { badRequest, notFound } from "../utils/appError.js";

const crud = createCrudController(DigitalCollectionModel, "digital-collection");

const buildSlug = (value) => slugify(String(value || ""), { lower: true, strict: true, trim: true });

async function uniqueSlug(baseSlug, excludeId = null) {
  let candidate = baseSlug || `collection-${Date.now()}`;
  let index = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const sql = excludeId
      ? `SELECT 1 FROM digital_collections WHERE slug = $1 AND collection_id <> $2 LIMIT 1`
      : `SELECT 1 FROM digital_collections WHERE slug = $1 LIMIT 1`;
    const values = excludeId ? [candidate, excludeId] : [candidate];
    const { rowCount } = await pool.query(sql, values);
    if (!rowCount) return candidate;
    index += 1;
    candidate = `${baseSlug}-${index}`;
  }
}

export const digitalCollectionController = {
  ...crud,
  store: asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    if (!name) throw badRequest("name is required");
    const payload = {
      ...req.body,
      name,
      slug: await uniqueSlug(buildSlug(req.body?.slug || name)),
      created_by: req.body?.created_by || req.user?.uuid || null,
      updated_by: req.body?.updated_by || req.user?.uuid || null,
    };
    const row = await DigitalCollectionModel.create(payload);
    return res.status(201).json(row);
  }),

  update: asyncHandler(async (req, res) => {
    const current = await DigitalCollectionModel.findById(req.params.id);
    if (!current) throw notFound("digital-collection not found");
    const nextName = req.body?.name !== undefined ? String(req.body.name || "").trim() : current.name;
    if (!nextName) throw badRequest("name is required");
    const rawSlug = req.body?.slug !== undefined ? req.body.slug : (req.body?.name !== undefined ? nextName : current.slug);
    const payload = {
      ...req.body,
      name: nextName,
      slug: await uniqueSlug(buildSlug(rawSlug || nextName), req.params.id),
      updated_by: req.body?.updated_by || req.user?.uuid || null,
    };
    const row = await DigitalCollectionModel.update(req.params.id, payload);
    return res.json(row);
  }),

  resources: asyncHandler(async (req, res) => {
    const collection = await DigitalCollectionModel.findById(req.params.id);
    if (!collection) throw notFound("digital-collection not found");
    const { rows } = await pool.query(
      `SELECT dcr.*, dr.material_id, dr.publisher_id, dr.access_level, dr.is_downloadable, dr.is_streamable, dr.is_active AS resource_is_active,
              cm.title, cm.subtitle, cm.publication_year
         FROM digital_collection_resources dcr
         JOIN digital_resources dr ON dr.digital_resource_id = dcr.digital_resource_id
         LEFT JOIN catalog_materials cm ON cm.material_id = dr.material_id
        WHERE dcr.collection_id = $1
        ORDER BY COALESCE(dcr.sort_order, 0) ASC, cm.title ASC`,
      [req.params.id]
    );
    return res.json({ collection, rows });
  }),

  addResource: asyncHandler(async (req, res) => {
    const collectionId = req.params.id;
    const digitalResourceId = req.body?.digital_resource_id;
    if (!digitalResourceId) throw badRequest("digital_resource_id is required");
    const collection = await DigitalCollectionModel.findById(collectionId);
    if (!collection) throw notFound("digital-collection not found");
    const resourceRes = await pool.query(`SELECT 1 FROM digital_resources WHERE digital_resource_id = $1 LIMIT 1`, [digitalResourceId]);
    if (!resourceRes.rowCount) throw notFound("digital-resource not found");
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM digital_collection_resources WHERE collection_id = $1 AND digital_resource_id = $2 LIMIT 1`,
      [collectionId, digitalResourceId]
    );
    if (existingRows[0]) return res.json(existingRows[0]);
    const { rows } = await pool.query(
      `INSERT INTO digital_collection_resources (collection_id, digital_resource_id, sort_order, note, added_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [collectionId, digitalResourceId, req.body?.sort_order ?? 0, req.body?.note || null, req.user?.uuid || null]
    );
    return res.status(201).json(rows[0]);
  }),

  removeResource: asyncHandler(async (req, res) => {
    const { id, resourceId } = req.params;
    const { rowCount } = await pool.query(
      `DELETE FROM digital_collection_resources WHERE collection_id = $1 AND digital_resource_id = $2`,
      [id, resourceId]
    );
    if (!rowCount) throw notFound("collection resource link not found");
    return res.json({ message: "Resource removed from collection" });
  }),
};
