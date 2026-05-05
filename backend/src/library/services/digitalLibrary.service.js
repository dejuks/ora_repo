import pool from '../../config/db.js';
import digitalLibraryModel from '../models/digitalLibrary.model.js';

class DigitalLibraryService {
  async list(query) { return digitalLibraryModel.listResources(query); }
  async getById(id) { return digitalLibraryModel.getResourceById(id); }

  async create(payload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const material = await digitalLibraryModel.createMaterial(payload, client);
      const resource = await digitalLibraryModel.upsertResource(material.material_id, payload, client);
      const files = [];
      if (Array.isArray(payload.files)) {
        for (const file of payload.files) files.push(await digitalLibraryModel.addFile(resource.digital_resource_id, file, client));
      }
      if (payload.create_submission) {
        await digitalLibraryModel.createSubmission({ ...payload, status: 'submitted' }, client);
      }
      await client.query('COMMIT');
      return { ...material, digital_resource: resource, files };
    } catch (error) {
      await client.query('ROLLBACK'); throw error;
    } finally { client.release(); }
  }

  async update(id, payload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await digitalLibraryModel.updateMaterial(id, payload, client);
      if (!updated) { await client.query('ROLLBACK'); return null; }
      const resource = await digitalLibraryModel.upsertResource(id, payload, client);
      if (Array.isArray(payload.new_files)) {
        for (const file of payload.new_files) await digitalLibraryModel.addFile(resource.digital_resource_id, file, client);
      }
      await client.query('COMMIT');
      return digitalLibraryModel.getResourceById(id, client);
    } catch (error) {
      await client.query('ROLLBACK'); throw error;
    } finally { client.release(); }
  }

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ok = await digitalLibraryModel.deleteMaterialAndDependencies(id, client);
      await client.query('COMMIT');
      return ok;
    } catch (error) {
      await client.query('ROLLBACK'); throw error;
    } finally { client.release(); }
  }

  async submitForApproval(payload) { return digitalLibraryModel.createSubmission({ ...payload, status: 'submitted' }); }
  async approveResource(payload) { return digitalLibraryModel.updateSubmissionStatus({ ...payload, status: 'approved', reviewed_at: new Date(), approved_at: new Date() }); }
  async rejectResource(payload) { return digitalLibraryModel.updateSubmissionStatus({ ...payload, status: 'rejected', reviewed_at: new Date() }); }
  async publishResource(payload) { return digitalLibraryModel.updateSubmissionStatus({ ...payload, status: 'published', published_at: new Date(), approved_at: payload.approved_at || new Date() }); }
  async unpublishResource(payload) { return digitalLibraryModel.updateSubmissionStatus({ ...payload, status: 'unpublished' }); }
  async assignAccessRights(payload) { return digitalLibraryModel.assignAccessRights(payload); }
  async updateLicense(payload) { return digitalLibraryModel.updateLicense(payload); }
  async trackUsage(payload) { return digitalLibraryModel.trackUsage(payload); }
  async usageReport(query) { return digitalLibraryModel.usageReport(query); }
}

export default new DigitalLibraryService();
