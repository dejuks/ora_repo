import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { getSystemSettings, updateSystemSettings } from '../../../api/admin.api';

export default function LibrarySystemSettingsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSystemSettings();
      const data = res.data?.data || [];
      setRows(data.map((row) => ({ ...row, value: row.parsed_value })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => rows.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = [];
    acc[row.category].push(row);
    return acc;
  }, {}), [rows]);

  const updateValue = (key, value) => {
    setRows((prev) => prev.map((row) => row.setting_key === key ? { ...row, value } : row));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = rows.map((row) => ({
        setting_key: row.setting_key,
        setting_value: row.value_type === 'number' ? Number(row.value || 0) : row.value_type === 'boolean' ? Boolean(row.value) : row.value,
        value_type: row.value_type,
        category: row.category,
        description: row.description,
      }));
      await updateSystemSettings(payload);
      setNotice('System settings updated successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h1>System Settings</h1>
            <p className="text-muted mb-0">Configure circulation, digital access, guest search, and operational thresholds.</p>
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving || loading}>{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {notice ? <div className="alert alert-success">{notice}</div> : null}
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="card"><div className="card-body">Loading...</div></div> : null}
          {!loading && Object.entries(grouped).map(([category, settings]) => (
            <div className="card" key={category}>
              <div className="card-header"><h3 className="card-title text-capitalize">{category.replace(/_/g, ' ')} settings</h3></div>
              <div className="card-body table-responsive p-0">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Key</th>
                      <th style={{ width: '35%' }}>Value</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((row) => (
                      <tr key={row.setting_key}>
                        <td><strong>{row.setting_key}</strong></td>
                        <td>
                          {row.value_type === 'boolean' ? (
                            <select className="form-control" value={String(Boolean(row.value))} onChange={(e) => updateValue(row.setting_key, e.target.value === 'true')}>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input className="form-control" type={row.value_type === 'number' ? 'number' : 'text'} value={row.value ?? ''} onChange={(e) => updateValue(row.setting_key, e.target.value)} />
                          )}
                        </td>
                        <td>{row.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
