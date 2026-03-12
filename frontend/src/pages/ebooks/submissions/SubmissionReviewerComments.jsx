// src/ebook/pages/submissions/SubmissionReviewerComments.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { getReviewSummary } from "../../../api/ebooks.js";

export default function SubmissionReviewerComments() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getReviewSummary(id);
      if (!res?.success) throw new Error(res?.message || "Failed to load review summary");
      setData(res.data);
    } catch (e) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const ebook = data?.ebook;
  const assignments = data?.assignments || [];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <button className="btn btn-default mr-2" onClick={() => nav(-1)}>
              <i className="fas fa-arrow-left mr-1" /> Back
            </button>
            <h1 className="d-inline">Reviewer Comments</h1>
            <div className="text-muted mt-1">Read reviewer feedback and recommendations.</div>
          </div>
          <span className="badge badge-info p-2">
            <i className="fas fa-comments mr-1" /> Submission #{id}
          </span>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {err && (
            <div className="alert alert-danger alert-dismissible">
              <button type="button" className="close" onClick={() => setErr("")}>×</button>
              <i className="fas fa-exclamation-triangle mr-2" />
              {err}
            </div>
          )}

          {loading ? (
            <div className="card"><div className="card-body">Loading...</div></div>
          ) : !data ? (
            <div className="card"><div className="card-body text-muted">No data</div></div>
          ) : (
            <>
              <div className="card card-outline card-secondary">
                <div className="card-body">
                  <div className="d-flex justify-content-between flex-wrap">
                    <div>
                      <div className="text-muted small">Title</div>
                      <div className="h5 mb-0">{ebook?.title || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted small">Status</div>
                      <span className="badge badge-secondary">{ebook?.status || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-user-check mr-2" /> Reviews ({assignments.length})
                  </h3>
                </div>

                <div className="card-body p-0">
                  {assignments.length === 0 ? (
                    <div className="p-3 text-muted">No reviewer assignments yet.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Reviewer</th>
                            <th>Status</th>
                            <th>Recommendation</th>
                            <th>Comments</th>
                            <th>Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.map((a) => (
                            <tr key={a.assignment_id}>
                              <td>
                                <div className="font-weight-bold">{a.reviewer_name || "—"}</div>
                                <div className="text-muted small">{a.reviewer_email || ""}</div>
                              </td>
                              <td>
                                <span className="badge badge-secondary">{a.status || "—"}</span>
                              </td>
                              <td>
                                <span className="badge badge-info">{a.recommendation || "—"}</span>
                              </td>
                              <td style={{ maxWidth: 420 }}>
                                <div className="small">
                                  {a.comments ? a.comments : <span className="text-muted">—</span>}
                                </div>

                                {/* NOTE:
                                   If you don't want authors to see confidential_comments,
                                   do NOT render it here.
                                   Keep it hidden unless you have a staff flag in frontend.
                                */}
                              </td>
                              <td className="text-muted small">
                                {a.completed_at ? new Date(a.completed_at).toLocaleString() : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => nav(`/ebook/submissions/${id}/revisions`)}
                  >
                    <i className="fas fa-upload mr-1" /> Submit Revision
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}