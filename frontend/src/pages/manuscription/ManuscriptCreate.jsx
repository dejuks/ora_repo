import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createManuscript } from '../../api/manuscript.api';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

export default function ManuscriptCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category_id: '',
    corresponding_author_id: ''
  });

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data));

    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (type) => {
    try {

      let stageId = 1; // Draft

      if (type === 'submitted') {
        stageId = 2; // Submitted
      }

      const payload = {
        ...formData,
        status: type,
        current_stage_id: stageId
      };

      await createManuscript(payload);

      navigate('/journal/manuscripts');

    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error);
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Add Manuscript</h3>
          </div>

          <div className="card-body">
            <form>

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
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
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
                    <option key={u.uuid} value={u.uuid}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => handleSubmit('draft')}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleSubmit('submitted')}
                >
                  Submit Manuscript
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
