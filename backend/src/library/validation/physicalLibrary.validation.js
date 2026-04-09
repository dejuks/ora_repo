import { body, param, query } from 'express-validator';

export const physicalLibraryListValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('per_page').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isString(),
  query('branch_id').optional().isUUID(),
];
export const physicalLibraryIdValidation = [param('id').isUUID().withMessage('Valid material id is required')];
export const copyIdValidation = [param('copyId').isUUID().withMessage('Valid copy id is required')];
export const holdIdValidation = [param('holdId').isUUID().withMessage('Valid hold id is required')];
export const createPhysicalLibraryValidation = [
  body('title').notEmpty().withMessage('title is required'),
  body('material_type_id').isUUID().withMessage('material_type_id must be a UUID'),
  body('category_id').optional({ nullable: true }).isUUID(),
  body('publisher_id').optional({ nullable: true }).isUUID(),
  body('language_id').optional({ nullable: true }).isUUID(),
  body('publication_year').optional({ nullable: true }).isInt({ min: 0 }),
  body('is_reference_only').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
  body('copies').optional().isArray(),
];
export const updatePhysicalLibraryValidation = [param('id').isUUID(), body('title').optional().notEmpty()];
export const addCopyValidation = [param('id').isUUID(), body('accession_number').notEmpty().isString(), body('branch_id').optional({ nullable: true }).isUUID(), body('location_id').optional({ nullable: true }).isUUID()];
export const updateCopyValidation = [param('copyId').isUUID(), body('accession_number').optional().isString()];
export const borrowValidation = [body('member_id').isUUID(), body('copy_id').isUUID(), body('policy_id').optional({ nullable: true }).isUUID(), body('due_date').optional({ nullable: true }).isISO8601()];
export const returnValidation = [body('loan_id').isUUID()];
export const renewValidation = [body('loan_id').isUUID(), body('due_date').optional({ nullable: true }).isISO8601()];
export const placeHoldValidation = [body('member_id').isUUID(), body('material_id').isUUID(), body('copy_id').optional({ nullable: true }).isUUID()];
export const cancelHoldValidation = [param('holdId').isUUID()];
export const fineValidation = [body('member_id').isUUID(), body('reason').notEmpty().isString(), body('amount').isFloat({ min: 0 }), body('loan_id').optional({ nullable: true }).isUUID(), body('copy_id').optional({ nullable: true }).isUUID()];
export const inventoryAuditValidation = [body('audit_name').notEmpty().isString(), body('branch_id').optional({ nullable: true }).isUUID(), body('location_id').optional({ nullable: true }).isUUID()];
export const receiveAcquisitionValidation = [body('purchase_order_id').isUUID()];
export const reportQueryValidation = [query('date_from').optional().isISO8601(), query('date_to').optional().isISO8601()];
