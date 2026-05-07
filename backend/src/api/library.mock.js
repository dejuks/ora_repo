
const STORAGE_KEY = 'ora_library_mock_db_v1';

const nowIso = () => new Date().toISOString();
const today = new Date();
const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const resourceConfigs = {
  'material-types': { id: 'material_type_id', prefix: 'mt' },
  categories: { id: 'category_id', prefix: 'cat' },
  publishers: { id: 'publisher_id', prefix: 'pub' },
  languages: { id: 'language_id', prefix: 'lang' },
  branches: { id: 'branch_id', prefix: 'branch' },
  locations: { id: 'location_id', prefix: 'loc' },
  'member-types': { id: 'member_type_id', prefix: 'mtype' },
  contributors: { id: 'contributor_id', prefix: 'contrib' },
  subjects: { id: 'subject_id', prefix: 'subj' },
  members: { id: 'member_id', prefix: 'member' },
  materials: { id: 'material_id', prefix: 'mat' },
  copies: { id: 'copy_id', prefix: 'copy' },
  loans: { id: 'loan_id', prefix: 'loan' },
  holds: { id: 'hold_id', prefix: 'hold' },
  fines: { id: 'fine_id', prefix: 'fine' },
  'acquisition-requests': { id: 'request_id', prefix: 'req' },
  vendors: { id: 'vendor_id', prefix: 'vendor' },
  'purchase-orders': { id: 'purchase_order_id', prefix: 'po' },
  'acquisition-receipts': { id: 'receipt_id', prefix: 'receipt' },
  'digital-submissions': { id: 'submission_id', prefix: 'sub' },
  'digital-submission-files': { id: 'submission_file_id', prefix: 'subfile' },
  'digital-resources': { id: 'digital_resource_id', prefix: 'dres' },
  'digital-resource-files': { id: 'resource_file_id', prefix: 'rfile' },
  'digital-collections': { id: 'collection_id', prefix: 'collection' },
  'digital-collection-items': { id: 'collection_item_id', prefix: 'collection_item' },
  'inventory-audits': { id: 'audit_id', prefix: 'audit' },
  'material-contributors': { id: 'material_contributor_id', prefix: 'matcontrib' },
  'material-subjects': { id: 'material_subject_id', prefix: 'matsubj' },
  'security-alerts': { id: 'alert_id', prefix: 'alert' },
  users: { id: 'uuid', prefix: 'user' },
  roles: { id: 'role_id', prefix: 'role' },
  logs: { id: 'log_id', prefix: 'log' },
};

function seed() {
  return {
    'material-types': [
      { material_type_id: 'mt_book', name: 'Book', description: 'Printed books', is_physical: true, is_digital: false, is_borrowable: true },
      { material_type_id: 'mt_ebook', name: 'eBook', description: 'Digital books', is_physical: false, is_digital: true, is_borrowable: true },
      { material_type_id: 'mt_journal', name: 'Journal', description: 'Serial publications', is_physical: true, is_digital: true, is_borrowable: false },
    ],
    categories: [
      { category_id: 'cat_cs', name: 'Computer Science', description: 'Computing and information systems' },
      { category_id: 'cat_eng', name: 'Engineering', description: 'Applied engineering titles' },
    ],
    publishers: [
      { publisher_id: 'pub_pearson', name: 'Pearson', description: 'Academic publisher', type: 'external', contact_email: 'info@pearson.test', is_external_provider: true },
      { publisher_id: 'pub_ora', name: 'ORA Press', description: 'Institutional publishing unit', type: 'internal', contact_email: 'library@ora.test', is_external_provider: false },
    ],
    languages: [
      { language_id: 'lang_en', name: 'English', description: 'English', code: 'en' },
      { language_id: 'lang_om', name: 'Afaan Oromo', description: 'Oromo', code: 'om' },
    ],
    branches: [
      { branch_id: 'branch_main', name: 'Main Library', description: 'Central branch', code: 'MAIN', status: 'active' },
      { branch_id: 'branch_science', name: 'Science Library', description: 'Science branch', code: 'SCI', status: 'active' },
    ],
    locations: [
      { location_id: 'loc_a1', name: 'Shelf A1', description: 'Ground floor shelf', branch_id: 'branch_main' },
      { location_id: 'loc_b2', name: 'Shelf B2', description: 'Second floor shelf', branch_id: 'branch_science' },
    ],
    'member-types': [
      { member_type_id: 'mtype_student', name: 'Student', description: 'Student member', max_loans: 5, loan_days: 14, max_renewals: 2, fine_per_day: 5 },
      { member_type_id: 'mtype_staff', name: 'Staff', description: 'Staff member', max_loans: 8, loan_days: 21, max_renewals: 3, fine_per_day: 2 },
    ],
    contributors: [
      { contributor_id: 'contrib_tanenbaum', full_name: 'Andrew Tanenbaum', name: 'Andrew Tanenbaum', description: 'Author', type: 'person' },
      { contributor_id: 'contrib_silberschatz', full_name: 'Abraham Silberschatz', name: 'Abraham Silberschatz', description: 'Author', type: 'person' },
    ],
    subjects: [
      { subject_id: 'subj_os', name: 'Operating Systems', description: 'OS theory and practice' },
      { subject_id: 'subj_db', name: 'Databases', description: 'Database systems' },
    ],
    users: [
      { uuid: 'user_admin', full_name: 'Library Admin', name: 'Library Admin', email: 'admin@ora.test', role: 'LIBRARY_ADMIN' },
      { uuid: 'user_member', full_name: 'Temam Aman', name: 'Temam Aman', email: 'member@ora.test', role: 'LIBRARY_MEMBER' },
      { uuid: 'user_librarian', full_name: 'Desk Librarian', name: 'Desk Librarian', email: 'librarian@ora.test', role: 'LIBRARIAN' },
    ],
    roles: [
      { role_id: 'role_admin', name: 'LIBRARY_ADMIN', description: 'Admin role' },
      { role_id: 'role_member', name: 'LIBRARY_MEMBER', description: 'Member role' },
      { role_id: 'role_librarian', name: 'LIBRARIAN', description: 'Librarian role' },
    ],
    logs: [
      { log_id: 'log_1', action: 'Created digital resource', entity_type: 'digital_resource', entity_id: 'dres_1', details: 'Mock seed log', created_at: nowIso() },
    ],
    'security-alerts': [
      { alert_id: 'alert_1', title: 'Repeated failed logins', severity: 'medium', status: 'open', created_at: nowIso() },
    ],
    members: [
      { member_id: 'member_1', full_name: 'Temam Aman', member_code: 'LIB-001', membership_no: 'LIB-001', status: 'active', user_id: 'user_member', member_type_id: 'mtype_student', joined_at: nowIso() },
      { member_id: 'member_2', full_name: 'Student B', member_code: 'LIB-002', membership_no: 'LIB-002', status: 'active', user_id: 'user_2', member_type_id: 'mtype_student', joined_at: nowIso() },
    ],
    materials: [
      { material_id: 'mat_1', title: 'Operating Systems Concepts', subtitle: '', description: 'Classic systems textbook', publication_year: 2024, material_type_id: 'mt_book', category_id: 'cat_cs', language_id: 'lang_en', publisher_id: 'pub_pearson', status: 'active', call_number: '005.43 SIL', classification_code: '005.43' },
      { material_id: 'mat_2', title: 'Database System Concepts', subtitle: '', description: 'Database reference', publication_year: 2023, material_type_id: 'mt_book', category_id: 'cat_cs', language_id: 'lang_en', publisher_id: 'pub_pearson', status: 'active', call_number: '005.74 SIL', classification_code: '005.74' },
      { material_id: 'mat_3', title: 'Machine Learning Basics', subtitle: '', description: 'Digital learning title', publication_year: 2025, material_type_id: 'mt_ebook', category_id: 'cat_cs', language_id: 'lang_en', publisher_id: 'pub_ora', status: 'active', call_number: '006.31 ORA', classification_code: '006.31' },
    ],
    copies: [
      { copy_id: 'copy_1', material_id: 'mat_1', accession_number: 'ACC-1001', barcode: 'BC-1001', branch_id: 'branch_main', location_id: 'loc_a1', shelf_location: 'A1', copy_status: 'available', status: 'available' },
      { copy_id: 'copy_2', material_id: 'mat_1', accession_number: 'ACC-1002', barcode: 'BC-1002', branch_id: 'branch_main', location_id: 'loc_a1', shelf_location: 'A1', copy_status: 'loaned', status: 'loaned' },
      { copy_id: 'copy_3', material_id: 'mat_2', accession_number: 'ACC-2001', barcode: '', branch_id: 'branch_science', location_id: 'loc_b2', shelf_location: 'B2', copy_status: 'available', status: 'available' },
    ],
    loans: [
      { loan_id: 'loan_1', member_id: 'member_1', copy_id: 'copy_2', issued_by: 'user_librarian', issue_date: daysFromNow(-10), due_date: daysFromNow(4), return_date: null, status: 'borrowed' },
      { loan_id: 'loan_2', member_id: 'member_2', copy_id: 'copy_1', issued_by: 'user_librarian', issue_date: daysFromNow(-20), due_date: daysFromNow(-3), return_date: null, status: 'overdue' },
    ],
    holds: [
      { hold_id: 'hold_1', member_id: 'member_1', material_id: 'mat_2', branch_id: 'branch_science', request_date: daysFromNow(-2), queue_position: 1, status: 'queued' },
    ],
    fines: [
      { fine_id: 'fine_1', member_id: 'member_2', loan_id: 'loan_2', amount: 25, paid_amount: 0, waived_amount: 0, reason: 'Overdue item', status: 'unpaid', created_at: daysFromNow(-2) },
      { fine_id: 'fine_2', member_id: 'member_1', loan_id: 'loan_1', amount: 10, paid_amount: 5, waived_amount: 0, reason: 'Late renewal fee', status: 'partial', created_at: daysFromNow(-1) },
    ],
    'acquisition-requests': [
      { request_id: 'req_1', title: 'Advanced Algorithms', author_name: 'CLRS Team', quantity: 3, estimated_cost: 12000, material_type_id: 'mt_book', requested_by: 'user_librarian', approved_by: null, status: 'submitted', requested_at: daysFromNow(-5) },
      { request_id: 'req_2', title: 'Cloud Computing', author_name: 'A. Author', quantity: 2, estimated_cost: 8000, material_type_id: 'mt_book', requested_by: 'user_librarian', approved_by: 'user_admin', status: 'approved', requested_at: daysFromNow(-8), approved_at: daysFromNow(-6) },
    ],
    vendors: [
      { vendor_id: 'vendor_1', name: 'Addis Books', description: 'Local vendor', contact_person: 'Helen', email: 'vendor@addis.test', status: 'active' },
    ],
    'purchase-orders': [
      { purchase_order_id: 'po_1', request_id: 'req_2', vendor_id: 'vendor_1', po_number: 'PO-0001', order_date: daysFromNow(-4), expected_delivery_date: daysFromNow(3), total_amount: 8000, status: 'ordered', created_by: 'user_admin' },
    ],
    'acquisition-receipts': [
      { receipt_id: 'receipt_1', purchase_order_id: 'po_1', receipt_number: 'REC-0001', received_date: daysFromNow(-1), received_by: 'user_librarian', status: 'received' },
    ],
    'digital-submissions': [
      { submission_id: 'sub_1', title: 'AI Research Paper', author: 'Content Uploader', publication_date: '2026-03-01', abstract: 'Paper awaiting approval', submitted_by: 'user_member', reviewed_by: null, status: 'draft', submitted_at: daysFromNow(-1), reviewed_at: null },
      { submission_id: 'sub_2', title: 'Oromo Heritage Journal', author: 'External Publisher', publication_date: '2026-02-10', abstract: 'Ready for approval', submitted_by: 'user_admin', reviewed_by: null, status: 'submitted', submitted_at: daysFromNow(-10), reviewed_at: null },
    ],
    'digital-submission-files': [
      { submission_file_id: 'subfile_1', submission_id: 'sub_1', file_name: 'ai-paper.pdf', file_role: 'main', mime_type: 'application/pdf', storage_path: '/mock/ai-paper.pdf', uploaded_at: nowIso() },
    ],
    'digital-resources': [
      { digital_resource_id: 'dres_1', material_id: 'mat_3', publisher_id: 'pub_ora', uploaded_by: 'user_admin', access_level: 'students', license_start_date: daysFromNow(-30), license_end_date: daysFromNow(365), is_downloadable: true, is_active: true, status: 'published', published_at: daysFromNow(-20) },
    ],
    'digital-resource-files': [
      { resource_file_id: 'rfile_1', digital_resource_id: 'dres_1', file_name: 'ml-basics.pdf', mime_type: 'application/pdf', storage_path: '/mock/ml-basics.pdf', uploaded_at: nowIso() },
    ],
    'digital-collections': [
      { collection_id: 'collection_1', name: 'Computer Science Collection', description: 'Core CS digital titles', created_by: 'user_admin', created_at: nowIso() },
    ],
    'digital-collection-items': [
      { collection_item_id: 'collection_item_1', collection_id: 'collection_1', digital_resource_id: 'dres_1' },
    ],
    'inventory-audits': [
      { audit_id: 'audit_1', branch_id: 'branch_main', conducted_by: 'user_librarian', audit_date: daysFromNow(-7), status: 'completed', notes: 'Minor discrepancies found' },
    ],
    'material-contributors': [
      { material_contributor_id: 'matcontrib_1', material_id: 'mat_1', contributor_id: 'contrib_silberschatz', role_name: 'Author', sequence_no: 1 },
    ],
    'material-subjects': [
      { material_subject_id: 'matsubj_1', material_id: 'mat_1', subject_id: 'subj_os' },
    ],
  };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const db = seed();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch {}
  return db;
}

function saveDb(db) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch {}
  return db;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function configFor(resource) {
  return resourceConfigs[resource] || { id: 'id', prefix: resource.replace(/[^a-z]/gi, '_') };
}

function asRows(rows, limit = 500, offset = 0) {
  return { rows, meta: { total: rows.length, limit, offset, page: Math.floor(offset / limit) + 1 } };
}

function normalizeStatus(row) {
  if (row.status) return String(row.status).toLowerCase();
  if (row.copy_status) return String(row.copy_status).toLowerCase();
  return '';
}

function resourceRows(resource) {
  const db = loadDb();
  return clone(db[resource] || []);
}

function persistResource(resource, rows) {
  const db = loadDb();
  db[resource] = rows;
  saveDb(db);
  return clone(rows);
}

function currentMemberId(db) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.member_id) return user.member_id;
    const member = (db.members || []).find((m) => m.user_id === user?.uuid || m.user_id === user?.id);
    if (member) return member.member_id;
  } catch {}
  return db.members?.[0]?.member_id || null;
}

function filterRows(rows, search) {
  if (!search) return rows;
  const needle = String(search).toLowerCase();
  return rows.filter((row) => Object.values(row || {}).some((v) => String(v ?? '').toLowerCase().includes(needle)));
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const ak = a.updated_at || a.created_at || a.submitted_at || a.requested_at || a.order_date || a.audit_date || a.name || '';
    const bk = b.updated_at || b.created_at || b.submitted_at || b.requested_at || b.order_date || b.audit_date || b.name || '';
    return String(bk).localeCompare(String(ak));
  });
}

function list(resource, params = {}) {
  let rows = resourceRows(resource);
  rows = filterRows(rows, params.search);
  if (params.member_id) rows = rows.filter((r) => r.member_id === params.member_id);
  if (params.material_id) rows = rows.filter((r) => r.material_id === params.material_id);
  if (params.status) rows = rows.filter((r) => normalizeStatus(r) === String(params.status).toLowerCase());
  rows = sortRows(rows);
  const limit = Number(params.limit || 500);
  const offset = Number(params.offset || 0);
  return Promise.resolve(asRows(rows.slice(offset, offset + limit), limit, offset));
}

function get(resource, id) {
  const rows = resourceRows(resource);
  const { id: idField } = configFor(resource);
  return Promise.resolve(rows.find((row) => String(row[idField]) === String(id)) || null);
}

function create(resource, payload = {}) {
  const rows = resourceRows(resource);
  const { id: idField, prefix } = configFor(resource);
  const row = { ...payload, [idField]: uid(prefix), created_at: nowIso(), updated_at: nowIso() };
  rows.unshift(row);
  persistResource(resource, rows);
  return Promise.resolve(clone(row));
}

function update(resource, id, payload = {}) {
  const rows = resourceRows(resource);
  const { id: idField } = configFor(resource);
  const index = rows.findIndex((row) => String(row[idField]) === String(id));
  if (index === -1) return Promise.resolve(null);
  rows[index] = { ...rows[index], ...payload, updated_at: nowIso() };
  persistResource(resource, rows);
  return Promise.resolve(clone(rows[index]));
}

function remove(resource, id) {
  const rows = resourceRows(resource);
  const { id: idField } = configFor(resource);
  persistResource(resource, rows.filter((row) => String(row[idField]) !== String(id)));
  return Promise.resolve({ success: true });
}

function materialTitle(db, materialId) {
  return db.materials.find((m) => m.material_id === materialId)?.title || '-';
}

function memberOverview(memberId) {
  const db = loadDb();
  const loans = db.loans.filter((loan) => loan.member_id === memberId);
  const holds = db.holds.filter((hold) => hold.member_id === memberId);
  const fines = db.fines.filter((fine) => fine.member_id === memberId).map((fine) => {
    const loan = db.loans.find((l) => l.loan_id === fine.loan_id);
    const copy = db.copies.find((c) => c.copy_id === loan?.copy_id);
    return {
      ...fine,
      material_title: materialTitle(db, copy?.material_id),
      accession_number: copy?.accession_number || '-',
      outstanding_amount: Math.max(0, Number(fine.amount || 0) - Number(fine.paid_amount || 0) - Number(fine.waived_amount || 0)),
    };
  });
  const activeLoans = loans.filter((loan) => !loan.return_date && ['borrowed', 'overdue'].includes(String(loan.status).toLowerCase())).map((loan) => {
    const copy = db.copies.find((c) => c.copy_id === loan.copy_id);
    return { ...loan, title: materialTitle(db, copy?.material_id), accession_number: copy?.accession_number || '-' };
  });
  const history = loans.map((loan) => {
    const copy = db.copies.find((c) => c.copy_id === loan.copy_id);
    return { ...loan, title: materialTitle(db, copy?.material_id), accession_number: copy?.accession_number || '-' };
  });
  return {
    member: db.members.find((m) => m.member_id === memberId) || null,
    activeLoans,
    myHolds: holds,
    fines,
    history,
    outstandingBalance: fines.reduce((sum, row) => sum + Number(row.outstanding_amount || 0), 0),
  };
}

const libraryMockApi = {
  list,
  get,
  create,
  update,
  remove,

  submitAcquisitionRequest: async (requestId) => update('acquisition-requests', requestId, { status: 'submitted', submitted_at: nowIso() }),
  approveAcquisitionRequest: async (requestId) => update('acquisition-requests', requestId, { status: 'approved', approved_by: 'user_admin', approved_at: nowIso() }),
  rejectAcquisitionRequest: async (requestId, payload = {}) => update('acquisition-requests', requestId, { status: 'rejected', rejection_reason: payload.rejection_reason || 'Rejected' }),
  markAcquisitionRequestOrdered: async (requestId) => update('acquisition-requests', requestId, { status: 'ordered' }),

  receivePurchaseOrder: async (purchaseOrderId, payload = {}) => {
    await update('purchase-orders', purchaseOrderId, { status: 'received' });
    const created = await create('acquisition-receipts', {
      purchase_order_id: purchaseOrderId,
      receipt_number: payload.receipt_number || `REC-${Date.now()}`,
      received_date: payload.received_date || nowIso(),
      received_by: 'user_librarian',
      status: 'received',
    });
    return created;
  },

  borrowLoan: async (payload) => {
    const db = loadDb();
    const copy = db.copies.find((c) => c.copy_id === payload.copy_id);
    if (!copy) throw new Error('Copy not found');
    copy.copy_status = 'loaned';
    copy.status = 'loaned';
    saveDb(db);
    const loan = await create('loans', {
      member_id: payload.member_id,
      copy_id: payload.copy_id,
      issued_by: 'user_librarian',
      issue_date: nowIso(),
      due_date: payload.new_due_date || daysFromNow(14),
      return_date: null,
      status: 'borrowed',
    });
    return loan;
  },
  returnLoan: async (loanId) => {
    const db = loadDb();
    const loan = db.loans.find((l) => l.loan_id === loanId);
    if (!loan) throw new Error('Loan not found');
    loan.return_date = nowIso();
    loan.status = 'returned';
    const copy = db.copies.find((c) => c.copy_id === loan.copy_id);
    if (copy) {
      copy.copy_status = 'available';
      copy.status = 'available';
    }
    saveDb(db);
    return clone(loan);
  },
  renewLoan: async (loanId, payload = {}) => {
    const dueDate = payload.new_due_date || daysFromNow(14);
    return update('loans', loanId, { due_date: dueDate, status: 'borrowed' });
  },
  createHold: async (payload) => create('holds', { ...payload, request_date: nowIso(), queue_position: 1, status: 'queued' }),
  cancelHold: async (holdId) => update('holds', holdId, { status: 'cancelled' }),
  fulfillHold: async (holdId, payload = {}) => update('holds', holdId, { status: 'ready_for_pickup', fulfilled_copy_id: payload.copy_id || null }),
  payFine: async (fineId, payload) => {
    const row = await get('fines', fineId);
    const paid = Number(row?.paid_amount || 0) + Number(payload.amount || 0);
    const waived = Number(row?.waived_amount || 0);
    const amount = Number(row?.amount || 0);
    return update('fines', fineId, { paid_amount: paid, status: paid + waived >= amount ? 'paid' : 'partial' });
  },
  waiveFine: async (fineId, payload) => {
    const row = await get('fines', fineId);
    const paid = Number(row?.paid_amount || 0);
    const waived = Number(row?.waived_amount || 0) + Number(payload.amount || 0);
    const amount = Number(row?.amount || 0);
    return update('fines', fineId, { waived_amount: waived, status: paid + waived >= amount ? 'waived' : 'partial', waive_reason: payload.reason || '' });
  },
  submitDigitalSubmission: async (submissionId) => update('digital-submissions', submissionId, { status: 'submitted', submitted_at: nowIso() }),
  reviewDigitalSubmission: async (submissionId, payload) => update('digital-submissions', submissionId, { status: payload.decision === 'approved' ? 'approved' : 'correction_requested', reviewed_at: nowIso(), reviewed_by: 'user_admin', review_comments: payload.comments || '' }),
  publishDigitalSubmission: async (submissionId) => {
    const sub = await get('digital-submissions', submissionId);
    if (!sub) throw new Error('Submission not found');
    const db = loadDb();
    const material = db.materials[0];
    const resource = await create('digital-resources', { material_id: material.material_id, publisher_id: 'pub_ora', uploaded_by: 'user_admin', access_level: 'students', license_start_date: nowIso(), license_end_date: daysFromNow(365), is_downloadable: true, is_active: true, status: 'published', published_at: nowIso() });
    await update('digital-submissions', submissionId, { status: 'published', published_resource_id: resource.digital_resource_id });
    return resource;
  },

  searchCatalog: async (params = {}) => {
    const db = loadDb();
    let rows = db.materials.map((m) => {
      const copies = db.copies.filter((c) => c.material_id === m.material_id);
      return { ...m, available_copies: copies.filter((c) => ['available', 'ready_for_pickup'].includes((c.copy_status || '').toLowerCase())).length, total_copies: copies.length };
    });
    rows = filterRows(rows, params.search || params.q);
    if (params.category_id) rows = rows.filter((r) => r.category_id === params.category_id);
    if (params.material_type_id) rows = rows.filter((r) => r.material_type_id === params.material_type_id);
    return asRows(rows, Number(params.limit || 50), 0);
  },
  getCatalogMaterial: async (materialId) => get('materials', materialId),
  getCatalogAvailability: async (materialId) => {
    const db = loadDb();
    const copies = db.copies.filter((c) => c.material_id === materialId);
    return { rows: copies, available: copies.filter((c) => (c.copy_status || '').toLowerCase() === 'available').length, total: copies.length };
  },
  getSubmissionWorkflow: async (submissionId) => {
    const sub = await get('digital-submissions', submissionId);
    return {
      submission: sub,
      history: [
        { step: 'draft_created', status: 'draft', changed_at: sub?.created_at || sub?.submitted_at || nowIso(), note: 'Submission created' },
        ...(sub?.status !== 'draft' ? [{ step: 'submitted', status: 'submitted', changed_at: sub?.submitted_at || nowIso(), note: 'Submitted for review' }] : []),
        ...(sub?.reviewed_at ? [{ step: 'reviewed', status: sub?.status, changed_at: sub.reviewed_at, note: sub.review_comments || 'Reviewed' }] : []),
      ],
      files: resourceRows('digital-submission-files').filter((f) => f.submission_id === submissionId),
    };
  },
  resubmitDigitalSubmission: async (submissionId, payload = {}) => update('digital-submissions', submissionId, { status: 'submitted', resubmission_note: payload.note || '', submitted_at: nowIso() }),
  getUploaderDashboard: async () => {
    const db = loadDb();
    return {
      draft: db['digital-submissions'].filter((s) => s.status === 'draft').length,
      submitted: db['digital-submissions'].filter((s) => s.status === 'submitted').length,
      approved: db['digital-submissions'].filter((s) => s.status === 'approved').length,
      published: db['digital-submissions'].filter((s) => s.status === 'published').length,
    };
  },
  listPublisherPackages: async () => asRows(resourceRows('digital-submissions').filter((s) => s.author === 'External Publisher')),
  createPublisherPackage: async (payload = {}) => create('digital-submissions', { title: payload.title || 'New Publisher Package', author: payload.publisher_name || 'External Publisher', publication_date: payload.publication_date || new Date().toISOString().slice(0, 10), abstract: payload.description || '', status: 'draft', package_type: 'publisher' }),
  createPublisherResource: async (payload = {}) => create('digital-resources', { material_id: payload.material_id || 'mat_3', publisher_id: payload.publisher_id || 'pub_pearson', access_level: payload.access_level || 'students', is_downloadable: true, is_active: true, status: 'published', uploaded_by: 'user_admin', license_start_date: nowIso(), license_end_date: daysFromNow(365) }),
  getUsageReport: async () => {
    const db = loadDb();
    return {
      totalResources: db['digital-resources'].length,
      activeResources: db['digital-resources'].filter((r) => r.is_active).length,
      downloadsThisMonth: 42,
      mostUsedCollections: db['digital-collections'].map((c) => ({ name: c.name, accesses: 12 })),
    };
  },
  getLoansReport: async () => {
    const db = loadDb();
    return {
      totalLoans: db.loans.length,
      activeLoans: db.loans.filter((l) => ['borrowed', 'overdue'].includes(l.status)).length,
      returnedLoans: db.loans.filter((l) => l.status === 'returned').length,
      overdueLoans: db.loans.filter((l) => l.status === 'overdue').length,
      rows: db.loans,
    };
  },
  getCatalogClassificationSuggestion: async (materialId) => ({ material_id: materialId, classification_code: '005.43', call_number: '005.43 AUTO', confidence: 0.92 }),
  applyCatalogClassification: async (materialId, payload) => update('materials', materialId, { classification_code: payload.classification_code, call_number: payload.call_number }),
  generateCopyBarcode: async (copyId, payload = {}) => update('copies', copyId, { barcode: `${payload.prefix || 'BC'}-${String(Date.now()).slice(-6)}` }),
  generateMissingCopyBarcodes: async (payload = {}) => {
    const rows = resourceRows('copies');
    let count = 0;
    const updated = rows.map((row) => {
      if (!row.barcode && count < Number(payload.limit || 50)) {
        count += 1;
        return { ...row, barcode: `${payload.prefix || 'BC'}-${String(Date.now() + count).slice(-6)}` };
      }
      return row;
    });
    persistResource('copies', updated);
    return { updated_count: count };
  },

  createInventoryAudit: async (payload = {}) => create('inventory-audits', { ...payload, audit_date: payload.audit_date || nowIso(), status: payload.status || 'draft' }),
  getInventoryReport: async () => {
    const db = loadDb();
    return {
      totalCopies: db.copies.length,
      availableCopies: db.copies.filter((c) => (c.copy_status || '').toLowerCase() === 'available').length,
      loanedCopies: db.copies.filter((c) => (c.copy_status || '').toLowerCase() === 'loaned').length,
      damagedItems: 1,
      missingItems: 1,
      branches: db.branches.map((branch) => ({ branch: branch.name, copies: db.copies.filter((c) => c.branch_id === branch.branch_id).length })),
    };
  },
  getCirculationSummary: async () => {
    const db = loadDb();
    return {
      active_loans: db.loans.filter((l) => ['borrowed', 'overdue'].includes(l.status)).length,
      overdue_loans: db.loans.filter((l) => l.status === 'overdue').length,
      queued_holds: db.holds.filter((h) => h.status === 'queued').length,
      unpaid_fines: db.fines.filter((f) => ['unpaid', 'partial'].includes(f.status)).length,
    };
  },
  getMyCirculationOverview: async () => memberOverview(currentMemberId(loadDb())),
  getMemberCirculationOverview: async (memberId) => memberOverview(memberId),

  getDigitalCollectionResources: async (collectionId) => {
    const db = loadDb();
    const resourceIds = db['digital-collection-items'].filter((item) => item.collection_id === collectionId).map((item) => item.digital_resource_id);
    return db['digital-resources'].filter((r) => resourceIds.includes(r.digital_resource_id));
  },
  addDigitalCollectionResource: async (collectionId, payload) => create('digital-collection-items', { collection_id: collectionId, digital_resource_id: payload.digital_resource_id }),
  removeDigitalCollectionResource: async (collectionId, resourceId) => {
    const rows = resourceRows('digital-collection-items').filter((item) => !(item.collection_id === collectionId && item.digital_resource_id === resourceId));
    persistResource('digital-collection-items', rows);
    return { success: true };
  },
  accessDigitalResource: async (resourceId) => ({ resource: await get('digital-resources', resourceId), files: resourceRows('digital-resource-files').filter((file) => file.digital_resource_id === resourceId) }),
  getReportSummary: async () => {
    const db = loadDb();
    const outstandingFineBalance = db.fines.reduce((sum, fine) => sum + Math.max(0, Number(fine.amount || 0) - Number(fine.paid_amount || 0) - Number(fine.waived_amount || 0)), 0);
    return {
      materials: db.materials.length,
      copies: db.copies.length,
      activeLoans: db.loans.filter((l) => ['borrowed', 'overdue'].includes(l.status)).length,
      pendingHolds: db.holds.filter((h) => h.status === 'queued').length,
      outstandingFineBalance,
      pendingDigitalSubmissions: db['digital-submissions'].filter((s) => ['draft', 'submitted', 'correction_requested'].includes(s.status)).length,
      activeDigitalResources: db['digital-resources'].filter((r) => r.is_active).length,
    };
  },
  getOverdueLoans: async () => {
    const db = loadDb();
    return db.loans.filter((loan) => loan.status === 'overdue').map((loan) => {
      const member = db.members.find((m) => m.member_id === loan.member_id);
      const copy = db.copies.find((c) => c.copy_id === loan.copy_id);
      return { ...loan, full_name: member?.full_name || '-', member_code: member?.member_code || '-', title: materialTitle(db, copy?.material_id), accession_number: copy?.accession_number || '-' };
    });
  },
  uploadSubmissionFile: async (submissionId, file, fileRole = 'main') => create('digital-submission-files', { submission_id: submissionId, file_name: file?.name || `upload-${Date.now()}.pdf`, file_role: fileRole, mime_type: file?.type || 'application/pdf', storage_path: '/mock/uploaded-file', uploaded_at: nowIso() }),
  uploadResourceFile: async (resourceId, file) => create('digital-resource-files', { digital_resource_id: resourceId, file_name: file?.name || `resource-${Date.now()}.pdf`, mime_type: file?.type || 'application/pdf', storage_path: '/mock/uploaded-resource', uploaded_at: nowIso() }),
};

export default libraryMockApi;
