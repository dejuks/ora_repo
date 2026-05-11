import pool from '../../config/db.js';

const RESOURCE_CONFIG = {
  'material-types': { table: 'material_types', id: 'material_type_id', select: 'material_type_id, code, name, is_borrowable, is_digital_allowed, is_physical_allowed, description, created_at, updated_at', mutable: ['code','name','is_borrowable','is_digital_allowed','is_physical_allowed','description'] },
  'categories': { table: 'library_categories', id: 'category_id', select: 'category_id, parent_category_id, code, name, description, created_at, updated_at', mutable: ['parent_category_id','code','name','description'] },
  'publishers': { table: 'publishers', id: 'publisher_id', select: 'publisher_id, name, city, country, website, contact_email, contact_phone, is_external_provider, created_at, updated_at', mutable: ['name','city','country','website','contact_email','contact_phone','is_external_provider'] },
  'languages': { table: 'languages', id: 'language_id', select: 'language_id, code, name', mutable: ['code','name'] },
  'subjects': { table: 'library_subjects', id: 'subject_id', select: 'subject_id, code, name, description, created_at, updated_at', mutable: ['code','name','description'] },
  'contributors': { table: 'contributors', id: 'contributor_id', select: 'contributor_id, full_name, organization_name, contributor_type, bio, email, orcid, created_at, updated_at', mutable: ['full_name','organization_name','contributor_type','bio','email','orcid'] },
  'branches': { table: 'library_branches', id: 'branch_id', select: 'branch_id, code, name, description, address, phone, email, is_active, created_at, updated_at', mutable: ['code','name','description','address','phone','email','is_active'] },
  'locations': { table: 'library_locations', id: 'location_id', select: 'location_id, branch_id, parent_location_id, code, name, location_type, description, is_active, created_at, updated_at', mutable: ['branch_id','parent_location_id','code','name','location_type','description','is_active'] },
  'member-types': { table: 'member_types', id: 'member_type_id', select: 'member_type_id, code, name, description, max_active_loans, max_hold_requests, loan_period_days, renewal_limit, fine_per_day, grace_period_days, can_access_digital, can_download_digital, is_active, created_at, updated_at', mutable: ['code','name','description','max_active_loans','max_hold_requests','loan_period_days','renewal_limit','fine_per_day','grace_period_days','can_access_digital','can_download_digital','is_active'] },
  'members': { table: 'library_members', id: 'member_id', select: 'member_id, user_id, member_type_id, member_code, branch_id, department, program, admission_year, expiry_date, status, notes, created_at, updated_at', mutable: ['user_id','member_type_id','member_code','branch_id','department','program','admission_year','expiry_date','status','notes'] },
  'materials': { table: 'catalog_materials', id: 'material_id', select: 'material_id, material_type_id, category_id, publisher_id, language_id, title, subtitle, edition, isbn, issn, publication_year, publication_place, abstract, description, table_of_contents, keywords, classification_code, call_number, material_format, is_reference_only, is_active, created_by, updated_by, created_at, updated_at', mutable: ['material_type_id','category_id','publisher_id','language_id','title','subtitle','edition','isbn','issn','publication_year','publication_place','abstract','description','table_of_contents','keywords','classification_code','call_number','material_format','is_reference_only','is_active','created_by','updated_by'] },
  'copies': { table: 'material_copies', id: 'copy_id', select: 'copy_id, material_id, branch_id, location_id, accession_number, barcode, rfid_tag, copy_number, purchase_price, replacement_cost, acquisition_date, condition_note, status, is_circulation_allowed, withdrawn_reason, created_at, updated_at', mutable: ['material_id','branch_id','location_id','accession_number','barcode','rfid_tag','copy_number','purchase_price','replacement_cost','acquisition_date','condition_note','status','is_circulation_allowed','withdrawn_reason'] },
  'circulation-policies': { table: 'circulation_policies', id: 'policy_id', select: 'policy_id, name, member_type_id, material_type_id, max_active_loans, loan_period_days, renewal_limit, grace_period_days, fine_per_day, max_fine_amount, allow_holds, allow_renewal, allow_reference_checkout, is_active, created_at, updated_at', mutable: ['name','member_type_id','material_type_id','max_active_loans','loan_period_days','renewal_limit','grace_period_days','fine_per_day','max_fine_amount','allow_holds','allow_renewal','allow_reference_checkout','is_active'] },
  'loans': { table: 'loans', id: 'loan_id', select: 'loan_id, member_id, copy_id, issued_by, returned_to, policy_id, loan_date, due_date, return_date, renewal_count, status, remarks, created_at, updated_at', mutable: ['member_id','copy_id','issued_by','returned_to','policy_id','loan_date','due_date','return_date','renewal_count','status','remarks'] },
  'holds': { table: 'hold_requests', id: 'hold_id', select: 'hold_id, member_id, material_id, copy_id, queue_position, status, requested_at, ready_at, expiry_at, fulfilled_at, cancelled_at, cancelled_reason, created_at, updated_at', mutable: ['member_id','material_id','copy_id','queue_position','status','requested_at','ready_at','expiry_at','fulfilled_at','cancelled_at','cancelled_reason'] },
  'fines': { table: 'fines', id: 'fine_id', select: 'fine_id, member_id, loan_id, copy_id, reason, amount, paid_amount, waived_amount, status, assessed_by, due_date, note, created_at, updated_at', mutable: ['member_id','loan_id','copy_id','reason','amount','paid_amount','waived_amount','status','assessed_by','due_date','note'] },
  'vendors': { table: 'vendors', id: 'vendor_id', select: 'vendor_id, name, contact_person, email, phone, address, website, tax_id, is_active, created_at, updated_at', mutable: ['name','contact_person','email','phone','address','website','tax_id','is_active'] },
  'acquisition-requests': { table: 'acquisition_requests', id: 'request_id', select: 'request_id, requested_by, approved_by, material_type_id, title, author_text, publisher_text, publication_year, isbn, quantity, estimated_price, justification, status, rejection_reason, submitted_at, approved_at, created_at, updated_at', mutable: ['requested_by','approved_by','material_type_id','title','author_text','publisher_text','publication_year','isbn','quantity','estimated_price','justification','status','rejection_reason','submitted_at','approved_at'] },
  'purchase-orders': { table: 'purchase_orders', id: 'purchase_order_id', select: 'purchase_order_id, request_id, vendor_id, po_number, ordered_by, approved_by, order_date, expected_delivery_date, total_amount, status, note, created_at, updated_at', mutable: ['request_id','vendor_id','po_number','ordered_by','approved_by','order_date','expected_delivery_date','total_amount','status','note'] },
  'acquisition-receipts': { table: 'acquisitions_receipts', id: 'receipt_id', select: 'receipt_id, purchase_order_id, received_by, receipt_number, received_date, note, created_at', mutable: ['purchase_order_id','received_by','receipt_number','received_date','note'] },
  'inventory-audits': { table: 'inventory_audits', id: 'audit_id', select: 'audit_id, branch_id, location_id, audit_name, status, started_by, completed_by, start_date, end_date, note, created_at', mutable: ['branch_id','location_id','audit_name','status','started_by','completed_by','start_date','end_date','note'] },
  'damage-reports': { table: 'damage_reports', id: 'damage_report_id', select: 'damage_report_id, copy_id, loan_id, reported_by, severity, description, estimated_cost, resolved, resolved_note, resolved_at, created_at', mutable: ['copy_id','loan_id','reported_by','severity','description','estimated_cost','resolved','resolved_note','resolved_at'] },
  'lost-item-reports': { table: 'lost_item_reports', id: 'lost_report_id', select: 'lost_report_id, copy_id, loan_id, reported_by, description, replacement_cost, resolved, resolved_note, resolved_at, created_at', mutable: ['copy_id','loan_id','reported_by','description','replacement_cost','resolved','resolved_note','resolved_at'] },
  'audit-logs': { table: 'library_audit_logs', id: 'audit_log_id', select: 'audit_log_id, actor_user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at', mutable: [] },
  'digital-resources': { table: 'digital_resources', id: 'digital_resource_id', select: 'digital_resource_id, material_id, publisher_id, access_level, drm_required, license_start_date, license_end_date, embargo_until, is_downloadable, is_streamable, is_active, created_by, updated_by, created_at, updated_at', mutable: ['material_id','publisher_id','access_level','drm_required','license_start_date','license_end_date','embargo_until','is_downloadable','is_streamable','is_active','created_by','updated_by'] },
  'digital-access-rules': { table: 'digital_access_rules', id: 'rule_id', select: 'rule_id, digital_resource_id, member_type_id, allow_view, allow_download, allow_print, max_downloads_per_user, note', mutable: ['digital_resource_id','member_type_id','allow_view','allow_download','allow_print','max_downloads_per_user','note'] },
  'digital-usage-logs': { table: 'digital_usage_logs', id: 'usage_log_id', select: 'usage_log_id, digital_resource_id, file_id, user_id, member_id, action, ip_address, user_agent, created_at', mutable: ['digital_resource_id','file_id','user_id','member_id','action','ip_address','user_agent'] },
  'digital-submissions': { table: 'digital_submissions', id: 'submission_id', select: 'submission_id, submitted_by, publisher_id, material_type_id, category_id, language_id, title, subtitle, abstract, keywords, publication_year, isbn, issn, access_level, status, note, submitted_at, reviewed_at, approved_at, published_at, created_at, updated_at', mutable: ['submitted_by','publisher_id','material_type_id','category_id','language_id','title','subtitle','abstract','keywords','publication_year','isbn','issn','access_level','status','note','submitted_at','reviewed_at','approved_at','published_at'] },
  'digital-collections': { table: 'digital_submission_publications', id: 'publication_id', select: 'publication_id, submission_id, material_id, digital_resource_id, published_by, published_at', mutable: ['submission_id','material_id','digital_resource_id','published_by','published_at'] },
};

function cfg(name){ const c = RESOURCE_CONFIG[name]; if(!c) throw new Error(`Unsupported library resource: ${name}`); return c; }
function truthy(v){ return v===true || v==='true' || v===1 || v==='1'; }

function sanitizePayload(resource, payload={}) {
  const c = cfg(resource);
  const out = {};
  for (const key of c.mutable) {
    if (payload[key] !== undefined) out[key] = payload[key];
  }
  return out;
}

function buildWhere(searchableColumns, params, search) {
  if (!search || !searchableColumns.length) return { where: '', params };
  params.push(`%${search}%`);
  const idx = params.length;
  return { where: ` WHERE ` + searchableColumns.map(col => `${col}::text ILIKE $${idx}`).join(' OR '), params };
}

async function listResource(resource, { limit=100, offset=0, search='' } = {}) {
  const c = cfg(resource);
  const searchable = c.mutable.filter(k => ['name','code','title','full_name','member_code','po_number','receipt_number','email','action','status'].includes(k));
  let params = [];
  const whereData = buildWhere(searchable, params, search);
  params = whereData.params;
  params.push(Math.min(Number(limit)||100, 500));
  const limitIdx = params.length;
  params.push(Number(offset)||0);
  const offsetIdx = params.length;
  const q = `SELECT ${c.select} FROM ${c.table}${whereData.where} ORDER BY 1 DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const rows = (await pool.query(q, params)).rows;
  return { rows, meta: { total: rows.length, limit: Number(limit)||100, offset: Number(offset)||0 } };
}

async function getResource(resource, id) {
  const c = cfg(resource);
  const q = `SELECT ${c.select} FROM ${c.table} WHERE ${c.id} = $1`;
  return (await pool.query(q, [id])).rows[0] || null;
}

async function createResource(resource, payload) {
  const c = cfg(resource);
  const data = sanitizePayload(resource, payload);
  const keys = Object.keys(data);
  if (!keys.length) throw new Error('No writable fields provided');
  const values = keys.map((_,i)=>`$${i+1}`);
  const sql = `INSERT INTO ${c.table} (${keys.join(', ')}) VALUES (${values.join(', ')}) RETURNING ${c.select}`;
  return (await pool.query(sql, keys.map(k=>data[k]))).rows[0];
}

async function updateResource(resource, id, payload) {
  const c = cfg(resource);
  const data = sanitizePayload(resource, payload);
  const keys = Object.keys(data);
  if (!keys.length) return getResource(resource, id);
  const setters = keys.map((k,i)=>`${k} = $${i+1}`);
  const sql = `UPDATE ${c.table} SET ${setters.join(', ')}${c.select.includes('updated_at') ? ', updated_at = NOW()' : ''} WHERE ${c.id} = $${keys.length+1} RETURNING ${c.select}`;
  return (await pool.query(sql, [...keys.map(k=>data[k]), id])).rows[0] || null;
}

async function removeResource(resource, id) {
  const c = cfg(resource);
  const sql = `DELETE FROM ${c.table} WHERE ${c.id} = $1 RETURNING ${c.id}`;
  return !!(await pool.query(sql, [id])).rows[0];
}

async function getAdminDashboard() {
  const [[materials],[copies],[members],[loans],[holds],[fines],[digitalSubmissions],[digitalResources]] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM catalog_materials`),
    pool.query(`SELECT COUNT(*)::int AS count FROM material_copies`),
    pool.query(`SELECT COUNT(*)::int AS count FROM library_members`),
    pool.query(`SELECT COUNT(*)::int AS count FROM loans WHERE status IN ('active','overdue')`),
    pool.query(`SELECT COUNT(*)::int AS count FROM hold_requests WHERE status IN ('queued','ready_for_pickup')`),
    pool.query(`SELECT COALESCE(SUM(GREATEST(amount - paid_amount - waived_amount,0)),0)::numeric AS balance FROM fines WHERE status <> 'paid'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM digital_submissions WHERE status IN ('submitted','under_review')`),
    pool.query(`SELECT COUNT(*)::int AS count FROM digital_resources WHERE is_active = TRUE`),
  ].map(p=>p.then(r=>r.rows)));
  return {
    materials: materials.count,
    copies: copies.count,
    activeLoans: loans.count,
    pendingHolds: holds.count,
    outstandingFineBalance: Number(fines.balance||0),
    pendingDigitalSubmissions: digitalSubmissions.count,
    activeDigitalResources: digitalResources.count,
    members: members.count,
  };
}

async function getLibrarianSummary() {
  const [summary, overdue, todayReturns] = await Promise.all([
    getAdminDashboard(),
    pool.query(`SELECT l.loan_id, l.member_id, l.copy_id, l.due_date, l.status, m.member_code, u.full_name, c.title, mc.accession_number FROM loans l JOIN library_members m ON m.member_id=l.member_id LEFT JOIN users u ON u.uuid=m.user_id JOIN material_copies mc ON mc.copy_id=l.copy_id JOIN catalog_materials c ON c.material_id=mc.material_id WHERE l.status='overdue' ORDER BY l.due_date ASC LIMIT 25`).then(r=>r.rows),
    pool.query(`SELECT l.loan_id, u.full_name, c.title, l.return_date FROM loans l JOIN library_members m ON m.member_id=l.member_id LEFT JOIN users u ON u.uuid=m.user_id JOIN material_copies mc ON mc.copy_id=l.copy_id JOIN catalog_materials c ON c.material_id=mc.material_id WHERE l.return_date::date = CURRENT_DATE ORDER BY l.return_date DESC LIMIT 15`).then(r=>r.rows),
  ]);
  return { ...summary, overdue, todayReturns };
}

async function getMemberOverview(userId) {
  if (!userId) return { member: null, loans: [], holds: [], fines: [], downloads: [] };
  const member = (await pool.query(`SELECT * FROM library_members WHERE user_id=$1 LIMIT 1`, [userId])).rows[0] || null;
  if (!member) return { member: null, loans: [], holds: [], fines: [], downloads: [] };
  const [loans, holds, fines, downloads] = await Promise.all([
    pool.query(`SELECT * FROM loans WHERE member_id=$1 ORDER BY created_at DESC LIMIT 100`, [member.member_id]).then(r=>r.rows),
    pool.query(`SELECT * FROM hold_requests WHERE member_id=$1 ORDER BY created_at DESC LIMIT 100`, [member.member_id]).then(r=>r.rows),
    pool.query(`SELECT * FROM fines WHERE member_id=$1 ORDER BY created_at DESC LIMIT 100`, [member.member_id]).then(r=>r.rows),
    pool.query(`SELECT * FROM digital_usage_logs WHERE member_id=$1 ORDER BY created_at DESC LIMIT 100`, [member.member_id]).then(r=>r.rows),
  ]);
  return { member, loans, holds, fines, downloads };
}

async function fulfillHold(holdId, payload={}) {
  const sql = `UPDATE hold_requests SET status='fulfilled', fulfilled_at=NOW(), copy_id = COALESCE($2, copy_id), updated_at = NOW() WHERE hold_id=$1 RETURNING *`;
  return (await pool.query(sql, [holdId, payload.copy_id || null])).rows[0] || null;
}

async function payFine(fineId, payload={}) {
  const amount = Number(payload.amount || payload.paid_amount || 0);
  const sql = `UPDATE fines SET paid_amount = COALESCE(paid_amount,0) + $2, status = CASE WHEN COALESCE(paid_amount,0) + COALESCE(waived_amount,0) + $2 >= amount THEN 'paid' ELSE 'partial' END, updated_at=NOW() WHERE fine_id=$1 RETURNING *`;
  return (await pool.query(sql, [fineId, amount])).rows[0] || null;
}

async function getOverdueLoans() {
  return (await pool.query(`SELECT l.loan_id, l.member_id, l.copy_id, l.due_date, l.status, m.member_code, u.full_name, c.title, mc.accession_number FROM loans l JOIN library_members m ON m.member_id=l.member_id LEFT JOIN users u ON u.uuid=m.user_id JOIN material_copies mc ON mc.copy_id=l.copy_id JOIN catalog_materials c ON c.material_id=mc.material_id WHERE l.status='overdue' ORDER BY l.due_date ASC LIMIT 100`)).rows;
}

export default { listResource, getResource, createResource, updateResource, removeResource, getAdminDashboard, getLibrarianSummary, getMemberOverview, fulfillHold, payFine, getOverdueLoans };
