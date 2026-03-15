import React from 'react';
import libraryApi from '../../../api/library.api';

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function getRows(result) {
  if (Array.isArray(result)) return result;
  if (result?.rows && Array.isArray(result.rows)) return result.rows;
  return [];
}

export function mapBy(rows = [], key) {
  return rows.reduce((acc, row) => {
    const value = row?.[key];
    if (value) acc[value] = row;
    return acc;
  }, {});
}

export function displayName(row, primaryKeys = ['name', 'title', 'full_name', 'member_code'], fallback = '-') {
  if (!row) return fallback;
  for (const key of primaryKeys) {
    if (row[key]) return row[key];
  }
  return fallback;
}

export function formatDate(value, withTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
}

export function formatCurrency(value) {
  const num = Number(value || 0);
  return `ETB ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function outstandingFine(row) {
  return Number(row?.amount || 0) - Number(row?.paid_amount || 0) - Number(row?.waived_amount || 0);
}

export function sumOutstandingFines(rows = []) {
  return rows.reduce((sum, row) => sum + Math.max(0, outstandingFine(row)), 0);
}

export function statusBadgeClass(status) {
  switch (status) {
    case 'active':
    case 'approved':
    case 'available':
    case 'published':
    case 'received':
    case 'paid':
      return 'badge badge-success';
    case 'overdue':
    case 'queued':
    case 'ready_for_pickup':
    case 'submitted':
    case 'under_review':
    case 'partial':
    case 'partially_received':
      return 'badge badge-warning';
    case 'rejected':
    case 'cancelled':
    case 'lost':
    case 'damaged':
    case 'unpaid':
    case 'blocked':
      return 'badge badge-danger';
    default:
      return 'badge badge-secondary';
  }
}

export function StatusBadge({ status }) {
  return <span className={statusBadgeClass(status)}>{String(status || '-').replaceAll('_', ' ')}</span>;
}

export async function loadResource(resource, params = {}) {
  return libraryApi.list(resource, { limit: 500, ...params });
}

export async function getCurrentMember() {
  const user = getCurrentUser();
  const localMemberId = user?.member_id || user?.member?.member_id || null;
  try {
    const members = await libraryApi.list('members', { limit: 500 });
    const rows = getRows(members);
    return rows.find((m) => m.user_id === user?.uuid || m.user_id === user?.id || m.member_id === localMemberId) || null;
  } catch {
    return localMemberId ? { member_id: localMemberId } : null;
  }
}

export async function loadLibraryLookups() {
  const [materials, copies, members, memberTypes, branches, materialTypes, vendors, purchaseOrders, requests, publishers , digitalResources] = await Promise.all([
    loadResource('materials').catch(() => ({ rows: [] })),
    loadResource('copies').catch(() => ({ rows: [] })),
    loadResource('members').catch(() => ({ rows: [] })),
    loadResource('member-types').catch(() => ({ rows: [] })),
    loadResource('branches').catch(() => ({ rows: [] })),
    loadResource('material-types').catch(() => ({ rows: [] })),
    loadResource('vendors').catch(() => ({ rows: [] })),
    loadResource('purchase-orders').catch(() => ({ rows: [] })),
    loadResource('acquisition-requests').catch(() => ({ rows: [] })),
    loadResource('publishers').catch(() => ({ rows: [] })),
    loadResource('digital-resources').catch(() => ({ rows: [] }))
  ]);

  const materialRows = getRows(materials);
  const copyRows = getRows(copies);
  const memberRows = getRows(members);
  const memberTypeRows = getRows(memberTypes);
  const branchRows = getRows(branches);
  const materialTypeRows = getRows(materialTypes);
  const vendorRows = getRows(vendors);
  const orderRows = getRows(purchaseOrders);
  const requestRows = getRows(requests);
  const publisherRows = getRows(publishers);
  const digitalResourceRows = getRows(digitalResources);
  const userRows = [];

  return {
    materials: materialRows,
    copies: copyRows,
    members: memberRows,
    memberTypes: memberTypeRows,
    branches: branchRows,
    materialTypes: materialTypeRows,
    vendors: vendorRows,
    purchaseOrders: orderRows,
    acquisitionRequests: requestRows,
    publishers: publisherRows,
    digitalResources: digitalResourceRows,
    users: userRows,
    materialMap: mapBy(materialRows, 'material_id'),
    copyMap: mapBy(copyRows, 'copy_id'),
    memberMap: mapBy(memberRows, 'member_id'),
    memberTypeMap: mapBy(memberTypeRows, 'member_type_id'),
    branchMap: mapBy(branchRows, 'branch_id'),
    materialTypeMap: mapBy(materialTypeRows, 'material_type_id'),
    vendorMap: mapBy(vendorRows, 'vendor_id'),
    purchaseOrderMap: mapBy(orderRows, 'purchase_order_id'),
    acquisitionRequestMap: mapBy(requestRows, 'request_id'),
    publisherMap: mapBy(publisherRows, 'publisher_id'),
    digitalResourceMap: mapBy(digitalResourceRows, 'digital_resource_id'),
    userMap: mapBy(userRows, 'uuid'),
  };
}
