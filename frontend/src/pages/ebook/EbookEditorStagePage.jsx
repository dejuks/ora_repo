import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

const STAGE_CONFIG = {
  screening: {
    heading: "Editorial Screening Queue",
    subtitle:
      "Review newly submitted manuscripts for scope, completeness, quality, and originality before moving them forward.",
    empty: "No new submissions are waiting for screening.",
    query: { stage: "screening" },
    actionLabel: "Start Screening",
    tone: "primary",
  },
  screened: {
    heading: "Screened Manuscripts",
    subtitle:
      "These manuscripts passed editorial screening and are ready for reviewer assignment.",
    empty: "No screened manuscripts are waiting for reviewer assignment.",
    query: { stage: "screened" },
    actionLabel: "Assign Reviewer",
    tone: "warning",
  },
  reviews: {
    heading: "Review Monitoring",
    subtitle:
      "Manuscripts currently under review. Track reviewer assignments, due dates, overdue cases, and submitted feedback.",
    empty: "No manuscripts are currently under review.",
    query: { stage: "reviews" },
    actionLabel: "Manage Reviews",
    tone: "info",
  },
  decision: {
    heading: "Decision Queue",
    subtitle:
      "Submissions with reviewer feedback ready for final editorial decision.",
    empty: "No reviewed manuscripts are waiting for editorial decision.",
    query: { stage: "decision" },
    actionLabel: "Open Decision",
    tone: "primary",
  },
  handoff: {
    heading: "Accepted & Handoff Queue",
    subtitle:
      "Accepted titles moving toward finance clearance and production handoff.",
    empty: "No accepted manuscripts are waiting for handoff.",
    query: { stage: "handoff" },
    actionLabel: "Open Handoff",
    tone: "success",
  },
};

const SCREENING_DEFAULT = {
  decision: "screened",
  note: "",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function matchSearch(row, term) {
  if (!term) return true;

  const haystack = [
    row?.title,
    row?.subtitle,
    row?.abstract,
    row?.author_name,
    row?.author_email,
    row?.status,
    row?.category,
    row?.language,
    Array.isArray(row?.keywords) ? row.keywords.join(", ") : "",
    Array.isArray(row?.reviewer_names) ? row.reviewer_names.join(", ") : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function StageTabs({ stage }) {
  const tabs = [
    {
      key: "screening",
      label: "Screening Queue",
      to: "/ebook/editor/screening",
    },
    {
      key: "screened",
      label: "Screened",
      to: "/ebook/editor/screened",
    },
    {
      key: "reviews",
      label: "Under Review",
      to: "/ebook/editor/reviews",
    },
    {
      key: "decision",
      label: "Decision Queue",
      to: "/ebook/editor/decision",
    },
    {
      key: "handoff",
      label: "Handoff",
      to: "/ebook/editor/handoff",
    },
  ];

  return (
    <div className="d-flex flex-wrap align-items-center" style={{ gap: 8 }}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          className={`btn ${
            stage === tab.key ? "btn-primary" : "btn-outline-primary"
          }`}
          to={tab.to}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function QueueSummaryCards({ stage, rows }) {
  const total = rows.length;
  const overdue = rows.filter((row) => Number(row?.overdue_assignment_count || 0) > 0).length;
  const withReviews = rows.filter((row) => Number(row?.review_count || 0) > 0).length;
  const withAssignments = rows.filter((row) => Number(row?.assignment_count || 0) > 0).length;

  const cards = [
    {
      label: "Total",
      value: total,
      tone: "primary",
    },
    {
      label: "With Assignments",
      value: withAssignments,
      tone: "warning",
    },
    {
      label: "With Reviews",
      value: withReviews,
      tone: "info",
    },
    {
      label: "Overdue",
      value: overdue,
      tone: "danger",
    },
  ];

  if (stage === "screening") {
    cards[1] = {
      label: "Submitted",
      value: total,
      tone: "warning",
    };
    cards[2] = {
      label: "Ready to Screen",
      value: total,
      tone: "info",
    };
  }

  return (
    <div className="row mb-4">
      {cards.map((card) => (
        <div className="col-md-3 mb-3" key={card.label}>
          <div className={`card border-${card.tone} h-100 shadow-sm`}>
            <div className="card-body">
              <div className="text-muted small mb-1">{card.label}</div>
              <div className={`h3 mb-0 text-${card.tone}`}>{card.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailTable({ row }) {
  const source = row || {};

  const Item = ({ label, value }) => (
    <tr>
      <th style={{ width: 220, backgroundColor: "#f8f9fa" }}>{label}</th>
      <td>{value || "—"}</td>
    </tr>
  );

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-sm mb-0">
        <tbody>
          <Item label="Title" value={source.title} />
          <Item label="Subtitle" value={source.subtitle} />
          <Item label="Author" value={source.author_name} />
          <Item label="Author Email" value={source.author_email} />
          <Item label="Status" value={<StatusBadge value={source.status} />} />
          <Item label="Category" value={source.category} />
          <Item label="Language" value={source.language} />
          <Item label="Publication Year" value={source.publication_year} />
          <Item label="Target Audience" value={source.target_audience} />
          <Item
            label="Keywords"
            value={
              Array.isArray(source.keywords) && source.keywords.length
                ? source.keywords.join(", ")
                : "—"
            }
          />
          <Item label="Submitted At" value={formatDateTime(source.submitted_at)} />
          <Item label="Updated At" value={formatDateTime(source.updated_at)} />
          <Item
            label="Reviewer Names"
            value={
              Array.isArray(source.reviewer_names) && source.reviewer_names.length
                ? source.reviewer_names.join(", ")
                : "—"
            }
          />
          <Item label="Assignment Count" value={source.assignment_count ?? 0} />
          <Item label="Review Count" value={source.review_count ?? 0} />
          <Item
            label="Overdue Assignment Count"
            value={source.overdue_assignment_count ?? 0}
          />
          <Item label="BPC Amount" value={source.bpc_amount ?? "—"} />
          <Item label="Payment Status" value={source.payment_status} />
          <Item label="Invoice Number" value={source.invoice_number} />
          <Item label="Receipt Number" value={source.receipt_number} />
          <Item
            label="Proof Sent To Author"
            value={source.proof_sent_to_author ? "Yes" : "No"}
          />
          <Item
            label="Author Proof Approved"
            value={source.author_proof_approved ? "Yes" : "No"}
          />
          <Item label="Proof Sent At" value={formatDateTime(source.proof_sent_at)} />
          <Item
            label="Proof Approved At"
            value={formatDateTime(source.proof_approved_at)}
          />
        </tbody>
      </table>
    </div>
  );
}

function DetailModal({ row, onClose }) {
  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title mb-1">{row?.title || "Submission Detail"}</h5>
              <div className="text-muted small">
                Full manuscript information and queue data
              </div>
            </div>
            <button
              type="button"
              className="close border-0 bg-transparent"
              onClick={onClose}
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="mb-4">
              <h6 className="font-weight-bold mb-2">Submission Details</h6>
              <DetailTable row={row} />
            </div>

            <div>
              <h6 className="font-weight-bold mb-2">Abstract</h6>
              <div className="border rounded bg-light p-3 text-pre-wrap">
                {row?.abstract || "No abstract available."}
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreeningModal({
  row,
  value,
  onChange,
  busy,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title mb-1">Editorial Screening</h5>
              <div className="text-muted small">
                Review and update the screening result for this manuscript
              </div>
            </div>
            <button
              type="button"
              className="close border-0 bg-transparent"
              onClick={onClose}
              disabled={busy}
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="mb-4">
              <h6 className="font-weight-bold mb-2">{row?.title || "Untitled Submission"}</h6>
              <div className="small text-muted">
                Author: {row?.author_name || "—"} • Submitted: {formatDateTime(row?.submitted_at)}
              </div>
            </div>

            <div className="mb-4">
              <div className="border rounded bg-light p-3 text-pre-wrap">
                {row?.abstract || "No abstract available."}
              </div>
            </div>

            <div className="form-group">
              <label className="font-weight-bold">Screening Decision</label>
              <select
                className="form-control"
                value={value.decision}
                onChange={(e) => onChange((prev) => ({ ...prev, decision: e.target.value }))}
                disabled={busy}
              >
                <option value="screened">Pass Screening</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="font-weight-bold">Editor Note</label>
              <textarea
                rows="5"
                className="form-control"
                placeholder="Add screening comment or rejection reason..."
                value={value.note}
                onChange={(e) => onChange((prev) => ({ ...prev, note: e.target.value }))}
                disabled={busy}
              />
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={busy}>
              {busy ? "Saving..." : "Save Screening"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EbookEditorStageListPage({ stage = "screening" }) {
  const navigate = useNavigate();
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.screening;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [screeningRow, setScreeningRow] = useState(null);
  const [screeningForm, setScreeningForm] = useState(SCREENING_DEFAULT);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await ebookApi.getEditorQueue(config.query || {});
      setRows(Array.isArray(result?.rows) ? result.rows : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load editor stage submissions."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const filteredRows = useMemo(() => {
    const term = normalizeText(search);

    return [...rows]
      .filter((row) => matchSearch(row, term))
      .sort((a, b) => {
        const aDate = new Date(a?.updated_at || a?.created_at || 0).getTime();
        const bDate = new Date(b?.updated_at || b?.created_at || 0).getTime();
        return bDate - aDate;
      });
  }, [rows, search]);

  const openScreening = (row) => {
    setScreeningRow(row);
    setScreeningForm({
      decision: "screened",
      note: "",
    });
  };

  const closeScreening = () => {
    setScreeningRow(null);
    setScreeningForm(SCREENING_DEFAULT);
  };

  const submitScreening = async () => {
    if (!screeningRow?.submission_id) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await ebookApi.screening(screeningRow.submission_id, {
        decision: screeningForm.decision,
        note: screeningForm.note,
      });

      setNotice("Screening decision saved successfully.");
      closeScreening();
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save screening decision."
      );
    } finally {
      setBusy(false);
    }
  };

  const openAction = (row) => {
    if (stage === "screening") {
      openScreening(row);
      return;
    }

    if (stage === "screened") {
      navigate(`/ebook/reviewer-manager?submissionId=${row.submission_id}`);
      return;
    }

    if (stage === "reviews") {
      navigate(`/ebook/reviewer-manager?submissionId=${row.submission_id}`);
      return;
    }

    if (stage === "decision") {
      navigate(`/ebook/editor/decision?submissionId=${row.submission_id}`);
      return;
    }

    if (stage === "handoff") {
      navigate(`/ebook/submissions/${row.submission_id}`);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap" style={{ gap: 12 }}>
          <div>
            <h1 className="mb-1">{config.heading}</h1>
            <p className="text-muted mb-0">{config.subtitle}</p>
          </div>

          <StageTabs stage={stage} />
        </div>
      </section>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : null}

      {notice ? (
        <div className="alert alert-success">{notice}</div>
      ) : null}

      <QueueSummaryCards stage={stage} rows={rows} />

      <div className={`card card-outline card-${config.tone || "primary"}`}>
        <div className="card-header">
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: 10 }}
          >
            <h3 className="card-title mb-0">{config.heading}</h3>

            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <input
                type="text"
                className="form-control"
                style={{ minWidth: 280 }}
                placeholder="Search title, author, status, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={load}>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="card-body table-responsive p-0">
          <table className="table table-bordered table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Assignments</th>
                <th>Reviews</th>
                <th>Overdue</th>
                <th>Updated</th>
                <th style={{ width: 240 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    {config.empty}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={row.submission_id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="font-weight-bold">{row.title || "Untitled"}</div>
                      <div className="small text-muted">
                        {row.subtitle || row.category || "—"}
                      </div>
                    </td>

                    <td>
                      <div>{row.author_name || "—"}</div>
                      <div className="small text-muted">{row.author_email || ""}</div>
                    </td>

                    <td>
                      <StatusBadge value={row.status} />
                    </td>

                    <td>{row.assignment_count ?? 0}</td>
                    <td>{row.review_count ?? 0}</td>
                    <td>
                      {Number(row.overdue_assignment_count || 0) > 0 ? (
                        <span className="badge badge-danger">
                          {row.overdue_assignment_count}
                        </span>
                      ) : (
                        <span className="badge badge-light">0</span>
                      )}
                    </td>
                    <td>{formatDate(row.updated_at || row.created_at)}</td>

                    <td>
                      <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSelectedRow(row)}
                        >
                          View Detail
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${
                            stage === "screening"
                              ? "btn-primary"
                              : stage === "screened"
                              ? "btn-warning"
                              : stage === "reviews"
                              ? "btn-outline-warning"
                              : stage === "decision"
                              ? "btn-outline-primary"
                              : "btn-outline-success"
                          }`}
                          onClick={() => openAction(row)}
                        >
                          {config.actionLabel}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow ? (
        <DetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      ) : null}

      {screeningRow ? (
        <ScreeningModal
          row={screeningRow}
          value={screeningForm}
          onChange={setScreeningForm}
          busy={busy}
          onClose={closeScreening}
          onSubmit={submitScreening}
        />
      ) : null}
    </MainLayout>
  );
}