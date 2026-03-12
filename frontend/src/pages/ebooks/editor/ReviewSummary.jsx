import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import {
  getReviewSummary,
  editorRequestRevision,
  editorDeskReject,
  getStatusColor,
  formatStatus,
} from "../../../api/ebooks.js";
import { useNavigate, useParams } from "react-router-dom";

export default function ReviewSummary() {
  const { id } = useParams(); // ebook_id
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await getReviewSummary(id);
      if (!r.success) throw new Error(r.message || "Failed to load review summary");
      setData(r.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const stats = useMemo(() => {
    const a = data?.assignments || [];
    const total = a.length;
    const completed = a.filter((x) => x.status === "COMPLETED").length;
    const accepted = a.filter((x) => x.status === "ACCEPTED").length;
    const pending = a.filter((x) => x.status === "PENDING").length;
    const declined = a.filter((x) => x.status === "DECLINED").length;

    const rec = {
      ACCEPT: a.filter((x) => x.recommendation === "ACCEPT").length,
      MINOR_REVISION: a.filter((x) => x.recommendation === "MINOR_REVISION").length,
      MAJOR_REVISION: a.filter((x) => x.recommendation === "MAJOR_REVISION").length,
      REJECT: a.filter((x) => x.recommendation === "REJECT").length,
    };

    return { total, completed, accepted, pending, declined, rec };
  }, [data]);

  const requestRevision = async () => {
    const note = prompt("Revision note to author (optional):", "");
    setErr("");
    try {
      const r = await editorRequestRevision(id, { note: note || "" });
      if (!r.success) throw new Error(r.message || "Failed to request revision");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const reject = async () => {
    const note = prompt("Reject reason (optional):", "");
    setErr("");
    try {
      const r = await editorDeskReject(id, { note: note || "" });
      if (!r.success) throw new Error(r.message || "Failed to reject");
      nav("/editor/rejected");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="mb-1">Review Summary</h3>
            <div className="text-muted small">Editor view: reviewer assignments & decisions</div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => nav(-1)}>
              Back
            </button>
            <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        {loading ? (
          <div className="card shadow-sm">
            <div className="card-body">Loading...</div>
          </div>
        ) : !data?.ebook ? (
          <div className="alert alert-warning">No data</div>
        ) : (
          <>
            {/* Ebook header */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="fw-semibold">{data.ebook.title}</div>
                    <div className="text-muted small">
                      Author: {data.ebook.author_name} ({data.ebook.author_email})
                    </div>
                    <div className="text-muted small">Ebook ID: {data.ebook.ebook_id}</div>
                  </div>
                  <div className="text-end">
                    <span className={`badge bg-${getStatusColor(data.ebook.status)}`}>
                      {formatStatus(data.ebook.status)}
                    </span>
                    <div className="text-muted small mt-1">
                      Submitted:{" "}
                      {data.ebook.submitted_at ? new Date(data.ebook.submitted_at).toLocaleString() : "-"}
                    </div>
                  </div>
                </div>

                <hr />

                {/* stats */}
                <div className="row g-2">
                  <div className="col-md-3">
                    <div className="border rounded p-2">
                      <div className="text-muted small">Total Assignments</div>
                      <div className="fw-bold">{stats.total}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-2">
                      <div className="text-muted small">Completed</div>
                      <div className="fw-bold">{stats.completed}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-2">
                      <div className="text-muted small">Pending</div>
                      <div className="fw-bold">{stats.pending}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-2">
                      <div className="text-muted small">Declined</div>
                      <div className="fw-bold">{stats.declined}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-muted small mb-1">Recommendations (from completed reviews)</div>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-success">ACCEPT: {stats.rec.ACCEPT}</span>
                    <span className="badge bg-warning text-dark">MINOR: {stats.rec.MINOR_REVISION}</span>
                    <span className="badge bg-warning">MAJOR: {stats.rec.MAJOR_REVISION}</span>
                    <span className="badge bg-danger">REJECT: {stats.rec.REJECT}</span>
                  </div>
                </div>

                
              </div>
            </div>

            {/* Assignments table */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <div className="fw-semibold">Reviewer Assignments</div>
              </div>
              <div className="card-body p-0">
                {data.assignments?.length ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Reviewer</th>
                          <th>Status</th>
                          <th>Recommendation</th>
                          <th>Assigned</th>
                          <th>Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.assignments.map((a) => (
                          <tr key={a.assignment_id}>
                            <td>
                              <div className="fw-semibold">{a.reviewer_name}</div>
                              <div className="text-muted small">{a.reviewer_email}</div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  a.status === "COMPLETED"
                                    ? "bg-success"
                                    : a.status === "ACCEPTED"
                                    ? "bg-primary"
                                    : a.status === "DECLINED"
                                    ? "bg-danger"
                                    : "bg-secondary"
                                }`}
                              >
                                {formatStatus(a.status)}
                              </span>
                            </td>
                            <td>{a.recommendation ? formatStatus(a.recommendation) : <span className="text-muted">-</span>}</td>
                            <td className="text-muted small">
                              {a.assigned_at ? new Date(a.assigned_at).toLocaleString() : "-"}
                            </td>
                            <td className="text-muted small">
                              {a.completed_at ? new Date(a.completed_at).toLocaleString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-muted">No reviewer assignments found.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}