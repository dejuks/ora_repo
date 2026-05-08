// src/pages/reviewer/EbookReviewerReviewPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function EbookReviewerReviewPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [assignment, setAssignment] = useState(null);

  const [form, setForm] = useState({
    originality_score: "",
    clarity_score: "",
    methodology_score: "",
    relevance_score: "",
    recommendation: "",
    comments_for_author: "",
    confidential_comments: "",
  });

  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/oraebook/reviewer/assignments/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignment(res.data.data);

    } catch (error) {
      console.error(error);
      alert("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/oraebook/reviewer/review-assignments/${assignmentId}/submit-review`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Review submitted successfully");

      navigate("/reviewer/pending");

    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!assignment) {
    return (
      <MainLayout>
        <div className="container mt-5">
          <div className="alert alert-danger">
            Assignment not found
          </div>
        </div>
      </MainLayout>
    );
  }

  const fileUrl = assignment.file_path
    ? `${API}/${assignment.file_path}`
    : null;

  return (
    <MainLayout>
      <div className="container-fluid mt-4 mb-5">

        <div className="row">

          {/* LEFT */}
          <div className="col-md-7">

            <div className="card shadow-sm border-0 mb-4">

              <div className="card-header bg-dark text-white">
                <h4 className="mb-0">
                  Review Manuscript
                </h4>
              </div>

              <div className="card-body">

                <h3 className="fw-bold mb-3">
                  {assignment.title}
                </h3>

                <div className="row mb-4">

                  <div className="col-md-4 mb-3">
                    <div className="border rounded p-3 bg-light">
                      <div className="text-muted">
                        Status
                      </div>

                      <strong>
                        {assignment.status}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="border rounded p-3 bg-light">
                      <div className="text-muted">
                        Language
                      </div>

                      <strong>
                        {assignment.language || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="border rounded p-3 bg-light">
                      <div className="text-muted">
                        Publication Year
                      </div>

                      <strong>
                        {assignment.publication_year || "-"}
                      </strong>
                    </div>
                  </div>

                </div>

                <div className="mb-4">
                  <h5>Abstract</h5>

                  <div className="border rounded p-3 bg-light">
                    {assignment.abstract}
                  </div>
                </div>

                {fileUrl && (
                  <div>
                    <h5 className="mb-3">
                      PDF Preview
                    </h5>

                    <iframe
                      src={fileUrl}
                      width="100%"
                      height="700px"
                      title="PDF"
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-md-5">

            <div className="card shadow-sm border-0">

              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  Submit Review
                </h5>
              </div>

              <div className="card-body">

                <form onSubmit={submitReview}>

                  {/* SCORE */}
                  <div className="mb-3">
                    <label className="form-label">
                      Originality Score
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      name="originality_score"
                      value={form.originality_score}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Clarity Score
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      name="clarity_score"
                      value={form.clarity_score}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Methodology Score
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      name="methodology_score"
                      value={form.methodology_score}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Relevance Score
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      name="relevance_score"
                      value={form.relevance_score}
                      onChange={handleChange}
                    />
                  </div>

                  {/* RECOMMENDATION */}
                  <div className="mb-3">
                    <label className="form-label">
                      Recommendation
                    </label>

                    <select
                      className="form-select"
                      name="recommendation"
                      value={form.recommendation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select Recommendation
                      </option>

                      <option value="accept">
                        Accept
                      </option>

                      <option value="minor_revision">
                        Minor Revision
                      </option>

                      <option value="major_revision">
                        Major Revision
                      </option>

                      <option value="reject">
                        Reject
                      </option>
                    </select>
                  </div>

                  {/* COMMENTS */}
                  <div className="mb-3">
                    <label className="form-label">
                      Comments For Author
                    </label>

                    <textarea
                      rows="5"
                      className="form-control"
                      name="comments_for_author"
                      value={form.comments_for_author}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Confidential Comments
                    </label>

                    <textarea
                      rows="5"
                      className="form-control"
                      name="confidential_comments"
                      value={form.confidential_comments}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-success w-100 btn-lg"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>

                </form>

              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}