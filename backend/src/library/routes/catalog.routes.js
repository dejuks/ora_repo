import express from 'express';
import { catalogOpacController } from '../controllers/catalogOpac.controller.js';

const router = express.Router();
router.get('/search', catalogOpacController.search);
router.get('/:id/availability', catalogOpacController.availability);
router.get('/:id', catalogOpacController.details);

export default router;
