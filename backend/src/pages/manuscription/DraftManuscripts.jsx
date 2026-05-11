import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import axios from 'axios';

export default function DraftManuscripts() {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      'http://localhost:5000/api/manuscripts/drafts',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDrafts(res.data);
  };

  const deleteDraft = async (id) => {
    if (!window.confirm('Delete this draft?')) return;

    const token = localStorage.getItem('token');
    await axios.delete(
      `http://localhost:5000/api/manuscripts/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-outline card-primary">
          <div className="card-header">
            <h3 className="card-title">Draft Manuscripts</h3>
          </div>

          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(d => (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td>{new Date(d.updated_at).toLocaleString()}</td>
                    <td>
                      <Link
                        to={`/manuscripts/edit/${d.id}`}
                        className="btn btn-warning btn-sm me-1"
                      >
                        Edit
                      </Link>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteDraft(d.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {!drafts.length && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No drafts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
