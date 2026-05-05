import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const initialForm = {
  title: "",
  abstract: "",
  isbn: "",
  language: "English",
  publication_year: "",
  status: "draft",
};

const ManuscriptPage = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Use the correct endpoint for user's own manuscripts
  const BASE = `${API}/ebook/manuscripts/my-manuscripts`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (e) {
      console.error("Error parsing user:", e);
    }

    loadData(token);
  }, []);

  const loadData = async (token) => {
    try {
      setLoading(true);
      // Get only user's own manuscripts
      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(Array.isArray(res.data) ? res.data : res.data?.rows || []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to load manuscripts");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setFile(null);
    setEditId(null);
  };

  const openCreatePanel = () => {
    resetForm();
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    resetForm();
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !editId) {
      alert("Please upload a file");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (file) {
      formData.append("file", file);
    }

    // Add author_id to associate with current user
    if (user?.uuid) {
      formData.append("author_id", user.uuid);
    }

    try {
      setSubmitting(true);

      if (editId) {
        await axios.put(`${API}/ebook/manuscripts/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Updated successfully");
      } else {
        await axios.post(`${API}/ebook/manuscripts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Created successfully");
      }

      closePanel();
      loadData(token);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (m) => {
    // Verify ownership before editing
    if (m.author_id !== user?.uuid) {
      alert("You can only edit your own manuscripts");
      return;
    }

    setForm({
      title: m.title || "",
      abstract: m.abstract || "",
      isbn: m.isbn || "",
      language: m.language || "English",
      publication_year: m.publication_year || "",
      status: m.status || "draft",
    });
    setFile(null);
    setEditId(m.id);
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    const manuscriptToDelete = list.find(m => m.id === id);
    
    // Verify ownership before deleting
    if (manuscriptToDelete?.author_id !== user?.uuid) {
      alert("You can only delete your own manuscripts");
      return;
    }

    if (!window.confirm("Delete this manuscript?")) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API}/ebook/manuscripts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData(token);
      alert("Deleted successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  const filteredList = useMemo(() => {
  const q = search.toLowerCase().trim();

  return list
    .filter((m) => m.status === "draft") // ✅ ONLY DRAFT
    .filter((m) => {
      const title = (m.title || "").toLowerCase();
      const isbn = (m.isbn || "").toLowerCase();
      const year = String(m.publication_year || "");
      return title.includes(q) || isbn.includes(q) || year.includes(q);
    });
}, [list, search]);

  const stats = useMemo(() => {
    return {
      total: list.length,
      draft: list.filter((m) => m.status === "draft").length,
      submitted: list.filter((m) => m.status === "submitted").length,
      thisYear: list.filter(
        (m) => String(m.publication_year || "") === String(new Date().getFullYear())
      ).length,
    };
  }, [list]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return {
          bg: "rgba(108,117,125,0.12)",
          color: "#6c757d",
          label: "DRAFT",
        };
      case "submitted":
        return {
          bg: "rgba(13,110,253,0.12)",
          color: "#0d6efd",
          label: "SUBMITTED",
        };
      case "approved":
        return {
          bg: "rgba(25,135,84,0.12)",
          color: "#198754",
          label: "APPROVED",
        };
      case "revision_required":
        return {
          bg: "rgba(255,193,7,0.18)",
          color: "#b58100",
          label: "REVISION REQUIRED",
        };
      default:
        return {
          bg: "rgba(33,37,41,0.10)",
          color: "#212529",
          label: (status || "UNKNOWN").toUpperCase(),
        };
    }
  };

  return (
    <MainLayout>
      <div
        style={{
          background: "linear-gradient(180deg, #f5f7fb 0%, #eef2f9 100%)",
          minHeight: "100vh",
        }}
      >
        <div className="container-fluid py-4">
          {/* Hero Header */}
          <div
            className="rounded-4 shadow-sm overflow-hidden mb-4"
            style={{
              background:
                "linear-gradient(135deg, #0d6efd 0%, #4f46e5 50%, #7c3aed 100%)",
            }}
          >
            <div className="p-4 p-md-5 text-white">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
                <div>
                  <div
                    className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3"
                    style={{
                      background: "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <i className="fas fa-pen-nib mr-2"></i>
                    <span className="font-weight-bold">ORA eBook Publishing</span>
                  </div>

                  <h2 className="mb-2 font-weight-bold">My Manuscripts</h2>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                    Manage your own manuscripts, update metadata, and prepare files before submission.
                  </p>
                </div>

                <div>
                  <button
                    className="btn btn-light btn-lg rounded-pill px-4 shadow-sm"
                    onClick={openCreatePanel}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Manuscript
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Only showing user's own stats */}
          <div className="row mb-4">
            

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                    style={{
                      width: 58,
                      height: 58,
                      background: "rgba(108,117,125,0.12)",
                      color: "#6c757d",
                    }}
                  >
                    <i className="fas fa-file-alt fa-lg"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Draft Status</div>
                    <div className="h4 mb-0 font-weight-bold">{stats.draft}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                    style={{
                      width: 58,
                      height: 58,
                      background: "rgba(25,135,84,0.12)",
                      color: "#198754",
                    }}
                  >
                    <i className="fas fa-calendar-alt fa-lg"></i>
                  </div>
                  <div>
                    <div className="text-muted small">This Year</div>
                    <div className="h4 mb-0 font-weight-bold">{stats.thisYear}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search + Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 px-4 pt-4 pb-3">
              <div className="row align-items-center">
                <div className="col-md-6 mb-3 mb-md-0">
                  <div>
                    <h4 className="mb-1 font-weight-bold">My Manuscripts</h4>
                   
                  </div>
                </div>

                <div className="col-md-6">
                  <div
                    className="input-group shadow-sm"
                    style={{
                      borderRadius: "999px",
                      overflow: "hidden",
                      border: "1px solid #e9edf5",
                    }}
                  >
                    <div className="input-group-prepend">
                      <span
                        className="input-group-text border-0 bg-white"
                        style={{ paddingLeft: "1rem" }}
                      >
                        <i className="fas fa-search text-muted"></i>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search by title, ISBN, or publication year..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ height: "48px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status"></div>
                  <div className="text-muted">Loading your manuscripts...</div>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 82,
                      height: 82,
                      background: "rgba(13,110,253,0.10)",
                      color: "#0d6efd",
                    }}
                  >
                    <i className="fas fa-folder-open fa-2x"></i>
                  </div>
                  <h4 className="font-weight-bold">No manuscripts found</h4>
                  <p className="text-muted mb-4">
                    You haven't created any manuscripts yet. Create your first manuscript to get started.
                  </p>
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={openCreatePanel}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Manuscript
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        <th className="border-0 px-4 py-3">Title</th>
                        {/* <th className="border-0 py-3">ISBN</th> */}
                        <th className="border-0 py-3">Language</th>
                        <th className="border-0 py-3">Year</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((m) => {
                        const badge = getStatusBadgeClass(m.status);
                        // Only show edit/delete if user owns this manuscript
                        const isOwner = m.author_id === user?.uuid;

                        return (
                          <tr key={m.id}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-start">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    background:
                                      "linear-gradient(135deg, #0d6efd, #7c3aed)",
                                    color: "#fff",
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="fas fa-file-alt"></i>
                                </div>
                                <div>
                                  <div className="font-weight-bold">{m.title}</div>
                                  <div
                                    className="text-muted small text-truncate"
                                    style={{ maxWidth: "320px" }}
                                  >
                                    {m.abstract || "No abstract provided"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* <td className="py-3">{m.isbn || "-"}</td> */}
                            <td className="py-3">{m.language || "-"}</td>
                            <td className="py-3">{m.publication_year || "-"}</td>

                            <td className="py-3">
                              <span
                                className="px-3 py-2 rounded-pill font-weight-bold"
                                style={{
                                  background: badge.bg,
                                  color: badge.color,
                                  fontSize: "0.75rem",
                                  display: "inline-block",
                                }}
                              >
                                {badge.label}
                              </span>
                            </td>

                            <td className="py-3 text-center">
                              <div className="btn-group">
                                <a
                                  href={`/ebook/manuscripts/draftshow/${m.id}`}
                                  className="btn btn-outline-primary btn-sm"
                                  title="View"
                                >
                                  <i className="fas fa-eye"></i>
                                </a>

                                {isOwner && (
                                  <>
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => handleEdit(m)}
                                      title="Edit"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>

                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDelete(m.id)}
                                      title="Delete"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!loading && filteredList.length > 0 && (
              <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  Showing <strong>{filteredList.length}</strong> manuscript
                  {filteredList.length !== 1 ? "s" : ""}
                </div>

                <button
                  className="btn btn-success rounded-pill px-4"
                  onClick={openCreatePanel}
                >
                  <i className="fas fa-plus mr-2"></i>
                  New Manuscript
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel Modal - Same as before */}
        {showPanel && (
          <div
            onClick={closePanel}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              backdropFilter: "blur(3px)",
              zIndex: 1999,
            }}
          />
        )}

        {/* Slide Panel */}
        <div
          className="position-fixed top-0 end-0 bg-white d-flex flex-column"
          style={{
            width: window.innerWidth < 768 ? "100%" : "560px",
            height: "100vh",
            zIndex: 2000,
            transform: showPanel ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.28s ease-in-out",
            boxShadow: "-10px 0 40px rgba(15,23,42,0.18)",
            borderTopLeftRadius: "1.5rem",
            borderBottomLeftRadius: "1.5rem",
            overflow: "hidden",
          }}
        >
          {/* Panel Header */}
          <div
            className="text-white px-4 py-4"
            style={{
              background:
                "linear-gradient(135deg, #0d6efd 0%, #4f46e5 55%, #7c3aed 100%)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div
                  className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3"
                  style={{ background: "rgba(255,255,255,0.16)" }}
                >
                  <i className="fas fa-pen mr-2"></i>
                  <span className="font-weight-bold">
                    {editId ? "Edit Mode" : "New Manuscript"}
                  </span>
                </div>

                <h4 className="mb-1 font-weight-bold">
                  {editId ? "Edit Manuscript" : "Create Manuscript"}
                </h4>
                <div style={{ color: "rgba(255,255,255,0.86)" }}>
                  Fill in the manuscript details and upload your document.
                </div>
              </div>

              <button
                onClick={closePanel}
                className="btn btn-light rounded-circle shadow-sm"
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                }}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Panel Body - Same form as before */}
          <div
            className="flex-grow-1"
            style={{
              overflowY: "auto",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <form onSubmit={handleSubmit} className="p-4">
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3">Basic Information</h5>

                  <div className="form-group mb-3">
                    <label className="font-weight-bold text-muted small">
                      MANUSCRIPT TITLE *
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter manuscript title"
                      className="form-control border-0 shadow-sm rounded-pill"
                      style={{ height: "50px", background: "#f8fafc" }}
                      required
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="font-weight-bold text-muted small">
                      ABSTRACT
                    </label>
                    <textarea
                      name="abstract"
                      value={form.abstract}
                      onChange={handleChange}
                      placeholder="Write a brief abstract of the manuscript..."
                      className="form-control border-0 shadow-sm rounded-4"
                      rows="5"
                      style={{ background: "#f8fafc", resize: "none" }}
                    />
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3">Publication Details</h5>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="font-weight-bold text-muted small">
                          ISBN *
                        </label>
                        <input
                          name="isbn"
                          value={form.isbn}
                          onChange={handleChange}
                          placeholder="Enter ISBN"
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="font-weight-bold text-muted small">
                          PUBLICATION YEAR *
                        </label>
                        <input
                          name="publication_year"
                          value={form.publication_year}
                          onChange={handleChange}
                          placeholder="Enter year"
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group mb-0">
                        <label className="font-weight-bold text-muted small">
                          LANGUAGE
                        </label>
                        <select
                          name="language"
                          value={form.language}
                          onChange={handleChange}
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                        >
                          <option value="English">English</option>
                          <option value="French">French</option>
                          <option value="Spanish">Spanish</option>
                          <option value="German">German</option>
                          <option value="Amharic">Amharic</option>
                          <option value="Afaan Oromo">Afaan Oromo</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group mb-0">
                        <label className="font-weight-bold text-muted small">
                          STATUS
                        </label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3">Document Upload</h5>

                  <div
                    className="rounded-4 p-4 text-center"
                    style={{
                      border: "2px dashed #d9e2f2",
                      background: "linear-gradient(180deg, #f8fafc 0%, #f4f7fb 100%)",
                    }}
                  >
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 70,
                        height: 70,
                        background: "rgba(13,110,253,0.12)",
                        color: "#0d6efd",
                      }}
                    >
                      <i className="fas fa-cloud-upload-alt fa-2x"></i>
                    </div>

                    <h6 className="font-weight-bold">Upload manuscript file</h6>
                    <p className="text-muted mb-3">
                      Supported documents: PDF or DOC format
                    </p>

                    <div className="custom-file text-left">
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="custom-file-input"
                        id="manuscriptFile"
                      />
                      <label
                        className="custom-file-label rounded-pill shadow-sm border-0"
                        htmlFor="manuscriptFile"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file ? file.name : "Choose manuscript file"}
                      </label>
                    </div>

                    {!editId && (
                      <small className="text-muted d-block mt-3">
                        File upload is required when creating a new manuscript.
                      </small>
                    )}

                    {editId && !file && (
                      <small className="text-muted d-block mt-3">
                        Leave file unchanged if you only want to update metadata.
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center pb-4">
                <button
                  type="button"
                  onClick={closePanel}
                  className="btn btn-outline-secondary rounded-pill px-4"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn rounded-pill px-4 text-white"
                  disabled={submitting}
                  style={{
                    background:
                      "linear-gradient(135deg, #0d6efd 0%, #4f46e5 60%, #7c3aed 100%)",
                    border: "none",
                    minWidth: "170px",
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editId ? "fa-save" : "fa-plus"} mr-2`}></i>
                      {editId ? "Update Manuscript" : "Create Manuscript"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManuscriptPage;