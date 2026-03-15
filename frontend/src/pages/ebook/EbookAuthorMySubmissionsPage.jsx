import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookAuthorMySubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const load = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.listMySubmissions({ limit: 100, search: query });
      setRows(result?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || (err?.response?.status === 401 ? "Please log in again." : err?.response?.status === 403 ? "You do not have permission to view your submissions." : "Failed to load your submissions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">My eBook Submissions</h1>
            <p className="text-muted mb-0">Author-only submission list with review, payment, and proof actions.</p>
          </div>
          <div className="d-flex gap-2">
            <Link className="btn btn-primary mr-2" to="/ebook/submissions/create">Create Submission</Link>
            <Link className="btn btn-outline-secondary" to="/ebook/dashboard">Back to dashboard</Link>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card card-secondary card-outline">
        <div className="card-header">
          <form className="d-flex align-items-center" onSubmit={handleSearch}>
            <h3 className="card-title mb-0">My manuscript list</h3>
            <div className="ml-auto d-flex" style={{ gap: 8 }}>
              <input
                className="form-control"
                style={{ minWidth: 260 }}
                placeholder="Search title, abstract, keywords"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">Search</button>
            </div>
          </form>
        </div>
        <div className="card-body table-responsive p-0">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Files</th>
                <th>Payment</th>
                <th>Review</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading…</td></tr>
              ) : !rows.length ? (
                <tr><td colSpan="6" className="text-center text-muted py-4">No submissions found.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.submission_id}>
                  <td>
                    <div className="font-weight-bold">{row.title}</div>
                    <small className="text-muted">{row.category || "—"} • {row.language || "—"}</small>
                  </td>
                  <td><StatusBadge value={row.status} /></td>
                  <td>
                    <div>{row.file_count || 0}</div>
                    <small className="text-muted">{Array.isArray(row.file_roles) && row.file_roles.length ? row.file_roles.join(", ") : "No file"}</small>
                  </td>
                  <td>
                    {row.requires_bpc ? (
                      <Link className="btn btn-sm btn-outline-warning" to={`/ebook/submissions/${row.submission_id}/payment`}>Payment</Link>
                    ) : <span className="text-muted">Not required</span>}
                  </td>
                  <td>
                    <Link className="btn btn-sm btn-outline-secondary" to={`/ebook/submissions/${row.submission_id}/review-comments`}>Comments</Link>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm flex-wrap">
                      <Link className="btn btn-outline-info" to={`/ebook/submissions/${row.submission_id}`}>Open</Link>
                      <Link className="btn btn-outline-primary" to={`/ebook/submissions/${row.submission_id}/edit`}>Update</Link>
                      <Link className="btn btn-outline-success" to={`/ebook/submissions/${row.submission_id}/proof-approval`}>Proof</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
