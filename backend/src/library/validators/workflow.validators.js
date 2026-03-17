import { body, param } from "express-validator";

export const borrowRules = [
  body('member_id').isUUID().withMessage('member_id is required'),
  body('copy_id').isUUID().withMessage('copy_id is required'),
  body('loan_date').optional().isISO8601().toDate(),
  body('due_date').optional().isISO8601().toDate(),
  body('remarks').optional().isString().isLength({ max: 5000 }),
];

export const returnRules = [
  param('id').isUUID().withMessage('loan id must be a valid UUID'),
  body('return_date').optional().isISO8601().toDate(),
  body('note').optional().isString().isLength({ max: 5000 }),
];

export const renewRules = [
  param('id').isUUID().withMessage('loan id must be a valid UUID'),
  body('new_due_date').optional().isISO8601().toDate(),
  body('note').optional().isString().isLength({ max: 5000 }),
];

export const holdCreateRules = [
  body('member_id').isUUID(),
  body('material_id').isUUID(),
  body('copy_id').optional().isUUID(),
];

export const holdCancelRules = [
  param('id').isUUID(),
  body('cancelled_reason').optional().isString().isLength({ max: 1000 }),
];

export const holdFulfillRules = [
  param('id').isUUID(),
  body('copy_id').optional().isUUID(),
];

export const finePaymentRules = [
  param('id').isUUID(),
  body('amount').isFloat({ gt: 0 }).toFloat(),
  body('payment_method').optional().isString().isLength({ max: 50 }),
  body('reference_no').optional().isString().isLength({ max: 100 }),
  body('note').optional().isString().isLength({ max: 1000 }),
];

export const fineWaiverRules = [
  param('id').isUUID(),
  body('amount').isFloat({ gt: 0 }).toFloat(),
  body('reason').isString().trim().notEmpty().isLength({ max: 5000 }),
];

export const submissionReviewRules = [
  param('id').isUUID(),
  body('decision').isIn(['pending','approved','rejected','correction_requested']),
  body('comments').optional().isString().isLength({ max: 10000 }),
  body('internal_note').optional().isString().isLength({ max: 10000 }),
  body('reason').optional().isString().isLength({ max: 5000 }),
];
