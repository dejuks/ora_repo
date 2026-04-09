import { BaseModel } from './base.model.js';
import pool from '../../config/db.js';

class PhysicalLibraryModel extends BaseModel {
  constructor() {
    super({ table: 'catalog_materials', primaryKey: 'material_id' });
  }

  async listMaterials({ search = '', status = '', branch_id = '', page = 1, per_page = 10 } = {}) {
    const limit = Math.min(Math.max(Number(per_page) || 10, 1), 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const offset = (currentPage - 1) * limit;
    const values = ['physical'];
    const filters = [`cm.material_format = $1`];

    if (String(search || '').trim()) {
      values.push(`%${String(search).trim()}%`);
      const i = values.length;
      filters.push(`(cm.title ILIKE $${i} OR cm.isbn ILIKE $${i} OR cm.call_number ILIKE $${i})`);
    }
    if (String(status || '').trim()) {
      values.push(String(status).trim());
      filters.push(`EXISTS (SELECT 1 FROM material_copies mc2 WHERE mc2.material_id = cm.material_id AND mc2.status = $${values.length})`);
    }
    if (String(branch_id || '').trim()) {
      values.push(String(branch_id).trim());
      filters.push(`EXISTS (SELECT 1 FROM material_copies mc3 WHERE mc3.material_id = cm.material_id AND mc3.branch_id = $${values.length})`);
    }

    const where = `WHERE ${filters.join(' AND ')}`;
    const countSql = `SELECT COUNT(*)::int AS total FROM catalog_materials cm ${where}`;
    const listSql = `
      SELECT
        cm.*,
        COUNT(mc.copy_id)::int AS total_copies,
        COUNT(CASE WHEN mc.status = 'available' THEN 1 END)::int AS available_copies,
        COUNT(CASE WHEN mc.status IN ('borrowed','checked_out','on_loan','loaned') THEN 1 END)::int AS borrowed_copies
      FROM catalog_materials cm
      LEFT JOIN material_copies mc ON mc.material_id = cm.material_id
      ${where}
      GROUP BY cm.material_id
      ORDER BY cm.created_at DESC NULLS LAST, cm.title ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    const countRes = await pool.query(countSql, values);
    const listRes = await pool.query(listSql, [...values, limit, offset]);
    const total = countRes.rows[0]?.total || 0;
    return { rows: listRes.rows, meta: { current_page: currentPage, per_page: limit, total, last_page: Math.max(Math.ceil(total / limit), 1) } };
  }

  async getMaterialById(materialId, client = pool) {
    const materialRes = await client.query(`SELECT * FROM catalog_materials WHERE material_id = $1 AND material_format = 'physical' LIMIT 1`, [materialId]);
    const material = materialRes.rows[0];
    if (!material) return null;

    const copiesRes = await client.query(`SELECT * FROM material_copies WHERE material_id = $1 ORDER BY created_at DESC NULLS LAST, copy_id DESC`, [materialId]);
    const holdsRes = await client.query(`SELECT * FROM hold_requests WHERE material_id = $1 ORDER BY requested_at DESC NULLS LAST, hold_id DESC LIMIT 20`, [materialId]);
    const loanRes = await client.query(`
      SELECT l.*
      FROM loans l
      JOIN material_copies mc ON mc.copy_id = l.copy_id
      WHERE mc.material_id = $1
      ORDER BY l.loan_date DESC NULLS LAST, l.loan_id DESC
      LIMIT 20
    `, [materialId]);

    return { ...material, copies: copiesRes.rows, recent_holds: holdsRes.rows, recent_loans: loanRes.rows };
  }

  async createMaterial(payload, client = pool) {
    const sql = `
      INSERT INTO catalog_materials (
        material_type_id, category_id, publisher_id, language_id,
        title, subtitle, edition, isbn, issn, publication_year,
        publication_place, abstract, description, table_of_contents,
        keywords, classification_code, call_number, material_format,
        is_reference_only, is_active, created_by, updated_by
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,$17,'physical',
        $18,$19,$20,$21
      ) RETURNING *
    `;
    const values = [
      payload.material_type_id, payload.category_id || null, payload.publisher_id || null, payload.language_id || null,
      payload.title, payload.subtitle || null, payload.edition || null, payload.isbn || null, payload.issn || null, payload.publication_year || null,
      payload.publication_place || null, payload.abstract || null, payload.description || null, payload.table_of_contents || null,
      payload.keywords || null, payload.classification_code || null, payload.call_number || null,
      payload.is_reference_only ?? false, payload.is_active ?? true, payload.created_by || null, payload.updated_by || null,
    ];
    const res = await client.query(sql, values);
    return res.rows[0];
  }

  async updateMaterial(materialId, payload, client = pool) {
    const allowed = ['material_type_id','category_id','publisher_id','language_id','title','subtitle','edition','isbn','issn','publication_year','publication_place','abstract','description','table_of_contents','keywords','classification_code','call_number','is_reference_only','is_active','updated_by'];
    const values = [];
    const fields = [];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        values.push(payload[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }
    if (!fields.length) return this.getMaterialById(materialId, client);
    values.push(materialId);
    const res = await client.query(`UPDATE catalog_materials SET ${fields.join(', ')} WHERE material_id = $${values.length} AND material_format = 'physical' RETURNING *`, values);
    return res.rows[0] || null;
  }

  async addCopy(materialId, payload, client = pool) {
    const sql = `
      INSERT INTO material_copies (
        material_id, branch_id, location_id, accession_number, barcode, rfid_tag,
        copy_number, purchase_price, replacement_cost, acquisition_date,
        condition_note, status, is_circulation_allowed, withdrawn_reason
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,
        $11,$12,$13,$14
      ) RETURNING *
    `;
    const values = [
      materialId, payload.branch_id || null, payload.location_id || null, payload.accession_number,
      payload.barcode || null, payload.rfid_tag || null, payload.copy_number || 1, payload.purchase_price || null,
      payload.replacement_cost || null, payload.acquisition_date || null, payload.condition_note || null,
      payload.status || 'available', payload.is_circulation_allowed ?? true, payload.withdrawn_reason || null,
    ];
    const res = await client.query(sql, values);
    return res.rows[0];
  }

  async updateCopy(copyId, payload, client = pool) {
    const allowed = ['branch_id','location_id','accession_number','barcode','rfid_tag','copy_number','purchase_price','replacement_cost','acquisition_date','condition_note','status','is_circulation_allowed','withdrawn_reason'];
    const values = [];
    const fields = [];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        values.push(payload[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }
    if (!fields.length) return this.getCopyById(copyId, client);
    values.push(copyId);
    const res = await client.query(`UPDATE material_copies SET ${fields.join(', ')} WHERE copy_id = $${values.length} RETURNING *`, values);
    return res.rows[0] || null;
  }

  async getCopyById(copyId, client = pool) {
    const res = await client.query(`SELECT * FROM material_copies WHERE copy_id = $1 LIMIT 1`, [copyId]);
    return res.rows[0] || null;
  }

  async listCopies(materialId, client = pool) {
    const res = await client.query(`SELECT * FROM material_copies WHERE material_id = $1 ORDER BY created_at DESC NULLS LAST, copy_id DESC`, [materialId]);
    return res.rows;
  }

  async removeCopy(copyId, client = pool) {
    const res = await client.query(`DELETE FROM material_copies WHERE copy_id = $1`, [copyId]);
    return res.rowCount > 0;
  }

  async borrowItem({ member_id, copy_id, issued_by, policy_id = null, due_date = null, remarks = null }, client = pool) {
    const copy = await this.getCopyById(copy_id, client);
    if (!copy) throw new Error('Copy not found');
    if (!copy.is_circulation_allowed) throw new Error('Copy is not allowed for circulation');
    if (copy.status !== 'available') throw new Error('Copy is not available for borrowing');
    const loanRes = await client.query(`
      INSERT INTO loans (member_id, copy_id, issued_by, policy_id, loan_date, due_date, renewal_count, status, remarks)
      VALUES ($1,$2,$3,$4,NOW(),COALESCE($5, NOW() + INTERVAL '14 days'),0,'active',$6)
      RETURNING *
    `, [member_id, copy_id, issued_by || null, policy_id, due_date, remarks]);
    await client.query(`UPDATE material_copies SET status = 'borrowed' WHERE copy_id = $1`, [copy_id]);
    return loanRes.rows[0];
  }

  async returnItem({ loan_id, returned_to = null, remarks = null }, client = pool) {
    const loanRes = await client.query(`SELECT * FROM loans WHERE loan_id = $1 LIMIT 1`, [loan_id]);
    const loan = loanRes.rows[0];
    if (!loan) throw new Error('Loan not found');
    if (loan.return_date) throw new Error('Loan already returned');
    const updatedLoanRes = await client.query(`
      UPDATE loans
      SET return_date = NOW(), returned_to = $1, status = 'returned', remarks = COALESCE($2, remarks)
      WHERE loan_id = $3
      RETURNING *
    `, [returned_to, remarks, loan_id]);
    await client.query(`UPDATE material_copies SET status = 'available' WHERE copy_id = $1`, [loan.copy_id]);
    return updatedLoanRes.rows[0];
  }

  async renewLoan({ loan_id, due_date = null, remarks = null }, client = pool) {
    const loanRes = await client.query(`SELECT * FROM loans WHERE loan_id = $1 LIMIT 1`, [loan_id]);
    const loan = loanRes.rows[0];
    if (!loan) throw new Error('Loan not found');
    if (loan.return_date) throw new Error('Returned loans cannot be renewed');
    const renewalRes = await client.query(`
      UPDATE loans
      SET renewal_count = COALESCE(renewal_count, 0) + 1,
          due_date = COALESCE($1, due_date + INTERVAL '7 days'),
          remarks = COALESCE($2, remarks)
      WHERE loan_id = $3
      RETURNING *
    `, [due_date, remarks, loan_id]);
    await client.query(`
      INSERT INTO loan_renewals (loan_id, renewed_at, old_due_date, new_due_date, renewed_by, note)
      VALUES ($1, NOW(), $2, $3, $4, $5)
    `, [loan_id, loan.due_date, renewalRes.rows[0].due_date, null, remarks]);
    return renewalRes.rows[0];
  }

  async placeHold({ member_id, material_id, copy_id = null, expiry_at = null }, client = pool) {
    const queueRes = await client.query(`SELECT COALESCE(MAX(queue_position), 0)::int + 1 AS next_position FROM hold_requests WHERE material_id = $1 AND status IN ('active','ready','pending')`, [material_id]);
    const queue_position = queueRes.rows[0]?.next_position || 1;
    const res = await client.query(`
      INSERT INTO hold_requests (member_id, material_id, copy_id, queue_position, status, requested_at, expiry_at)
      VALUES ($1,$2,$3,$4,'active',NOW(),$5)
      RETURNING *
    `, [member_id, material_id, copy_id, queue_position, expiry_at]);
    return res.rows[0];
  }

  async cancelHold({ hold_id, cancelled_reason = null }, client = pool) {
    const res = await client.query(`
      UPDATE hold_requests
      SET status = 'cancelled', cancelled_at = NOW(), cancelled_reason = $1
      WHERE hold_id = $2
      RETURNING *
    `, [cancelled_reason, hold_id]);
    return res.rows[0] || null;
  }

  async createFine({ member_id, loan_id = null, copy_id = null, reason, amount, assessed_by = null, due_date = null, note = null }, client = pool) {
    const res = await client.query(`
      INSERT INTO fines (member_id, loan_id, copy_id, reason, amount, paid_amount, waived_amount, status, assessed_by, due_date, note)
      VALUES ($1,$2,$3,$4,$5,0,0,'pending',$6,$7,$8)
      RETURNING *
    `, [member_id, loan_id, copy_id, reason, amount, assessed_by, due_date, note]);
    return res.rows[0];
  }

  async markMissing({ copy_id, reported_by = null, note = null }, client = pool) {
    await client.query(`UPDATE material_copies SET status = 'missing', condition_note = COALESCE($1, condition_note) WHERE copy_id = $2`, [note, copy_id]);
    const res = await client.query(`
      INSERT INTO lost_item_reports (copy_id, reported_by, description, reported_at)
      VALUES ($1,$2,$3,NOW()) RETURNING *
    `, [copy_id, reported_by, note || 'Marked as missing']);
    return res.rows[0];
  }

  async markDamaged({ copy_id, loan_id = null, reported_by = null, severity = 'minor', description = null, estimated_cost = null }, client = pool) {
    await client.query(`UPDATE material_copies SET status = 'damaged', condition_note = COALESCE($1, condition_note) WHERE copy_id = $2`, [description, copy_id]);
    const res = await client.query(`
      INSERT INTO damage_reports (copy_id, loan_id, reported_by, severity, description, estimated_cost, resolved)
      VALUES ($1,$2,$3,$4,$5,$6,false)
      RETURNING *
    `, [copy_id, loan_id, reported_by, severity, description, estimated_cost]);
    return res.rows[0];
  }

  async inventoryAudit({ branch_id = null, location_id = null, audit_name, started_by = null, note = null }, client = pool) {
    const res = await client.query(`
      INSERT INTO inventory_audits (branch_id, location_id, audit_name, status, started_by, start_date, note)
      VALUES ($1,$2,$3,'in_progress',$4,NOW(),$5)
      RETURNING *
    `, [branch_id, location_id, audit_name, started_by, note]);
    return res.rows[0];
  }

  async receiveAcquisition({ purchase_order_id, received_by = null, note = null }, client = pool) {
    const poRes = await client.query(`SELECT * FROM purchase_orders WHERE purchase_order_id = $1 LIMIT 1`, [purchase_order_id]);
    const po = poRes.rows[0];
    if (!po) throw new Error('Purchase order not found');
    const receiptRes = await client.query(`
      INSERT INTO acquisition_receipts (purchase_order_id, received_by, receipt_date, note)
      VALUES ($1,$2,NOW(),$3)
      RETURNING *
    `, [purchase_order_id, received_by, note]);
    await client.query(`UPDATE purchase_orders SET status = 'received' WHERE purchase_order_id = $1`, [purchase_order_id]);
    return receiptRes.rows[0];
  }

  async usageReport({ date_from = null, date_to = null } = {}, client = pool) {
    const values = [];
    const filters = [];
    if (date_from) { values.push(date_from); filters.push(`l.loan_date >= $${values.length}`); }
    if (date_to) { values.push(date_to); filters.push(`l.loan_date <= $${values.length}`); }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await client.query(`
      SELECT COUNT(*)::int AS total_loans,
             COUNT(CASE WHEN l.return_date IS NULL THEN 1 END)::int AS active_loans,
             COUNT(CASE WHEN l.return_date IS NOT NULL THEN 1 END)::int AS returned_loans,
             COUNT(DISTINCT l.member_id)::int AS unique_members
      FROM loans l
      ${where}
    `, values);
    return res.rows[0];
  }

  async inventoryReport(client = pool) {
    const res = await client.query(`
      SELECT
        COUNT(*)::int AS total_copies,
        COUNT(CASE WHEN status = 'available' THEN 1 END)::int AS available_copies,
        COUNT(CASE WHEN status IN ('borrowed','checked_out','on_loan','loaned') THEN 1 END)::int AS borrowed_copies,
        COUNT(CASE WHEN status = 'missing' THEN 1 END)::int AS missing_copies,
        COUNT(CASE WHEN status = 'damaged' THEN 1 END)::int AS damaged_copies
      FROM material_copies
    `);
    return res.rows[0];
  }
}

export default new PhysicalLibraryModel();
