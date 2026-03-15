import React from "react";

const styles = {
  draft: "secondary",
  submitted: "primary",
  editor_screening: "info",
  under_review: "warning",
  revision_requested: "warning",
  accepted: "success",
  finance_cleared: "success",
  in_production: "info",
  published: "success",
  rejected: "danger",
  assigned: "secondary",
  cleared: "success",
  pending: "warning",
};

export default function StatusBadge({ value }) {
  const key = String(value || '').toLowerCase();
  const tone = styles[key] || 'secondary';
  return <span className={`badge badge-${tone}`}>{key ? key.replaceAll('_', ' ') : '—'}</span>;
}
