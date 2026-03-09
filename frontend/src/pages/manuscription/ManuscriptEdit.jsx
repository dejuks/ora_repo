// pages/journals/manuscriptions/pages/ManuscriptEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Swal from 'sweetalert2';
import axios from 'axios';

import { MdTitle, MdDescription, MdAttachFile } from "react-icons/md";
import { FaBuilding, FaBalanceScale, FaSave, FaPaperPlane, FaFileAlt, FaTag, FaBookOpen, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaArrowLeft, FaInfoCircle, FaSpinner, FaUsers, FaEdit, FaEye } from 'react-icons/fa';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function ManuscriptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    authors: '',
    affiliations: '',
    coverLetter: '',
    ethicalStatement: '',
    status: 'draft'
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);

  // Helper function to safely convert any value to string
  const safeString = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    }
    return String(value);
  };

  // Calculate validation progress
  useEffect(() => {
    // Ensure values are strings
    const title = safeString(formData.title);
    const abstract = safeString(formData.abstract);
    const authors = safeString(formData.authors);
    const keywords = safeString(formData.keywords);

    const requiredFields = {
      title: title.length >= 10,
      abstract: abstract.length >= 50,
      authors: authors.length > 0,
      keywords: keywords.length > 0,
      files: existingFiles.length > 0 || newFiles.length > 0
    };
    
    const completed = Object.values(requiredFields).filter(Boolean).length;
    const total = Object.keys(requiredFields).length;
    setValidationProgress(Math.round((completed / total) * 100));
  }, [formData, existingFiles, newFiles]);

  // Determine if form is editable
  const isEditable = ['draft', 'rejected'].includes(formData?.status);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch manuscript
        const manuscriptRes = await api.get(`/manuscripts/${id}`);
        const manuscript = manuscriptRes.data;
        
        // Safely convert all fields to strings
        setFormData({
          title: safeString(manuscript.title),
          abstract: safeString(manuscript.abstract),
          keywords: safeString(manuscript.keywords),
          authors: safeString(manuscript.authors),
          affiliations: safeString(manuscript.affiliations),
          coverLetter: safeString(manuscript.coverLetter || manuscript.cover_letter),
          ethicalStatement: safeString(manuscript.ethicalStatement || manuscript.ethical_statement),
          status: safeString(manuscript.status) || 'draft'
        });

        // Fetch manuscript files
        try {
          const filesRes = await api.get(`/files/manuscript/${id}`);
          setExistingFiles(Array.isArray(filesRes.data) ? filesRes.data : []);
        } catch (fileErr) {
          console.error('Error loading files:', fileErr);
          setExistingFiles([]);
        }
        
      } catch (err) {
        console.error('Error loading manuscript:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to load manuscript'
        });
        navigate('/journal/manuscripts');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || '' // Ensure we never set null/undefined
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

    setNewFiles(prev => [...prev, ...validFiles]);
    // Clear file error if files are added
    if (validFiles.length > 0 && errors.files) {
      setErrors(prev => ({ ...prev, files: null }));
    }
  };

  const removeExistingFile = (fileId) => {
    setFilesToDelete(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Safely convert to strings
    const title = safeString(formData.title);
    const abstract = safeString(formData.abstract);
    const authors = safeString(formData.authors);
    const keywords = safeString(formData.keywords);

    console.log('Validating - authors:', authors, 'type:', typeof authors); // Debug log

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else if (abstract.length < 50) {
      newErrors.abstract = 'Abstract must be at least 50 characters';
    }

    if (!authors.trim()) {
      newErrors.authors = 'Authors are required';
    }

    if (!keywords.trim()) {
      newErrors.keywords = 'Keywords are required';
    }

    if (existingFiles.length === 0 && newFiles.length === 0) {
      newErrors.files = 'Please upload at least one manuscript file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save as Draft
  const handleSaveDraft = async () => {
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

      // Append new files
      newFiles.forEach(file => {
        formDataToSend.append("newFiles", file);
      });

      // Append files to delete
      filesToDelete.forEach(fileId => {
        formDataToSend.append("filesToDelete", fileId);
      });

      // Append all form fields - safely convert to strings
      formDataToSend.append("title", safeString(formData.title).trim());
      formDataToSend.append("abstract", safeString(formData.abstract).trim());
      formDataToSend.append("keywords", safeString(formData.keywords).trim());
      formDataToSend.append("authors", safeString(formData.authors).trim());
      formDataToSend.append("affiliations", safeString(formData.affiliations).trim());
      formDataToSend.append("coverLetter", safeString(formData.coverLetter).trim());
      formDataToSend.append("ethicalStatement", safeString(formData.ethicalStatement).trim());
      formDataToSend.append("status", 'draft');

      await api.put(`/manuscripts/${id}`, formDataToSend, {
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

      setSuccessMessage('Manuscript saved as draft successfully!');

      setTimeout(() => {
        navigate('/journal/manuscripts');
      }, 1500);

    } catch (err) {
      console.error("Update error:", err);
      setErrors({
        submit: err.response?.data?.error || err.response?.data?.message || err.message || "Update failed. Please try again."
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Submit Manuscript
  const handleSubmit = async () => {
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

      // Append new files
      newFiles.forEach(file => {
        formDataToSend.append("newFiles", file);
      });

      // Append files to delete
      filesToDelete.forEach(fileId => {
        formDataToSend.append("filesToDelete", fileId);
      });

      // Append all form fields - safely convert to strings
      formDataToSend.append("title", safeString(formData.title).trim());
      formDataToSend.append("abstract", safeString(formData.abstract).trim());
      formDataToSend.append("keywords", safeString(formData.keywords).trim());
      formDataToSend.append("authors", safeString(formData.authors).trim());
      formDataToSend.append("affiliations", safeString(formData.affiliations).trim());
      formDataToSend.append("coverLetter", safeString(formData.coverLetter).trim());
      formDataToSend.append("ethicalStatement", safeString(formData.ethicalStatement).trim());
      formDataToSend.append("status", 'submitted');

      await api.put(`/manuscripts/${id}`, formDataToSend, {
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

      setSuccessMessage('Manuscript submitted successfully!');

      setTimeout(() => {
        navigate('/journal/manuscripts');
      }, 1500);

    } catch (err) {
      console.error("Submit error:", err);
      setErrors({
        submit: err.response?.data?.error || err.response?.data?.message || err.message || "Submission failed. Please try again."
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Display existing files
  const renderExistingFiles = () => {
    if (!existingFiles || existingFiles.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h6>Existing Files:</h6>
        <ul className="list-unstyled">
          {existingFiles.map((file) => (
            <li key={file.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
              <span>
                <FaFileAlt className="mr-2 text-primary" />
                {file.filename || file.original_filename || 'Unnamed file'} 
                {file.file_size ? ` (${(file.file_size / 1024).toFixed(2)} KB)` : ''}
              </span>
              {isEditable && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeExistingFile(file.id)}
                >
                  <FaTimesCircle />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Display new files
  const renderNewFiles = () => {
    if (!newFiles || newFiles.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h6>New Files to Upload:</h6>
        <ul className="list-unstyled">
          {newFiles.map((file, index) => (
            <li key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
              <span>
                <FaFileAlt className="mr-2 text-success" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <button 
                type="button" 
                className="btn btn-sm btn-danger"
                onClick={() => removeNewFile(index)}
              >
                <FaTimesCircle />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading manuscript...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="manuscript-edit bg-white" style={{ minHeight: '100vh', padding: '30px 0' }}>
        <div className="container-fluid px-4">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="h2 mb-0" style={{ color: '#2c3e50', fontWeight: 600 }}>
                  <FaEdit className="mr-3 text-primary" />
                  Edit Manuscript
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

          {/* Status Alert */}
          {!isEditable && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info d-flex align-items-center" style={{ borderRadius: '8px' }}>
                  <FaInfoCircle className="mr-2" size={20} />
                  <div>
                    This manuscript cannot be edited at the current stage (<strong>{safeString(formData.status) || 'draft'}</strong>).
                    You can only view the content.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 bg-light" style={{ borderRadius: '10px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ color: '#2c3e50', fontWeight: 500 }}>Uploading...</span>
                      <span style={{ color: '#3498db', fontWeight: 600 }}>{uploadProgress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px', background: '#ecf0f1' }}>
                      <div 
                        className="progress-bar bg-info"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <div className="col-md-4">
              <div className="card border-0 bg-light" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <span className={`badge badge-${getStatusBadgeColor(formData.status)} p-2`}>
                      Status: {safeString(formData.status) || 'draft'}
                    </span>
                    <span className="ml-auto text-muted">
                      ID: {id ? id.substring(0, 8) : ''}...
                    </span>
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

                  {/* Form Fields */}
                  <div className="form-group mb-3">
                    <label className="form-label">
                      <MdTitle className="mr-2" /> Title <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text"
                      name="title"
                      className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      value={safeString(formData.title)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      placeholder="Enter manuscript title"
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    <small className="text-muted">Minimum 10 characters required</small>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">
                      <MdDescription className="mr-2" /> Abstract <span className="text-danger">*</span>
                    </label>
                    <textarea 
                      name="abstract"
                      className={`form-control ${errors.abstract ? 'is-invalid' : ''}`}
                      value={safeString(formData.abstract)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      rows={5}
                      placeholder="Enter manuscript abstract"
                    />
                    {errors.abstract && <div className="invalid-feedback">{errors.abstract}</div>}
                    <small className="text-muted">Minimum 50 characters required</small>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">
                      <FaTag className="mr-2" /> Keywords <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text"
                      name="keywords"
                      className={`form-control ${errors.keywords ? 'is-invalid' : ''}`}
                      value={safeString(formData.keywords)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      placeholder="Enter keywords (comma-separated)"
                    />
                    {errors.keywords && <div className="invalid-feedback">{errors.keywords}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">
                      <FaUsers className="mr-2" /> Authors <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text"
                      name="authors"
                      className={`form-control ${errors.authors ? 'is-invalid' : ''}`}
                      value={safeString(formData.authors)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      placeholder="Enter authors (comma-separated)"
                    />
                    {errors.authors && <div className="invalid-feedback">{errors.authors}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">
                      <FaBuilding className="mr-2" /> Affiliations
                    </label>
                    <input 
                      type="text"
                      name="affiliations"
                      className={`form-control ${errors.affiliations ? 'is-invalid' : ''}`}
                      value={safeString(formData.affiliations)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      placeholder="Enter affiliations (comma-separated)"
                    />
                    {errors.affiliations && <div className="invalid-feedback">{errors.affiliations}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">
                      <FaFileAlt className="mr-2" /> Cover Letter
                    </label>
                    <textarea 
                      name="coverLetter"
                      className={`form-control ${errors.coverLetter ? 'is-invalid' : ''}`}
                      value={safeString(formData.coverLetter)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      rows={4}
                      placeholder="Enter cover letter (optional)"
                    />
                    {errors.coverLetter && <div className="invalid-feedback">{errors.coverLetter}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">
                      <FaBalanceScale className="mr-2" /> Ethical Statement
                    </label>
                    <textarea 
                      name="ethicalStatement"
                      className={`form-control ${errors.ethicalStatement ? 'is-invalid' : ''}`}
                      value={safeString(formData.ethicalStatement)}
                      onChange={handleChange}
                      disabled={!isEditable || submitting}
                      rows={4}
                      placeholder="Enter ethical statement (optional)"
                    />
                    {errors.ethicalStatement && <div className="invalid-feedback">{errors.ethicalStatement}</div>}
                  </div>
                  
                  {/* File Upload */}
                  <div className="form-group mb-3">
                    <label className="form-label">
                      <MdAttachFile className="mr-2" /> Manuscript Files <span className="text-danger">*</span>
                    </label>
                    
                    {renderExistingFiles()}
                    {renderNewFiles()}
                    
                    {isEditable && (
                      <>
                        <input 
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                          onChange={handleFileUpload}
                          disabled={submitting}
                        />
                        {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                        <small className="text-muted">Accepted formats: PDF, DOC, DOCX (Max 10MB per file)</small>
                      </>
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
                    <li className="mb-2 d-flex">
                      <FaCheckCircle className="text-success mr-2 mt-1 flex-shrink-0" />
                      <span>Files: at least one manuscript file</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Required Fields Card */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-header bg-info text-white py-3">
                  <h5 className="mb-0 fw-bold"><FaCheckCircle className="mr-2" /> Required Fields</h5>
                </div>
                <div className="card-body p-3">
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Title</span>
                    {(safeString(formData.title)).length >= 10 ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Abstract</span>
                    {(safeString(formData.abstract)).length >= 50 ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Authors</span>
                    {(safeString(formData.authors)) ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Keywords</span>
                    {(safeString(formData.keywords)) ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Files</span>
                    {(existingFiles.length > 0 || newFiles.length > 0) ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                </div>
              </div>

              {/* Manuscript Info Card */}
              <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '10px' }}>
                <div className="card-header bg-secondary text-white py-3">
                  <h5 className="mb-0 fw-bold"><FaInfoCircle className="mr-2" /> Information</h5>
                </div>
                <div className="card-body p-3">
                  <div className="mb-2">
                    <small className="text-muted d-block">Manuscript ID</small>
                    <code>{id || ''}</code>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Status</small>
                    <span className={`badge badge-${getStatusBadgeColor(formData.status)}`}>
                      {safeString(formData.status) || 'draft'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditable ? (
            <div className="row mt-4">
              <div className="col-12 d-flex justify-content-end">
                <button 
                  className="btn btn-outline-secondary mr-2"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  style={{ borderRadius: '50px', padding: '10px 25px' }}
                >
                  {submitting ? <FaSpinner className="mr-2 spin" /> : <FaSave className="mr-2" />}
                  Save Draft
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ borderRadius: '50px', padding: '10px 25px' }}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="mr-2 spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" /> Submit
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-default ml-2"
                  onClick={() => navigate('/journal/manuscripts')}
                  disabled={submitting}
                  style={{ borderRadius: '50px', padding: '10px 25px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="row mt-4">
              <div className="col-12">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/journal/manuscripts/${id}`)}
                  style={{ borderRadius: '50px', padding: '10px 25px' }}
                >
                  <FaEye className="mr-2" /> View Manuscript
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </MainLayout>
  );
}

// Helper function for status badge colors
const getStatusBadgeColor = (status) => {
  const colors = {
    draft: 'secondary',
    submitted: 'info',
    screening: 'warning',
    under_review: 'primary',
    accepted: 'success',
    rejected: 'danger',
    revision: 'warning',
    payment_pending: 'warning',
    published: 'success'
  };
  return colors[status] || 'secondary';
};