import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const RevisionRequiredManuscriptPage = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const BASE = `${API}/ebook/manuscripts/revisions`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (e) {
      console.error("Error parsing user:", e);
    }

    loadData(token);
  }, [navigate]);

  const loadData = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle both array and object responses
      const manuscripts = Array.isArray(res.data) ? res.data : res.data?.rows || [];
      setList(manuscripts);
    } catch (err) {
      console.error("Load data error:", err);
      setError(err?.response?.data?.error || err?.message || "Failed to load revision manuscripts");
      
      // Show more detailed error for debugging
      if (err?.response?.status === 500) {
        console.error("Server error details:", err?.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    
    if (!searchLower) return list;
    
    return list.filter(
      (m) =>
        (m.title || "").toLowerCase().includes(searchLower) ||
        (m.isbn || "").toLowerCase().includes(searchLower) ||
        String(m.publication_year || "").includes(searchLower)
    );
  }, [list, search]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "badge badge-secondary";
      case "submitted":
        return "badge badge-primary";
      case "revision_required":
        return "badge badge-warning";
      case "under_review":
        return "badge badge-info";
      case "approved":
        return "badge badge-success";
      case "rejected":
        return "badge badge-danger";
      default:
        return "badge badge-secondary";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "UNKNOWN";
    return status.replace(/_/g, " ").toUpperCase();
  };

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) {
      loadData(token);
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Revision Required Manuscripts</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/ebook/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item active">Revision Required</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Manuscripts Needing Revision</h3>
              <div className="card-tools">
                <div className="input-group input-group-sm" style={{ width: "300px" }}>
                  <input
                    type="text"
                    className="form-control float-right"
                    placeholder="Search by title, ISBN, or year..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-default" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <div className="text-muted">Loading revision manuscripts...</div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <div className="alert alert-danger mx-5">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    {error}
                    <div className="mt-3">
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={handleRetry}
                      >
                        <i className="fas fa-sync-alt mr-1"></i>
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-5">
                  <div className="alert alert-info mx-5">
                    <i className="fas fa-info-circle mr-2"></i>
                    {list.length === 0 
                      ? "No revision-required manuscripts found." 
                      : "No manuscripts match your search criteria."}
                  </div>
                </div>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>ISBN</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.title || "Untitled"}</strong>
                          {m.abstract && (
                          
                            <small className="text-muted">
                              {m.abstract.substring(0, 60)}...
                            </small>
                          )}
                        </td>
                        <td>{m.author_name || m.author?.name || "-"}</td>
                        <td>{m.isbn || "-"}</td>
                        <td>
                          <span className="badge badge-info">
                            {m.publication_year || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(m.status)}>
                            {getStatusText(m.status)}
                          </span>
                          {m.status === "revision_required" && (
                            <span className="badge badge-warning ml-1">
                              <i className="fas fa-clock"></i> Action Required
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/ebook/manuscripts/show/${m.id}`}
                              className="btn btn-info"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>

                            {m.status === "revision_required" && (
                              <>
                                <Link
                                  to={`/ebook/manuscripts/${m.id}/revisions`}
                                  className="btn btn-warning"
                                  title="View Revision Comments"
                                >
                                  <i className="fas fa-comment-dots"></i>
                                </Link>

                                <Link
                                  to={`/ebook/manuscripts/${m.id}/submit-revision`}
                                  className="btn btn-success"
                                  title="Submit Revision"
                                >
                                  <i className="fas fa-upload"></i>
                                </Link>
                              </>
                            )}

                            <Link
                              to={`/ebook/manuscripts/edit/${m.id}`}
                              className="btn btn-primary"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && filteredList.length > 0 && (
              <div className="card-footer clearfix">
                <div className="row">
                  <div className="col-sm-12 col-md-5">
                    <div className="dataTables_info">
                      Showing {filteredList.length} of {list.length} manuscript(s)
                      {filteredList.length !== list.length && " (filtered)"}
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-7">
                    <div className="dataTables_paginate paging_simple_numbers">
                      {/* Add pagination here if needed */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default RevisionRequiredManuscriptPage;