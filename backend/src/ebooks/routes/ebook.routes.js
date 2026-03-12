// src/ebooks/routes/ebook.routes.js
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { ebookUpload } from "../../middleware/ebookUpload.middleware.js";

import {
  createEbook,
  listMyEbooks,
  listAllEbooks,
  getEbookDetail,
  updateEbook,
  deleteEbook,
  uploadFileToCurrentVersion,
  submitRevision,

  // editor screening
  listScreeningQueue,
  startScreening,
  getScreeningFormData,
  submitScreeningAssessment,
  requestRevision,
  sendToReview,
  deskReject,
  getReviewSummary,
  editorAccept,

  // reviewer
  getMyReviews,
  respondToReview,
  submitReview,

  // finance
  listFinancePending,
  financeDecision,

  // production + publication
  listProductionQueue,
  uploadFinalOutputs,
  publishEbook,

  // public library
  publicListPublished,
  publicEbookDetail,
  publicDownload,
} from "../controllers/ebook.controller.js";

const r = Router();

/* ================= AUTHOR ================= */
/**
 * CREATE ebook: multipart with optional file
 * field name must be: "file"
 */
r.post("/", authenticate, ebookUpload.single("file"), createEbook);

r.get("/mine", authenticate, listMyEbooks);

/* ================= EDITOR / SCREENING ================= */
r.get("/editor/screening", authenticate, listScreeningQueue);
r.post("/:id/editor/start-screening", authenticate, startScreening);

r.get("/:id/screening-form", authenticate, getScreeningFormData);
r.post("/:id/screening-assessment", authenticate, submitScreeningAssessment);

r.post("/:id/editor/request-revision", authenticate, requestRevision);
r.post("/:id/editor/send-to-review", authenticate, sendToReview);
r.post("/:id/editor/desk-reject", authenticate, deskReject);

r.get("/:id/review-summary", authenticate, getReviewSummary);
r.post("/:id/editor/accept", authenticate, editorAccept);

/* ================= REVIEWER (KEEP BEFORE /:id) ================= */
r.get("/reviewer/my-reviews", authenticate, getMyReviews);
r.post("/reviewer/:assignmentId/respond", authenticate, respondToReview);
r.post("/reviewer/:assignmentId/submit", authenticate, submitReview);

/* ================= FINANCE ================= */
r.get("/finance/pending", authenticate, listFinancePending);
r.post("/:id/finance/decision", authenticate, financeDecision);

/* ================= DIGITAL PRODUCTION + PUBLICATION ================= */
r.get("/production/queue", authenticate, listProductionQueue);

r.post(
  "/:id/production/upload-final",
  authenticate,
  ebookUpload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "epub", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadFinalOutputs
);

r.post("/:id/production/publish", authenticate, publishEbook);

/* ================= PUBLIC LIBRARY (NO AUTH REQUIRED) ================= */
r.get("/public", publicListPublished);
r.get("/public/:id", publicEbookDetail);
r.get("/public/:id/download", publicDownload);

/* ================= FILES ================= */
r.post("/:id/files", authenticate, ebookUpload.single("file"), uploadFileToCurrentVersion);
r.post("/:id/revision", authenticate, ebookUpload.single("file"), submitRevision);

/* ================= STAFF ================= */
r.get("/", authenticate, listAllEbooks);

/* ================= GENERIC :id CRUD (LAST) ================= */
r.get("/:id", authenticate, getEbookDetail);
r.put("/:id", authenticate, updateEbook);
r.delete("/:id", authenticate, deleteEbook);

export default r;