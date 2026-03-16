// pages/journals/manuscriptions/pages/ManuscriptContributePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../../landing/components/Navbar";
import { FaFilePdf, FaFileWord, FaFileAlt, FaPlus, FaTrash, FaUpload, FaSave, FaPaperPlane } from "react-icons/fa";
import { MdTitle, MdPerson, MdEmail, MdPhone, MdDescription, MdAttachFile } from "react-icons/md";

const API_BASE = process.env.REACT_APP_API_URL || "";

const ManuscriptContributePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    stage_name: "draft",
    status: "draft",
    co_authors: [],
    files: []
  });

  const [currentAuthor, setCurrentAuthor] = useState({
    name: "",
    email: "",
    institution: "",
    orcid: ""
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user) {
      navigate('/journal/author-login?redirect=/manuscripts/contribute');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (e) => {
    setCurrentAuthor({ ...currentAuthor, [e.target.name]: e.target.value });
  };

  const addCoAuthor = () => {
    if (currentAuthor.name && currentAuthor.email) {
      setFormData({
        ...formData,
        co_authors: [...formData.co_authors, currentAuthor]
      });
      setCurrentAuthor({
        name: "",
        email: "",
        institution: "",
        orcid: ""
      });
    }
  };

  const removeCoAuthor = (index) => {
    const updatedAuthors = formData.co_authors.filter((_, i) => i !== index);
    setFormData({ ...formData, co_authors: updatedAuthors });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, files: [...formData.files, ...files] });
  };

  const removeFile = (index) => {
    const updatedFiles = formData.files.filter((_, i) => i !== index);
    setFormData({ ...formData, files: updatedFiles });
  };

  const handleSubmit = async (e, submitType = "draft") => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.title) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.abstract) {
      setError("Abstract is required");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('abstract', formData.abstract);
      submitData.append('keywords', formData.keywords);
      submitData.append('stage_name', submitType === "submit" ? "submitted" : "draft");
      submitData.append('status', submitType === "submit" ? "submitted" : "draft");
      submitData.append('author_name', user.full_name || user.name || "Anonymous");
      submitData.append('author_email', user.email || "");
      submitData.append('author_id', user.id || "");
      submitData.append('co_authors', JSON.stringify(formData.co_authors));

      // Append files
      formData.files.forEach((file, index) => {
        submitData.append(`files`, file);
      });

      const res = await fetch(`${API_BASE}/manuscripts`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit manuscript");
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/journal/author-dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = (e) => handleSubmit(e, "draft");
  const handleSubmitManuscript = (e) => handleSubmit(e, "submit");

  if (success) {
    return (
      <>
        <Navbar />
        <div style={styles.successContainer}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Manuscript Submitted Successfully!</h2>
            <p style={styles.successText}>
              Your manuscript has been submitted and is now under review.
            </p>
            <p style={styles.successSubtext}>
              You will be redirected to your dashboard in a moment...
            </p>
            <button 
              onClick={() => navigate('/journal/author-dashboard')}
              style={styles.successButton}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Submit Your Manuscript</h1>
            <p style={styles.subtitle}>
              Share your research with the academic community. Fill in the details below to submit your manuscript.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Main Form */}
          <form style={styles.form}>
            {/* Basic Information */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <MdTitle style={styles.sectionIcon} />
                Basic Information
              </h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Manuscript Title <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter the full title of your manuscript"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Abstract <span style={styles.required}>*</span>
                </label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleChange}
                  placeholder="Provide a summary of your research (150-250 words)"
                  style={styles.textarea}
                  rows="6"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="Enter keywords separated by commas (e.g., Oromo history, linguistics, culture)"
                  style={styles.input}
                />
                <p style={styles.hint}>Separate keywords with commas</p>
              </div>
            </div>

            {/* Co-authors Section */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <MdPerson style={styles.sectionIcon} />
                Co-authors
              </h2>

              {/* Add Co-author Form */}
              <div style={styles.coAuthorForm}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={currentAuthor.name}
                      onChange={handleAuthorChange}
                      placeholder="Full name"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={currentAuthor.email}
                      onChange={handleAuthorChange}
                      placeholder="Email address"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Institution</label>
                    <input
                      type="text"
                      name="institution"
                      value={currentAuthor.institution}
                      onChange={handleAuthorChange}
                      placeholder="Affiliation/Institution"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ORCID</label>
                    <input
                      type="text"
                      name="orcid"
                      value={currentAuthor.orcid}
                      onChange={handleAuthorChange}
                      placeholder="0000-0000-0000-0000"
                      style={styles.input}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addCoAuthor}
                  style={styles.addButton}
                >
                  <FaPlus style={styles.buttonIcon} />
                  Add Co-author
                </button>
              </div>

              {/* Co-authors List */}
              {formData.co_authors.length > 0 && (
                <div style={styles.coAuthorsList}>
                  <h3 style={styles.listTitle}>Added Co-authors</h3>
                  {formData.co_authors.map((author, index) => (
                    <div key={index} style={styles.coAuthorItem}>
                      <div style={styles.coAuthorInfo}>
                        <p style={styles.coAuthorName}>{author.name}</p>
                        <p style={styles.coAuthorEmail}>{author.email}</p>
                        {author.institution && (
                          <p style={styles.coAuthorInstitution}>{author.institution}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCoAuthor(index)}
                        style={styles.removeButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files Section */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <MdAttachFile style={styles.sectionIcon} />
                Manuscript Files
              </h2>

              {/* File Upload */}
              <div style={styles.fileUploadArea}>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.tex"
                  style={styles.fileInput}
                />
                <label htmlFor="file-upload" style={styles.fileUploadLabel}>
                  <FaUpload style={styles.uploadIcon} />
                  <span>Click to upload files</span>
                  <span style={styles.fileHint}>PDF, DOC, DOCX, TEX (Max 10MB each)</span>
                </label>
              </div>

              {/* Files List */}
              {formData.files.length > 0 && (
                <div style={styles.filesList}>
                  <h3 style={styles.listTitle}>Uploaded Files</h3>
                  {formData.files.map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <div style={styles.fileInfo}>
                        {file.type === 'application/pdf' ? (
                          <FaFilePdf style={styles.fileIconPdf} />
                        ) : file.type.includes('word') ? (
                          <FaFileWord style={styles.fileIconWord} />
                        ) : (
                          <FaFileAlt style={styles.fileIconGeneric} />
                        )}
                        <div>
                          <p style={styles.fileName}>{file.name}</p>
                          <p style={styles.fileSize}>
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={styles.removeFileButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                type="button"
                onClick={handleSaveDraft}
                style={styles.draftButton}
                disabled={loading}
              >
                <FaSave style={styles.buttonIcon} />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handleSubmitManuscript}
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingSpinner}></span>
                ) : (
                  <>
                    <FaPaperPlane style={styles.buttonIcon} />
                    Submit Manuscript
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "2rem",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#0A2F1F",
    margin: "0 0 1rem",
  },

  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },

  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    marginBottom: "2rem",
  },

  errorIcon: {
    fontSize: "1.25rem",
  },

  errorText: {
    color: "#dc2626",
    margin: 0,
  },

  form: {
    background: "white",
    borderRadius: "24px",
    padding: "2.5rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },

  formSection: {
    marginBottom: "2.5rem",
    paddingBottom: "2.5rem",
    borderBottom: "1px solid #e2e8f0",
    ":last-child": {
      borderBottom: "none",
      marginBottom: 0,
      paddingBottom: 0,
    },
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 1.5rem",
  },

  sectionIcon: {
    color: "#C9A227",
    fontSize: "1.5rem",
  },

  formGroup: {
    marginBottom: "1.5rem",
  },

  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },

  label: {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#334155",
    marginBottom: "0.5rem",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s ease",
    ":focus": {
      borderColor: "#C9A227",
      boxShadow: "0 0 0 3px rgba(201, 162, 39, 0.1)",
    },
  },

  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },

  hint: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginTop: "0.5rem",
  },

  // Co-author Section
  coAuthorForm: {
    background: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "16px",
    marginBottom: "1.5rem",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "transparent",
    border: "2px dashed #C9A227",
    borderRadius: "12px",
    color: "#C9A227",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "1rem",
    ":hover": {
      background: "rgba(201, 162, 39, 0.05)",
    },
  },

  coAuthorsList: {
    marginTop: "1.5rem",
  },

  listTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "1rem",
  },

  coAuthorItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "0.75rem",
  },

  coAuthorInfo: {
    flex: 1,
  },

  coAuthorName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 0.25rem",
  },

  coAuthorEmail: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: "0 0 0.25rem",
  },

  coAuthorInstitution: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: 0,
  },

  removeButton: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "0.5rem",
    fontSize: "1rem",
  },

  // File Upload Section
  fileUploadArea: {
    marginBottom: "1.5rem",
  },

  fileInput: {
    display: "none",
  },

  fileUploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "2.5rem",
    background: "#f8fafc",
    border: "2px dashed #e2e8f0",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      borderColor: "#C9A227",
      background: "rgba(201, 162, 39, 0.02)",
    },
  },

  uploadIcon: {
    fontSize: "2rem",
    color: "#C9A227",
  },

  fileHint: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },

  filesList: {
    marginTop: "1.5rem",
  },

  fileItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "0.75rem",
  },

  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  fileIconPdf: {
    color: "#ef4444",
    fontSize: "1.5rem",
  },

  fileIconWord: {
    color: "#2563eb",
    fontSize: "1.5rem",
  },

  fileIconGeneric: {
    color: "#64748b",
    fontSize: "1.5rem",
  },

  fileName: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#0f172a",
    margin: "0 0 0.25rem",
  },

  fileSize: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
  },

  removeFileButton: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "0.5rem",
  },

  // Action Buttons
  actionButtons: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  },

  draftButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: "white",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    color: "#475569",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#f8fafc",
      borderColor: "#94a3b8",
    },
  },

  submitButton: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 25px rgba(10, 47, 31, 0.2)",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },

  buttonIcon: {
    fontSize: "1rem",
  },

  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid white",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  // Success Page
  successContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },

  successCard: {
    background: "white",
    padding: "3rem",
    borderRadius: "32px",
    textAlign: "center",
    maxWidth: "500px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  successIcon: {
    fontSize: "4rem",
    marginBottom: "1.5rem",
  },

  successTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0A2F1F",
    margin: "0 0 1rem",
  },

  successText: {
    fontSize: "1.1rem",
    color: "#475569",
    marginBottom: "0.5rem",
  },

  successSubtext: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "2rem",
  },

  successButton: {
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 25px rgba(10, 47, 31, 0.2)",
    },
  },
};

// Add global styles
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

export default ManuscriptContributePage;