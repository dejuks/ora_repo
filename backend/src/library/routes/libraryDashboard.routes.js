import express from "express";
import { libraryDashboardController } from "../controllers/libraryDashboard.controller.js";

const router = express.Router();

router.get('/librarian', libraryDashboardController.librarian);
router.get('/manager', libraryDashboardController.manager);
router.get('/cataloger', libraryDashboardController.cataloger);
router.get('/admin', libraryDashboardController.admin);

export default router;
