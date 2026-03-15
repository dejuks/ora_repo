import { getLibraryAuditOverview, getSecurityAlerts } from '../services/adminAudit.service.js';

export const listAuditLogs = async (req, res) => {
  try {
    const rows = await getLibraryAuditOverview(req.query || {});
    res.json({ success: true, rows, meta: { total: rows.length } });
  } catch (error) {
    console.error('listAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
  }
};

export const securityAlerts = async (_req, res) => {
  try {
    const data = await getSecurityAlerts();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('securityAlerts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch security alerts', error: error.message });
  }
};
