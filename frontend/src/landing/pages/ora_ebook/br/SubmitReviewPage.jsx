// src/pages/ebook/reviewer/SubmitReviewPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SubmitReviewPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const BASE = `${API}/api/oraebook/reviewer`;

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    originality_score: "",
    clarity_score: "",
    methodology_score: "",
    relevance_score: "",
    comments_for_author: "",
    confidential_comments: "",
    recommendation: "",
  });

  const getToken = () => localStorage.getItem("token");

  const headers = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const normalizeAssignment = (res) => {
    const data = res?.data?.data || res?.data || {};
    const ebook = data.ebook || {};
    const author = data.author || {};

    return {
      assignment_id: data.assignment_id || data.id || assignmentId,
      ebook_id: data.ebook_id || ebook.ebook_id || ebook.id || "",
      title: data.title || data.ebook_title || ebook.title || "Untitled eBook",
      author_name:
        data.author_name ||
        data.authorName ||
        author.name ||
        author.full_name ||
        "N/A",
      author_email: data.author_email || author.email || "",
      abstract:
        data.abstract ||
        data.ebook_abstract ||
        ebook.abstract ||
        "No abstract available.",
      keywords: data.keywords || ebook.keywords || "",
      status: data.status || data.assignment_status || "N/A",
    };
  };

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${BASE}/review-assignments/${assignmentId}`,
        { headers: headers() }
      );

      setAssignment(normalizeAssignment(res));
    } catch (err) {
      console.error("Load assignment error:", err);
      setAssignment(null);
      setError(err?.response?.data?.message || "API route not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    if (!assignmentId) {
      setError("Assignment id is missing from URL.");
      setLoading(false);
      return;
    }

    loadAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const payload = {
    originality_score: form.originality_score
      ? Number(form.originality_score)
      : null,
    clarity_score: form.clarity_score ? Number(form.clarity_score) : null,
    methodology_score: form.methodology_score
      ? Number(form.methodology_score)
      : null,
    relevance_score: form.relevance_score
      ? Number(form.relevance_score)
      : null,
    comments_for_author: form.comments_for_author,
    confidential_comments: form.confidential_comments,
    recommendation: form.recommendation,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.recommendation) {
      alert("Recommendation is required.");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        `${BASE}/review-assignments/${assignmentId}/submit-review`,
        payload,
        { headers: headers() }
      );

      alert("Review submitted successfully.");
      navigate("/ebook/reviewer/accepted");
    } catch (err) {
      console.error("Submit review error:", err);
      alert(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ background: "#f4f7fb", minHeight: "100vh" }}>
        <div className="container py-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-2 text-muted">Loading assignment...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
            </div>
          ) : !assignment ? (
            <div className="alert alert-danger">Assignment not found.</div>
          ) : (
            <div className="card shadow-sm rounded-4 border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Submit Review</h5>
              </div>

              <div className="card-body">
                <h4>{assignment.title}</h4>

                <p>
                  <strong>Author:</strong> {assignment.author_name}
                </p>

                <p>
                  <strong>Status:</strong> {assignment.status}
                </p>

                <div className="mb-3">
                  <strong>Abstract:</strong>
                  <div className="border rounded p-3 bg-light mt-2">
                    {assignment.abstract}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {[
                      ["originality_score", "Originality"],
                      ["clarity_score", "Clarity"],
                      ["methodology_score", "Methodology"],
                      ["relevance_score", "Relevance"],
                    ].map(([name, label]) => (
                      <div className="col-md-3 mb-3" key={name}>
                        <label>{label}</label>
                        <input
                          type="number"
                          name={name}
                          min="1"
                          max="5"
                          className="form-control rounded-pill"
                          value={form[name]}
                          onChange={handleChange}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label>Comments for Author</label>
                    <textarea
                      name="comments_for_author"
                      className="form-control"
                      rows="4"
                      value={form.comments_for_author}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Confidential Comments</label>
                    <textarea
                      name="confidential_comments"
                      className="form-control"
                      rows="3"
                      value={form.confidential_comments}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Recommendation *</label>
                    <select
                      name="recommendation"
                      className="form-control rounded-pill"
                      value={form.recommendation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="accept">Accept</option>
                      <option value="minor_revision">Minor Revision</option>
                      <option value="major_revision">Major Revision</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ml-2 rounded-pill px-4"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default SubmitReviewPage;