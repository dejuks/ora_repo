import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../../components/layout/MainLayout';

const REJECTION_CHECKLIST = [
  'Out of journal scope',
  'Poor language quality',
  'Formatting not compliant',
  'Ethical issues',
  'Insufficient originality',
  'Incomplete submission',
];

export default function ManuscriptListAEScreening() {
  const [manuscripts, setManuscripts] = useState([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  /* ============================
     REJECT MODAL STATE
  ============================ */
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingManuscript, setRejectingManuscript] = useState(null);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    loadManuscripts();
  }, []);

  useEffect(() => {
    let filtered = manuscripts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.author_name.toLowerCase().includes(term)
      );
    }

    setFilteredManuscripts(filtered);
  }, [searchTerm, manuscripts]);

  /* ============================
     LOAD SCREENING MANUSCRIPTS
  ============================ */
  const loadManuscripts = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      'http://localhost:5000/api/journal/ae/screening',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setManuscripts(res.data);
    setFilteredManuscripts(res.data);
  };

  /* ============================
     MOVE TO PEER REVIEW
  ============================ */
  const moveToPeerReview = async (m) => {
    if (!window.confirm('Move manuscript to peer review?')) return;

    const token = localStorage.getItem('token');
    await axios.post(
      `http://localhost:5000/api/manuscripts/${m.id}/peer-review`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    loadManuscripts();
  };

  /* ============================
     REJECTION
  ============================ */
  const openRejectModal = (m) => {
    setRejectingManuscript(m);
    setRejectReasons([]);
    setRejectComment('');
    setRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectComment.trim()) {
      alert('Rejection comment is required');
      return;
    }

    const token = localStorage.getItem('token');
    await axios.post(
      `http://localhost:5000/api/manuscripts/${rejectingManuscript.id}/reject`,
      {
        comment: rejectComment,
        checklist: rejectReasons,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setRejectModalOpen(false);
    loadManuscripts();
  };

  /* ============================
     UI
  ============================ */
  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-outline card-warning">
          <div className="card-header">
            <h3 className="card-title">Screening Manuscripts</h3>
          </div>

          <div className="card-body">
            {/* SEARCH */}
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* TABLE */}
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManuscripts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No manuscripts found
                    </td>
                  </tr>
                ) : (
                  filteredManuscripts.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>{m.author_name}</td>
                      <td>
                        <span className="badge bg-warning">
                          {m.status}
                        </span>
                      </td>
                      <td>{m.stage_name}</td>
                      <td className="d-flex gap-1">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => moveToPeerReview(m)}
                        >
                          Send to Review
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openRejectModal(m)}
                        >
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

        {/* ============================
           REJECT MODAL
        ============================ */}
        {rejectModalOpen && rejectingManuscript && (
          <div
            className="modal fade show d-block"
            style={{ background: 'rgba(0,0,0,.5)' }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5>Reject Manuscript</h5>
                  <button
                    className="btn-close"
                    onClick={() => setRejectModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <h6 className="mb-2">{rejectingManuscript.title}</h6>

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
                      <label className="form-check-label">
                        {r}
                      </label>
                    </div>
                  ))}

                  <hr />

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Detailed rejection comment (required)"
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
                  <button
                    className="btn btn-danger"
                    onClick={submitRejection}
                  >
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
