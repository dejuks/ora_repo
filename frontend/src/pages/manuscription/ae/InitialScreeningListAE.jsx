import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  fetchInitialScreeningManuscripts,
  screeningAPI,
  rejectManuscriptAPI,
} from "../../../api/associateEditor.api";

export default function InitialScreeningListAE() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScreeningManuscripts();
  }, []);

  const loadScreeningManuscripts = async () => {
    setLoading(true);
    try {
      const data = await fetchInitialScreeningManuscripts();
      setManuscripts(data);
    } catch (err) {
      console.error("Failed to load initial screening manuscripts:", err);
      alert("Failed to load manuscripts");
    } finally {
      setLoading(false);
    }
  };

  const handleScreen = async (id) => {
    if (!window.confirm("Are you sure you want to screen this manuscript?")) return;

    try {
      await screeningAPI(id);
      alert("Manuscript screened successfully");
      loadScreeningManuscripts();
    } catch (err) {
      console.error("Screening error:", err);
      alert("Failed to screen manuscript");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this manuscript?")) return;

    try {
      await rejectManuscriptAPI(id);
      alert("Manuscript rejected successfully");
      loadScreeningManuscripts();
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject manuscript");
    }
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
              <p>Loading manuscripts...</p>
            ) : (
              <table className="table table-bordered table-hover">
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
      </div>
    </MainLayout>
  );
}
