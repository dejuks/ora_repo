import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getRecentChanges } from "../../api/wikiArticle.api";
import {
  FaHistory,
  FaSearch,
  FaUser,
  FaEdit,
  FaPlus,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

export default function RecentChangesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    changeType: "",
    user: "",
    articleId: "",
  });

  const loadData = async (currentPage = page) => {
    setLoading(true);
    try {
      const res = await getRecentChanges({
        page: currentPage,
        limit: 20,
        ...filters,
      });

      setItems(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (error) {
      console.error("Failed to load recent changes:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [filters.changeType, filters.user, filters.articleId]);

  const getBadge = (type) => {
    if (type === "create") {
      return <span className="badge bg-success"><FaPlus className="me-1" />Create</span>;
    }
    return <span className="badge bg-primary"><FaEdit className="me-1" />Edit</span>;
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <FaHistory className="me-2 text-primary" />
              Recent Changes
            </h2>
            <p className="text-muted mb-0">
              Latest wiki article creation and edit activity
            </p>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Change Type</label>
                <select
                  className="form-select"
                  value={filters.changeType}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, changeType: e.target.value }))
                  }
                >
                  <option value="">All</option>
                  <option value="create">Create</option>
                  <option value="edit">Edit</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">User UUID</label>
                <input
                  className="form-control"
                  placeholder="Filter by user id"
                  value={filters.user}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, user: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Article ID</label>
                <input
                  className="form-control"
                  placeholder="Filter by article id"
                  value={filters.articleId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, articleId: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Change Log</h5>
            <span className="badge bg-secondary">
              {pagination?.total ?? items.length} total
            </span>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No recent changes found
              </div>
            ) : (
              <div className="timeline">
                {items.map((item) => (
                  <div
                    key={item.change_id}
                    className="border rounded p-3 mb-3 bg-light"
                  >
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <div className="mb-2">{getBadge(item.change_type)}</div>

                        <h6 className="mb-1">
                          <Link to={`/wiki/articles/${item.article_slug || item.article_id}`}>
                            <FaFileAlt className="me-2 text-muted" />
                            {item.article_title}
                          </Link>
                        </h6>

                        <div className="small text-muted mb-2">
                          <FaUser className="me-1" />
                          {item.user_name || item.username || "Unknown user"}
                        </div>

                        <div className="small">
                          {item.change_type === "create" ? (
                            <>Article was created</>
                          ) : (
                            <>
                              Revision #{item.version}
                              {item.summary ? ` — ${item.summary}` : ""}
                            </>
                          )}
                        </div>

                        {Array.isArray(item.categories) && item.categories.length > 0 && (
                          <div className="mt-2 d-flex flex-wrap gap-1">
                            {item.categories.map((cat) => (
                              <span key={cat.id} className="badge bg-secondary">
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-muted small">
                        <FaClock className="me-1" />
                        {new Date(item.changed_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => {
                  const next = page - 1;
                  setPage(next);
                  loadData(next);
                }}
              >
                Previous
              </button>

              <span className="small text-muted align-self-center">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  loadData(next);
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}