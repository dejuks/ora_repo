import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import { createManuscript } from '../../api/manuscript.api';

export default function ManuscriptCreateWithFiles() {
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category_id: '',
    corresponding_author_id: '',
    status: 'submitted',
    current_stage_id: 1
  });

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [manuscriptId, setManuscriptId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('original');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories').then(res => setCategories(res.data));
    axios.get('http://localhost:5000/api/users').then(res => setUsers(res.data));
  }, []);

  const fetchFiles = async (id = manuscriptId) => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/files/manuscript/${id}`);
      setUploadedFiles(res.data);
    } catch (err) {
      console.error("Fetch files error:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create manuscript
  const handleSubmitManuscript = async (e) => {
    e.preventDefault();
    try {
      const res = await createManuscript(formData);
      setManuscriptId(res.id);
      fetchFiles(res.id); // automatically show files section
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !manuscriptId) return;

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('manuscript_id', manuscriptId);
    data.append('file_type', fileType);

    try {
      await axios.post('http://localhost:5000/api/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      fetchFiles(); // refresh the file list
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Create Manuscript & Upload Files</h3>
          </div>

          <div className="card-body">

            {/* ===== Manuscript Form ===== */}
            <form onSubmit={handleSubmitManuscript}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Abstract</label>
                <textarea
                  name="abstract"
                  className="form-control"
                  value={formData.abstract}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category_id"
                  className="form-control"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Corresponding Author</label>
                <select
                  name="corresponding_author_id"
                  className="form-control"
                  value={formData.corresponding_author_id}
                  onChange={handleChange}
                >
                  <option value="">Select author</option>
                  {users.map(u => (
                    <option key={u.uuid} value={u.uuid}>{u.full_name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-success">Create Manuscript</button>
            </form>

            {/* ===== File Upload Section ===== */}
            {manuscriptId && (
              <div className="mt-4">
                <h5>Upload Files</h5>
                <div className="d-flex align-items-center mb-2">
                  <input type="file" onChange={handleFileChange} />
                  <select
                    value={fileType}
                    onChange={e => setFileType(e.target.value)}
                    className="ml-2 form-control"
                    style={{ width: '200px', marginLeft: '10px' }}
                  >
                    <option value="original">Original</option>
                    <option value="revision">Revision</option>
                    <option value="supplementary">Supplementary</option>
                  </select>
                  <button
                    onClick={handleUploadFile}
                    className="btn btn-primary ml-2"
                    style={{ marginLeft: '10px' }}
                  >
                    Upload
                  </button>
                </div>

                <ul>
                  {uploadedFiles.length > 0 ? uploadedFiles.map(f => (
                    <li key={f.id}>
                      <a href={`http://localhost:5000/${f.file_path}`} target="_blank" rel="noreferrer">
                        {f.file_path} ({f.file_type})
                      </a>
                    </li>
                  )) : <li>No files uploaded yet</li>}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
