import physicalLibraryService from '../services/physicalLibrary.service.js';
import { ok, fail } from '../utils/responseFormatter.js';

class PhysicalLibraryController {
  async index(req, res) {
    try { const result = await physicalLibraryService.list(req.query || {}); return ok(res, result.rows, 'Physical materials fetched successfully', 200, result.meta); }
    catch (error) { return fail(res, error.message || 'Failed to fetch physical materials', 500); }
  }

  async show(req, res) {
    try { const row = await physicalLibraryService.getById(req.params.id); if (!row) return fail(res, 'Physical material not found', 404); return ok(res, row, 'Physical material fetched successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to fetch physical material', 500); }
  }

  async store(req, res) {
    try {
      const row = await physicalLibraryService.create({ ...req.body, created_by: req.user?.uuid || req.body?.created_by || null, updated_by: req.user?.uuid || req.body?.updated_by || null });
      return ok(res, row, 'Physical material created successfully', 201);
    } catch (error) { return fail(res, error.message || 'Failed to create physical material', 500); }
  }

  async update(req, res) {
    try {
      const row = await physicalLibraryService.update(req.params.id, { ...req.body, updated_by: req.user?.uuid || req.body?.updated_by || null });
      if (!row) return fail(res, 'Physical material not found', 404);
      return ok(res, row, 'Physical material updated successfully');
    } catch (error) { return fail(res, error.message || 'Failed to update physical material', 500); }
  }

  async destroy(req, res) {
    try { const deleted = await physicalLibraryService.delete(req.params.id); if (!deleted) return fail(res, 'Physical material not found', 404); return ok(res, null, 'Physical material deleted successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to delete physical material', 500); }
  }

  async addCopy(req, res) {
    try { const row = await physicalLibraryService.addCopy(req.params.id, req.body); return ok(res, row, 'Copy added successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to add copy', 500); }
  }
  async listCopies(req, res) {
    try { const rows = await physicalLibraryService.listCopies(req.params.id); return ok(res, rows, 'Copies fetched successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to fetch copies', 500); }
  }
  async updateCopy(req, res) {
    try { const row = await physicalLibraryService.updateCopy(req.params.copyId, req.body); if (!row) return fail(res, 'Copy not found', 404); return ok(res, row, 'Copy updated successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to update copy', 500); }
  }
  async removeCopy(req, res) {
    try { const deleted = await physicalLibraryService.removeCopy(req.params.copyId); if (!deleted) return fail(res, 'Copy not found', 404); return ok(res, null, 'Copy removed successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to remove copy', 500); }
  }
  async borrowItem(req, res) {
    try { const row = await physicalLibraryService.borrowItem({ ...req.body, issued_by: req.user?.uuid || req.body?.issued_by || null }); return ok(res, row, 'Item borrowed successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to borrow item', 500); }
  }
  async returnItem(req, res) {
    try { const row = await physicalLibraryService.returnItem({ ...req.body, returned_to: req.user?.uuid || req.body?.returned_to || null }); return ok(res, row, 'Item returned successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to return item', 500); }
  }
  async renewLoan(req, res) {
    try { const row = await physicalLibraryService.renewLoan(req.body); return ok(res, row, 'Loan renewed successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to renew loan', 500); }
  }
  async placeHold(req, res) {
    try { const row = await physicalLibraryService.placeHold(req.body); return ok(res, row, 'Hold placed successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to place hold', 500); }
  }
  async cancelHold(req, res) {
    try { const row = await physicalLibraryService.cancelHold({ hold_id: req.params.holdId, cancelled_reason: req.body?.cancelled_reason || null }); if (!row) return fail(res, 'Hold not found', 404); return ok(res, row, 'Hold cancelled successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to cancel hold', 500); }
  }
  async createFine(req, res) {
    try { const row = await physicalLibraryService.createFine({ ...req.body, assessed_by: req.user?.uuid || req.body?.assessed_by || null }); return ok(res, row, 'Fine created successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to create fine', 500); }
  }
  async markMissing(req, res) {
    try { const row = await physicalLibraryService.markMissing({ copy_id: req.params.copyId, reported_by: req.user?.uuid || req.body?.reported_by || null, note: req.body?.note || null }); return ok(res, row, 'Copy marked as missing'); }
    catch (error) { return fail(res, error.message || 'Failed to mark copy as missing', 500); }
  }
  async markDamaged(req, res) {
    try { const row = await physicalLibraryService.markDamaged({ copy_id: req.params.copyId, loan_id: req.body?.loan_id || null, reported_by: req.user?.uuid || req.body?.reported_by || null, severity: req.body?.severity || 'minor', description: req.body?.description || null, estimated_cost: req.body?.estimated_cost || null }); return ok(res, row, 'Copy marked as damaged'); }
    catch (error) { return fail(res, error.message || 'Failed to mark copy as damaged', 500); }
  }
  async inventoryAudit(req, res) {
    try { const row = await physicalLibraryService.inventoryAudit({ ...req.body, started_by: req.user?.uuid || req.body?.started_by || null }); return ok(res, row, 'Inventory audit started successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to start inventory audit', 500); }
  }
  async receiveAcquisition(req, res) {
    try { const row = await physicalLibraryService.receiveAcquisition({ ...req.body, received_by: req.user?.uuid || req.body?.received_by || null }); return ok(res, row, 'Acquisition received successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to receive acquisition', 500); }
  }
  async usageReport(req, res) {
    try { const row = await physicalLibraryService.usageReport(req.query || {}); return ok(res, row, 'Physical usage report fetched successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to fetch physical usage report', 500); }
  }
  async inventoryReport(req, res) {
    try { const row = await physicalLibraryService.inventoryReport(); return ok(res, row, 'Inventory report fetched successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to fetch inventory report', 500); }
  }
}

export default new PhysicalLibraryController();
