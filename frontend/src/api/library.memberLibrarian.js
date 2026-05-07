import libraryApi from './library.api.js';

const rowsOf = (payload) => payload?.rows || [];
const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

export async function getMemberDashboardData() {
  const overview = await libraryApi.getMyCirculationOverview();
  const catalog = await libraryApi.searchCatalog({ limit: 6 });
  return {
    overview,
    recommended: rowsOf(catalog),
  };
}

export async function searchOpac(search = '') {
  return libraryApi.searchCatalog({ search, limit: 50 });
}

export async function getMemberLoans() {
  const overview = await libraryApi.getMyCirculationOverview();
  return overview?.activeLoans || [];
}

export async function getMemberLoanHistory() {
  const overview = await libraryApi.getMyCirculationOverview();
  return overview?.history || [];
}

export async function getMemberHolds() {
  const overview = await libraryApi.getMyCirculationOverview();
  return overview?.myHolds || [];
}

export async function getMemberFines() {
  const overview = await libraryApi.getMyCirculationOverview();
  return overview?.fines || [];
}

export async function getMemberAccount() {
  const overview = await libraryApi.getMyCirculationOverview();
  const user = currentUser();
  return {
    user,
    member: overview?.member || null,
    activeLoans: overview?.activeLoans || [],
    holds: overview?.myHolds || [],
    fines: overview?.fines || [],
    history: overview?.history || [],
    outstandingBalance: overview?.outstandingBalance || 0,
  };
}

export async function createMemberHold(materialId) {
  const account = await getMemberAccount();
  const memberId = account?.member?.member_id;
  if (!memberId) throw new Error('Member account not found');
  return libraryApi.createHold({
    member_id: memberId,
    material_id: materialId,
    branch_id: 'branch_main',
  });
}

export async function renewMemberLoan(loanId) {
  return libraryApi.renewLoan(loanId, {});
}

export async function cancelMemberHold(holdId) {
  return libraryApi.cancelHold(holdId);
}

export async function payMemberFine(fineId, amount) {
  return libraryApi.payFine(fineId, { amount });
}

export async function getLibrarianDashboardData() {
  const [summary, loans, holds, fines, members, materials, copies] = await Promise.all([
    libraryApi.getCirculationSummary(),
    libraryApi.list('loans', { limit: 100 }),
    libraryApi.list('holds', { limit: 100 }),
    libraryApi.list('fines', { limit: 100 }),
    libraryApi.list('members', { limit: 100 }),
    libraryApi.list('materials', { limit: 100 }),
    libraryApi.list('copies', { limit: 100 }),
  ]);

  return {
    summary,
    loans: rowsOf(loans),
    holds: rowsOf(holds),
    fines: rowsOf(fines),
    members: rowsOf(members),
    materials: rowsOf(materials),
    copies: rowsOf(copies),
  };
}

export async function getLibrarianLoans() {
  const payload = await libraryApi.list('loans', { limit: 100 });
  return rowsOf(payload);
}

export async function getLibrarianHolds() {
  const payload = await libraryApi.list('holds', { limit: 100 });
  return rowsOf(payload);
}

export async function getLibrarianFines() {
  const payload = await libraryApi.list('fines', { limit: 100 });
  return rowsOf(payload);
}

export async function getLibrarianMembers() {
  const payload = await libraryApi.list('members', { limit: 100 });
  return rowsOf(payload);
}

export async function getLibrarianMaterials() {
  const payload = await libraryApi.list('materials', { limit: 100 });
  return rowsOf(payload);
}

export async function getLibrarianCopies() {
  const payload = await libraryApi.list('copies', { limit: 100 });
  return rowsOf(payload);
}

export async function getLibrarianHistory() {
  const payload = await libraryApi.list('loans', { limit: 100 });
  return rowsOf(payload).sort((a, b) => String(b.issue_date || '').localeCompare(String(a.issue_date || '')));
}

export async function createDeskLoan({ memberId, copyId }) {
  return libraryApi.borrowLoan({ member_id: memberId, copy_id: copyId });
}

export async function returnDeskLoan(loanId) {
  return libraryApi.returnLoan(loanId);
}

export async function renewDeskLoan(loanId) {
  return libraryApi.renewLoan(loanId, {});
}

export async function fulfillDeskHold(holdId, copyId) {
  return libraryApi.fulfillHold(holdId, { copy_id: copyId, copyId });
}

export async function collectDeskFine(fineId, amount) {
  return libraryApi.payFine(fineId, { amount });
}
