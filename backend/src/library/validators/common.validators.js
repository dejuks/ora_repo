import { param, query } from "express-validator";

export const uuidParam = (name = 'id') => param(name).isUUID().withMessage(`${name} must be a valid UUID`);
export const paginationRules = [
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 255 }),
];
