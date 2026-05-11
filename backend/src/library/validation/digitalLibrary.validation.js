import { body, param, query } from 'express-validator';

export const digitalLibraryListValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('per_page').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('access_level').optional().isString(),
  query('status').optional().isString(),
];
export const digitalLibraryIdValidation = [param('id').isUUID().withMessage('Valid material id is required')];
export const submissionIdValidation = [param('submissionId').isUUID().withMessage('Valid submission id is required')];
export const createDigitalLibraryValidation = [
  body('title').notEmpty().withMessage('title is required'),
  body('material_type_id').isUUID().withMessage('material_type_id must be a UUID'),
  body('category_id').optional({ nullable: true }).isUUID(),
  body('publisher_id').optional({ nullable: true }).isUUID(),
  body('language_id').optional({ nullable: true }).isUUID(),
  body('publication_year').optional({ nullable: true }).isInt({ min: 0 }),
  body('access_level').optional().isString(),
  body('drm_required').optional().isBoolean(),
  body('is_downloadable').optional().isBoolean(),
  body('is_streamable').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
  body('files').optional().isArray(),
];
export const updateDigitalLibraryValidation = [param('id').isUUID(), body('title').optional().notEmpty()];
export const submissionValidation = [body('title').notEmpty().isString(), body('material_type_id').isUUID(), body('category_id').optional({ nullable: true }).isUUID(), body('language_id').optional({ nullable: true }).isUUID(), body('publisher_id').optional({ nullable: true }).isUUID()];
export const accessRightsValidation = [param('id').isUUID(), body('access_level').isString(), body('is_downloadable').optional().isBoolean(), body('is_streamable').optional().isBoolean()];
export const licenseValidation = [param('id').isUUID(), body('drm_required').optional().isBoolean(), body('license_start_date').optional({ nullable: true }).isISO8601(), body('license_end_date').optional({ nullable: true }).isISO8601(), body('embargo_until').optional({ nullable: true }).isISO8601()];
export const trackUsageValidation = [param('id').isUUID(), body('file_id').optional({ nullable: true }).isUUID(), body('member_id').optional({ nullable: true }).isUUID(), body('action').optional().isString()];
export const usageReportValidation = [param('id').optional().isUUID(), query('material_id').optional().isUUID(), query('date_from').optional().isISO8601(), query('date_to').optional().isISO8601()];
