import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getPopularArticles } from "../../api/wikiArticle.api";
import {
  FaFire,
  FaEye,
  FaTrophy,
  FaUser,
  FaHistory,
  FaStar,
} from "react-icons/fa";

export default function PopularArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getPopularArticles({ limit: 20 });
setArticles(res.data || []);
    } catch (error) {
      console.error("Failed to load popular articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const trendBadge = (trend) => {
    if (trend === "hot") {
      return <span className="badge bg-danger"><FaFire className="me-1" /> Hot</span>;
    }
    if (trend === "rising") {
      return <span className="badge bg-warning text-dark">Rising</span>;
    }
    return <span className="badge bg-secondary">Normal</span>;
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <FaTrophy className="me-2 text-warning" />
              Popular Articles
            </h2>
            <p className="text-muted mb-0">
              Top wiki articles ranked by total views
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5 text-muted">
              No popular articles found
            </div>
          </div>
        ) : (
          <>
            <div className="row mb-4">
              {articles.slice(0, 3).map((article) => (
                <div className="col-md-4 mb-3" key={article.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-dark fs-6">#{article.rank}</span>
                        {trendBadge(article.trend)}
                      </div>

                      <h5 className="card-title">
                        <Link
                          to={`/wiki/articles/${article.slug || article.id}`}
                          className="text-decoration-none"
                        >
                          {article.title}
                        </Link>
                      </h5>

                      <p className="text-muted small mb-3">
                        {article.excerpt || "No excerpt available"}
                      </p>

                      <div className="small text-muted mb-2">
                        <FaUser className="me-1" />
                        {article.author_display_name ||
                          article.author_name ||
                          article.author_username ||
                          "Unknown"}
                      </div>

                      <div className="d-flex justify-content-between small">
                        <span><FaEye className="me-1" /> {article.view_count} views</span>
                        <span><FaHistory className="me-1" /> {article.revision_count} edits</span>
                      </div>

                      {article.categories?.length > 0 && (
                        <div className="mt-3 d-flex flex-wrap gap-1">
                          {article.categories.slice(0, 3).map((cat) => (
                            <span key={cat.id} className="badge bg-secondary">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">All Popular Rankings</h5>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Rank</th>
                        <th>Article</th>
                        <th>Author</th>
                        <th>Views</th>
                        <th>Revisions</th>
                        <th>Trend</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr key={article.id}>
                          <td>
                            <span className="badge bg-dark">#{article.rank}</span>
                          </td>
                          <td>
                            <div>
                              <Link
                                to={`/wiki/articles/${article.slug || article.id}`}
                                className="fw-semibold text-decoration-none"
                              >
                                {article.title}
                              </Link>
                              {article.is_featured && (
                                <span className="badge bg-warning text-dark ms-2">
                                  <FaStar className="me-1" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {article.author_display_name ||
                              article.author_name ||
                              article.author_username ||
                              "Unknown"}
                          </td>
                          <td>{article.view_count}</td>
                          <td>{article.revision_count}</td>
                          <td>{trendBadge(article.trend)}</td>
                          <td>{new Date(article.updated_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}