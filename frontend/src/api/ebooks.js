// src/api/ebooks.js
// Thin named-export wrapper so all your pages can do:
//   import { listMyEbooks, createEbook, ... } from "../../api/ebooks";
// while the actual axios client lives in src/api/ebookApi.js

// NOTE: ebookApi.js lives in the same folder (src/api)
import ebookApi from "./ebookApi.js";

// AUTHOR
export const createEbook = (payload) => ebookApi.createEbook(payload);
export const listMyEbooks = () => ebookApi.getMyEbooks();
export const ebookDetail = (id) => ebookApi.getEbookById(id);
export const updateEbook = (id, payload) => ebookApi.updateEbook(id, payload);
export const deleteEbook = (id) => ebookApi.deleteEbook(id);
export const uploadFileToCurrentVersion = (ebookId, payload) =>
  ebookApi.uploadFileToCurrentVersion(ebookId, payload);
export const submitRevision = (ebookId, payload) => ebookApi.submitRevision(ebookId, payload);

// STAFF
export const listAllEbooks = (filters) => ebookApi.getAllEbooks(filters);

// EDITOR
export const listScreeningQueue = (params) => ebookApi.listScreeningQueue(params);
export const startScreening = (ebookId) => ebookApi.startScreening(ebookId);
export const getScreeningFormData = (ebookId) => ebookApi.getScreeningFormData(ebookId);
export const submitScreeningAssessment = (ebookId, payload) =>
  ebookApi.submitScreeningAssessment(ebookId, payload);
export const requestRevision = (ebookId, note) => ebookApi.requestRevision(ebookId, note);
export const sendToReview = (ebookId, reviewerIds) => ebookApi.sendToReview(ebookId, reviewerIds);
export const deskReject = (ebookId, note) => ebookApi.deskReject(ebookId, note);
export const getReviewSummary = (ebookId) => ebookApi.getReviewSummary(ebookId);
export const editorAccept = (ebookId, note) => ebookApi.editorAccept(ebookId, note);

// REVIEWER
export const getMyReviews = () => ebookApi.getMyReviews();
export const respondToReview = (assignmentId, action) =>
  ebookApi.respondToReview(assignmentId, action);
export const submitReview = (assignmentId, payload) => ebookApi.submitReview(assignmentId, payload);

// FINANCE
export const listFinancePending = () => ebookApi.listFinancePending();
export const financeDecision = (ebookId, payload) => ebookApi.financeDecision(ebookId, payload);

// PRODUCTION + PUBLICATION
export const listProductionQueue = () => ebookApi.listProductionQueue();
export const uploadFinalOutputs = (ebookId, payload) => ebookApi.uploadFinalOutputs(ebookId, payload);
export const publishEbook = (ebookId, payload) => ebookApi.publishEbook(ebookId, payload);

// PUBLIC LIBRARY
export const publicListPublished = (q) => ebookApi.publicList(q);
export const publicEbookDetail = (id) => ebookApi.publicDetail(id);
export const publicDownloadEbook = (id, type) => ebookApi.publicDownload(id, type);

// ---------------------------------------------------------------------------
// Backward-compatible aliases
// (Some existing pages import older function names. Keep these so nothing breaks.)

// Common
export const getEbookById = (id) => ebookDetail(id);

// Lists
export const fetchAllEbooks = (filters) => listAllEbooks(filters);
export const fetchScreeningQueue = (params) => listScreeningQueue(params);

// Editor actions (legacy naming)
export const editorStartScreening = (ebookId) => startScreening(ebookId);
export const editorSendToReview = (ebookId, reviewerIds) => sendToReview(ebookId, reviewerIds);
export const editorDeskReject = (ebookId, note) => deskReject(ebookId, note);
export const editorRequestRevision = (ebookId, note) => requestRevision(ebookId, note);

// UI helpers (used by some pages)
export function formatStatus(status) {
  if (!status) return "";
  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStatusColor(status) {
  const s = String(status || "").toUpperCase();
  if (["DRAFT"].includes(s)) return "secondary";
  if (["SUBMITTED", "SCREENING"].includes(s)) return "info";
  if (["UNDER_REVIEW", "REVISION_REQUESTED", "REVISED_SUBMITTED"].includes(s)) return "warning";
  if (["ACCEPTED", "FINANCE_CLEARED", "PUBLISHED"].includes(s)) return "success";
  if (["REJECTED", "DESK_REJECTED", "WITHDRAWN"].includes(s)) return "danger";
  return "secondary";
}
