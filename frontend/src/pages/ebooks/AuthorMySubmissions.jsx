import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import { listMyEbooks } from "../../api/ebooks.js";

function badgeClass(status) {
  const s = String(status || "").toUpperCase();
  if (s === "DRAFT") return "badge badge-secondary";
  if (["SUBMITTED", "SCREENING"].includes(s)) return "badge badge-info";
  if (["UNDER_REVIEW", "REVISION_REQUESTED"].includes(s)) return "badge badge-warning";
  if (["ACCEPTED", "FINANCE_CLEARED", "PUBLISHED"].includes(s)) return "badge badge-success";
  if (["REJECTED"].includes(s)) return "badge badge-danger";
  return "badge badge-secondary";
}

export default function MySubmissions() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await listMyEbooks();
      if (!res?.success) throw new Error(res?.message || "Failed to load submissions");
      setRows(res.data || []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h1>My Submissions</h1>
            <div className="text-muted">Track revisions, reviews, proofs and license files</div>
          </div>
          <button className="btn btn-primary" onClick={() => nav("/ebook/submit")}>
            <i className="fas fa-plus mr-1" /> New Submission
          </button>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {err && (
            <div className="alert alert-danger alert-dismissible">
              <button type="button" className="close" onClick={() => setErr("")}>×</button>
              {err}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><i className="fas fa-book mr-2" /> Submissions</h3>
              <div className="card-tools">
                <button className="btn btn-tool" onClick={load} title="Refresh">
                  <i className="fas fa-sync" />
                </button>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th>Updated At</th>
                    <th style={{ width: 120 }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center p-4 text-muted">Loading...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-4 text-muted">No submissions yet.</td></tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.ebook_id}>
                        <td className="font-weight-bold">{r.title}</td>
                        <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                        <td>{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}</td>
                        <td>{r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => nav(`/ebook/submissions/${r.ebook_id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer text-muted small">
              Tip: open a submission to upload revisions, view reviewer comments, final proof, and license.
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}