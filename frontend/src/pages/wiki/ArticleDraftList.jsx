import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getArticles, deleteArticle, updateArticle } from "../../api/wikiArticle.api";
import { Link } from "react-router-dom";

export default function ArticleDraftList() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // NEW: modal state
  const [modalArticle, setModalArticle] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  /* ================= FETCH DRAFTS ================= */
  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await getArticles({ status: "draft" });
      setArticles(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load drafts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  /* ================= DELETE ================= */
  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Draft?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      await deleteArticle(id);
      fetchDrafts();
      Swal.fire("Deleted!", "Draft has been deleted.", "success");
    }
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (article) => {
    setModalArticle(article);
    setModalTitle(article.title);
    setIsModalOpen(true); // show modal
  };

  /* ================= CLOSE MODAL ================= */
  const closeModal = () => {
    setIsModalOpen(false);
    setModalArticle(null);
    setModalTitle("");
  };

  /* ================= SAVE EDIT ================= */
  const saveEdit = async () => {
    if (!modalTitle.trim()) {
      Swal.fire("Error", "Title cannot be empty", "error");
      return;
    }

    try {
      await updateArticle(modalArticle.id, { title: modalTitle });
      Swal.fire("Updated!", "Draft updated successfully", "success");
      fetchDrafts();
      closeModal();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update draft", "error");
    }
  };

  /* ================= FILTER ================= */
  const filtered = articles.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-3">
            <div className="col-md-8">
              <h1 className="m-0 text-dark">
                <i className="fas fa-file-alt mr-2 text-warning"></i>
                Draft Articles
              </h1>
              <p className="text-muted">
                Articles that are still in draft stage
              </p>
            </div>

            <div className="col-md-4 text-right">
              <Link to="/wiki/articles/create" className="btn btn-primary">
                <i className="fas fa-plus mr-1"></i>
                New Draft
              </Link>
            </div>
          </div>

          {/* SEARCH */}
          <div className="card card-warning card-outline mb-4">
            <div className="card-body">
              <input
                className="form-control form-control-lg"
                placeholder="Search drafts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="card card-warning card-outline">
            <div className="card-body p-0">

              {loading ? (
                <div className="text-center py-5">Loading drafts...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5">No draft articles found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Language</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a) => (
                        <tr key={a.id}>
                          <td>{a.title}</td>
                          <td>{a.slug}</td>
                          <td>{a.language}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-info btn-sm mr-1"
                              onClick={() => openEditModal(a)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>

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
{/* ================= EDIT MODAL ================= */}
{isModalOpen && (
  <div className="modal show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header bg-info text-white">
          <h5 className="modal-title">Edit Draft</h5>
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <label>Title</label>
          <input
            type="text"
            className="form-control mb-2"
            value={modalTitle}
            onChange={(e) => setModalTitle(e.target.value)}
          />

          <label>Slug</label>
          <input
            type="text"
            className="form-control mb-2"
            value={modalArticle?.slug || ""}
            onChange={(e) =>
              setModalArticle({ ...modalArticle, slug: e.target.value })
            }
          />

          <label>Language</label>
          <select
            className="form-control"
            value={modalArticle?.language || "om"}
            onChange={(e) =>
              setModalArticle({ ...modalArticle, language: e.target.value })
            }
          >
            <option value="om">Oromo</option>
            <option value="en">English</option>
            <option value="am">Amharic</option>
            {/* Add more languages if needed */}
          </select>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-info"
            onClick={async () => {
              // Save all fields
              if (!modalTitle.trim() || !modalArticle.slug.trim()) {
                Swal.fire("Error", "Title and Slug cannot be empty", "error");
                return;
              }

              try {
                await updateArticle(modalArticle.id, {
                  title: modalTitle,
                  slug: modalArticle.slug,
                  language: modalArticle.language,
                  status: modalArticle.status || "draft", // keep status if any
                });
                Swal.fire("Updated!", "Draft updated successfully", "success");
                fetchDrafts();
                closeModal();
              } catch (err) {
                console.error(err);
                Swal.fire("Error", "Failed to update draft", "error");
              }
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      </section>
    </MainLayout>
  );
}
