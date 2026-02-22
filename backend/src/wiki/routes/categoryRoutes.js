// routes/categoryRoutes.js
import express from 'express';
import {
  createNewCategory,
  getCategories,
  getCategory,
  updateCategoryHandler,
  deleteCategoryHandler,
  createBulkCategoriesHandler,
  getCategoryStatistics,
  getCategoryOptions
} from '../controllers/categoryController.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no login required)
router.get('/', getCategories);
router.get('/options', getCategoryOptions);
router.get('/stats', getCategoryStatistics);
router.get('/:id', getCategory);

// Protected routes (login required)
router.post('/', authenticate, createNewCategory);
router.put('/:id', authenticate, updateCategoryHandler);
router.post('/bulk', authenticate,  createBulkCategoriesHandler);
router.delete('/:id', authenticate,  deleteCategoryHandler);

export default router;