import portalLibraryService from '../services/portalLibrary.service.js';
import { ok, fail } from '../utils/responseFormatter.js';

export async function listResource(req, res) {
  try {
    const result = await portalLibraryService.listResource(req.params.resource, req.query || {});
    return ok(res, result.rows, `${req.params.resource} fetched successfully`, 200, result.meta);
  } catch (error) {
    return fail(res, error.message || 'Failed to fetch resource', 500);
  }
}

export async function getResource(req, res) {
  try {
    const row = await portalLibraryService.getResource(req.params.resource, req.params.id);
    if (!row) return fail(res, 'Record not found', 404);
    return ok(res, row, 'Record fetched successfully');
  } catch (error) {
    return fail(res, error.message || 'Failed to fetch resource', 500);
  }
}

export async function createResource(req, res) {
  try {
    const row = await portalLibraryService.createResource(req.params.resource, req.body || {});
    return ok(res, row, 'Record created successfully', 201);
  } catch (error) {
    return fail(res, error.message || 'Failed to create resource', 500);
  }
}

export async function updateResource(req, res) {
  try {
    const row = await portalLibraryService.updateResource(req.params.resource, req.params.id, req.body || {});
    if (!row) return fail(res, 'Record not found', 404);
    return ok(res, row, 'Record updated successfully');
  } catch (error) {
    return fail(res, error.message || 'Failed to update resource', 500);
  }
}

export async function removeResource(req, res) {
  try {
    const deleted = await portalLibraryService.removeResource(req.params.resource, req.params.id);
    if (!deleted) return fail(res, 'Record not found', 404);
    return ok(res, null, 'Record deleted successfully');
  } catch (error) {
    return fail(res, error.message || 'Failed to delete resource', 500);
  }
}

export async function adminDashboard(req, res) {
  try { return ok(res, await portalLibraryService.getAdminDashboard(), 'Library admin dashboard fetched successfully'); }
  catch (error) { return fail(res, error.message || 'Failed to fetch dashboard', 500); }
}

export async function librarianSummary(req, res) {
  try { return ok(res, await portalLibraryService.getLibrarianSummary(), 'Library circulation summary fetched successfully'); }
  catch (error) { return fail(res, error.message || 'Failed to fetch summary', 500); }
}

export async function memberOverview(req, res) {
  try { return ok(res, await portalLibraryService.getMemberOverview(req.user?.uuid || req.query.user_id || null), 'Member overview fetched successfully'); }
  catch (error) { return fail(res, error.message || 'Failed to fetch member overview', 500); }
}

export async function overdueLoans(req, res) {
  try { return ok(res, await portalLibraryService.getOverdueLoans(), 'Overdue loans fetched successfully'); }
  catch (error) { return fail(res, error.message || 'Failed to fetch overdue loans', 500); }
}

export async function fulfillHold(req, res) {
  try {
    const row = await portalLibraryService.fulfillHold(req.params.holdId, req.body || {});
    if (!row) return fail(res, 'Hold not found', 404);
    return ok(res, row, 'Hold fulfilled successfully');
  } catch (error) { return fail(res, error.message || 'Failed to fulfill hold', 500); }
}

export async function payFine(req, res) {
  try {
    const row = await portalLibraryService.payFine(req.params.fineId, req.body || {});
    if (!row) return fail(res, 'Fine not found', 404);
    return ok(res, row, 'Fine payment recorded successfully');
  } catch (error) { return fail(res, error.message || 'Failed to pay fine', 500); }
}
