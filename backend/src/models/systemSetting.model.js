import pool from '../config/db.js';

const DEFAULTS = [
  { setting_key: 'loan_period_days', setting_value: 14, value_type: 'number', category: 'circulation', description: 'Default loan period in days' },
  { setting_key: 'max_books_per_member', setting_value: 5, value_type: 'number', category: 'circulation', description: 'Maximum active loans per member' },
  { setting_key: 'max_renewals', setting_value: 2, value_type: 'number', category: 'circulation', description: 'Maximum renewals allowed per loan' },
  { setting_key: 'fine_per_day', setting_value: 2, value_type: 'number', category: 'circulation', description: 'Default overdue fine per day' },
  { setting_key: 'hold_pickup_days', setting_value: 3, value_type: 'number', category: 'circulation', description: 'Days a fulfilled hold is kept for pickup' },
  { setting_key: 'allow_guest_opac', setting_value: true, value_type: 'boolean', category: 'access', description: 'Allow guest access to catalog search' },
  { setting_key: 'allow_digital_downloads', setting_value: true, value_type: 'boolean', category: 'digital', description: 'Allow member download of digital resources' },
  { setting_key: 'approval_required_for_digital_uploads', setting_value: true, value_type: 'boolean', category: 'digital', description: 'Require approval before publishing digital submissions' },
  { setting_key: 'default_branch_code', setting_value: '', value_type: 'string', category: 'general', description: 'Default branch code for new library records' },
  { setting_key: 'security_alert_delete_threshold', setting_value: 5, value_type: 'number', category: 'security', description: 'Number of delete actions in 24h before a warning alert is raised' },
];

const normalizeValue = (value, valueType) => {
  if (valueType === 'number') return Number(value || 0);
  if (valueType === 'boolean') return value === true || value === 'true' || value === '1' || value === 1;
  if (valueType === 'json') return typeof value === 'string' ? JSON.parse(value) : value;
  return value ?? '';
};

export const SystemSetting = {
  async ensureTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(120) UNIQUE NOT NULL,
        setting_value JSONB NOT NULL,
        value_type VARCHAR(20) NOT NULL DEFAULT 'string',
        category VARCHAR(80) NOT NULL DEFAULT 'general',
        description TEXT,
        updated_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  },

  async seedDefaults(userId = null) {
    await this.ensureTable();
    for (const item of DEFAULTS) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, value_type, category, description, updated_by)
         VALUES ($1, $2::jsonb, $3, $4, $5, $6)
         ON CONFLICT (setting_key) DO NOTHING`,
        [
          item.setting_key,
          JSON.stringify(item.setting_value),
          item.value_type,
          item.category,
          item.description,
          userId,
        ]
      );
    }
  },

  async getAll() {
    await this.seedDefaults();
    const { rows } = await pool.query(`
      SELECT setting_id, setting_key, setting_value, value_type, category, description, updated_by, created_at, updated_at
      FROM system_settings
      ORDER BY category, setting_key
    `);
    return rows.map((row) => ({
      ...row,
      parsed_value: normalizeValue(row.setting_value, row.value_type),
    }));
  },

  async getGrouped() {
    const rows = await this.getAll();
    return rows.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    }, {});
  },

  async upsertMany(items = [], userId = null) {
    await this.ensureTable();
    const updated = [];
    for (const item of items) {
      const valueType = item.value_type || (typeof item.setting_value === 'boolean' ? 'boolean' : typeof item.setting_value === 'number' ? 'number' : 'string');
      const { rows } = await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, value_type, category, description, updated_by, updated_at)
         VALUES ($1, $2::jsonb, $3, $4, $5, $6, NOW())
         ON CONFLICT (setting_key) DO UPDATE SET
           setting_value = EXCLUDED.setting_value,
           value_type = EXCLUDED.value_type,
           category = EXCLUDED.category,
           description = COALESCE(EXCLUDED.description, system_settings.description),
           updated_by = EXCLUDED.updated_by,
           updated_at = NOW()
         RETURNING *`,
        [
          item.setting_key,
          JSON.stringify(item.setting_value),
          valueType,
          item.category || 'general',
          item.description || null,
          userId,
        ]
      );
      updated.push({ ...rows[0], parsed_value: normalizeValue(rows[0].setting_value, rows[0].value_type) });
    }
    return updated;
  },
};
