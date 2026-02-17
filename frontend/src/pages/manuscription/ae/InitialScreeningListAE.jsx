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
                    <th>Submitted At</th>
                    <th>Files</th>
                    <th width="180">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manuscripts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No manuscripts under initial screening
                      </td>
                    </tr>
                  ) : (
                    manuscripts.map((m) => (
                      <tr key={m.id}>
                        <td>{m.title}</td>
                        <td>
                          <span className="badge bg-warning">{m.status}</span>
                        </td>
                        <td>{new Date(m.submitted_at).toLocaleString()}</td>
                        <td>
                          {m.files?.length > 0 ? (
                            <ul className="mb-0">
                              {m.files.map((f) => (
                                <li key={f.id}>
                                  <a
                                    href={`http://localhost:5000/${f.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {f.file_name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted">No files</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-1"
                            onClick={() => handleScreen(m.id)}
                          >
                            Screen
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(m.id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
