import React from "react";

const COLOR_MAP = {
  draft: "secondary",
  submitted: "primary",
  screening: "info",
  editor_screening: "info",
  under_review: "warning",
  review_monitoring: "warning",
  revision_requested: "warning",
  revisions_required: "warning",
  revised_submission: "info",
  accepted: "success",
  finance_pending: "warning",
  finance_cleared: "success",
  in_production: "info",
  proof_sent: "warning",
  proof_approved: "success",
  published: "success",
  public_access: "success",
  public: "success",
  private: "secondary",
  rejected: "danger",
  assigned: "secondary",
  accepted_assignment: "primary",
  submitted_review: "success",
  submitted_feedback: "success",
  cleared: "success",
  active: "success",
  inactive: "secondary",
  available: "success",
  borrowed: "warning",
  reserved: "info",
  lost: "danger",
  damaged: "danger",
  pending: "warning",
  queued: "secondary",
  ready_for_pickup: "info",
  waiver_requested: "secondary",
  waived: "success",
  paid: "primary",
  partially_paid: "warning",
  approved: "success",
  declined: "danger",
  overdue: "danger",
  completed: "success",
};

const LABEL_MAP = {
  revisions_required: "Revisions Required",
  revised_submission: "Revised Submission",
  revision_requested: "Revision Requested",
  finance_pending: "Finance Pending",
  finance_cleared: "Finance Cleared",
  in_production: "In Production",
  proof_sent: "Proof Sent",
  proof_approved: "Proof Approved",
  public_access: "Public Access",
  ready_for_pickup: "Ready For Pickup",
  waiver_requested: "Waiver Requested",
  waived: "Waiver Approved",
  partially_paid: "Partially Paid",
  under_review: "Under Review",
  editor_screening: "Editorial Screening",
};

function normalizeStatus(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatLabel(raw, normalized) {
  if (!raw) return "—";
  if (LABEL_MAP[normalized]) return LABEL_MAP[normalized];
  return String(raw)
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ value, status, className = "" }) {
  const raw = value ?? status ?? "";
  const normalized = normalizeStatus(raw);
  const color = COLOR_MAP[normalized] || "secondary";
  const label = formatLabel(raw, normalized);

  return (
    <span className={`badge badge-${color} ${className}`.trim()} style={{ fontSize: "0.8rem", textTransform: "none" }}>
      {label}
    </span>
  );
}
