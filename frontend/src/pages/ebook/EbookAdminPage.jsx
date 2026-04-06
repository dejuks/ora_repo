import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "./mock/ebookMockApi.js";

const defaultRules = {
  auto_assign_editor_on_submit: false,
  require_finance_clearance_before_production: true,
  allow_publish_only_after_proof_approval: true,
  auto_release_embargo_daily: true,
  notify_roles_on_clearance: ["EBOOK_EDITOR", "EBOOK_DIGITAL_CONTENT_MANAGER"],
  default_access_level: "open_access",
  retention_note: "Keep production and publication files under managed storage.",
};

export default function EbookAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [health, setHealth] = useState(null);
  const [storage, setStorage] = useState(null);
  const [audit, setAudit] = useState({ rows: [], summary: {} });
  const [rules, setRules] = useState(defaultRules);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [healthRes, storageRes, auditRes] = await Promise.all([
        ebookApi.getAdminHealth(),
        ebookApi.getAdminStorage(),
        ebookApi.getAdminAuditLogs({ limit: 50 }),
      ]);
      setHealth(healthRes);
      setStorage(storageRes);
      setAudit(auditRes || { rows: [], summary: {} });
      if (healthRes?.workflow_rules) {
        setRules({ ...defaultRules, ...healthRes.workflow_rules });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load ebook administration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveRules = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await ebookApi.saveWorkflowRules({
        ...rules,
        notify_roles_on_clearance: String(rules.notify_roles_on_clearance || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setNotice("Workflow rules saved.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save workflow rules.");
    } finally {
      setSaving(false);
    }
  };

  const reindex = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await ebookApi.reindexAdmin();
      setNotice(`Logical reindex completed. Indexed ${result?.submissions_indexed || 0} submissions and ${result?.public_publications_indexed || 0} public publications.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to run reindex.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">Ebook System Administration</h1>
            <p className="text-muted mb-0">Manage workflow rules, inspect audit activity, monitor storage usage, and verify module health.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary mr-2" onClick={load} disabled={loading || saving}>Refresh</button>
            <Link className="btn btn-outline-primary" to="/ebook/dashboard">Dashboard</Link>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="row mb-4">
        <div className="col-md-3"><div className="small-box bg-success"><div className="inner"><h3>{health?.status === "ok" ? "OK" : "—"}</h3><p>System health</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-info"><div className="inner"><h3>{storage?.database?.total_submission_files || 0}</h3><p>Tracked files</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-warning"><div className="inner"><h3>{health?.queues?.editorial_queue || 0}</h3><p>Editorial queue</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-primary"><div className="inner"><h3>{health?.queues?.published_total || 0}</h3><p>Published ebooks</p></div></div></div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card card-outline card-primary mb-3">
            <div className="card-header"><h3 className="card-title mb-0">Workflow automation rules</h3></div>
            <div className="card-body">
              <div className="form-group form-check">
                <input className="form-check-input" type="checkbox" id="autoAssign" checked={!!rules.auto_assign_editor_on_submit} onChange={(e) => setRules({ ...rules, auto_assign_editor_on_submit: e.target.checked })} />
                <label className="form-check-label" htmlFor="autoAssign">Auto assign editor on submission</label>
              </div>
              <div className="form-group form-check">
                <input className="form-check-input" type="checkbox" id="financeFirst" checked={!!rules.require_finance_clearance_before_production} onChange={(e) => setRules({ ...rules, require_finance_clearance_before_production: e.target.checked })} />
                <label className="form-check-label" htmlFor="financeFirst">Require finance clearance before production</label>
              </div>
              <div className="form-group form-check">
                <input className="form-check-input" type="checkbox" id="proofFirst" checked={!!rules.allow_publish_only_after_proof_approval} onChange={(e) => setRules({ ...rules, allow_publish_only_after_proof_approval: e.target.checked })} />
                <label className="form-check-label" htmlFor="proofFirst">Require proof approval before publication</label>
              </div>
              <div className="form-group form-check">
                <input className="form-check-input" type="checkbox" id="embargoRelease" checked={!!rules.auto_release_embargo_daily} onChange={(e) => setRules({ ...rules, auto_release_embargo_daily: e.target.checked })} />
                <label className="form-check-label" htmlFor="embargoRelease">Auto release embargo daily</label>
              </div>
              <div className="form-group">
                <label>Default access level</label>
                <select className="form-control" value={rules.default_access_level} onChange={(e) => setRules({ ...rules, default_access_level: e.target.value })}>
                  <option value="open_access">Open access</option>
                  <option value="institution_only">Institution only</option>
                  <option value="restricted">Restricted</option>
                  <option value="embargoed">Embargoed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notify roles on clearance</label>
                <input className="form-control" value={Array.isArray(rules.notify_roles_on_clearance) ? rules.notify_roles_on_clearance.join(", ") : rules.notify_roles_on_clearance || ""} onChange={(e) => setRules({ ...rules, notify_roles_on_clearance: e.target.value })} />
                <small className="form-text text-muted">Comma-separated role names.</small>
              </div>
              <div className="form-group mb-0">
                <label>Storage / retention note</label>
                <textarea className="form-control" rows="3" value={rules.retention_note || ""} onChange={(e) => setRules({ ...rules, retention_note: e.target.value })} />
              </div>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary" onClick={saveRules} disabled={saving}>Save rules</button>
            </div>
          </div>

          <div className="card card-outline card-info mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Storage monitoring</h3>
              <button className="btn btn-sm btn-outline-info" onClick={reindex} disabled={saving}>Run reindex</button>
            </div>
            <div className="card-body">
              <div><strong>Uploads root:</strong> {storage?.uploads_root || "—"}</div>
              <div><strong>Filesystem usage:</strong> {storage?.filesystem?.total_size_human || "0 B"} ({storage?.filesystem?.file_count || 0} files)</div>
              <div><strong>Database tracked size:</strong> {storage?.database?.submission_size_human || "0 B"}</div>
              <div><strong>Submissions with files:</strong> {storage?.database?.submissions_with_files || 0}</div>
              <div><strong>Embargoed publications:</strong> {storage?.publications?.embargoed_publications || 0}</div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card card-outline card-success mb-3">
            <div className="card-header"><h3 className="card-title mb-0">Service health</h3></div>
            <div className="card-body">
              <div><strong>Checked at:</strong> {health?.checked_at || "—"}</div>
              <div><strong>Database time:</strong> {health?.database_time ? new Date(health.database_time).toLocaleString() : "—"}</div>
              <div><strong>Database:</strong> {health?.services?.database || "—"}</div>
              <div><strong>Uploads directory:</strong> {health?.services?.uploads_directory || "—"}</div>
              <div><strong>Search index:</strong> {health?.services?.search_index || "—"}</div>
              <div><strong>Backup/restore:</strong> {health?.services?.backup_restore || "—"}</div>
              <hr />
              <div><strong>Production-ready queue:</strong> {health?.queues?.production_ready || 0}</div>
              <div><strong>Workflow rules present:</strong> {health?.workflow_rules_present ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="card card-outline card-secondary">
            <div className="card-header"><h3 className="card-title mb-0">Audit activity</h3></div>
            <div className="card-body p-0 table-responsive" style={{ maxHeight: 540 }}>
              <table className="table table-sm table-hover mb-0">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr> : !(audit?.rows || []).length ? <tr><td colSpan="3" className="text-center text-muted py-4">No audit activity found.</td></tr> : (audit.rows || []).map((row) => (
                    <tr key={`${row.action}-${row.log_id}-${row.created_at}`}>
                      <td>
                        <div className="font-weight-bold">{row.action}</div>
                        <div className="small text-muted">{row.entity_type} {row.entity_id || ""}</div>
                      </td>
                      <td>{row.actor_name || row.actor_id || "System"}</td>
                      <td>{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
