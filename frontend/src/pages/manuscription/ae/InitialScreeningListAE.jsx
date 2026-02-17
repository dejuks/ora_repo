import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  fetchInitialScreeningManuscripts,
  screeningAPI,
  rejectManuscriptAPI,
  fetchReviewersAPI,
  assignReviewersAPI,
} from "../../../api/associateEditor.api";

export default function InitialScreeningListAE() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // reviewer modal
  const [showModal, setShowModal] = useState(false);
  const [currentManuscript, setCurrentManuscript] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  useEffect(() => {
    loadInitialScreening();
  }, []);

  const loadInitialScreening = async () => {
    try {
      setLoading(true);
      const data = await fetchInitialScreeningManuscripts();
      setManuscripts(data);
    } catch (err) {
      alert("Failed to load manuscripts");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SCREEN ================= */
  const handleScreen = async (id) => {
    if (!window.confirm("Mark this manuscript as screened?")) return;
    await screeningAPI(id);
    loadInitialScreening();
  };

  /* ================= REJECT ================= */
  const handleReject = async (id) => {
    if (!window.confirm("Reject this manuscript?")) return;
    await rejectManuscriptAPI(id);
    loadInitialScreening();
  };

  /* ================= ASSIGN REVIEWERS ================= */
  const openAssignModal = async (manuscript) => {
    setCurrentManuscript(manuscript);
    setSelectedReviewers([]);
    const data = await fetchReviewersAPI();
    setReviewers(data);
    setShowModal(true);
  };

  const assignReviewers = async () => {
    if (selectedReviewers.length === 0) {
      alert("Select at least one reviewer");
      return;
    }

    await assignReviewersAPI(currentManuscript.id, selectedReviewers);
    alert("Reviewers assigned successfully");
    setShowModal(false);
    loadInitialScreening();
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-outline card-warning">
          <div className="card-header">
            <h3 className="card-title">Initial Screening Manuscripts</h3>
          </div>

          <div className="card-body">
            {loading ? (
              <p>Loading...</p>
            ) : manuscripts.length === 0 ? (
              <p>No manuscripts</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th width="260">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manuscripts.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>
                        <span className="badge bg-info">{m.status}</span>
                      </td>
                      <td>{new Date(m.submitted_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-1"
                          onClick={() => handleScreen(m.id)}
                        >
                          Screen
                        </button>

                        <button
                          className="btn btn-primary btn-sm me-1"
                          onClick={() => openAssignModal(m)}
                        >
                          Assign Reviewers
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(m.id)}
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

        {/* ================= ASSIGN MODAL ================= */}
        {showModal && (
          <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Assign Reviewers</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>

                <div className="modal-body">
                  {reviewers.map((r) => (
                    <div className="form-check" key={r.uuid}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        onChange={(e) =>
                          setSelectedReviewers((prev) =>
                            e.target.checked
                              ? [...prev, r.uuid]
                              : prev.filter((x) => x !== r.uuid)
                          )
                        }
                      />
                      <label className="form-check-label">
                        {r.full_name} ({r.email})
                      </label>
                    </div>
                  ))}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={assignReviewers}>
                    Assign
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
