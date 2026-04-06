import React from "react";
export function indexBy(rows = [], key) {
  return rows.reduce((acc, row) => {
    const value = row?.[key];
    if (value) acc[value] = row;
    return acc;
  }, {});
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export function formatCurrency(value) {
  const amount = Number(value || 0);
  return `ETB ${amount.toLocaleString()}`;
}

export function badgeClass(status = "") {
  const normalized = String(status).toLowerCase();
  if (["active", "approved", "paid", "published", "returned", "fulfilled", "ready_for_pickup", "ordered"].includes(normalized)) return "badge badge-success";
  if (["partial", "submitted", "under_review", "queued", "pending"].includes(normalized)) return "badge badge-warning";
  if (["overdue", "correction_requested"].includes(normalized)) return "badge badge-danger";
  if (["rejected", "cancelled", "waived", "lost", "damaged"].includes(normalized)) return "badge badge-secondary";
  return "badge badge-light";
}

export function StatusBadge({ value }) {
  return <span className={badgeClass(value)}>{String(value || "-").replaceAll("_", " ")}</span>;
}
