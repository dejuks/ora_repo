import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import {
  fetchScreeningQueue,
  editorStartScreening,
  getScreeningFormData,
  submitScreeningAssessment,
  editorDeskReject,
  getStatusColor,
  formatStatus,
} from "../../../api/ebooks.js";

function Modal({ open, title, subtitle, onClose, children, footer }) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 2000,
        }}
      />

      {/* Modal container */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2010,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Modal card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 980,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
              {subtitle ? (
                <div style={{ marginTop: 2, fontSize: 12, color: "#6c757d" }}>{subtitle}</div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-outline-secondary"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 16, maxHeight: "70vh", overflow: "auto" }}>{children}</div>

          {/* Footer */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              background: "#fafafa",
            }}
          >
            {footer}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ScreeningQueue() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [filter, setFilter] = useState("SUBMITTED"); // SUBMITTED | SCREENING | ""(both)
  const [modalOpen, setModalOpen] = useState(false);

  const [active, setActive] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [form, setForm] = useState({
    relevanceScore: 3,
    scopeMatch: true,
    qualityScore: 3,
    comments: "",
    recommendedAction: "SEND_TO_REVIEW",
    reviewerIds: [],
  });

  const canSubmit = useMemo(() => {
    if (form.recommendedAction === "SEND_TO_REVIEW") {
      return Array.isArray(form.reviewerIds) && form.reviewerIds.length > 0;
    }
    return true;
  }, [form]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetchScreeningQueue(filter === "" ? "" : filter);
      if (!r.success) throw new Error(r.message || "Failed to load");
      setRows(r.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [filter]);

  const openScreeningModal = async (ebookRow) => {
    setErr("");
    setActive(ebookRow);
    setModalOpen(true);
    setReviewers([]);
    setForm({
      relevanceScore: 3,
      scopeMatch: true,
      qualityScore: 3,
      comments: "",
      recommendedAction: "SEND_TO_REVIEW",
      reviewerIds: [],
    });

    try {
      const r = await getScreeningFormData(ebookRow.ebook_id);
      if (!r.success) throw new Error(r.message || "Failed to load form data");
      setReviewers(r.data?.reviewers || []);
    } catch (e) {
      setErr(e.message);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setActive(null);
    setReviewers([]);
  };

  const onStartScreening = async (ebookId) => {
    setErr("");
    try {
      const r = await editorStartScreening(ebookId);
      if (!r.success) throw new Error(r.message || "Failed");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onDeskRejectQuick = async (ebookId) => {
    const note = prompt("Reason for desk reject (optional):", "");
    setErr("");
    try {
      const r = await editorDeskReject(ebookId, { note: note || "" });
      if (!r.success) throw new Error(r.message || "Failed");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onSubmitScreening = async () => {
    if (!active) return;
    setErr("");
    try {
      const payload = {
        relevanceScore: Number(form.relevanceScore),
        scopeMatch: !!form.scopeMatch,
        qualityScore: Number(form.qualityScore),
        comments: form.comments,
        recommendedAction: form.recommendedAction,
        reviewerIds: form.reviewerIds,
      };

      const r = await submitScreeningAssessment(active.ebook_id, payload);
      if (!r.success) throw new Error(r.message || "Failed to submit screening");

      closeModal();
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const toggleReviewer = (id) => {
    setForm((prev) => {
      const set = new Set(prev.reviewerIds);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, reviewerIds: Array.from(set) };
    });
  };

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="mb-1">Screening Queue</h3>
            <div className="text-muted small">Manuscripts waiting for editor screening</div>
          </div>

          <div className="d-flex gap-2">
            <select
              className="form-select"
              style={{ width: 240 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">SUBMITTED + SCREENING</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="SCREENING">SCREENING</option>
            </select>
            <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-4 text-muted">No manuscripts found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th style={{ width: 340 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.ebook_id}>
                        <td>
                          <div className="fw-semibold">{r.title}</div>
                          <div className="small text-muted">{r.ebook_id}</div>
                        </td>
                        <td>
                          <div>{r.author_name}</div>
                          <div className="small text-muted">{r.author_email}</div>
                        </td>
                        <td>
                          <span className={`badge bg-${getStatusColor(r.status)}`}>
                            {formatStatus(r.status)}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "-"}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            {r.status === "SUBMITTED" && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => onStartScreening(r.ebook_id)}
                              >
                                Start Screening
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => openScreeningModal(r)}
                            >
                              Screen / Assign
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDeskRejectQuick(r.ebook_id)}
                            >
                              Desk Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ===== Custom Modal (Portal) ===== */}
        <Modal
          open={modalOpen}
          title="Screening Assessment"
          subtitle={active?.title || ""}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-outline-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={onSubmitScreening} disabled={!canSubmit}>
                Submit Screening
              </button>
            </>
          }
        >
          {err && <div className="alert alert-danger">{err}</div>}

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Relevance Score (1-5)</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={5}
                value={form.relevanceScore}
                onChange={(e) => setForm((p) => ({ ...p, relevanceScore: e.target.value }))}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Quality Score (1-5)</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={5}
                value={form.qualityScore}
                onChange={(e) => setForm((p) => ({ ...p, qualityScore: e.target.value }))}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Scope Match</label>
              <select
                className="form-select"
                value={String(form.scopeMatch)}
                onChange={(e) => setForm((p) => ({ ...p, scopeMatch: e.target.value === "true" }))}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Recommended Action</label>
              <select
                className="form-select"
                value={form.recommendedAction}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    recommendedAction: e.target.value,
                    reviewerIds: [],
                  }))
                }
              >
                <option value="SEND_TO_REVIEW">Send to Review + Assign Reviewers</option>
                <option value="REQUEST_REVISION">Request Revision</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>

            {form.recommendedAction === "SEND_TO_REVIEW" && (
              <div className="col-12">
                <label className="form-label">Assign Reviewers</label>

                {reviewers.length === 0 ? (
                  <div className="text-muted small">
                    No reviewers found. Check your roles/users setup.
                  </div>
                ) : (
                  <div className="border rounded p-2" style={{ maxHeight: 260, overflow: "auto" }}>
                    {reviewers.map((u) => (
                      <div className="form-check" key={u.uuid}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`rev-${u.uuid}`}
                          checked={form.reviewerIds.includes(u.uuid)}
                          onChange={() => toggleReviewer(u.uuid)}
                        />
                        <label className="form-check-label" htmlFor={`rev-${u.uuid}`}>
                          {u.full_name} <span className="text-muted">({u.email})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {!canSubmit && (
                  <div className="text-danger small mt-1">Select at least one reviewer.</div>
                )}
              </div>
            )}

            <div className="col-12">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.comments}
                onChange={(e) => setForm((p) => ({ ...p, comments: e.target.value }))}
                placeholder="Write screening comments..."
              />
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}