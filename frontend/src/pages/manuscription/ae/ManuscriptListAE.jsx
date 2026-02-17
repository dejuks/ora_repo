import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../components/layout/MainLayout";

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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingManuscript, setRejectingManuscript] = useState(null);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    loadManuscripts();
  }, []);

  const loadManuscripts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "http://localhost:5000/api/manuscripts/submitted",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setManuscripts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load manuscripts");
    }
  };

  // Confirm before moving to screening
  const moveToScreening = async (m) => {
    if (!window.confirm(`Are you sure you want to move "${m.title}" to screening?`)) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/manuscripts/${m.id}/screening`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Manuscript "${m.title}" moved to screening`);
      loadManuscripts();
    } catch (err) {
      console.error(err);
      alert("Failed to move manuscript to screening");
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
      alert("Rejection comment is required");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/manuscripts/${rejectingManuscript.id}/reject`,
        { comment: rejectComment, checklist: rejectReasons },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectModalOpen(false);
      alert(`Manuscript "${rejectingManuscript.title}" rejected`);
      loadManuscripts();
    } catch (err) {
      console.error(err);
      alert("Failed to reject manuscript");
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Submitted Manuscripts</h3>
          </div>

          <div className="card-body">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th width="200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {manuscripts.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{m.status_label}</td>
                    <td>
                      {m.files?.length > 0 ? (
                        <ul>
                          {m.files.map((f) => (
                            <li key={f.id}>
                              <a href={`http://localhost:5000/${f.file_path}`} target="_blank" rel="noreferrer">
                                {f.file_name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>No files</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-1"
                        onClick={() => moveToScreening(m)}
                      >
                        Screening
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openRejectModal(m)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Reject Manuscript</h5>
                  <button
                    className="btn-close"
                    onClick={() => setRejectModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <h6>{rejectingManuscript.title}</h6>

                  {REJECTION_CHECKLIST.map((r) => (
                    <div className="form-check" key={r}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={rejectReasons.includes(r)}
                        onChange={(e) =>
                          setRejectReasons((prev) =>
                            e.target.checked
                              ? [...prev, r]
                              : prev.filter((x) => x !== r)
                          )
                        }
                      />
                      <label className="form-check-label">{r}</label>
                    </div>
                  ))}

                  <textarea
                    className="form-control mt-3"
                    rows="4"
                    placeholder="Rejection comment (required)"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setRejectModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={submitRejection}>
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
