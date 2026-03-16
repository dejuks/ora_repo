import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Swal from "sweetalert2";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const REJECTION_CHECKLIST = [
  "Out of scope",
  "Poor language quality",
  "Formatting not compliant",
  "Ethical issues",
  "Insufficient originality",
  "Incomplete submission",
];

export default function ManuscriptListAE() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingManuscript, setRejectingManuscript] = useState(null);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    loadManuscripts();
  }, []);

  const loadManuscripts = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/manuscripts/submitted`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setManuscripts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load manuscripts");
      setManuscripts([]);
    } finally {
      setLoading(false);
    }
  };

  // Confirm before moving to screening
  const moveToScreening = async (m) => {
    const result = await Swal.fire({
      title: 'Move to Screening?',
      text: `Are you sure you want to move "${m.title}" to screening?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Yes, move it'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_BASE_URL}/manuscripts/${m.id}/screening`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire('Success!', `Manuscript "${m.title}" moved to screening`, 'success');
      loadManuscripts();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to move manuscript to screening', 'error');
    }
  };

  const openRejectModal = (m) => {
    setRejectingManuscript(m);
    setRejectReasons([]);
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectComment.trim()) {
      Swal.fire('Warning', 'Rejection comment is required', 'warning');
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_BASE_URL}/manuscripts/${rejectingManuscript.id}/reject`,
        { comment: rejectComment, checklist: rejectReasons },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRejectModalOpen(false);
      Swal.fire('Rejected', `Manuscript "${rejectingManuscript.title}" rejected`, 'success');
      loadManuscripts();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to reject manuscript', 'error');
    }
  };

  /* ============================
     FILE OPEN HANDLER
  ============================ */
  const handleFileOpen = async (file) => {
    try {
      const token = localStorage.getItem('token');
      
      Swal.fire({
        title: 'Opening file...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Try different possible endpoints
      const possibleEndpoints = [
        `${API_BASE_URL}/files/download/${file.file_path?.split('/').pop()}`,
        `${API_BASE_URL}/files/${file.id}`,
        `${API_BASE_URL}/files/view/${file.id}`,
        `${API_BASE_URL}/files/file/${file.id}`,
        `${API_BASE_URL}/download/${file.id}`,
        `${API_BASE_URL}/file/${file.id}`
      ];

      let response = null;
      let successEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          });
          successEndpoint = endpoint;
          break;
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
        }
      }

      if (!response) {
        throw new Error('No working endpoint found for file download');
      }

      console.log('Success with endpoint:', successEndpoint);
      Swal.close();

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error('Error opening file:', err);
      Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to open file',
        text: err.message || 'Please check if the file endpoint is correct',
        footer: 'Check console for more details'
      });
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Submitted Manuscripts</h3>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <table className="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th width="200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : manuscripts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      <i className="fas fa-inbox fa-3x mb-3"></i>
                      <p>No submitted manuscripts found</p>
                    </td>
                  </tr>
                ) : (
                  manuscripts.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title || 'Untitled'}</td>
                      <td>
                        <span className="btn bg-info">{m.status}</span>
                      </td>
                      <td>
                        {m.files && m.files.length > 0 ? (
                          <div className="file-list">
                            {m.files.map((f, index) => (
                              <div key={index} className="mb-1">
                                <button
                                  onClick={() => handleFileOpen(f)}
                                  className="btn btn-link btn-sm p-0 text-decoration-none"
                                  style={{ color: '#0d6efd' }}
                                >
                                  <i className="fas fa-file me-1"></i>
                                  {f.file_type || 'File'} {index + 1}
                                </button>
                                <br />
                                <small className="text-muted">
                                  Uploaded: {f.uploaded_at ? new Date(f.uploaded_at).toLocaleString() : 'N/A'}
                                </small>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">No files</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-1"
                          onClick={() => moveToScreening(m)}
                        >
                          <i className="fas fa-check me-1"></i>
                          Screening
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openRejectModal(m)}
                        >
                          <i className="fas fa-times me-1"></i>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REJECTION MODAL */}
        {rejectModalOpen && rejectingManuscript && (
          <div
            className="modal fade show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Reject Manuscript
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setRejectModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <h6 className="mb-3">{rejectingManuscript.title}</h6>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Rejection Reasons</label>
                    {REJECTION_CHECKLIST.map((r) => (
                      <div className="form-check" key={r}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`check-${r}`}
                          checked={rejectReasons.includes(r)}
                          onChange={(e) =>
                            setRejectReasons((prev) =>
                              e.target.checked
                                ? [...prev, r]
                                : prev.filter((x) => x !== r)
                            )
                          }
                        />
                        <label className="form-check-label" htmlFor={`check-${r}`}>
                          {r}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Rejection Comment <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Provide detailed feedback for the author..."
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setRejectModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={submitRejection}
                    disabled={!rejectComment.trim()}
                  >
                    <i className="fas fa-times me-1"></i>
                    Confirm Reject
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