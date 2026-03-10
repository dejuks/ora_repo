// pages/ebooks/UpdateEbook.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EbookForm from "./EbookForm";

export default function UpdateEbook() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchEbook();
  }, [id]);

  const fetchEbook = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/ebooks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setEbook(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load ebook");
      console.error("Error fetching ebook:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    
    try {
      const url = `http://localhost:5000/api/ebooks/${id}`;
      
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        navigate("/ebooks", { 
          state: { 
            message: "Ebook updated successfully!",
            type: "success"
          } 
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error updating ebook:", err);
      alert("Failed to update ebook. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm("Are you sure you want to delete this version?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/ebooks/${id}/versions/${versionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Refresh ebook data
        fetchEbook();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error deleting version:", err);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3">Loading ebook details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>Error</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate("/ebooks")}
          >
            Back to Ebooks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-warning text-white shadow-lg border-0">
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="mr-3">
                    <i className="fas fa-edit fa-3x opacity-75"></i>
                  </div>
                  <div>
                    <h2 className="mb-1">Edit Ebook</h2>
                    <p className="mb-0 opacity-75">
                      Update ebook details, metadata, and files
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`badge badge-${ebook.status === 'published' ? 'success' : 
                                                    ebook.status === 'accepted' ? 'info' :
                                                    ebook.status === 'under_review' ? 'warning' : 'secondary'} 
                                                    badge-pill px-3 py-2`}>
                    {ebook.status === 'draft' && '📝 Draft'}
                    {ebook.status === 'under_review' && '🔍 Under Review'}
                    {ebook.status === 'accepted' && '✅ Accepted'}
                    {ebook.status === 'published' && '📚 Published'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs card-header-tabs" style={{ borderBottom: 'none' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
                style={{ 
                  border: 'none',
                  borderBottom: activeTab === 'details' ? '3px solid #C9A227' : '3px solid transparent',
                  fontWeight: activeTab === 'details' ? '600' : '400'
                }}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Details
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'versions' ? 'active' : ''}`}
                onClick={() => setActiveTab('versions')}
                style={{ 
                  border: 'none',
                  borderBottom: activeTab === 'versions' ? '3px solid #C9A227' : '3px solid transparent',
                  fontWeight: activeTab === 'versions' ? '600' : '400'
                }}
              >
                <i className="fas fa-history mr-2"></i>
                Version History
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
                style={{ 
                  border: 'none',
                  borderBottom: activeTab === 'preview' ? '3px solid #C9A227' : '3px solid transparent',
                  fontWeight: activeTab === 'preview' ? '600' : '400'
                }}
              >
                <i className="fas fa-eye mr-2"></i>
                Preview
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-md-10 mx-auto">
          {activeTab === 'details' && (
            <div className="card shadow">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-edit mr-2 text-primary"></i>
                  Edit Ebook Information
                </h5>
                <small className="text-muted">
                  Last updated: {new Date(ebook.updated_at).toLocaleString()}
                </small>
              </div>
              <div className="card-body p-4">
                <EbookForm 
                  initialData={ebook} 
                  onSubmit={handleSubmit} 
                />
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="card shadow">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="fas fa-history mr-2 text-info"></i>
                  Version History
                </h5>
              </div>
              <div className="card-body">
                {ebook.file_versions && ebook.file_versions.length > 0 ? (
                  <div className="timeline">
                    {ebook.file_versions.map((version, index) => (
                      <div key={version.id} className="timeline-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex">
                            <div className="mr-3">
                              <div className={`rounded-circle ${version.is_current ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center`} 
                                   style={{ width: '40px', height: '40px' }}>
                                <i className={`fas ${version.is_current ? 'fa-check' : 'fa-file'}`}></i>
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-1">
                                Version {version.version}
                                {version.is_current && (
                                  <span className="badge badge-success ml-2">Current</span>
                                )}
                              </h6>
                              <p className="mb-1">{version.file_name}</p>
                              <small className="text-muted">
                                Uploaded by {version.uploaded_by_name} on {new Date(version.uploaded_at).toLocaleString()}
                                {' • '}{(version.file_size / 1024 / 1024).toFixed(2)} MB
                              </small>
                            </div>
                          </div>
                          <div>
                            {!version.is_current && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteVersion(version.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                        {index < ebook.file_versions.length - 1 && (
                          <hr className="my-3" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No version history available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="card shadow">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="fas fa-eye mr-2 text-primary"></i>
                  Ebook Preview
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    {ebook.cover_image ? (
                      <img 
                        src={`http://localhost:5000/${ebook.cover_image}`}
                        alt={ebook.title}
                        className="img-fluid rounded shadow"
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center rounded" 
                           style={{ height: '300px' }}>
                        <i className="fas fa-book fa-4x text-muted"></i>
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <h3>{ebook.title}</h3>
                    <p className="text-muted mb-3">
                      <i className="fas fa-language mr-2"></i>Language: {ebook.language === 'om' ? 'Afaan Oromoo' : ebook.language === 'en' ? 'English' : 'Amharic'}
                      {ebook.page_count && (
                        <> • <i className="fas fa-file-alt mr-2"></i>{ebook.page_count} pages</>
                      )}
                    </p>
                    
                    <h6>Abstract</h6>
                    <p>{ebook.abstract || 'No abstract provided'}</p>
                    
                    {ebook.keywords && ebook.keywords.length > 0 && (
                      <>
                        <h6 className="mt-3">Keywords</h6>
                        <div>
                          {ebook.keywords.map((keyword, idx) => (
                            <span key={idx} className="badge badge-secondary mr-2 px-3 py-2">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {ebook.manuscript_file && (
                      <div className="mt-4">
                        <a 
                          href={`http://localhost:5000/api/ebooks/${ebook.id}/download`}
                          className="btn btn-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download Manuscript
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {submitting && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Updating ebook...</p>
        </div>
      )}
    </div>
  );
}