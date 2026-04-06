import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import {
  getArticles,
  deleteArticle,
} from "../../api/wikiArticle.api";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaCalendar,
  FaUser,
} from "react-icons/fa";

function MyArticleList() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // fetch only my articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles();
      const data = res.data.data || res.data;

      const myArticles = data.filter(
        (a) => a.created_by === currentUser?.uuid
      );

      setArticles(myArticles);
      setFiltered(myArticles);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // search filter
  useEffect(() => {
    const result = articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.content?.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(result);
  }, [search, articles]);

  // delete article
  const remove = async (id, title) => {
    const confirm = await Swal.fire({
      title: "Delete Article?",
      text: title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteArticle(id);
      Swal.fire("Deleted!", "", "success");
      fetchArticles();
    } catch {
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">My Articles</h2>
            <p className="text-muted mb-0">
              {filtered.length} articles found
            </p>
          </div>

          <Link
            to="/wiki/articles/create"
            className="btn btn-primary"
          >
            <FaPlus className="me-2" />
            New Article
          </Link>
        </div>

        {/* Search */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>

              <input
                className="form-control"
                placeholder="Search my articles..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h6>Total Articles</h6>
                <h3>{articles.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h6>Published</h6>
                <h3>
                  {
                    articles.filter(
                      (a) => a.status === "published"
                    ).length
                  }
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h6>Drafts</h6>
                <h3>
                  {
                    articles.filter(
                      (a) => a.status === "draft"
                    ).length
                  }
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">My Articles</h5>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5">
                <p>No articles yet</p>

                <Link
                  to="/wiki/articles/create"
                  className="btn btn-primary btn-sm"
                >
                  <FaPlus className="me-2" />
                  Create First Article
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
                      <th className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <strong>
                            {article.title}
                          </strong>
                        </td>

                        <td>
                          <span>
                            {article.status}
                          </span>
                        </td>

                        <td>
                          {article.view_count || 0}
                        </td>

                        <td>
                          <FaCalendar className="me-1 text-muted small" />
                          {new Date(
                            article.created_at
                          ).toLocaleDateString()}
                        </td>

                        <td className="text-end">
                          <Link
                            to={`/wiki/articles/${article.slug}`}
                            className="btn btn-sm btn-outline-info me-1"
                          >
                            <FaEye />
                          </Link>

                          <Link
                            to={`/wiki/articles/edit/${article.id}`}
                            className="btn btn-sm btn-outline-warning me-1"
                          >
                            <FaEdit />
                          </Link>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              remove(
                                article.id,
                                article.title
                              )
                            }
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
        </div>
      </div>
    </MainLayout>
  );
}

export default MyArticleList;