import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  fetchInitialScreeningManuscripts,
  rejectManuscriptAPI,
  fetchReviewersAPI,
  assignReviewersAPI,
} from "../../../api/associateEditor.api";

export default function InitialScreeningListAE() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentManuscript, setCurrentManuscript] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadInitialScreening();
  }, []);

  const loadInitialScreening = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInitialScreeningManuscripts();
      setManuscripts(data);
    } catch (err) {
      setError("Failed to load manuscripts");
    } finally {
      setLoading(false);
    }
  };

  const getManuscriptId = (m) =>
    m.uuid || m.manuscript_uuid || m.id || null;

  const handleReject = async (manuscript) => {
    const id = getManuscriptId(manuscript);
    if (!id) return alert("Invalid manuscript ID");

    if (!window.confirm("Reject this manuscript?")) return;

    try {
      await rejectManuscriptAPI(id);
      alert("Manuscript rejected successfully");
      loadInitialScreening();
    } catch {
      alert("Failed to reject manuscript");
    }
  };

  const openAssignModal = async (manuscript) => {
    try {
      setCurrentManuscript(manuscript);
      setSelectedReviewers([]);
      const data = await fetchReviewersAPI();
      setReviewers(data);
      setShowModal(true);
    } catch {
      alert("Failed to load reviewers");
    }
  };

  const assignReviewers = async () => {
    if (!selectedReviewers.length)
      return alert("Select at least one reviewer");

    const id = getManuscriptId(currentManuscript);
    if (!id) return alert("Invalid manuscript ID");

    try {
      setAssigning(true);
      await assignReviewersAPI(id, selectedReviewers);
      alert("Reviewers assigned successfully");
      setShowModal(false);
      loadInitialScreening();
    } catch {
      alert("Failed to assign reviewers");
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  const getStatusBadge = (status) => {
    const map = {
      screening: "badge bg-warning text-dark",
      submitted: "badge bg-info",
      rejected: "badge bg-danger",
      screened: "badge bg-success",
      review: "badge bg-primary",
      under_review: "badge bg-primary",
    };
    return map[status] || "badge bg-secondary";
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h3 className="card-title">Initial Screening Manuscripts</h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={loadInitialScreening}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : manuscripts.length === 0 ? (
              <div className="alert alert-info">No manuscripts found</div>
            ) : (
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th width="280">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manuscripts.map((m, index) => (
                    <tr key={getManuscriptId(m) || index}>
                      <td>{m.title}</td>
                      <td>{m.authors}</td>
                      <td>
                        <span className={getStatusBadge(m.status)}>
                          {m.status}
                        </span>
                      </td>
                      <td>{formatDate(m.submitted_at)}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => openAssignModal(m)}
                          disabled={m.status !== "screening"}
                        >
                          Assign
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(m)}
                          disabled={m.status === "rejected"}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ASSIGN MODAL */}
        {showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Assign Reviewers</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  {currentManuscript && (
                    <div className="mb-3 p-2 bg-light rounded">
                      <strong>Manuscript:</strong>{" "}
                      {currentManuscript.title}
                    </div>
                  )}

                  {reviewers.length === 0 ? (
                    <div className="text-muted">No reviewers found</div>
                  ) : (
                    reviewers.map((r) => (
                      <div className="form-check mb-2" key={r.uuid || r.id}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedReviewers.includes(r.uuid || r.id)}
                          onChange={(e) =>
                            setSelectedReviewers((prev) =>
                              e.target.checked
                                ? [...prev, r.uuid || r.id]
                                : prev.filter(
                                    (id) => id !== (r.uuid || r.id)
                                  )
                            )
                          }
                        />
                        <label className="form-check-label">
                          {r.full_name} ({r.email})
                        </label>
                      </div>
                    ))
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={assignReviewers}
                    disabled={!selectedReviewers.length || assigning}
                  >
                    {assigning
                      ? "Assigning..."
                      : `Assign (${selectedReviewers.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
