import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";

export default function EbookReviewerManagerPage() {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // LOAD REVIEWERS
  // =========================
  const loadReviewers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await ebookApi.listReviewerOptions();

      console.log("API RESPONSE:", res); // 👈 DEBUG

      // ✅ FIX HERE
      setReviewers(res?.data || []);

    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to load reviewers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewers();
  }, []);

  // =========================
  // DELETE / REVOKE
  // =========================
  const removeReviewer = async (id) => {
    if (!window.confirm("Delete this reviewer?")) return;

    try {
      await ebookApi.deleteReviewer?.(id);
      setMessage("Reviewer removed successfully");
      loadReviewers();
    } catch (err) {
      console.error(err);
      setError("Failed to remove reviewer");
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h3>Reviewers List</h3>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="text-center p-4">
            <div className="spinner-border text-primary"></div>
            <p>Loading reviewers...</p>
          </div>
        )}

        {/* TABLE */}
        {!loading && (
          <div className="card">
            <div className="card-header">
              All Reviewers
            </div>

            <div className="card-body table-responsive">
              {reviewers.length === 0 ? (
                <p className="text-muted">No reviewers found</p>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reviewers.map((r) => (
                      <tr key={r.uuid}>
                        <td>{r.full_name || "-"}</td>
                        <td>{r.email}</td>
                        <td>{r.role || "reviewer"}</td>
                        <td>
                          {r.active ? "Active" : "Inactive"}
                        </td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeReviewer(r.uuid)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}