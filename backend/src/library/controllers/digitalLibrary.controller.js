import digitalLibraryService from '../services/digitalLibrary.service.js';
import { ok, fail } from '../utils/responseFormatter.js';

class DigitalLibraryController {
  async index(req, res) {
    try { const result = await digitalLibraryService.list(req.query || {}); return ok(res, result.rows, 'Digital materials fetched successfully', 200, result.meta); }
    catch (error) { return fail(res, error.message || 'Failed to fetch digital materials', 500); }
  }
  async show(req, res) {
    try { const row = await digitalLibraryService.getById(req.params.id); if (!row) return fail(res, 'Digital material not found', 404); return ok(res, row, 'Digital material fetched successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to fetch digital material', 500); }
  }
  async store(req, res) {
    try { const row = await digitalLibraryService.create({ ...req.body, created_by: req.user?.uuid || req.body?.created_by || null, updated_by: req.user?.uuid || req.body?.updated_by || null }); return ok(res, row, 'Digital material created successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to create digital material', 500); }
  }
  async update(req, res) {
    try { const row = await digitalLibraryService.update(req.params.id, { ...req.body, updated_by: req.user?.uuid || req.body?.updated_by || null }); if (!row) return fail(res, 'Digital material not found', 404); return ok(res, row, 'Digital material updated successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to update digital material', 500); }
  }
  async destroy(req, res) {
    try { const deleted = await digitalLibraryService.delete(req.params.id); if (!deleted) return fail(res, 'Digital material not found', 404); return ok(res, null, 'Digital material deleted successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to delete digital material', 500); }
  }
  async submitForApproval(req, res) {
    try { const row = await digitalLibraryService.submitForApproval({ ...req.body, submitted_by: req.user?.uuid || req.body?.submitted_by || null }); return ok(res, row, 'Digital content submitted for approval', 201); }
    catch (error) { return fail(res, error.message || 'Failed to submit digital content', 500); }
  }
  async approveResource(req, res) {
    try { const row = await digitalLibraryService.approveResource({ submission_id: req.params.submissionId, note: req.body?.note || null }); if (!row) return fail(res, 'Submission not found', 404); return ok(res, row, 'Digital content approved successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to approve digital content', 500); }
  }
  async rejectResource(req, res) {
    try { const row = await digitalLibraryService.rejectResource({ submission_id: req.params.submissionId, note: req.body?.note || null }); if (!row) return fail(res, 'Submission not found', 404); return ok(res, row, 'Digital content rejected successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to reject digital content', 500); }
  }
  async publishResource(req, res) {
    try { const row = await digitalLibraryService.publishResource({ submission_id: req.params.submissionId, note: req.body?.note || null }); if (!row) return fail(res, 'Submission not found', 404); return ok(res, row, 'Digital content published successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to publish digital content', 500); }
  }
  async unpublishResource(req, res) {
    try { const row = await digitalLibraryService.unpublishResource({ submission_id: req.params.submissionId, note: req.body?.note || null }); if (!row) return fail(res, 'Submission not found', 404); return ok(res, row, 'Digital content unpublished successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to unpublish digital content', 500); }
  }
  async assignAccessRights(req, res) {
    try { const row = await digitalLibraryService.assignAccessRights({ material_id: req.params.id, ...req.body, updated_by: req.user?.uuid || req.body?.updated_by || null }); if (!row) return fail(res, 'Digital resource not found', 404); return ok(res, row, 'Access rights updated successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to update access rights', 500); }
  }
  async updateLicense(req, res) {
    try { const row = await digitalLibraryService.updateLicense({ material_id: req.params.id, ...req.body, updated_by: req.user?.uuid || req.body?.updated_by || null }); if (!row) return fail(res, 'Digital resource not found', 404); return ok(res, row, 'License settings updated successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to update license settings', 500); }
  }
  async trackUsage(req, res) {
    try { const row = await digitalLibraryService.trackUsage({ material_id: req.params.id, ...req.body, user_id: req.user?.uuid || req.body?.user_id || null, ip_address: req.ip, user_agent: req.headers['user-agent'] || null }); return ok(res, row, 'Digital usage tracked successfully', 201); }
    catch (error) { return fail(res, error.message || 'Failed to track digital usage', 500); }
  }
  async usageReport(req, res) {
    try { const row = await digitalLibraryService.usageReport({ ...req.query, material_id: req.params.id || req.query.material_id || null }); return ok(res, row, 'Digital usage report fetched successfully'); }
    catch (error) { return fail(res, error.message || 'Failed to fetch digital usage report', 500); }
  }
}

export default new DigitalLibraryController();
