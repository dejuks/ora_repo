import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const normalizeRoleName = (value) =>
  (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");

const hasRole = (user, names = []) => {
  const userRoles =
    user?.roles?.map((r) =>
      normalizeRoleName(r.role_name || r.name || r.code)
    ) || [];
  return names.some((name) => userRoles.includes(normalizeRoleName(name)));
};

export default function EbookSubmissionDetailPage() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);

  const [fileRole, setFileRole] = useState("manuscript");
  const [selectedFile, setSelectedFile] = useState(null);

  const [screening, setScreening] = useState({
    decision: "send_to_review",
    note: "",
  });
  const [screeningFile, setScreeningFile] = useState(null);

  const [reviewerForm, setReviewerForm] = useState({
    reviewer_ids: [],
    due_date: "",
    invitation_note: "",
  });
  const [reviewerOptions, setReviewerOptions] = useState([]);

  const [decisionForm, setDecisionForm] = useState({
    decision: "accept",
    note: "",
  });

  const [financeForm, setFinanceForm] = useState({
    invoice_number: "",
    currency_code: "ETB",
    amount_due: "",
    amount_paid: "",
    payment_status: "pending",
    payment_reference: "",
    receipt_number: "",
    review_note: "",
  });

  const [productionForm, setProductionForm] = useState({
    pdf_ready: false,
    epub_ready: false,
    proof_sent_to_author: false,
    author_proof_approved: false,
    isbn: "",
    doi: "",
    repository_path: "",
    quality_note: "",
  });

  const [publishForm, setPublishForm] = useState({
    slug: "",
    access_level: "open_access",
    embargo_until: "",
    license_name: "All rights reserved",
    landing_page_title: "",
    is_public: true,
  });

  const [activeModal, setActiveModal] = useState("");

  const canAuthor = hasRole(user, ["EBOOK_AUTHOR", "EBOOK_ADMIN"]);
  const canEditor = hasRole(user, ["EBOOK_EDITOR", "EBOOK_ADMIN"]);
  const canFinance = hasRole(user, ["EBOOK_FINANCE_OFFICER", "EBOOK_ADMIN"]);
  const canProduction = hasRole(user, [
    "EBOOK_DIGITAL_CONTENT_MANAGER",
    "EBOOK_ADMIN",
  ]);

  const isAuthorOnlyView =
    canAuthor && !canEditor && !canFinance && !canProduction;

  const currentStatus = data?.submission?.status || "";
  const isAuthorDraft = isAuthorOnlyView && currentStatus === "draft";
  const canAuthorEditDraft =
    isAuthorOnlyView && ["draft", "rejected"].includes(currentStatus);

  const isScreeningStage = [
    "submitted",
    "editor_screening",
    "revision_requested",
  ].includes(currentStatus);

  const isReviewStage = currentStatus === "under_review";

  const screeningDecisionLabel =
    screening.decision === "send_to_review"
      ? "Send to review"
      : screening.decision === "request_revision"
      ? "Request revision"
      : "Reject submission";

  const openModal = (name) => setActiveModal(name);
  const closeModal = () => setActiveModal("");

  const load = async () => {
    setLoading(true);
    try {
      const result = await ebookApi.getWorkflow(id);
      setData(result);

      const sub = result?.submission || {};

      setFinanceForm((p) => ({
        ...p,
        invoice_number: sub.invoice_number || "",
        amount_due: sub.amount_due || "",
        amount_paid: sub.amount_paid || "",
        payment_status: sub.payment_status || "pending",
        receipt_number: sub.receipt_number || "",
      }));

      setProductionForm((p) => ({
        ...p,
        pdf_ready: !!sub.pdf_ready,
        epub_ready: !!sub.epub_ready,
        proof_sent_to_author: !!sub.proof_sent_to_author,
        author_proof_approved: !!sub.author_proof_approved,
        isbn: sub.isbn || "",
        doi: sub.doi || "",
        repository_path: sub.repository_path || "",
      }));

      setPublishForm((p) => ({
        ...p,
        slug: sub.slug || "",
        access_level: sub.access_level || "open_access",
        landing_page_title: sub.title || "",
        is_public: sub.is_public ?? true,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load workflow.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const loadReviewers = async () => {
      try {
        const result = await ebookApi.getReviewerOptions();
        setReviewerOptions(
          Array.isArray(result)
            ? result
            : Array.isArray(result?.rows)
            ? result.rows
            : []
        );
      } catch (err) {
        setReviewerOptions([]);
      }
    };

    if (canEditor) loadReviewers();
  }, [canEditor]);

  const toggleReviewerSelection = (reviewerId) => {
    setReviewerForm((prev) => ({
      ...prev,
      reviewer_ids: prev.reviewer_ids.includes(reviewerId)
        ? prev.reviewer_ids.filter((item) => item !== reviewerId)
        : [...prev.reviewer_ids, reviewerId],
    }));
  };

  const doAction = async (fn, success) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(success);
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setNotice("");

    try {
      await ebookApi.uploadFile(id, selectedFile, fileRole);
      setNotice("File uploaded successfully.");
      setSelectedFile(null);
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleScreeningAction = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (screening.decision === "request_revision") {
        if (!String(screening.note || "").trim()) {
          throw new Error("Revision note is required.");
        }
        if (screeningFile) {
          await ebookApi.uploadFile(id, screeningFile, "editor_revision_request");
        }
        await ebookApi.screening(id, {
          decision: "request_revision",
          note: screening.note,
        });
        setNotice("Revision request saved and returned to the author.");
      } else if (screening.decision === "send_to_review") {
        if (!reviewerForm.reviewer_ids.length) {
          throw new Error("Select at least one reviewer.");
        }
        if (!reviewerForm.due_date) {
          throw new Error("Due date is required.");
        }
        await ebookApi.assignReviewer(id, reviewerForm);
        setNotice("Reviewer(s) assigned and manuscript moved to review.");
      } else if (screening.decision === "reject") {
        if (!String(screening.note || "").trim()) {
          throw new Error("Rejection note is required.");
        }
        await ebookApi.screening(id, {
          decision: "reject",
          note: screening.note,
        });
        setNotice("Submission rejected.");
      }

      setScreeningFile(null);
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;

    return (
      <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {activeModal === "upload" && "Upload File"}
                  {activeModal === "author" && "Author Actions"}
                  {activeModal === "editor" && "Editor Actions"}
                  {activeModal === "finance" && "Finance Actions"}
                  {activeModal === "production" && "Production Actions"}
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                {activeModal === "upload" && (
                  <form onSubmit={handleUpload}>
                    <div className="form-row align-items-end">
                      <div className="form-group col-md-4">
                        <label>File role</label>
                        <select
                          className="form-control"
                          value={fileRole}
                          onChange={(e) => setFileRole(e.target.value)}
                        >
                          <option value="manuscript">Manuscript</option>
                          <option value="revision">Revision</option>
                          <option value="proof">Proof</option>
                          <option value="pdf">PDF</option>
                          <option value="epub">EPUB</option>
                          <option value="cover">Cover</option>
                          <option value="supplementary">Supplementary</option>
                        </select>
                      </div>

                      <div className="form-group col-md-8">
                        <label>File</label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? "Uploading..." : "Upload File"}
                    </button>
                  </form>
                )}

                {activeModal === "author" && (
                  <>
                    {isAuthorDraft ? (
                      <div className="d-flex flex-column" style={{ gap: 10 }}>
                        <div className="alert alert-secondary">
                          This submission is still a draft. Update it, upload files if
                          needed, then send it for editorial screening.
                        </div>
                        <Link className="btn btn-outline-secondary" to="/ebook/drafts">
                          Back to drafts
                        </Link>
                        <Link
                          className="btn btn-outline-primary"
                          to={`/ebook/submissions/${id}/edit`}
                        >
                          Edit draft metadata
                        </Link>
                        <button
                          className="btn btn-primary"
                          disabled={saving}
                          onClick={() =>
                            doAction(
                              () => ebookApi.submitSubmission(id),
                              "Draft submitted successfully for editorial screening."
                            )
                          }
                        >
                          {saving ? "Submitting..." : "Submit draft"}
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex flex-column" style={{ gap: 10 }}>
                        {canAuthorEditDraft ? (
                          <Link
                            className="btn btn-outline-secondary"
                            to={`/ebook/submissions/${id}/edit`}
                          >
                            Edit submission
                          </Link>
                        ) : null}
                        <Link className="btn btn-outline-primary" to="/ebook/my-submissions">
                          All submissions
                        </Link>
                        <Link className="btn btn-outline-secondary" to="/ebook/drafts">
                          Drafts
                        </Link>
                        <Link className="btn btn-outline-warning" to="/ebook/my-revisions">
                          Revision requests
                        </Link>
                        <Link className="btn btn-outline-danger" to="/ebook/my-payments">
                          Payments & waivers
                        </Link>
                        <Link className="btn btn-outline-success" to="/ebook/my-proofs">
                          Proof approvals
                        </Link>
                        <Link className="btn btn-outline-dark" to="/ebook/my-rejected">
                          Rejected by editor
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {activeModal === "editor" && (
                  <>
                    {isScreeningStage ? (
                      <>
                        <div className="form-group">
                          <label>Screening decision</label>
                          <select
                            className="form-control"
                            value={screening.decision}
                            onChange={(e) =>
                              setScreening({ ...screening, decision: e.target.value })
                            }
                          >
                            <option value="send_to_review">Send to review</option>
                            <option value="request_revision">Request revision</option>
                            <option value="reject">Reject</option>
                          </select>
                        </div>

                        {screening.decision === "send_to_review" && (
                          <>
                            <div className="form-group">
                              <label>Select reviewer(s)</label>
                              <div
                                className="border rounded p-2"
                                style={{ maxHeight: "220px", overflowY: "auto" }}
                              >
                                {!reviewerOptions.length ? (
                                  <div className="text-muted small">
                                    No users with reviewer role found.
                                  </div>
                                ) : (
                                  reviewerOptions.map((reviewer) => (
                                    <div className="form-check mb-2" key={reviewer.uuid}>
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`reviewer-${reviewer.uuid}`}
                                        checked={reviewerForm.reviewer_ids.includes(
                                          reviewer.uuid
                                        )}
                                        onChange={() =>
                                          toggleReviewerSelection(reviewer.uuid)
                                        }
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`reviewer-${reviewer.uuid}`}
                                      >
                                        <strong>
                                          {reviewer.full_name || reviewer.email}
                                        </strong>
                                        <div className="text-muted small">
                                          {reviewer.email || "No email"} • Active
                                          assignments:{" "}
                                          {reviewer.active_assignment_count ?? 0}
                                        </div>
                                      </label>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Due date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={reviewerForm.due_date}
                                onChange={(e) =>
                                  setReviewerForm({
                                    ...reviewerForm,
                                    due_date: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Invitation note</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={reviewerForm.invitation_note}
                                onChange={(e) =>
                                  setReviewerForm({
                                    ...reviewerForm,
                                    invitation_note: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </>
                        )}

                        {screening.decision === "request_revision" && (
                          <>
                            <div className="form-group">
                              <label>Revision note</label>
                              <textarea
                                className="form-control"
                                rows="4"
                                value={screening.note}
                                onChange={(e) =>
                                  setScreening({ ...screening, note: e.target.value })
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>Attach marked file (optional)</label>
                              <input
                                type="file"
                                className="form-control"
                                onChange={(e) =>
                                  setScreeningFile(e.target.files?.[0] || null)
                                }
                              />
                            </div>
                          </>
                        )}

                        {screening.decision === "reject" && (
                          <div className="form-group">
                            <label>Rejection note</label>
                            <textarea
                              className="form-control"
                              rows="4"
                              value={screening.note}
                              onChange={(e) =>
                                setScreening({ ...screening, note: e.target.value })
                              }
                            />
                          </div>
                        )}

                        <button
                          className="btn btn-warning"
                          disabled={saving}
                          onClick={handleScreeningAction}
                        >
                          {saving ? "Saving..." : screeningDecisionLabel}
                        </button>
                      </>
                    ) : isReviewStage ? (
                      <>
                        <div className="form-group">
                          <label>Editorial decision</label>
                          <select
                            className="form-control"
                            value={decisionForm.decision}
                            onChange={(e) =>
                              setDecisionForm({
                                ...decisionForm,
                                decision: e.target.value,
                              })
                            }
                          >
                            <option value="accept">Accept</option>
                            <option value="minor_revision">Minor revision</option>
                            <option value="major_revision">Major revision</option>
                            <option value="reject">Reject</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Decision note</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={decisionForm.note}
                            onChange={(e) =>
                              setDecisionForm({
                                ...decisionForm,
                                note: e.target.value,
                              })
                            }
                          />
                        </div>

                        <button
                          className="btn btn-success"
                          disabled={saving}
                          onClick={() =>
                            doAction(
                              () =>
                                ebookApi.makeDecision(id, {
                                  ...decisionForm,
                                  decision: String(decisionForm.decision || "")
                                    .trim()
                                    .toLowerCase()
                                    .replace(/\s+/g, "_"),
                                }),
                              "Editorial decision recorded."
                            )
                          }
                        >
                          Save decision
                        </button>
                      </>
                    ) : (
                      <div className="alert alert-light border mb-0">
                        No editor form is needed right now. Current status:{" "}
                        <StatusBadge value={currentStatus || "draft"} />
                      </div>
                    )}
                  </>
                )}

                {activeModal === "finance" && (
                  <>
                    <div className="form-group">
                      <label>Invoice number</label>
                      <input
                        className="form-control"
                        value={financeForm.invoice_number}
                        onChange={(e) =>
                          setFinanceForm({
                            ...financeForm,
                            invoice_number: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label>Amount due</label>
                        <input
                          type="number"
                          className="form-control"
                          value={financeForm.amount_due}
                          onChange={(e) =>
                            setFinanceForm({
                              ...financeForm,
                              amount_due: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label>Amount paid</label>
                        <input
                          type="number"
                          className="form-control"
                          value={financeForm.amount_paid}
                          onChange={(e) =>
                            setFinanceForm({
                              ...financeForm,
                              amount_paid: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="form-control"
                        value={financeForm.payment_status}
                        onChange={(e) =>
                          setFinanceForm({
                            ...financeForm,
                            payment_status: e.target.value,
                          })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="waiver_requested">Waiver requested</option>
                        <option value="waived">Waived</option>
                        <option value="partially_paid">Partially paid</option>
                        <option value="paid">Paid</option>
                        <option value="cleared">Cleared</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>

                    <button
                      className="btn btn-danger"
                      disabled={saving}
                      onClick={() =>
                        doAction(
                          () => ebookApi.upsertFinance(id, financeForm),
                          "Finance record saved."
                        )
                      }
                    >
                      Save finance
                    </button>
                  </>
                )}

                {activeModal === "production" && (
                  <>
                    <div className="form-check mb-2">
                      <input
                        id="pdf_ready"
                        type="checkbox"
                        className="form-check-input"
                        checked={productionForm.pdf_ready}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            pdf_ready: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="pdf_ready" className="form-check-label">
                        PDF ready
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        id="epub_ready"
                        type="checkbox"
                        className="form-check-input"
                        checked={productionForm.epub_ready}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            epub_ready: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="epub_ready" className="form-check-label">
                        EPUB ready
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        id="proof_sent"
                        type="checkbox"
                        className="form-check-input"
                        checked={productionForm.proof_sent_to_author}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            proof_sent_to_author: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="proof_sent" className="form-check-label">
                        Proof sent to author
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        id="proof_ok"
                        type="checkbox"
                        className="form-check-input"
                        checked={productionForm.author_proof_approved}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            author_proof_approved: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="proof_ok" className="form-check-label">
                        Author approved proof
                      </label>
                    </div>

                    <div className="form-group">
                      <label>ISBN</label>
                      <input
                        className="form-control"
                        value={productionForm.isbn}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            isbn: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>DOI</label>
                      <input
                        className="form-control"
                        value={productionForm.doi}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            doi: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Repository path</label>
                      <input
                        className="form-control"
                        value={productionForm.repository_path}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            repository_path: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button
                      className="btn btn-success mb-3"
                      disabled={saving}
                      onClick={() =>
                        doAction(
                          () => ebookApi.upsertProduction(id, productionForm),
                          "Production metadata saved."
                        )
                      }
                    >
                      Save production
                    </button>

                    <hr />

                    <div className="form-group">
                      <label>Publication slug</label>
                      <input
                        className="form-control"
                        value={publishForm.slug}
                        onChange={(e) =>
                          setPublishForm({
                            ...publishForm,
                            slug: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Access level</label>
                      <select
                        className="form-control"
                        value={publishForm.access_level}
                        onChange={(e) =>
                          setPublishForm({
                            ...publishForm,
                            access_level: e.target.value,
                          })
                        }
                      >
                        <option value="open_access">Open access</option>
                        <option value="restricted">Restricted</option>
                        <option value="embargoed">Embargoed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Embargo until</label>
                      <input
                        type="date"
                        className="form-control"
                        value={publishForm.embargo_until}
                        onChange={(e) =>
                          setPublishForm({
                            ...publishForm,
                            embargo_until: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>License</label>
                      <input
                        className="form-control"
                        value={publishForm.license_name}
                        onChange={(e) =>
                          setPublishForm({
                            ...publishForm,
                            license_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button
                      className="btn btn-outline-success"
                      disabled={saving}
                      onClick={() =>
                        doAction(
                          () => ebookApi.publishSubmission(id, publishForm),
                          "Submission published to the ORA eBook catalog."
                        )
                      }
                    >
                      Publish
                    </button>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
      </>
    );
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">Submission Workflow</h1>
            <p className="text-muted mb-0">
              Full editorial, review, finance, production, and publication workflow.
            </p>
          </div>
          <div>
            <Link
              className="btn btn-outline-secondary"
              to={isAuthorOnlyView ? "/ebook/my-submissions" : "/ebook/submissions"}
            >
              Back
            </Link>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? (
        <div className="card">
          <div className="card-body">Loading workflow...</div>
        </div>
      ) : !data?.submission ? (
        <div className="card">
          <div className="card-body text-muted">Submission not found.</div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-primary card-outline mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title mb-0">Submission Information</h3>
                <div className="d-flex" style={{ gap: 8 }}>
                  {(isAuthorDraft || !isAuthorOnlyView) && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openModal("upload")}
                    >
                      Upload File
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-striped mb-0">
                    <tbody>
                      <tr>
                        <th style={{ width: "220px" }}>Title</th>
                        <td>{data.submission.title || "—"}</td>
                      </tr>
                      <tr>
                        <th>Subtitle</th>
                        <td>{data.submission.subtitle || "—"}</td>
                      </tr>
                      <tr>
                        <th>Abstract</th>
                        <td>{data.submission.abstract || "—"}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>
                          <StatusBadge value={data.submission.status} />
                        </td>
                      </tr>
                      <tr>
                        <th>Author</th>
                        <td>{data.submission.author_name || "—"}</td>
                      </tr>
                      <tr>
                        <th>Editor</th>
                        <td>{data.submission.editor_name || "—"}</td>
                      </tr>
                      <tr>
                        <th>Final Decision</th>
                        <td>{data.submission.final_decision || "—"}</td>
                      </tr>
                      <tr>
                        <th>Keywords</th>
                        <td>
                          {(data.submission.keywords || []).join(", ") || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card card-secondary card-outline mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Files</h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-bordered table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Version</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!(data.files || []).length ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No files uploaded.
                          </td>
                        </tr>
                      ) : (
                        data.files.map((file) => (
                          <tr key={file.file_id}>
                            <td>{file.file_role}</td>
                            <td>{file.original_name}</td>
                            <td>{file.version_no}</td>
                            <td>{file.mime_type || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card card-secondary card-outline mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Review Assignments</h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-bordered table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Reviewer</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!(data.assignments || []).length ? (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
                            No assignments.
                          </td>
                        </tr>
                      ) : (
                        data.assignments.map((item) => (
                          <tr key={item.assignment_id}>
                            <td>{item.reviewer_name || item.reviewer_id}</td>
                            <td>
                              <StatusBadge value={item.status} />
                            </td>
                            <td>{item.due_date || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card card-secondary card-outline mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Reviews</h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-bordered table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Reviewer</th>
                        <th>Recommendation</th>
                        <th>Comments for Author</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!(data.reviews || []).length ? (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
                            No reviews.
                          </td>
                        </tr>
                      ) : (
                        data.reviews.map((item) => (
                          <tr key={item.review_id}>
                            <td>{item.reviewer_name || item.reviewer_id}</td>
                            <td>{item.recommendation || "—"}</td>
                            <td>{item.comments_for_author || "No author comments"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card card-light card-outline mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Actions</h3>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column" style={{ gap: 10 }}>
                  {canAuthor && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => openModal("author")}
                    >
                      Author Actions
                    </button>
                  )}

                  {canEditor && (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => openModal("editor")}
                    >
                      Editor Actions
                    </button>
                  )}

                  {canFinance && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => openModal("finance")}
                    >
                      Finance Actions
                    </button>
                  )}

                  {canProduction && (
                    <button
                      className="btn btn-outline-success"
                      onClick={() => openModal("production")}
                    >
                      Production Actions
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="card card-light card-outline">
              <div className="card-header">
                <h3 className="card-title mb-0">Workflow History</h3>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {!(data.history || []).length ? (
                    <li className="list-group-item text-muted">
                      No workflow history.
                    </li>
                  ) : (
                    data.history.map((item) => (
                      <li className="list-group-item" key={item.history_id}>
                        <div className="font-weight-bold">{item.action}</div>
                        <div>
                          <small>{item.actor_name || item.actor_id || "System"}</small>
                        </div>
                        <div>
                          <small className="text-muted">
                            {item.from_status || "—"} → {item.to_status || "—"}
                          </small>
                        </div>
                        <div className="text-muted small">{item.note || ""}</div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderModal()}
    </MainLayout>
  );
}