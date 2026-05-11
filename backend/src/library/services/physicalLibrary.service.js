import pool from '../../config/db.js';
import physicalLibraryModel from '../models/physicalLibrary.model.js';

class PhysicalLibraryService {
  async list(query) { return physicalLibraryModel.listMaterials(query); }
  async getById(id) { return physicalLibraryModel.getMaterialById(id); }

  async create(payload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const material = await physicalLibraryModel.createMaterial(payload, client);
      const copies = [];
      if (Array.isArray(payload.copies)) {
        for (const copy of payload.copies) copies.push(await physicalLibraryModel.addCopy(material.material_id, copy, client));
      }
      await client.query('COMMIT');
      return { ...material, copies };
    } catch (error) {
      await client.query('ROLLBACK'); throw error;
    } finally { client.release(); }
  }

  async update(id, payload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await physicalLibraryModel.updateMaterial(id, payload, client);
      if (!updated) { await client.query('ROLLBACK'); return null; }
      if (Array.isArray(payload.new_copies)) {
        for (const copy of payload.new_copies) await physicalLibraryModel.addCopy(id, copy, client);
      }
      await client.query('COMMIT');
      return physicalLibraryModel.getMaterialById(id, client);
    } catch (error) {
      await client.query('ROLLBACK'); throw error;
    } finally { client.release(); }
  }

  async delete(id) { return physicalLibraryModel.delete(id); }
  async addCopy(materialId, payload) { return physicalLibraryModel.addCopy(materialId, payload); }
  async updateCopy(copyId, payload) { return physicalLibraryModel.updateCopy(copyId, payload); }
  async listCopies(materialId) { return physicalLibraryModel.listCopies(materialId); }
  async removeCopy(copyId) { return physicalLibraryModel.removeCopy(copyId); }
  async borrowItem(payload) { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await physicalLibraryModel.borrowItem(payload, c); await c.query('COMMIT'); return r; } catch(e){ await c.query('ROLLBACK'); throw e; } finally { c.release(); } }
  async returnItem(payload) { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await physicalLibraryModel.returnItem(payload, c); await c.query('COMMIT'); return r; } catch(e){ await c.query('ROLLBACK'); throw e; } finally { c.release(); } }
  async renewLoan(payload) { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await physicalLibraryModel.renewLoan(payload, c); await c.query('COMMIT'); return r; } catch(e){ await c.query('ROLLBACK'); throw e; } finally { c.release(); } }
  async placeHold(payload) { return physicalLibraryModel.placeHold(payload); }
  async cancelHold(payload) { return physicalLibraryModel.cancelHold(payload); }
  async createFine(payload) { return physicalLibraryModel.createFine(payload); }
  async markMissing(payload) { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await physicalLibraryModel.markMissing(payload, c); await c.query('COMMIT'); return r; } catch(e){ await c.query('ROLLBACK'); throw e; } finally { c.release(); } }
  async markDamaged(payload) { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await physicalLibraryModel.markDamaged(payload, c); await c.query('COMMIT'); return r; } catch(e){ await c.query('ROLLBACK'); throw e; } finally { c.release(); } }
  async inventoryAudit(payload) { return physicalLibraryModel.inventoryAudit(payload); }
  async receiveAcquisition(payload) { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await physicalLibraryModel.receiveAcquisition(payload, c); await c.query('COMMIT'); return r; } catch(e){ await c.query('ROLLBACK'); throw e; } finally { c.release(); } }
  async usageReport(query) { return physicalLibraryModel.usageReport(query); }
  async inventoryReport() { return physicalLibraryModel.inventoryReport(); }
}

export default new PhysicalLibraryService();
