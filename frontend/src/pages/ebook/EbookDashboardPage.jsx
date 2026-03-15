import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

const normalizeRoleName = (value) => (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");

const ROLE_TO_PANEL = {
  EBOOK_AUTHOR: 'author',
  EBOOK_EDITOR: 'editor',
  EBOOK_REVIEWER: 'reviewer',
  EBOOK_FINANCE_OFFICER: 'finance',
  EBOOK_DIGITAL_CONTENT_MANAGER: 'production',
  EBOOK_ADMIN: 'editor',
};

const cardClass = 'card card-outline card-primary h-100';

export default function EbookDashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const roleNames = user?.roles?.map((r) => normalizeRoleName(r.role_name || r.name || r.code)) || [];
  const panel = useMemo(() => roleNames.map((role) => ROLE_TO_PANEL[role]).find(Boolean) || 'author', [roleNames.join(',')]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const loader = {
          author: ebookApi.getAuthorDashboard,
          editor: ebookApi.getEditorDashboard,
          reviewer: ebookApi.getReviewerDashboard,
          finance: ebookApi.getFinanceDashboard,
          production: ebookApi.getProductionDashboard,
        }[panel] || ebookApi.getAuthorDashboard;
        setData(await loader());
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load eBook dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [panel]);

  const summary = data?.summary || {};
  const rows = data?.submissions || data?.assignments || data?.finances || data?.production || [];

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">eBook Publishing Dashboard</h1>
            <p className="text-muted mb-0">Workflow overview for {panel.replace('_', ' ')} role.</p>
          </div>
          <div className="mt-2 mt-md-0">
            <Link className="btn btn-primary mr-2" to="/ebook/submissions">All submissions</Link>
            <Link className="btn btn-outline-secondary" to="/ebook/publications">Published catalog</Link>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="card"><div className="card-body">Loading dashboard…</div></div>
      ) : (
        <>
          <div className="row mb-4">
            {Object.entries(summary).slice(0, 6).map(([key, value]) => (
              <div className="col-md-4 col-xl-2 mb-3" key={key}>
                <div className={cardClass}>
                  <div className="card-body">
                    <div className="text-muted text-uppercase small">{key.replaceAll('_', ' ')}</div>
                    <div className="display-5 font-weight-bold">{value ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-outline card-secondary">
            <div className="card-header"><h3 className="card-title mb-0">Recent workflow items</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Title / Item</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!rows.length ? (
                    <tr><td colSpan="4" className="text-center text-muted py-4">No records found.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.submission_id || row.assignment_id || row.finance_id || row.production_id}>
                      <td>
                        <div className="font-weight-bold">{row.title || row.invoice_number || row.repository_path || 'Workflow item'}</div>
                        <small className="text-muted">{row.author_name || row.reviewer_name || row.slug || '—'}</small>
                      </td>
                      <td><StatusBadge value={row.status || row.payment_status || row.submission_status} /></td>
                      <td>{row.author_name || row.reviewer_name || row.editor_name || '—'}</td>
                      <td>
                        {row.submission_id ? <Link className="btn btn-sm btn-outline-primary" to={`/ebook/submissions/${row.submission_id}`}>Open</Link> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
