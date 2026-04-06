import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getArticles, deleteArticle } from "../../api/wikiArticle.api";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaCalendar,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

function MyDraftArticleList() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles();
      const data = res.data.data || res.data;

      const myDraftArticles = data.filter(
        (a) => a.created_by === currentUser?.uuid && a.status === "draft"
      );

      setArticles(myDraftArticles);
      setFiltered(myDraftArticles);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load draft articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    const result = articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.content?.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(result);
  }, [search, articles]);

  const remove = async (id, title) => {
    const confirm = await Swal.fire({
      title: "Delete Draft?",
      text: title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteArticle(id);
      Swal.fire("Deleted!", "Draft article deleted successfully.", "success");
      fetchArticles();
    } catch {
      Swal.fire("Error", "Failed to delete draft article", "error");
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">My Draft Articles</h2>
            <p className="text-muted mb-0">{filtered.length} draft articles found</p>
          </div>

          <Link to="/wiki/articles/create" className="btn btn-primary">
            <FaPlus className="me-2" />
            New Draft
          </Link>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>

              <input
                className="form-control"
                placeholder="Search my draft articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h6>Total Drafts</h6>
                <h3>{articles.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h6>Total Views</h6>
                <h3>{articles.reduce((sum, a) => sum + (a.view_count || 0), 0)}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-secondary text-white">
              <div className="card-body">
                <h6>Recently Updated</h6>
                <h3>
                  {
                    articles.filter((a) => {
                      if (!a.updated_at) return false;
                      const updated = new Date(a.updated_at);
                      const now = new Date();
                      const diffDays =
                        (now - updated) / (1000 * 60 * 60 * 24);
                      return diffDays <= 7;
                    }).length
                  }
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">My Draft Articles</h5>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5">
                <FaFileAlt className="text-muted mb-3" size={40} />
                <p className="mb-2">No draft articles found</p>

                <Link to="/wiki/articles/create" className="btn btn-primary btn-sm">
                  <FaPlus className="me-2" />
                  Create Draft
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Created</th>
                      <th>Updated</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <div>
                            <strong>{article.title}</strong>
                            <div className="small text-muted">
                              {article.slug || "No slug"}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span>
                            Draft
                          </span>
                        </td>

                        <td>{article.view_count || 0}</td>

                        <td>
                          <FaCalendar className="me-1 text-muted small" />
                          {article.created_at
                            ? new Date(article.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <FaClock className="me-1 text-muted small" />
                          {article.updated_at
                            ? new Date(article.updated_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="text-end">
                          <Link
                            to={`/wiki/articles/${article.slug || article.id}`}
                            className="btn btn-sm btn-outline-info me-1"
                            title="View"
                          >
                            <FaEye />
                          </Link>

                          <Link
                            to={`/wiki/articles/edit/${article.id}`}
                            className="btn btn-sm btn-outline-warning me-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => remove(article.id, article.title)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-footer text-muted small">
            Showing {filtered.length} of {articles.length} draft articles
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MyDraftArticleList;