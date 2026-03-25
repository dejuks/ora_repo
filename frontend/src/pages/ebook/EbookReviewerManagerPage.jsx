import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return value;
  }
}

export default function EbookReviewerManagerPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const submissionId = query.get("submissionId") || "";

  const [workflow, setWorkflow] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [forms, setForms] = useState({});
  const [bulkReviewerIds, setBulkReviewerIds] = useState([]);
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkNote, setBulkNote] = useState("");

  const load = async () => {
    if (!submissionId) {
      setError("Missing submissionId in URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [workflowRes, assignmentRes, reviewerRes] = await Promise.all([
        ebookApi.getWorkflow(submissionId),
        ebookApi.listReviewAssignments({ submission_id: submissionId }),
        ebookApi.listReviewerOptions(),
      ]);

      setWorkflow(workflowRes || null);
      setAssignments(assignmentRes?.rows || assignmentRes || []);
      setReviewers(reviewerRes?.rows || reviewerRes || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load reviewer manager.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [submissionId]);

  const change = (assignmentId, patch) =>
    setForms((prev) => ({
      ...prev,
      [assignmentId]: { ...(prev[assignmentId] || {}), ...patch },
    }));

  const act = async (runner, success) => {
    setError("");
    setNotice("");
    try {
      await runner();
      setNotice(success);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Action failed.");
    }
  };

  const callApiMethod = async (methodName, ...args) => {
    const fn = ebookApi?.[methodName];
    if (typeof fn !== "function") {
      throw new Error(`${methodName} is not implemented in ebook.api.js`);
    }
    return await fn(...args);
  };

  const submission = workflow?.submission || null;
  const reviews = workflow?.reviews || [];

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap">
          <div>
            <h1 className="mb-1">Reviewer Assignment Manager</h1>
            <p className="text-muted mb-0">
              Manage reviewers for this submission, reassign them, and review submitted reports.
            </p>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
            type="button"
          >
            Back
          </button>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? (
        <div className="card">
          <div className="card-body">Loading…</div>
        </div>
      ) : !submission ? (
        <div className="card">
          <div className="card-body text-muted">Submission not found.</div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-5">
            <div className="card card-outline card-primary mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Submission details</h3>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Title:</strong> {submission.title || "—"}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong> <StatusBadge value={submission.status} />
                </div>
                <div className="mb-2">
                  <strong>Category:</strong> {submission.category || "—"}
                </div>
                <div className="mb-2">
                  <strong>Language:</strong> {submission.language || "—"}
                </div>
                <div className="mb-2">
                  <strong>Submission ID:</strong>
                  <div className="small text-muted">{submission.submission_id}</div>
                </div>
              </div>
            </div>

            <div className="card card-outline card-info mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Assign reviewers</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Select one or more reviewers</label>
                  <select
                    multiple
                    className="form-control"
                    value={bulkReviewerIds}
                    onChange={(e) =>
                      setBulkReviewerIds(
                        Array.from(e.target.selectedOptions).map((opt) => opt.value)
                      )
                    }
                    style={{ minHeight: "160px" }}
                  >
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.uuid} value={reviewer.uuid}>
                        {reviewer.full_name || reviewer.email}
                        {reviewer.email ? ` (${reviewer.email})` : ""}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">
                    Hold Ctrl or Cmd to select multiple reviewers.
                  </small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label>Due date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={bulkDueDate}
                      onChange={(e) => setBulkDueDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label>Invitation note</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bulkNote}
                      onChange={(e) => setBulkNote(e.target.value)}
                      placeholder="Invitation note"
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap mt-3" style={{ gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    disabled={!bulkReviewerIds.length}
                    onClick={() =>
                      act(
                        () =>
                          callApiMethod("assignReviewer", submissionId, {
                            reviewer_ids: bulkReviewerIds,
                            due_date: bulkDueDate || null,
                            invitation_note: bulkNote || null,
                          }),
                        "Reviewers assigned successfully."
                      )
                    }
                  >
                    Assign Selected Reviewers
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      act(
                        () =>
                          callApiMethod("assignPreviousReviewersForRevision", submissionId, {
                            due_date: bulkDueDate || null,
                            invitation_note: bulkNote || "Assigned previous reviewers again",
                          }),
                        "Previous reviewers assigned successfully."
                      )
                    }
                  >
                    Assign Previous Reviewers
                  </button>
                </div>
              </div>
            </div>

            <div className="card card-outline card-warning">
              <div className="card-header">
                <h3 className="card-title mb-0">Assigned reviewers</h3>
              </div>
              <div className="card-body">
                {!assignments.length ? (
                  <div className="text-muted">No reviewers assigned yet.</div>
                ) : (
                  assignments.map((row) => {
                    const form = forms[row.assignment_id] || {
                      to_reviewer_id: "",
                      note: row.invitation_note || row.response_note || "",
                      due_date: row.due_date ? formatDate(row.due_date) : "",
                    };

                    const reviewerChoices = reviewers.filter(
                      (reviewer) => reviewer.uuid !== row.reviewer_id
                    );

                    return (
                      <div key={row.assignment_id} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                          <div>
                            <strong>
                              {row.reviewer_name || row.reviewer_email || row.reviewer_id}
                            </strong>
                            <div className="small text-muted">
                              Status: {row.status || "—"} • Due: {formatDate(row.due_date)}
                            </div>
                            <div className="small text-muted">
                              Assigned at: {formatDate(row.assigned_at)}
                            </div>
                            <div className="small text-muted">
                              Round: {row.round_no || 1}
                            </div>
                            <div className="mt-2">
                              <strong className="small">Invitation note:</strong>
                              <div className="small text-muted">
                                {row.invitation_note || "—"}
                              </div>
                            </div>
                            <div className="mt-1">
                              <strong className="small">Response note:</strong>
                              <div className="small text-muted">
                                {row.response_note || "—"}
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              act(
                                () => callApiMethod("removeReviewAssignment", row.assignment_id),
                                "Assignment removed."
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <div className="row mt-2">
                          <div className="col-md-5 mb-2">
                            <select
                              className="form-control form-control-sm"
                              value={form.to_reviewer_id}
                              onChange={(e) =>
                                change(row.assignment_id, {
                                  to_reviewer_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Select new reviewer</option>
                              {reviewerChoices.map((reviewer) => (
                                <option key={reviewer.uuid} value={reviewer.uuid}>
                                  {reviewer.full_name || reviewer.email}
                                  {reviewer.email ? ` (${reviewer.email})` : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-3 mb-2">
                            <input
                              className="form-control form-control-sm"
                              type="date"
                              value={form.due_date}
                              onChange={(e) =>
                                change(row.assignment_id, {
                                  due_date: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-md-4 mb-2">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Note"
                              value={form.note}
                              onChange={(e) =>
                                change(row.assignment_id, {
                                  note: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <button
                          className="btn btn-sm btn-primary"
                          disabled={!form.to_reviewer_id}
                          onClick={() =>
                            act(
                              () =>
                                callApiMethod("reassignReviewer", row.submission_id, {
                                  from_assignment_id: row.assignment_id,
                                  to_reviewer_id: form.to_reviewer_id,
                                  due_date: form.due_date || null,
                                  note: form.note || null,
                                }),
                              "Reviewer changed successfully."
                            )
                          }
                        >
                          Change Reviewer
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card card-outline card-success">
              <div className="card-header">
                <h3 className="card-title mb-0">Review reports comparison</h3>
              </div>
              <div className="card-body">
                {!reviews.length ? (
                  <div className="text-muted">
                    No reviews submitted yet for this submission.
                  </div>
                ) : (
                  <div className="row">
                    {reviews.map((review) => (
                      <div className="col-md-6" key={review.review_id}>
                        <div className="border rounded p-3 mb-3 h-100">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>
                              {review.reviewer_name ||
                                review.reviewer_email ||
                                review.reviewer_id}
                            </strong>
                            <StatusBadge value={review.recommendation} />
                          </div>
                          <div className="small text-muted mb-2">
                            Submitted: {formatDate(review.submitted_at)}
                          </div>
                          <div className="mb-2">
                            <strong>Author comments</strong>
                            <div>{review.comments_for_author || "—"}</div>
                          </div>
                          <div>
                            <strong>Confidential comments</strong>
                            <div>{review.confidential_comments || "—"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}