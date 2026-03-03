import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

import {
  getAllManuscripts,
  getManuscriptById,
  createManuscript,
  updateManuscript,
  deleteManuscript,
  getDraftManuscripts,
  submitDraftManuscript,
  getSubmittedManuscripts,
  moveToScreening,
  rejectToAuthor,
  resubmitManuscript,
  getInitialScreenedManuscripts,
  getScreeningManuscripts,
  downloadFile
} from "../controllers/manuscript.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ======================================================
   MULTER CONFIG - Configure for file uploads
====================================================== */
// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/manuscripts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `manuscript-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/* ======================================================
   PUBLIC ROUTES (if any)
====================================================== */
router.get("/files/:fileId/download", downloadFile);

/* ======================================================
   ALL ROUTES REQUIRE AUTHENTICATION
====================================================== */
router.use(authenticate);

/* ======================================================
   AE / EIC ROUTES
====================================================== */
router.get("/submitted", getSubmittedManuscripts);
router.get("/screening", getScreeningManuscripts);
router.get("/initial-screening", getInitialScreenedManuscripts);
router.post("/:manuscriptId/screening", moveToScreening);
router.post("/:manuscriptId/reject", rejectToAuthor);
router.post("/:manuscriptId/resubmit", resubmitManuscript);

/* ======================================================
   AUTHOR – DRAFT ROUTES
====================================================== */
router.get("/drafts", getDraftManuscripts);
router.post("/:manuscriptId/submit", submitDraftManuscript);

/* ======================================================
   NORMAL CRUD
====================================================== */
router.get("/", getAllManuscripts);
router.get("/:id", getManuscriptById);

/* ✅ CREATE MANUSCRIPT WITH FILE UPLOAD */
router.post("/", upload.array('files', 5), createManuscript);

/* ✅ UPDATE MANUSCRIPT WITH FILE UPLOAD */
router.put("/:id", upload.array('files', 5), updateManuscript);

router.delete("/:id", deleteManuscript);

export default router;