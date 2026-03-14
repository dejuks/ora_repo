import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  getAllManuscripts,
  getManuscriptById,
  createManuscript,
  updateManuscript,
  deleteManuscript,
  getDraftManuscripts,
  getAllPublicManuscripts,
  getPublicManuscriptById,
  submitDraftManuscript,
  getSubmittedManuscripts,
  moveToScreening,
  rejectToAuthor,
  resubmitManuscript,
  getInitialScreenedManuscripts,
  getScreeningManuscripts,
  downloadFile,
  fetchUnderReviewManuscripts,
  fetchAERecommendations,
  fetchEICDecisions
} from "../controllers/manuscript.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


// ======================================================
// MULTER CONFIGURATION
// ======================================================

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/manuscripts");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, `manuscript-${uniqueSuffix}${ext}`);
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF and Word documents are allowed"
      ),
      false
    );
  }
};

// Upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});


// ======================================================
// PUBLIC ROUTES (NO AUTH)
// ======================================================

// Get all public manuscripts
router.get("/public", getAllPublicManuscripts);

// Get single public manuscript
router.get("/public/:id", getPublicManuscriptById);

// Download manuscript file
router.get("/files/:fileId/download", downloadFile);


// ======================================================
// AUTHOR ROUTES
// ======================================================

// Draft manuscripts
router.get("/drafts", authenticate, getDraftManuscripts);

// Submit draft
router.post("/:manuscriptId/submit", authenticate, submitDraftManuscript);


// ======================================================
// AE / EIC ROUTES
// ======================================================

// Submitted manuscripts
router.get("/submitted", authenticate, getSubmittedManuscripts);

// Screening
router.get("/screening", authenticate, getScreeningManuscripts);

// Initial screening
router.get("/initial-screening", authenticate, getInitialScreenedManuscripts);

// Move to screening
router.post("/:manuscriptId/screening", authenticate, moveToScreening);

// Reject manuscript
router.post("/:manuscriptId/reject", authenticate, rejectToAuthor);

// Resubmit manuscript
router.post("/:manuscriptId/resubmit", authenticate, resubmitManuscript);


// ======================================================
// REVIEW / EDITOR ROUTES
// ======================================================

router.get("/under-review", authenticate, fetchUnderReviewManuscripts);

router.get("/ae-recommendations", authenticate, fetchAERecommendations);

router.get("/eic-decisions", authenticate, fetchEICDecisions);


// ======================================================
// ADMIN / NORMAL CRUD
// ======================================================

// Get all manuscripts
router.get("/", authenticate, getAllManuscripts);

// Get manuscript by ID
router.get("/:id", authenticate, getManuscriptById);


// ======================================================
// CREATE MANUSCRIPT
// ======================================================

router.post(
  "/",
  authenticate,
  upload.array("files", 5),
  createManuscript
);


// ======================================================
// UPDATE MANUSCRIPT
// ======================================================

router.put(
  "/:id",
  authenticate,
  upload.array("files", 5),
  updateManuscript
);


// ======================================================
// DELETE MANUSCRIPT
// ======================================================

router.delete("/:id", authenticate, deleteManuscript);


export default router;