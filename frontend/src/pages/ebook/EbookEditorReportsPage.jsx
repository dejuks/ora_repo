import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "./mock/ebookMockApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookEditorReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ screening: [], screened: [], review: [], decisions: [], handoff: [], overdue: [] });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [screening, screened, review, decisions, handoff, reminders] = await Promise.all([
        ebookApi.getEditorQueue({ stage: "screening" }),
        ebookApi.getEditorQueue({ stage: "screened" }),
        ebookApi.getEditorQueue({ stage: "under_review" }),
        ebookApi.getEditorQueue({ stage: "decisions" }),
        ebookApi.getEditorQueue({ stage: "handoff" }),
        ebookApi.getReviewerReminders({ only_overdue: "true" }),
      ]);
      setData({
        screening: screening?.rows || [],
        screened: screened?.rows || [],
        review: review?.rows || [],
        decisions: (decisions?.rows || []).filter((row) => Number(row.review_count || 0) > 0),
        handoff: handoff?.rows || [],
        overdue: reminders?.rows || [],
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load editor reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = useMemo(() => ([
    ["Screening Queue", data.screening.length, "bg-primary"],
    ["Screened Ready", data.screened.length, "bg-info"],
    ["Under Review", data.review.length, "bg-warning"],
    ["Decision Ready", data.decisions.length, "bg-success"],
    ["Approved / Handoff", data.handoff.length, "bg-secondary"],
    ["Overdue Assignments", data.overdue.length, "bg-danger"],
  ]), [data]);

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="mb-1">Editorial Reports</h1>
          <p className="text-muted mb-0">Track queue volume, decision readiness, handoff progress, and overdue reviewers.</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row mb-4">
        {cards.map(([label, value, cls]) => (
          <div className="col-lg-2 col-md-4 col-sm-6" key={label}>
            <div className={`small-box ${cls}`}><div className="inner"><h3>{loading ? "…" : value}</h3><p>{label}</p></div></div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-lg-7">
          <div className="card card-outline card-primary">
            <div className="card-header"><h3 className="card-title mb-0">Decision-ready manuscripts</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover mb-0">
                <thead><tr><th>Title</th><th>Author</th><th>Reviews</th><th>Status</th></tr></thead>
                <tbody>
                  {!data.decisions.length ? <tr><td colSpan="4" className="text-center text-muted py-4">No manuscripts are ready for decision.</td></tr> : data.decisions.map((row) => (
                    <tr key={row.submission_id}><td>{row.title}</td><td>{row.author_name || "—"}</td><td>{row.review_count || 0}</td><td><StatusBadge value={row.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card card-outline card-danger">
            <div className="card-header"><h3 className="card-title mb-0">Overdue reviewer assignments</h3></div>
            <div className="card-body">
              {!data.overdue.length ? <div className="text-muted">No overdue reviewer assignments.</div> : data.overdue.map((row) => (
                <div key={row.assignment_id} className="border rounded p-2 mb-2">
                  <div className="font-weight-bold">{row.title}</div>
                  <div className="small text-muted">Reviewer: {row.reviewer_name || "—"} • Due: {row.due_date || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
