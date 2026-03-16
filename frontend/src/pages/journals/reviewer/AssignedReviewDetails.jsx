import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getAssignmentDetailsAPI,
  submitReviewAPI,
  saveReviewDraftAPI,
  getReviewDraftAPI
} from "../../../api/reviewer.api";

function AssignedReviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [reviewData, setReviewData] = useState({
    comments: "",
    recommendation: "",
    file: null
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadAssignmentDetails();
    loadDraft();
  }, [id]);

  const loadAssignmentDetails = async () => {
    try {
      const data = await getAssignmentDetailsAPI(id);
      setAssignment(data);
    } catch (err) {
      console.error("Error loading assignment:", err);
      alert("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      const draft = await getReviewDraftAPI(id);
      if (draft) {
        setReviewData({
          comments: draft.comments || "",
          recommendation: draft.recommendation || "",
          file: draft.file_path || null
        });
      }
    } catch (err) {
      // Silently fail - no draft found
      console.log("No draft found");
    }
  };

 const handleSaveDraft = async () => {
  try {
    setSavingDraft(true);

    const formData = new FormData();
    formData.append("comments", reviewData.comments);
    formData.append("recommendation", reviewData.recommendation);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    await saveReviewDraftAPI(id, formData);

    alert("Draft saved successfully");

  } catch (err) {
    alert("Failed to save draft");
  } finally {
    setSavingDraft(false);
  }
};


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (recommendation) => {
    if (!reviewData.comments.trim()) {
      alert("Please enter your review comments");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData if file is being uploaded
      let submitData = {
        comments: reviewData.comments,
        recommendation: recommendation
      };

      if (selectedFile) {
        // Handle file upload separately if needed
        const formData = new FormData();
        formData.append("comments", reviewData.comments);
        formData.append("recommendation", recommendation);
        formData.append("file", selectedFile);
        await submitReviewAPI(id, formData);
      } else {
        await submitReviewAPI(id, submitData);
      }
      
      alert("Review submitted successfully");
      navigate("/journal/reviewer/assigned");
    } catch (err) {
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge bg-warning",
      accepted: "badge bg-info",
      in_review: "badge bg-primary",
      submitted: "badge bg-success",
      declined: "badge bg-danger"
    };
    return badges[status] || "badge bg-secondary";
  };

  const getWorkflowStep = (status) => {
    const steps = [
      { name: "Submitted", status: "submitted" },
      { name: "Screening", status: "screening" },
      { name: "Peer Review", status: "review" },
      { name: "Revision", status: "revision" },
      { name: "Decision", status: "decision" },
      { name: "Published", status: "published" }
    ];

    return steps.map((step, index) => {
      let badgeClass = "badge bg-secondary";
      let textClass = "text-muted";
      
      if (step.name === "Peer Review") {
        badgeClass = "badge bg-primary";
        textClass = "font-weight-bold";
      }
      
      return (
        <React.Fragment key={step.name}>
          <div className="text-center">
            <span className={badgeClass + " p-3"}>{index + 1}</span>
            <p className={`mt-2 ${textClass}`}>{step.name}</p>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-fill align-self-center">
              <hr />
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <section className="content pt-4">
          <div className="container-fluid text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!assignment) {
    return (
      <MainLayout>
        <section className="content pt-4">
          <div className="container-fluid">
            <div className="alert alert-danger">Assignment not found</div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="content pt-4">
        <div className="container-fluid">

          {/* Breadcrumb */}
          <div className="mb-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/reviewer/assigned">Assigned Reviews</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Review Details
                </li>
              </ol>
            </nav>
          </div>

          {/* ================= TITLE ================= */}
          <div className="mb-4">
            <h2 className="font-weight-bold">
              {assignment.manuscript_title}
            </h2>
            <div className="mt-2">
              <span className={getStatusBadge(assignment.status)}>
                {assignment.status}
              </span>
              {assignment.deadline && (
                <span className="ms-3 text-danger">
                  <i className="fas fa-clock me-1"></i>
                  Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* ================= WORKFLOW PROGRESS ================= */}
          <div className="card">
            <div className="card-body">
              <h5 className="font-weight-bold mb-4">Workflow Progress</h5>
              <div className="d-flex justify-content-between text-center">
                {getWorkflowStep(assignment.manuscript_status)}
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="row mt-4">

            {/* ===== Abstract ===== */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title font-weight-bold">Abstract</h5>
                </div>
                <div className="card-body">
                  <p>{assignment.abstract || "No abstract available"}</p>

                  <hr />

                  <h6 className="font-weight-bold">Manuscript File</h6>
                  {assignment.manuscript_file_path ? (
                    <a
                      href={`http://localhost:5000/${assignment.manuscript_file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-file-pdf me-2"></i>
                      Download Manuscript
                    </a>
                  ) : (
                    <p className="text-muted">No file available</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Details ===== */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title font-weight-bold">Details</h5>
                </div>
                <div className="card-body">

                  <p>
                    <i className="fas fa-user me-2 text-primary"></i>
                    <strong>Authors:</strong><br />
                    {assignment.author_name || "N/A"}
                    {assignment.author_email && (
                      <><br /><small className="text-muted">{assignment.author_email}</small></>
                    )}
                  </p>

                  <hr />

                 

                  <hr />

                  <p>
                    <i className="fas fa-tag me-2 text-primary"></i>
                    <strong>Journal:</strong><br />
                    {assignment.manuscript_title || "N/A"}
                  </p>

                  <hr />

                  <p>
                    <i className="fas fa-calendar me-2 text-primary"></i>
                    <strong>Submitted:</strong><br />
                    {assignment.manuscript_submitted_at 
                      ? new Date(assignment.manuscript_submitted_at).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <hr />

                  <p>
                    <i className="fas fa-clock me-2 text-primary"></i>
                    <strong>Review Deadline:</strong><br />
                    {assignment.deadline 
                      ? new Date(assignment.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <hr />

                  <p>
                    <i className="fas fa-user-edit me-2 text-primary"></i>
                    <strong>Assigned Reviewer:</strong><br />
                    {assignment.reviewer_name  || "N/A"}
                  </p>

                  {assignment.keywords && (
                    <>
                      <hr />
                      <p>
                        <i className="fas fa-tags me-2 text-primary"></i>
                        <strong>Keywords:</strong><br />
                        {assignment.keywords}
                      </p>
                    </>
                  )}

                </div>
              </div>
            </div>

          </div>

          {/* ================= REVIEW ACTION SECTION ================= */}
        
          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title font-weight-bold mb-0">
                Reviewer Decision
              </h5>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSaveDraft}
                disabled={savingDraft}
              >
                {savingDraft ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i> Save Draft
                  </>
                )}
              </button>
            </div>
            <div className="card-body">

              <div className="form-group mb-4">
                <label className="font-weight-bold">Reviewer Comment</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={reviewData.comments}
                  onChange={(e) => setReviewData({...reviewData, comments: e.target.value})}
                  placeholder="Write your detailed review comments here..."
                ></textarea>
                <small className="text-muted">
                  Provide constructive feedback to help the author improve their work.
                </small>
              </div>

              <div className="form-group mb-4">
                <label className="font-weight-bold">Upload Review File (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <small className="text-muted">
                  You can upload a separate file with your review (PDF, DOC, DOCX)
                </small>
              </div>

              <div className="mt-4">
                <label className="font-weight-bold mb-3 d-block">Recommendation</label>
                
                <button
                  className="btn btn-success me-2"
                  onClick={() => handleSubmit("accepted")}
                  disabled={submitting}
                >
                  <i className="fas fa-check me-1"></i> 
                  Accept{assignment.review_status}
                </button>

                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleSubmit("minor_revisions")}
                  disabled={submitting}
                >
                  <i className="fas fa-edit me-1"></i> 
                  Minor Revisions
                </button>

                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleSubmit("major_revisions")}
                  disabled={submitting}
                >
                  <i className="fas fa-edit me-1"></i> 
                  Major Revisions
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleSubmit("reject")}
                  disabled={submitting}
                >
                  <i className="fas fa-times me-1"></i> 
                  Reject
                </button>
              </div>

              {submitting && (
                <div className="mt-3 text-primary">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting review...
                </div>
              )}

            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}

export default AssignedReviewDetails;