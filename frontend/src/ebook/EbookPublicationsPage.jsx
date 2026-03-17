import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookPublicationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await ebookApi.listPublicCatalog({ search, limit: 50 });
      setRows(result?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load publications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div><h1 className="mb-1">Published eBook Catalog</h1><p className="text-muted mb-0">Public release catalog with access level and publication metadata.</p></div>
          <Link className="btn btn-outline-secondary" to="/ebook/dashboard">Back to dashboard</Link>
        </div>
      </section>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="card card-outline card-primary">
        <div className="card-body">
          <div className="form-row align-items-end mb-3">
            <div className="form-group col-md-9"><label>Search</label><input className="form-control" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title, abstract, keywords" /></div>
            <div className="form-group col-md-3"><button className="btn btn-primary btn-block" onClick={load}>Search</button></div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead><tr><th>Title</th><th>Author</th><th>Access</th><th>Year</th><th>Published</th></tr></thead>
              <tbody>{loading ? <tr><td colSpan="5" className="text-center py-4">Loading…</td></tr> : !rows.length ? <tr><td colSpan="5" className="text-center text-muted py-4">No publications found.</td></tr> : rows.map((row) => <tr key={row.publication_id}><td><div className="font-weight-bold">{row.title}</div><small className="text-muted">/{row.slug}</small></td><td>{row.author_name || '—'}</td><td><StatusBadge value={row.access_level} /></td><td>{row.publication_year || '—'}</td><td>{row.published_at ? new Date(row.published_at).toLocaleDateString() : '—'}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
