import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

export default function ManuscriptFiles() {
  const { id } = useParams(); // manuscript id
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('original');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await axios.get(`http://localhost:5000/api/files/manuscript/${id}`);
    setFiles(res.data);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('Select a file first');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('manuscript_id', id);
    formData.append('file_type', fileType);

    try {
      await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error);
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <h3>Upload Files</h3>

        <div className="mb-3">
          <input type="file" onChange={handleFileChange} />
          <select value={fileType} onChange={e => setFileType(e.target.value)} className="ml-2">
            <option value="original">Original</option>
            <option value="revision">Revision</option>
            <option value="supplementary">Supplementary</option>
          </select>
          <button onClick={handleUpload} className="btn btn-success ml-2">Upload</button>
        </div>

        <h5>Uploaded Files</h5>
        <ul>
          {files.map(f => (
            <li key={f.id}>
              <a href={`http://localhost:5000/${f.file_path}`} target="_blank" rel="noreferrer">
                {f.file_path} ({f.file_type})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}
