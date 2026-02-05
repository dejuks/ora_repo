import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getArticles, deleteArticle } from "../../api/wikiArticle.api";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles();
      setArticles(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const result = articles.filter((a) =>
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.slug?.toLowerCase().includes(search.toLowerCase()) ||
      a.status?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, articles]);

  /* ================= DELETE ================= */
  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Article?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete",
    });

    if (confirm.isConfirmed) {
      await deleteArticle(id);

      Swal.fire({
        title: "Deleted!",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      fetchArticles();
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status) => {
    const map = {
      draft: "badge-warning",
      published: "badge-success",
      archived: "badge-secondary",
    };

    return (
      <span className={`badge ${map[status] || "badge-info"} p-2`}>
        {status}
      </span>
    );
  };

  /* ================= UI ================= */
  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-4">
            <div className="col-md-8">
              <h1 className="m-0 text-dark">
                <i className="fas fa-book mr-2 text-primary"></i>
                Wiki Articles
              </h1>
              <p className="text-muted">
                Manage Wikipedia content and publications
              </p>
            </div>

            <div className="col-md-4 text-right">
              <Link
                to="/wiki/articles/create"
                className="btn btn-primary btn-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Article
              </Link>
            </div>
          </div>

          {/* SEARCH */}
          <div className="card card-primary card-outline mb-4">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-search mr-1"></i>
                Search Articles
              </h3>
            </div>

            <div className="card-body">
              <input
                className="form-control form-control-lg"
                placeholder="Search by title, slug, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="card card-primary card-outline">
            <div className="card-body p-0">

              {loading ? (
                <div className="text-center py-5">
                  Loading articles...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                  No articles found
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Status</th>
                        <th>Language</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((a) => (
                        <tr key={a.id}>
                          <td>{a.title}</td>
                          <td>{a.slug}</td>
                          <td>{getStatusBadge(a.status)}</td>
                          <td>{a.language}</td>

                          <td className="text-center">
                            <Link
                              to={`/wiki/articles/edit/${a.id}`}
                              className="btn btn-info btn-sm mr-1"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => remove(a.id)}
                            >
                              <i className="fas fa-trash"></i>
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
      </section>
    </MainLayout>
  );
}
