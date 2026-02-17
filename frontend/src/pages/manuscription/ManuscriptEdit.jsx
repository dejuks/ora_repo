import React, { useState, useEffect } from 'react';
import { fetchManuscript, updateManuscript } from '../../api/manuscript.api';
import MainLayout from '../../components/layout/MainLayout';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ManuscriptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category_id: '',
    corresponding_author_id: '',
    status: 'draft',           // Default draft for new manuscript
    current_stage_id: 1        // Usually Draft stage
  });

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchManuscript(id).then(res => setFormData(res.data));

    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data));

    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data));
  }, [id]);

  // Determine if form is editable
  const isEditable = formData.status === 'draft' || formData.status === 'revision';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    try {
      await updateManuscript(id, { ...formData, status: 'draft' });
      alert('Saved as Draft');
      navigate('/journal/manuscripts');
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error || 'Error saving draft');
    }
  };

  // Submit Manuscript
  const handleSubmit = async () => {
    try {
      await updateManuscript(id, { ...formData, status: 'submitted' });
      alert('Manuscript Submitted');
      navigate('/manuscripts');
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error || 'Error submitting manuscript');
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Edit Manuscript</h3>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title || ''}
                onChange={handleChange}
                disabled={!isEditable}
                required
              />
            </div>

            <div className="form-group">
              <label>Abstract</label>
              <textarea
                name="abstract"
                className="form-control"
                value={formData.abstract || ''}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category_id"
                className="form-control"
                value={formData.category_id || ''}
                onChange={handleChange}
                disabled={!isEditable}
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
                value={formData.corresponding_author_id || ''}
                onChange={handleChange}
                disabled={!isEditable}
              >
                <option value="">Select author</option>
                {users.map(u => (
                  <option key={u.uuid} value={u.uuid}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author buttons: Save Draft / Submit */}
            {isEditable && (
              <div className="form-group mt-3">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            )}

            {!isEditable && (
              <p className="text-info mt-3">
                Manuscript cannot be edited at this stage.
              </p>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
