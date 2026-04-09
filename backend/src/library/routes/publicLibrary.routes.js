import express from 'express';
import publicLibraryController from '../controllers/publicLibrary.controller.js';

const router = express.Router();

router.get('/published', (req, res) => publicLibraryController.index(req, res));
router.get('/categories', (req, res) => publicLibraryController.categories(req, res));
router.get('/published/:id', (req, res) => publicLibraryController.show(req, res));

export default router;
