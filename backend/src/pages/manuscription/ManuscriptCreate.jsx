import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

import { MdTitle, MdDescription, MdAttachFile } from "react-icons/md";
import { FaBuilding, FaBalanceScale } from "react-icons/fa";
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

export default function ManuscriptCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);

  // Updated form data with all fields
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    authors: '',
    affiliations: '',
    coverLetter: '',
    ethicalStatement: ''
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
    // Clear file error if files are added
    if (validFiles.length > 0 && errors.files) {
      setErrors(prev => ({ ...prev, files: null }));
    }
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

      // Append all form fields
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("abstract", formData.abstract.trim());
      formDataToSend.append("keywords", formData.keywords);
      formDataToSend.append("authors", formData.authors.trim());
      formDataToSend.append("affiliations", formData.affiliations.trim());
      formDataToSend.append("coverLetter", formData.coverLetter.trim());
      formDataToSend.append("ethicalStatement", formData.ethicalStatement.trim());
      formDataToSend.append("status", type);

      // Log what we're sending
      console.log("Sending FormData with fields:", {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        keywords: formData.keywords,
        authors: formData.authors.trim(),
        affiliations: formData.affiliations.trim(),
        coverLetter: formData.coverLetter.trim(),
        ethicalStatement: formData.ethicalStatement.trim(),
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

  // Display uploaded files
  const renderUploadedFiles = () => {
    if (uploadedFiles.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h6>Uploaded Files:</h6>
        <ul className="list-unstyled">
          {uploadedFiles.map((file, index) => (
            <li key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
              <span>
                <FaFileAlt className="mr-2 text-primary" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <button 
                type="button" 
                className="btn btn-sm btn-danger"
                onClick={() => removeFile(index)}
              >
                <FaTimesCircle />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
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
                      value={formData.title}
                      onChange={handleChange}
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
                      value={formData.abstract}
                      onChange={handleChange}
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
                      value={formData.keywords}
                      onChange={handleChange}
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
                      value={formData.authors}
                      onChange={handleChange}
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
                      value={formData.affiliations}
                      onChange={handleChange}
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
                      value={formData.coverLetter}
                      onChange={handleChange}
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
                      value={formData.ethicalStatement}
                      onChange={handleChange}
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
                    <input 
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                      onChange={handleFileUpload}
                    />
                    {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                    {renderUploadedFiles()}
                    <small className="text-muted">Accepted formats: PDF, DOC, DOCX (Max 10MB per file)</small>
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
                    {formData.title.length >= 10 ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Abstract</span>
                    {formData.abstract.length >= 50 ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Authors</span>
                    {formData.authors ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Keywords</span>
                    {formData.keywords ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Files</span>
                    {uploadedFiles.length > 0 ? 
                      <FaCheckCircle className="text-success" /> : 
                      <FaTimesCircle className="text-warning" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-end">
              <button 
                className="btn btn-outline-secondary mr-2"
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
                style={{ borderRadius: '50px', padding: '10px 25px' }}
              >
                <FaSave className="mr-2" /> Save Draft
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleSubmit('submitted')}
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
            </div>
          </div>
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