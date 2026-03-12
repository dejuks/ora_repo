import libraryApi from '../../../api/library.api';

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export async function getCurrentMember() {
  const user = getCurrentUser();
  const localMemberId = user?.member_id || user?.member?.member_id || null;
  try {
    const members = await libraryApi.list('members', { limit: 500 });
    const rows = members?.rows || [];
    return rows.find((m) => m.user_id === user?.uuid || m.user_id === user?.id || m.member_id === localMemberId) || (localMemberId ? { member_id: localMemberId, member_code: user?.member_code || user?.member?.member_code } : null);
  } catch {
    return localMemberId ? { member_id: localMemberId, member_code: user?.member_code || user?.member?.member_code } : null;
  }
}

export function outstandingFine(row) {
  return Number(row?.amount || 0) - Number(row?.paid_amount || 0) - Number(row?.waived_amount || 0);
}

export function sumOutstandingFines(rows = []) {
  return rows.reduce((sum, row) => sum + Math.max(0, outstandingFine(row)), 0);
}

export function formatCurrency(value) {
  const num = Number(value || 0);
  return `ETB ${num.toLocaleString()}`;
}

export async function loadResource(resource, params = {}) {
  return libraryApi.list(resource, { limit: 500, ...params });
}
