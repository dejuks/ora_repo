import { SystemSetting } from '../models/systemSetting.model.js';
import { writeLibraryAuditLog } from '../library/utils/audit.js';

export const getSystemSettings = async (req, res) => {
  try {
    const grouped = await SystemSetting.getGrouped();
    const list = await SystemSetting.getAll();
    res.json({ success: true, data: list, grouped });
  } catch (error) {
    console.error('getSystemSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system settings', error: error.message });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.settings) ? req.body.settings : [];
    if (!items.length) {
      return res.status(400).json({ success: false, message: 'settings array is required' });
    }

    const updated = await SystemSetting.upsertMany(items, req.user?.uuid || null);
    await writeLibraryAuditLog({
      actorUserId: req.user?.uuid || null,
      action: 'system_settings.updated',
      entityType: 'system_settings',
      entityId: null,
      oldValues: null,
      newValues: updated.map((row) => ({ key: row.setting_key, value: row.parsed_value })),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, message: 'System settings updated successfully', data: updated });
  } catch (error) {
    console.error('updateSystemSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update system settings', error: error.message });
  }
};
