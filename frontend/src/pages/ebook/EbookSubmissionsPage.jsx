// pages/ebook/EbookSubmissionsPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "./mock/ebookMockApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookSubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Get current logged in user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.uuid || user?.id;

  const loadSubmissions = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.listSubmissions({ 
        limit: 100, 
        search: query,
        author_id: userId
      });
      
      // Handle different response structures
      let submissionsData = [];
      
      if (result?.rows && Array.isArray(result.rows)) {
        submissionsData = result.rows;
      } else if (result?.data && Array.isArray(result.data)) {
        submissionsData = result.data;
      } else if (Array.isArray(result)) {
        submissionsData = result;
      }
      
      // Filter by author_id on client side if needed
      if (userId && submissionsData.length > 0) {
        submissionsData = submissionsData.filter(sub => 
          sub.author_id === userId || 
          sub.user_id === userId ||
          sub.created_by === userId
        );
      }
      
      setSubmissions(submissionsData);
      
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError(err?.response?.data?.message || "Failed to load your submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadSubmissions(); 
  }, []);

  // Filter submissions based on search term
  const filtered = submissions.filter(
    (sub) =>
      sub.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSearch = (e) => {
    e.preventDefault();
    loadSubmissions(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    loadSubmissions("");
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-secondary",
      submitted: "bg-primary",
      editor_screening: "bg-info",
      under_review: "bg-warning text-dark",
      revision_requested: "bg-warning text-dark",
      accepted: "bg-success",
      rejected: "bg-danger",
      published: "bg-success"
    };
    return colors[status?.toLowerCase()] || "bg-secondary";
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Draft",
      submitted: "Submitted",
      editor_screening: "Editor Screening",
      under_review: "Under Review",
      revision_requested: "Revision Required",
      accepted: "Accepted",
      rejected: "Rejected",
      published: "Published"
    };
    return labels[status?.toLowerCase()] || status || "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold mb-2">My Submissions</h1>
              <p className="text-muted mb-0">
                View and manage your manuscript submissions
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link 
                to="/ebook/submissions/create" 
                className="btn btn-primary shadow-sm"
              >
                <i className="fas fa-plus me-2"></i>
                New Submission
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Main Card */}
          <div className="card card-outline card-primary shadow">
            
            {/* Card Header with Search */}
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title">
                  <i className="fas fa-list me-2"></i>
                  Your Submissions
                </h3>

                <div className="d-flex gap-2">
                  <div className="input-group" style={{ width: 300 }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        type="button"
                        onClick={clearSearch}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-primary" 
                      type="button"
                      onClick={handleSearch}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body - Clean Table */}
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="text-muted">Loading your submissions...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: "60px" }}>#</th>
                        <th>Title</th>
                        <th style={{ width: "140px" }}>Status</th>
                        <th style={{ width: "100px" }}>Year</th>
                        <th style={{ width: "100px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <i className="fas fa-file-alt fa-3x mb-3 text-muted"></i>
                            <p className="mb-2">No submissions found</p>
                            {searchTerm ? (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={clearSearch}
                              >
                                Clear Search
                              </button>
                            ) : (
                              <Link 
                                to="/ebook/submissions/create" 
                                className="btn btn-sm btn-primary"
                              >
                                Create Your First Submission
                              </Link>
                            )}
                          </td>
                        </tr>
                      )}

                      {currentData.map((row, index) => (
                        <tr key={row.submission_id || row.id || index}>
                          <td className="align-middle text-muted">
                            {indexOfFirst + index + 1}
                          </td>
                          
                          <td className="align-middle">
                            <div className="fw-bold">{row.title || 'Untitled'}</div>
                            <small className="text-muted">
                              Last updated: {formatDate(row.updated_at || row.created_at)}
                            </small>
                          </td>
                          
                          <td className="align-middle">
                            <span
                              className={`badge ${getStatusColor(row.status)}`}
                              style={{
                                minWidth: 110,
                                display: "inline-block",
                                textAlign: "center",
                                padding: "0.5rem 0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: "500",
                                borderRadius: "20px"
                              }}
                            >
                              {getStatusLabel(row.status)}
                            </span>
                          </td>
                          
                          <td className="align-middle">
                            <span className="badge bg-light text-dark px-3 py-2">
                              {row.publication_year || new Date().getFullYear()}
                            </span>
                          </td>
                          
                          <td className="align-middle">
                            <Link
                              to={`/ebook/submissions/${row.submission_id || row.id}`}
                              className="btn btn-sm btn-outline-primary px-3"
                              title="View Details"
                            >
                              <i className="fas fa-eye me-1"></i>
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Card Footer - Pagination */}
            {filtered.length > 0 && (
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    <i className="fas fa-database me-1"></i>
                    Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filtered.length)} of {filtered.length} submissions
                    {searchTerm && (
                      <> for "<span className="fw-bold text-primary">{searchTerm}</span>"</>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <li
                            key={i}
                            className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}