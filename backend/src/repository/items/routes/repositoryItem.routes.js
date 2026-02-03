import express from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../../../middleware/auth.middleware.js";
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getCuratorNewQueue,
  approveRepositoryItem,
  rejectRepositoryItem,
  requestRevision,
  suggestMetadata,
  analyzeVocabulary,
  checkCopyright,
  getAuthorDrafts,
  submitDraftItem,
  getAuthorDepositsUnderReview,
  getReturnedDeposits,
  getApprovedDeposits,
  searchRepositoryItems,
  getReviewerNewQueue,
  claimItem,
  bulkClaimItems,getReviewerItemDetail
} from "../controllers/repositoryItem.controller.js";

const router = express.Router();

// ======================
// Multer config
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "/uploads/repository/items"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ======================
// AUTHOR ROUTES
// ======================

// Create new item (draft or submitted)
router.post("/", authenticate, upload.single("file"), createItem);

// Get all items (admin/curator)
router.get("/", authenticate, getItems);

// Get single item by UUID
router.get("/:uuid", authenticate, getItem);

// Update an item
router.put("/:uuid", authenticate, upload.single("file"), updateItem);

// Delete an item
router.delete("/:uuid", authenticate, deleteItem);

// Get current author's drafts
router.get("/author/drafts", authenticate, getAuthorDrafts);

// Submit a draft for review
router.patch("/author/:uuid/submit", authenticate, submitDraftItem);

// ======================
// CURATOR / ADMIN ROUTES
// ======================

// Get new submissions for curator queue
router.get("/curator/queue/new", authenticate, getCuratorNewQueue);

// Approve an item
router.patch("/:uuid/approve", authenticate, approveRepositoryItem);

// Reject an item
router.patch("/:uuid/reject", authenticate, rejectRepositoryItem);

// Request revision
router.patch("/:uuid/revision", authenticate, requestRevision);

// Suggest metadata
router.patch("/:uuid/suggest-metadata", authenticate, suggestMetadata);

// Analyze vocabulary
router.get("/:uuid/analyze-vocab", authenticate, analyzeVocabulary);

// Check copyright similarity
router.get("/:uuid/copyright-check", authenticate, checkCopyright);

router.get("/author/deposits/review",authenticate,getAuthorDepositsUnderReview);

router.get("/author/deposits/returned",authenticate,getReturnedDeposits);

router.get("/repository/author/deposits/approved",authenticate,getApprovedDeposits);

router.get("/search", authenticate, searchRepositoryItems);


/* ===============================
   REVIEWER QUEUE
=============================== */
router.get("/reviewer/queue/new",authenticate,getReviewerNewQueue);

router.patch("/:id/claim",authenticate,claimItem);

router.patch(
  "/reviewer/queue/claim",
  authenticate,
  bulkClaimItems
);

/* Reviewer queue */
router.get(
  "/reviewer/queue/new",
  authenticate,
  getReviewerNewQueue
);

/* Reviewer detail view */
router.get(
  "/reviewer/:uuid",
  authenticate,
  getReviewerItemDetail
);



export default router;
