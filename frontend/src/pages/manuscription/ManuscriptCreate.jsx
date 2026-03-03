import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { getCategories } from '../../api/manuscript.categories.api';
import axios from 'axios';
import { 
  FaSave, 
  FaPaperPlane, 
  FaFileAlt,
  FaTag,
  FaAlignLeft,
  FaBookOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaInfoCircle,
  FaSpinner,
  FaCloudUploadAlt,
  FaUsers
} from 'react-icons/fa';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function ManuscriptCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);

  // Simplified form data
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    authors: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Calculate validation progress
  useEffect(() => {
    const requiredFields = {
      title: formData.title.length >= 10,
      abstract: formData.abstract.length >= 50,
      authors: formData.authors.length > 0,
      keywords: formData.keywords.length > 0,
      files: uploadedFiles.length > 0
    };
    
    const completed = Object.values(requiredFields).filter(Boolean).length;
    const total = Object.keys(requiredFields).length;
    setValidationProgress(Math.round((completed / total) * 100));
  }, [formData, uploadedFiles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                          file.type === 'application/msword' || 
                          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        setErrors(prev => ({
          ...prev,
          file: 'Only PDF and Word documents are allowed'
        }));
      }
      if (!isValidSize) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 10MB'
        }));
      }
      
      return isValidType && isValidSize;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else if (formData.abstract.length < 50) {
      newErrors.abstract = 'Abstract must be at least 50 characters';
    }

    if (!formData.authors.trim()) {
      newErrors.authors = 'Authors are required';
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = 'Keywords are required';
    }

    if (uploadedFiles.length === 0) {
      newErrors.files = 'Please upload at least one manuscript file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (type) => {
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, form: 'Please fix the errors above' }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();

      // Append files
      uploadedFiles.forEach(file => {
        formDataToSend.append("files", file);
      });

      // Append form fields directly (not as JSON)
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("abstract", formData.abstract.trim());
      formDataToSend.append("keywords", formData.keywords);
      formDataToSend.append("authors", formData.authors.trim());
      formDataToSend.append("status", type);

      // Log what we're sending
      console.log("Sending FormData with fields:", {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        keywords: formData.keywords,
        authors: formData.authors.trim(),
        status: type,
        files: uploadedFiles.length
      });

      const response = await api.post("/manuscripts", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        }
      });

      console.log("Upload response:", response.data);

      setSuccessMessage(
        `Manuscript ${type === 'submitted' ? 'submitted' : 'saved as draft'} successfully!`
      );

      setTimeout(() => {
        navigate('/journal/manuscripts');
      }, 1500);

    } catch (err) {
      console.error("Submission error:", err);
      console.error("Error response:", err.response?.data);

      setErrors({
        submit: err.response?.data?.error || 
                err.response?.data?.message || 
                err.message || 
                "Upload failed. Please try again."
      });

    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <MainLayout>
      <div className="manuscript-create bg-white" style={{ minHeight: '100vh', padding: '30px 0' }}>
        <div className="container-fluid px-4">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="h2 mb-0" style={{ color: '#2c3e50', fontWeight: 600 }}>
                  <FaBookOpen className="mr-3 text-primary" />
                  Submit New Manuscript
                </h1>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/journal/manuscripts')}
                  style={{ borderRadius: '50px', padding: '10px 25px' }}
                >
                  <FaArrowLeft className="mr-2" /> Back to Manuscripts
                </button>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="card border-0 bg-light" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: '#2c3e50', fontWeight: 500 }}>Form Completion</span>
                    <span style={{ color: '#3498db', fontWeight: 600 }}>{validationProgress}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px', background: '#ecf0f1' }}>
                    <div 
                      className="progress-bar bg-success"
                      style={{ width: `${validationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="row">
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-body p-4">
                  {/* Error Display */}
                  {errors.form && (
                    <div className="alert alert-danger d-flex align-items-center" style={{ borderRadius: '8px' }}>
                      <FaExclamationTriangle className="mr-2" size={20} />
                      <div>{errors.form}</div>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="alert alert-danger d-flex align-items-center" style={{ borderRadius: '8px' }}>
                      <FaExclamationTriangle className="mr-2" size={20} />
                      <div>{errors.submit}</div>
                    </div>
                  )}

                  {successMessage && (
                    <div className="alert alert-success d-flex align-items-center" style={{ borderRadius: '8px' }}>
                      <FaCheckCircle className="mr-2" size={20} />
                      <div>{successMessage}</div>
                    </div>
                  )}

                  {/* Title */}
                  <div className="form-group mb-4">
                    <label className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
                      <FaTag className="mr-2 text-primary" />
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter the manuscript title"
                      style={{ borderRadius: '8px' }}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    <small className="text-muted">{formData.title.length}/500 characters</small>
                  </div>

                  {/* Abstract */}
                  <div className="form-group mb-4">
                    <label className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
                      <FaAlignLeft className="mr-2 text-primary" />
                      Abstract <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="abstract"
                      className={`form-control ${errors.abstract ? 'is-invalid' : ''}`}
                      value={formData.abstract}
                      onChange={handleChange}
                      placeholder="Enter the manuscript abstract"
                      rows="6"
                      style={{ borderRadius: '8px' }}
                    />
                    {errors.abstract && <div className="invalid-feedback">{errors.abstract}</div>}
                    <small className="text-muted">{formData.abstract.length}/2000 characters</small>
                  </div>

                  {/* Authors */}
                  <div className="form-group mb-4">
                    <label className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
                      <FaUsers className="mr-2 text-primary" />
                      Authors <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="authors"
                      className={`form-control form-control-lg ${errors.authors ? 'is-invalid' : ''}`}
                      value={formData.authors}
                      onChange={handleChange}
                      placeholder="e.g., John Doe, Jane Smith, Mike Johnson"
                      style={{ borderRadius: '8px' }}
                    />
                    {errors.authors && <div className="invalid-feedback">{errors.authors}</div>}
                    <small className="text-muted">Enter author names separated by commas</small>
                  </div>

                  {/* Keywords */}
                  <div className="form-group mb-4">
                    <label className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
                      <FaTag className="mr-2 text-primary" />
                      Keywords <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      className={`form-control ${errors.keywords ? 'is-invalid' : ''}`}
                      value={formData.keywords}
                      onChange={handleChange}
                      placeholder="e.g., AI, Healthcare, Ethiopia"
                      style={{ borderRadius: '8px' }}
                    />
                    {errors.keywords && <div className="invalid-feedback">{errors.keywords}</div>}
                    <small className="text-muted">Separate keywords with commas (max 10)</small>
                  </div>

                  {/* File Upload */}
                  <div className="form-group mb-4">
                    <label className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
                      <FaCloudUploadAlt className="mr-2 text-primary" />
                      Upload Manuscript Files <span className="text-danger">*</span>
                    </label>
                    
                    {errors.files && (
                      <div className="alert alert-warning py-2" style={{ borderRadius: '6px' }}>
                        <FaExclamationTriangle className="mr-2" />
                        {errors.files}
                      </div>
                    )}

                    <div 
                      className="upload-area text-center p-5"
                      style={{
                        border: '2px dashed #3498db',
                        borderRadius: '8px',
                        background: '#f8f9fa',
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById('fileInput').click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFileUpload(e);
                      }}
                    >
                      <FaCloudUploadAlt size={50} className="text-primary mb-3" />
                      <h5 className="fw-bold" style={{ color: '#2c3e50' }}>Drag and drop files here</h5>
                      <p className="text-muted mb-3">or click to browse</p>
                      <p className="small text-muted">Supported formats: PDF, DOC, DOCX (Max 10MB per file)</p>
                      <input
                        id="fileInput"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="progress" style={{ height: '5px' }}>
                          <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-center mt-2 small">Uploading... {uploadProgress}%</p>
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Uploaded Files</h6>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center p-3 mb-2" style={{ background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                            <div className="d-flex align-items-center">
                              <FaFileAlt className="text-primary mr-3" size={20} />
                              <div>
                                <div className="fw-bold" style={{ color: '#2c3e50' }}>{file.name}</div>
                                <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                              </div>
                            </div>
                            <button type="button" className="btn btn-link text-danger" onClick={() => removeFile(index)}>
                              <FaTimesCircle size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-3">
              {/* Guidelines Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '10px' }}>
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="mb-0 fw-bold"><FaInfoCircle className="mr-2" /> Guidelines</h5>
                </div>
                <div className="card-body p-3">
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex">
                      <FaCheckCircle className="text-success mr-2 mt-1 flex-shrink-0" />
                      <span>Title: min 10 characters</span>
                    </li>
                    <li className="mb-2 d-flex">
                      <FaCheckCircle className="text-success mr-2 mt-1 flex-shrink-0" />
                      <span>Abstract: min 50 characters</span>
                    </li>
                    <li className="mb-2 d-flex">
                      <FaCheckCircle className="text-success mr-2 mt-1 flex-shrink-0" />
                      <span>Authors: comma-separated names</span>
                    </li>
                    <li className="mb-2 d-flex">
                      <FaCheckCircle className="text-success mr-2 mt-1 flex-shrink-0" />
                      <span>Keywords: comma-separated</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Required Fields Card */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-header bg-info text-white py-3">
                  <h5 className="mb-0 fw-bold"><FaCheckCircle className="mr-2" /> Progress</h5>
                </div>
                <div className="card-body p-3">
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Title</span>
                    {formData.title ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Abstract</span>
                    {formData.abstract ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Authors</span>
                    {formData.authors ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Keywords</span>
                    {formData.keywords ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Files</span>
                    {uploadedFiles.length > 0 ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-warning" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg"
                      onClick={() => navigate('/journal/manuscripts')}
                      style={{ borderRadius: '8px', padding: '12px 30px' }}
                    >
                      <FaTimesCircle className="mr-2" /> Cancel
                    </button>
                    
                    <div>
                      <button
                        type="button"
                        className="btn btn-info btn-lg mr-3"
                        onClick={() => handleSubmit('draft')}
                        disabled={submitting}
                        style={{ borderRadius: '8px', padding: '12px 30px' }}
                      >
                        {submitting ? <><FaSpinner className="fa-spin mr-2" /> Saving...</> : <><FaSave className="mr-2" /> Save Draft</>}
                      </button>

                      <button
                        type="button"
                        className="btn btn-success btn-lg"
                        onClick={() => handleSubmit('submitted')}
                        disabled={submitting}
                        style={{ borderRadius: '8px', padding: '12px 30px' }}
                      >
                        {submitting ? <><FaSpinner className="fa-spin mr-2" /> Submitting...</> : <><FaPaperPlane className="mr-2" /> Submit</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}