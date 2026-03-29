import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../../../middleware/auth.middleware.js";

import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  submitDraftItem,
  getCuratorNewQueue,
  approveRepositoryItem,
  rejectRepositoryItem,
  requestRevision,
  suggestMetadata,
  analyzeVocabulary,
  checkCopyright,
  getAuthorDrafts,
  getAuthorDepositsUnderReview,
  getReturnedDeposits,
  getApprovedDeposits,
  searchRepositoryItems,
  getReviewerNewQueue,
  claimItem,
  bulkClaimItems,
  getReviewerItemDetail,
  updateRevisionComment,getMyItems,getDashboardStats,updateAccess
} from "../controllers/repositoryItem.controller.js";

const router = express.Router();

/* ======================
   ENSURE UPLOAD FOLDER EXISTS
====================== */
const uploadDir = path.join(process.cwd(), "uploads/repository/items");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ======================
   MULTER CONFIG
====================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/* ======================
   FILE FILTER
====================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PNG, JPG allowed"), false);
  }
};

/* ======================
   MULTER INSTANCE
====================== */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/* ======================
   MULTER ERROR HANDLER
====================== */
const uploadMiddleware = (req, res, next) => {
  const handler = upload.single("file");

  handler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

/* ======================
   ROUTES ORDER (IMPORTANT)
====================== */

/* ---------- AUTHOR ---------- */
router.get("/author/drafts", authenticate, getAuthorDrafts);
router.patch("/author/:uuid/submit", authenticate, submitDraftItem);

router.get("/author/deposits/review", authenticate, getAuthorDepositsUnderReview);
router.get("/author/deposits/returned", authenticate, getReturnedDeposits);
router.get("/author/deposits/approved", authenticate, getApprovedDeposits);

/* ---------- CURATOR ---------- */
router.get("/curator/queue/new", authenticate, getCuratorNewQueue);

router.patch("/:uuid/approve", authenticate, approveRepositoryItem);
router.patch("/:uuid/reject", authenticate, rejectRepositoryItem);
router.patch("/:uuid/revision", authenticate, requestRevision);
router.patch("/:uuid/suggest-metadata", authenticate, suggestMetadata);

/* ---------- REVIEWER ---------- */
router.get("/reviewer/queue/new", authenticate, getReviewerNewQueue);

router.patch("/reviewer/:uuid/claim", authenticate, claimItem);
router.patch("/reviewer/queue/claim", authenticate, bulkClaimItems);

router.get("/reviewer/:uuid", authenticate, getReviewerItemDetail);

/* ---------- SEARCH ---------- */
router.get("/search", authenticate, searchRepositoryItems);

/* ---------- NLP ---------- */
router.get("/:uuid/analyze-vocab", authenticate, analyzeVocabulary);
router.get("/:uuid/copyright-check", authenticate, checkCopyright);

/* ---------- REVISION UPDATE ---------- */
router.patch(
  "/:uuid/edit-revision",
  authenticate,
  uploadMiddleware,
  updateRevisionComment
);
router.get("/author/my-items", authenticate, getMyItems);

router.put("/update-access", authenticate, updateAccess);
/* ======================
   BASIC CRUD (LAST)
====================== */

// CREATE
router.post("/", authenticate, uploadMiddleware, createItem);

router.get("/author/dashboard", authenticate, getDashboardStats);
// GET ALL
router.get("/", authenticate, getItems);

// GET ONE (KEEP LAST)
router.get("/:uuid", authenticate, getItem);

// UPDATE
router.put("/:uuid", authenticate, uploadMiddleware, updateItem);

// DELETE
router.delete("/:uuid", authenticate, deleteItem);

export default router;