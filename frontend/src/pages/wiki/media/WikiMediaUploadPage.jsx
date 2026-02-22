// WikiMediaUploadPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../landing/components/Navbar';
import { 
  FaUpload, 
  FaTimes, 
  FaImage, 
  FaVideo, 
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrash,
  FaEdit
} from 'react-icons/fa';

const WikiMediaUploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState({
    article_id: '',
    license: 'CC-BY-SA-4.0',
    alt_text: '',
    caption: ''
  });

  const licenses = [
    { value: 'CC-BY-SA-4.0', label: 'CC BY-SA 4.0' },
    { value: 'CC-BY-4.0', label: 'CC BY 4.0' },
    { value: 'CC0', label: 'Public Domain (CC0)' },
    { value: 'GFDL', label: 'GNU Free Documentation License' },
    { value: 'Copyrighted', label: 'Copyrighted (with permission)' }
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/articles?limit=100');
      const data = await res.json();
      setArticles(data.data?.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('file', uploadedFile);
    formDataToSend.append('article_id', formData.article_id || '');
    formDataToSend.append('license', formData.license);
    formDataToSend.append('alt_text', formData.alt_text);
    formDataToSend.append('caption', formData.caption);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/wiki/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/wiki/media');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return <FaImage style={{color: '#4CAF50'}} />;
      case 'video': return <FaVideo style={{color: '#2196F3'}} />;
      default: return <FaFileAlt style={{color: '#FF9800'}} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div style={styles.successContainer}>
          <div style={styles.successCard}>
            <FaCheckCircle style={styles.successIcon} />
            <h2 style={styles.successTitle}>Upload Successful!</h2>
            <p style={styles.successMessage}>
              Your file has been uploaded successfully.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Upload Media</h1>
          <p style={styles.subtitle}>
            Upload free-license images, videos, and documents to Oromo Wikipedia
          </p>
        </div>

        <div style={styles.content}>
          {/* Upload Form */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Upload New File</h2>
            
            {error && (
              <div style={styles.errorMessage}>
                <FaExclamationTriangle />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* File Upload Area */}
              <div style={styles.uploadArea}>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
                <label htmlFor="file" style={styles.uploadLabel}>
                  {uploadedFile ? (
                    <div style={styles.filePreview}>
                      {getFileIcon(uploadedFile)}
                      <div style={styles.fileInfo}>
                        <span style={styles.fileName}>{uploadedFile.name}</span>
                        <span style={styles.fileSize}>
                          {formatFileSize(uploadedFile.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        style={styles.removeFileButton}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div style={styles.uploadPlaceholder}>
                      <FaUpload style={styles.uploadIcon} />
                      <span style={styles.uploadText}>
                        Click to select or drag and drop
                      </span>
                      <span style={styles.uploadHint}>
                        Images, Videos, Audio, PDF (Max 10MB)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* License Selection */}
              <div style={styles.formGroup}>
                <label style={styles.label}>License *</label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  {licenses.map(license => (
                    <option key={license.value} value={license.value}>
                      {license.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Article Association */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Associated Article (Optional)</label>
                <select
                  name="article_id"
                  value={formData.article_id}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">None - Standalone Media</option>
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alt Text */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Alt Text (Optional)</label>
                <input
                  type="text"
                  name="alt_text"
                  value={formData.alt_text}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Describe the image for accessibility"
                />
              </div>

              {/* Caption */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Caption (Optional)</label>
                <textarea
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="Add a caption for this media"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !uploadedFile}
                  style={{
                    ...styles.submitButton,
                    opacity: loading || !uploadedFile ? 0.6 : 1,
                    cursor: loading || !uploadedFile ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Uploading...' : <><FaUpload /> Upload Media</>}
                </button>
              </div>
            </form>
          </div>

          {/* License Info */}
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>License Information</h3>
            <div style={styles.licenseInfo}>
              <h4>CC BY-SA 4.0</h4>
              <p>You are free to:</p>
              <ul>
                <li>✓ Share — copy and redistribute</li>
                <li>✓ Adapt — remix, transform, build upon</li>
              </ul>
              <p>Under these terms:</p>
              <ul>
                <li>📝 Attribution — You must give credit</li>
                <li>🔗 ShareAlike — Share under same license</li>
              </ul>
            </div>

            <div style={styles.guidelines}>
              <h4>Upload Guidelines</h4>
              <ul>
                <li>Only upload files you own or have permission to use</li>
                <li>Files must be freely licensed</li>
                <li>No copyrighted material without permission</li>
                <li>Maximum file size: 10MB</li>
                <li>Supported formats: Images, Videos, Audio, PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    background: '#f8f9fa'
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    color: '#0F3D2E',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '30px',
  },
  formCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '1.5rem',
    color: '#0F3D2E',
    marginBottom: '25px',
  },
  uploadArea: {
    marginBottom: '25px',
  },
  uploadLabel: {
    display: 'block',
    cursor: 'pointer',
  },
  uploadPlaceholder: {
    border: '2px dashed #C9A227',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    background: '#f8f9fa',
    transition: 'all 0.3s ease',
    ':hover': {
      background: '#f0f3f5',
    },
  },
  uploadIcon: {
    fontSize: '3rem',
    color: '#C9A227',
    marginBottom: '15px',
  },
  uploadText: {
    display: 'block',
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '5px',
  },
  uploadHint: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#999',
  },
  filePreview: {
    border: '2px solid #4CAF50',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: '#f8f9fa',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    display: 'block',
    fontSize: '1rem',
    color: '#333',
    marginBottom: '5px',
  },
  fileSize: {
    fontSize: '0.85rem',
    color: '#999',
  },
  removeFileButton: {
    background: 'none',
    border: 'none',
    color: '#f44336',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '5px',
    ':hover': {
      color: '#d32f2f',
    },
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    ':focus': {
      borderColor: '#C9A227',
    },
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
    ':focus': {
      borderColor: '#C9A227',
    },
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
  actions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    flex: 2,
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
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(201,162,39,0.3)',
    },
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
    transition: 'all 0.3s',
    ':hover': {
      background: '#eaeef2',
    },
  },
  infoCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    height: 'fit-content',
  },
  infoTitle: {
    fontSize: '1.3rem',
    color: '#0F3D2E',
    marginBottom: '20px',
  },
  licenseInfo: {
    marginBottom: '25px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    '& h4': {
      fontSize: '1.1rem',
      color: '#0F3D2E',
      marginBottom: '10px',
    },
    '& p': {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '5px',
    },
    '& ul': {
      margin: '10px 0',
      paddingLeft: '20px',
      '& li': {
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '5px',
      },
    },
  },
  guidelines: {
    '& h4': {
      fontSize: '1.1rem',
      color: '#0F3D2E',
      marginBottom: '10px',
    },
    '& ul': {
      paddingLeft: '20px',
      '& li': {
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '8px',
      },
    },
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  successContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
  },
  successCard: {
    background: 'white',
    padding: '50px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  successIcon: {
    fontSize: '4rem',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '2rem',
    color: '#0F3D2E',
    marginBottom: '10px',
  },
  successMessage: {
    fontSize: '1.1rem',
    color: '#666',
  },
};

export default WikiMediaUploadPage;