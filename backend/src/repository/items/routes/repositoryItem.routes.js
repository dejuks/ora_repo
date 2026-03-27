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
  bulkClaimItems,
  getReviewerItemDetail,
  updateRevisionComment
} from "../controllers/repositoryItem.controller.js";

const router = express.Router();

/* ======================
   MULTER CONFIG
====================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/repository/items"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ======================
   AUTHOR ROUTES
====================== */

// CREATE
router.post("/", authenticate, upload.single("file"), createItem);

// GET ALL
router.get("/", authenticate, getItems);

// GET ONE
router.get("/:uuid", authenticate, getItem);

// UPDATE
router.put("/:uuid", authenticate, upload.single("file"), updateItem);

// DELETE
router.delete("/:uuid", authenticate, deleteItem);

// AUTHOR
router.get("/author/drafts", authenticate, getAuthorDrafts);
router.patch("/author/:uuid/submit", authenticate, submitDraftItem);

/* ======================
   CURATOR ROUTES
====================== */

router.get("/curator/queue/new", authenticate, getCuratorNewQueue);
router.patch("/:uuid/approve", authenticate, approveRepositoryItem);
router.patch("/:uuid/reject", authenticate, rejectRepositoryItem);
router.patch("/:uuid/revision", authenticate, requestRevision);
router.patch("/:uuid/suggest-metadata", authenticate, suggestMetadata);

router.get("/:uuid/analyze-vocab", authenticate, analyzeVocabulary);
router.get("/:uuid/copyright-check", authenticate, checkCopyright);

/* ======================
   AUTHOR DEPOSITS
====================== */

router.get("/author/deposits/review", authenticate, getAuthorDepositsUnderReview);
router.get("/author/deposits/returned", authenticate, getReturnedDeposits);
router.get("/author/deposits/approved", authenticate, getApprovedDeposits);

/* ======================
   SEARCH
====================== */

router.get("/search", authenticate, searchRepositoryItems);

/* ======================
   REVIEWER
====================== */

router.get("/reviewer/queue/new", authenticate, getReviewerNewQueue);
router.patch("/:id/claim", authenticate, claimItem);
router.patch("/reviewer/queue/claim", authenticate, bulkClaimItems);
router.get("/reviewer/:uuid", authenticate, getReviewerItemDetail);

/* ======================
   REVISION UPDATE
====================== */

router.patch(
  "/:uuid/edit-revision",
  authenticate,
  upload.single("file"),
  updateRevisionComment
);

export default router;