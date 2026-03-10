// CreateArticlePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../landing/components/Navbar';
import { FaSave, FaTimes } from 'react-icons/fa';

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    status: 'draft',
    categories: [],
    is_featured: false
  });

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log("🔍 Token exists:", !!token);
    console.log("🔍 User exists:", !!user);
    
    if (!token || !user) {
      navigate('/wiki/login');
      return;
    }

    // Log token payload for debugging
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("🔍 Token payload:", payload);
    } catch (e) {
      console.error("❌ Invalid token format");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wiki/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      categories: selectedOptions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login first');
        setTimeout(() => navigate('/wiki/login'), 2000);
        return;
      }

      // DEBUG: Log token
      console.log("📤 Token being sent:", token.substring(0, 20) + "...");

      const API_URL = 'http://localhost:5000/api/wiki/articles';
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log("📥 Response status:", res.status);

      const data = await res.json();
      console.log("📥 Response data:", data);

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      navigate(`/wiki/article/${data.data.slug}`);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Article</h1>
          <p style={styles.subtitle}>Share your knowledge with the Oromo Wikipedia community</p>
        </div>

     
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter article title"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Write your article content here..."
              rows={15}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Edit Summary</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              style={styles.input}
              placeholder="Briefly describe your changes"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Categories</label>
              <select
                multiple
                name="categories"
                value={formData.categories}
                onChange={handleCategoryChange}
                style={styles.select}
                size={5}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <small style={styles.helpText}>Hold Ctrl/Cmd to select multiple</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="draft">Draft</option>
                <option value="pending">Submit for Review</option>
                <option value="published">Publish</option>
              </select>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>Mark as featured article</span>
            </label>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.cancelButton}
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? 'Creating...' : <><FaSave /> Create Article</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    color: '#0F3D2E',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
  },
  form: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    background: 'white',
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#999',
    fontSize: '0.85rem',
  },
  checkboxGroup: {
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #C9A227 0%, #B38F1F 100%)',
    color: '#0F3D2E',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    background: '#f8f9fa',
    color: '#666',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
};

export default CreateArticlePage;