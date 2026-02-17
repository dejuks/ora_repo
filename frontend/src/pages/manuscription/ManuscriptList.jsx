import React, { useEffect, useState } from 'react';
import { fetchManuscripts, deleteManuscript } from '../../api/manuscript.api';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import { Link } from 'react-router-dom';

export default function ManuscriptList() {
  const [manuscripts, setManuscripts] = useState([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [modalFiles, setModalFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileType, setFileType] = useState('original');

  /* ============================
     LOAD
  ============================ */
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
          m.category_name?.toLowerCase().includes(term) ||
          m.author_name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    setFilteredManuscripts(filtered);
  }, [searchTerm, statusFilter, manuscripts]);

  const loadManuscripts = async () => {
    const res = await fetchManuscripts();
    setManuscripts(res.data);
    setFilteredManuscripts(res.data);
  };

  /* ============================
     DELETE (DRAFT ONLY)
  ============================ */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draft manuscript?')) return;

    await deleteManuscript(id);
    const updated = manuscripts.filter((m) => m.id !== id);
    setManuscripts(updated);
    setFilteredManuscripts(updated);
  };

  /* ============================
     FILE MODAL
  ============================ */
  const openFileModal = async (manuscript) => {
    setSelectedManuscript(manuscript);
    setUploadFiles([]);
    setFileType(manuscript.status === 'rejected' ? 'revision' : 'original');
    setModalOpen(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/files/manuscript/${manuscript.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalFiles(res.data);
    } catch {
      setModalFiles([]);
    }
  };

  const closeModal = () => setModalOpen(false);
  const handleFileChange = (e) => setUploadFiles(e.target.files);

  const handleUploadFiles = async () => {
    if (!uploadFiles.length) return alert('Select at least one file');

    const formData = new FormData();
    [...uploadFiles].forEach((f) => formData.append('files', f));

    formData.append('manuscript_id', selectedManuscript.id);
    formData.append('file_type', fileType);

    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/files/upload', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await axios.get(
      `http://localhost:5000/api/files/manuscript/${selectedManuscript.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setModalFiles(res.data);
    setUploadFiles([]);
  };

  /* ============================
     REVISE & RESUBMIT (REJECTED)
  ============================ */
  const handleResubmit = async (manuscript) => {
    if (!window.confirm('Confirm revise & resubmit?')) return;

    const token = localStorage.getItem('token');
    await axios.post(
      `http://localhost:5000/api/manuscripts/${manuscript.id}/resubmit`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert('Resubmitted successfully');
    loadManuscripts();
  };

  /* ============================
     UI
  ============================ */
  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header d-flex justify-content-between">
            <h3 className="card-title">Manuscripts</h3>
            <Link to="/manuscripts/create" className="btn btn-success btn-sm">
              + Add Manuscript
            </Link>
          </div>

          <div className="card-body">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Files</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManuscripts.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>
                      {m.status}
                      {/* <span className={`badge ${getStatusBadgeClass(m.status)}`}>
                        {m.status}
                      </span> */}
                    </td>
                    <td>{m.stage_name}</td>

                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => openFileModal(m)}
                      >
                        Files
                      </button>
                    </td>

                    {/* 🔐 ACTION RULES */}
                    <td className="d-flex gap-1">
                      {/* EDIT → Draft & Rejected ONLY */}
                      {(m.status === 'draft' || m.status === 'rejected') && (
                        <Link
                          to={`/manuscripts/edit/${m.id}`}
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </Link>
                      )}

                      {/* RESUBMIT → Rejected ONLY */}
                      {m.status === 'rejected' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleResubmit(m)}
                        >
                          Revise & Resubmit
                        </button>
                      )}

                      {/* DELETE → Draft ONLY */}
                      {m.status === 'draft' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(m.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FILE MODAL */}
        {modalOpen && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5>{selectedManuscript?.title}</h5>
                  <button className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <input type="file" multiple onChange={handleFileChange} />
                  <button className="btn btn-success mt-2" onClick={handleUploadFiles}>
                    Upload
                  </button>

                  <hr />
                  {modalFiles.map((f) => (
                    <div key={f.id}>
                      <a href={`http://localhost:5000/${f.file_path}`} target="_blank" rel="noreferrer">
                        {f.file_path.split('/').pop()}
                      </a>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Close
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

/* ============================
   STATUS BADGE
============================ */
function getStatusBadgeClass(status) {
  switch (status) {
    case 'draft':
      return 'badge-secondary';
    case 'submitted':
      return 'badge-info';
    case 'screening':
      return 'badge-warning';
    case 'rejected':
      return 'badge-danger';
    default:
      return 'badge-dark';
  }
}
