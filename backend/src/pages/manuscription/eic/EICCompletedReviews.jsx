import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { getCompletedReviewsAPI } from "../../../api/eic.decision.api";

export default function EICCompletedReviews() {
  const navigate = useNavigate();
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCompletedReviewsAPI();
      setManuscripts(data || []);
    } catch (err) {
      console.error("Error loading manuscripts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = manuscripts.filter((m) => {
    const matchesSearch = 
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.author_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.abstract?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && m.status === "review";
    if (filter === "decided") return matchesSearch && m.status === "decision";
    
    return matchesSearch;
  });

  const handleView = (id) => {
    navigate(`/eic/decision/${id}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      review: "badge bg-warning text-dark",
      decision: "badge bg-info",
      accepted: "badge bg-success",
      rejected: "badge bg-danger",
      revision_required: "badge bg-primary"
    };
    return badges[status] || "badge bg-secondary";
  };

  const getRecommendationBadge = (rec) => {
    const badges = {
      accept: "badge bg-success",
      minor_revision: "badge bg-info",
      major_revision: "badge bg-warning",
      reject: "badge bg-danger"
    };
    return badges[rec] || "badge bg-secondary";
  };

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-clipboard-check me-2"></i>
              Manuscripts Ready for Decision
            </h3>
            
            <div className="card-tools d-flex">
              <select
                className="form-control form-control-sm mr-2"
                style={{ width: 150 }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Manuscripts</option>
                <option value="pending">Pending Decision</option>
                <option value="decided">Decided</option>
              </select>
              
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: 200 }}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body table-responsive p-0" style={{ maxHeight: "70vh" }}>
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading manuscripts...</p>
              </div>
            ) : (
              <table className="table table-hover table-striped table-bordered mb-0">
                <thead className="thead-light">
                  <tr>
                    <th width="50">#</th>
                    <th>Title</th>
                    <th width="200">Author</th>
                    <th width="100">Reviews</th>
                    <th width="150">AE Recommendation</th>
                    <th width="120">Status</th>
                    <th width="100">Submitted</th>
                    <th width="100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No manuscripts found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((m, i) => (
                      <tr key={m.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{m.title}</strong>
                          {m.abstract && (
                            <small className="d-block text-muted text-truncate" style={{ maxWidth: '400px' }}>
                              {m.abstract.substring(0, 100)}...
                            </small>
                          )}
                        </td>
                        <td>
                          {m.author_name}
                          <small className="d-block text-muted">{m.author_email}</small>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info" style={{ fontSize: '14px' }}>
                            {m.completed_reviews || 0}/{m.total_reviews || 0}
                          </span>
                        </td>
                        <td>
                          {m.ae_recommendation ? (
                            <span className={getRecommendationBadge(m.ae_recommendation)}>
                              {m.ae_recommendation.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">No recommendation</span>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadge(m.status)}>
                            {m.status_label || m.status}
                          </span>
                        </td>
                        <td>{new Date(m.submitted_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleView(m.id)}
                            title="View & Make Decision"
                          >
                            <i className="fas fa-gavel me-1"></i>
                            Decide
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="card-footer">
            <small className="text-muted">
              Total: {filteredData.length} manuscript(s)
            </small>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}