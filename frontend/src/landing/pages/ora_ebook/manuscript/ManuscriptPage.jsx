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
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  const BASE = `${API}/ebook/manuscripts`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }

    setUser(storedUser);
    
    // Extract user roles
    const roles = storedUser?.roles?.map(r => r.role_name || r.name || r.code) || [];
    setUserRoles(roles);
    
    loadData(token);
  }, []);

  const loadData = async (token) => {
    try {
      setLoading(true);
      
      // Get user's roles to determine what data to fetch
      const roles = userRoles.length > 0 ? userRoles : [];
      const isAdmin = roles.some(r => r.toUpperCase().includes("ADMIN"));
      const isEditor = roles.some(r => r.toUpperCase().includes("EDITOR"));
      const isReviewer = roles.some(r => r.toUpperCase().includes("REVIEWER"));
      
      let endpoint = BASE;
      let params = {};
      
      // Different endpoints based on role
      if (isAdmin) {
        // Admin sees all manuscripts
        endpoint = `${BASE}/all`;
      } else if (isEditor) {
        // Editor sees manuscripts assigned to them
        endpoint = `${BASE}/assigned-to-me`;
      } else if (isReviewer) {
        // Reviewer sees manuscripts assigned for review
        endpoint = `${BASE}/for-review`;
      } else {
        // Author sees only their own manuscripts
        endpoint = `${BASE}/my-manuscripts`;
      }
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
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

  const openCreateModal = () => {
    // Only authors can create new manuscripts
    const isAuthor = userRoles.some(r => 
      r.toUpperCase().includes("AUTHOR") || 
      r.toUpperCase() === "PUBLIC_READER"
    );
    
    if (!isAuthor && !userRoles.some(r => r.toUpperCase().includes("ADMIN"))) {
      alert("Only authors can create new manuscripts");
      return;
    }
    
    resetForm();
    setShowPanel(true);
  };

  const closeModal = () => {
    setShowPanel(false);
    resetForm();
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !editId) {
      alert("Please upload a file");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (file) formData.append("file", file);
    
    // Add author ID to associate manuscript with current user
    if (user?.id) {
      formData.append("author_id", user.id);
    }

    try {
      setSubmitting(true);

      if (editId) {
        // Check if user has permission to edit this manuscript
        const manuscript = list.find(m => m.id === editId);
        const canEdit = await canUserModify(manuscript);
        
        if (!canEdit) {
          alert("You don't have permission to edit this manuscript");
          return;
        }
        
        await axios.put(`${BASE}/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Updated successfully");
      } else {
        await axios.post(BASE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Created successfully");
      }

      closeModal();
      loadData(token);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const canUserModify = async (manuscript) => {
    if (!manuscript) return false;
    
    const token = localStorage.getItem("token");
    const isAdmin = userRoles.some(r => r.toUpperCase().includes("ADMIN"));
    
    // Admin can modify anything
    if (isAdmin) return true;
    
    // Check if user is the author
    if (manuscript.author_id === user?.id) return true;
    
    // Check if user is assigned editor
    if (manuscript.editor_id === user?.id) return true;
    
    return false;
  };

  const handleEdit = async (m) => {
    const canEdit = await canUserModify(m);
    
    if (!canEdit) {
      alert("You don't have permission to edit this manuscript");
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
    setEditId(m.id);
    setFile(null);
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    const manuscript = list.find(m => m.id === id);
    const canDelete = await canUserModify(manuscript);
    
    if (!canDelete) {
      alert("You don't have permission to delete this manuscript");
      return;
    }
    
    if (!window.confirm("Delete this manuscript?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData(token);
      alert("Deleted successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-secondary";
      case "submitted":
        return "bg-primary";
      case "revision_required":
        return "bg-warning text-dark";
      case "under_review":
        return "bg-info";
      case "approved":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-dark";
    }
  };

  const getRoleDisplay = () => {
    if (userRoles.some(r => r.toUpperCase().includes("ADMIN"))) return "Administrator";
    if (userRoles.some(r => r.toUpperCase().includes("EDITOR"))) return "Editor";
    if (userRoles.some(r => r.toUpperCase().includes("REVIEWER"))) return "Reviewer";
    return "Author";
  };

  const stats = useMemo(() => {
    const total = list.length;
    const drafts = list.filter((m) => m.status === "draft").length;
    const submitted = list.filter((m) => m.status === "submitted").length;
    const underReview = list.filter((m) => m.status === "under_review").length;
    const approved = list.filter((m) => m.status === "approved").length;
    const rejected = list.filter((m) => m.status === "rejected").length;

    return { total, drafts, submitted, underReview, approved, rejected };
  }, [list]);

  // Determine if user can create new manuscripts
  const canCreate = userRoles.some(r => 
    r.toUpperCase().includes("AUTHOR") || 
    r.toUpperCase().includes("ADMIN")
  );

  return (
    <MainLayout>
      <div style={{ background: "#f4f7fb", minHeight: "100vh" }}>
        <section className="content-header pb-0">
          <div className="container-fluid">
            <div
              className="rounded-4 shadow-sm overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #4f46e5 55%, #7c3aed 100%)",
              }}
            >
              <div className="p-4 p-md-5 text-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div
                      className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3"
                      style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
                    >
                      <i className="fas fa-book-open mr-2"></i>
                      <span className="font-weight-bold">ORA eBook Publishing</span>
                    </div>

                    <h1 className="mb-2 font-weight-bold">
                      {getRoleDisplay()} Manuscript Workspace
                    </h1>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                      {userRoles.some(r => r.toUpperCase().includes("ADMIN")) && 
                        "View and manage all manuscripts in the system"}
                      {userRoles.some(r => r.toUpperCase().includes("EDITOR")) && 
                        "Manage manuscripts assigned to you for editorial review"}
                      {userRoles.some(r => r.toUpperCase().includes("REVIEWER")) && 
                        "Review manuscripts assigned to you"}
                      {!userRoles.some(r => r.toUpperCase().includes("ADMIN") || 
                         r.toUpperCase().includes("EDITOR") || 
                         r.toUpperCase().includes("REVIEWER")) && 
                        "Create, manage, and track your manuscript submissions"}
                    </p>
                  </div>

                  {canCreate && (
                    <div className="text-md-right">
                      <button
                        type="button"
                        className="btn btn-light btn-lg shadow-sm rounded-pill px-4"
                        onClick={openCreateModal}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Create Manuscript
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{ width: 56, height: 56, background: "rgba(13,110,253,0.12)", color: "#0d6efd" }}
                    >
                      <i className="fas fa-folder-open fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Total Manuscripts</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.total}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{ width: 56, height: 56, background: "rgba(108,117,125,0.12)", color: "#6c757d" }}
                    >
                      <i className="fas fa-file-alt fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Draft</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.drafts}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{ width: 56, height: 56, background: "rgba(13,110,253,0.12)", color: "#0d6efd" }}
                    >
                      <i className="fas fa-paper-plane fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Submitted</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.submitted}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{ width: 56, height: 56, background: "rgba(13,202,240,0.12)", color: "#0dcaf0" }}
                    >
                      <i className="fas fa-chart-line fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Under Review</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.underReview}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{ width: 56, height: 56, background: "rgba(25,135,84,0.12)", color: "#198754" }}
                    >
                      <i className="fas fa-check-circle fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Approved</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.approved}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{ width: 56, height: 56, background: "rgba(220,53,69,0.12)", color: "#dc3545" }}
                    >
                      <i className="fas fa-times-circle fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Rejected</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.rejected}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content pt-2">
          <div className="container-fluid">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header border-0 bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                style={{ padding: "1.25rem 1.5rem" }}
              >
                <div>
                  <h3 className="card-title mb-1 font-weight-bold" style={{ fontSize: "1.2rem" }}>
                    {userRoles.some(r => r.toUpperCase().includes("ADMIN")) && "All Manuscripts"}
                    {userRoles.some(r => r.toUpperCase().includes("EDITOR")) && "Assigned Manuscripts"}
                    {userRoles.some(r => r.toUpperCase().includes("REVIEWER")) && "Review Assignments"}
                    {!userRoles.some(r => r.toUpperCase().includes("ADMIN") || 
                       r.toUpperCase().includes("EDITOR") || 
                       r.toUpperCase().includes("REVIEWER")) && "My Manuscripts"}
                  </h3>
                  <div className="text-muted small">
                    {userRoles.some(r => r.toUpperCase().includes("ADMIN")) && 
                      "View and manage all manuscripts across the system"}
                    {userRoles.some(r => r.toUpperCase().includes("EDITOR")) && 
                      "Manuscripts assigned to you for editorial processing"}
                    {userRoles.some(r => r.toUpperCase().includes("REVIEWER")) && 
                      "Manuscripts assigned to you for peer review"}
                    {!userRoles.some(r => r.toUpperCase().includes("ADMIN") || 
                       r.toUpperCase().includes("EDITOR") || 
                       r.toUpperCase().includes("REVIEWER")) && 
                      "Manuscripts you have submitted or are working on"}
                  </div>
                </div>

                <div className="mt-3 mt-md-0">
                  <span className="badge badge-light px-3 py-2" style={{ fontSize: "0.85rem" }}>
                    {list.length} record{list.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <div className="text-muted">Loading manuscripts...</div>
                  </div>
                ) : list.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 80,
                        height: 80,
                        background: "rgba(13,110,253,0.10)",
                        color: "#0d6efd",
                      }}
                    >
                      <i className="fas fa-book fa-2x"></i>
                    </div>
                    <h4 className="font-weight-bold">No manuscripts found</h4>
                    <p className="text-muted mb-4">
                      {userRoles.some(r => r.toUpperCase().includes("AUTHOR")) && 
                        "Start by creating your first manuscript and uploading the document."}
                      {userRoles.some(r => r.toUpperCase().includes("EDITOR")) && 
                        "No manuscripts are currently assigned to you."}
                      {userRoles.some(r => r.toUpperCase().includes("REVIEWER")) && 
                        "No review assignments at this time."}
                      {userRoles.some(r => r.toUpperCase().includes("ADMIN")) && 
                        "No manuscripts have been submitted yet."}
                    </p>
                    {canCreate && (
                      <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={openCreateModal}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Create Manuscript
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered align-middle mb-0">
                      <thead style={{ background: "#f8fafc" }}>
                        <tr>
                          <th className="border-0 px-4 py-3">Manuscript</th>
                          <th className="border-0 py-3">Author</th>
                          <th className="border-0 py-3">ISBN</th>
                          <th className="border-0 py-3">Language</th>
                          <th className="border-0 py-3">Year</th>
                          <th className="border-0 py-3">Status</th>
                          <th className="border-0 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((m) => (
                          <tr key={m.id}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-start">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    background: "linear-gradient(135deg, #0d6efd, #7c3aed)",
                                    color: "#fff",
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="fas fa-file-alt"></i>
                                </div>
                                <div>
                                  <div className="font-weight-bold" style={{ fontSize: "1rem" }}>
                                    {m.title}
                                  </div>
                                  <div className="text-muted small text-truncate" style={{ maxWidth: "320px" }}>
                                    {m.abstract || "No abstract provided"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">{m.author_name || m.author?.name || "-"}</td>
                            <td className="py-3">{m.isbn || "-"}</td>
                            <td className="py-3">{m.language || "-"}</td>
                            <td className="py-3">{m.publication_year || "-"}</td>
                            <td className="py-3">
                              <span className={`badge ${getStatusClass(m.status)} px-3 py-2 rounded-pill`}>
                                {(m.status || "unknown").replaceAll("_", " ").toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <div className="btn-group">
                                <a
                                  href={`/ebook/manuscripts/show/${m.id}`}
                                  className="btn btn-outline-primary btn-sm"
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </a>
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
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {!loading && list.length > 0 && canCreate && (
                <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center px-4 py-3">
                  <div className="text-muted small">
                    Showing <strong>{list.length}</strong> manuscript{list.length !== 1 ? "s" : ""}
                  </div>
                  <button className="btn btn-success rounded-pill px-4" onClick={openCreateModal}>
                    <i className="fas fa-plus mr-2"></i>
                    New Manuscript
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal form remains the same */}
        <div
          className={`modal fade ${showPanel ? "show d-block" : ""}`}
          style={{
            display: showPanel ? "block" : "none",
            background: showPanel ? "rgba(15, 23, 42, 0.55)" : "transparent",
            backdropFilter: showPanel ? "blur(4px)" : "none",
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header border-0 text-white"
                style={{
                  background: "linear-gradient(135deg, #0d6efd 0%, #4f46e5 60%, #7c3aed 100%)",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div>
                  <h5 className="modal-title font-weight-bold mb-1">
                    <i className="fas fa-book mr-2"></i>
                    {editId ? "Edit Manuscript" : "Create Manuscript"}
                  </h5>
                  <small style={{ color: "rgba(255,255,255,0.82)" }}>
                    Fill in manuscript details and upload the document.
                  </small>
                </div>

                <button
                  type="button"
                  className="close text-white"
                  onClick={closeModal}
                  style={{ opacity: 1 }}
                >
                  <span>&times;</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: "1.5rem" }}>
                  <div className="form-group">
                    <label className="font-weight-semibold">Title *</label>
                    <input
                      name="title"
                      value={form.title}
                      placeholder="Enter manuscript title"
                      onChange={handleChange}
                      className="form-control rounded-pill"
                      style={{ height: "48px" }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="font-weight-semibold">Abstract</label>
                    <textarea
                      name="abstract"
                      value={form.abstract}
                      placeholder="Enter manuscript abstract"
                      onChange={handleChange}
                      className="form-control rounded-4"
                      rows="5"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="font-weight-semibold">ISBN</label>
                        <input
                          name="isbn"
                          value={form.isbn}
                          placeholder="Enter ISBN"
                          onChange={handleChange}
                          className="form-control rounded-pill"
                          style={{ height: "48px" }}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="font-weight-semibold">Publication Year</label>
                        <input
                          name="publication_year"
                          value={form.publication_year}
                          placeholder="Enter publication year"
                          onChange={handleChange}
                          className="form-control rounded-pill"
                          style={{ height: "48px" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="font-weight-semibold">Language</label>
                        <select
                          name="language"
                          value={form.language}
                          onChange={handleChange}
                          className="form-control rounded-pill"
                          style={{ height: "48px" }}
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
                      <div className="form-group">
                        <label className="font-weight-semibold">Status</label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="form-control rounded-pill"
                          style={{ height: "48px" }}
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label className="font-weight-semibold">Manuscript File (PDF / DOC)</label>
                    <div
                      className="border rounded-4 p-4 text-center"
                      style={{
                        borderStyle: "dashed",
                        background: "#f8fafc",
                      }}
                    >
                      <div className="mb-3" style={{ color: "#4f46e5" }}>
                        <i className="fas fa-cloud-upload-alt fa-2x"></i>
                      </div>

                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="form-control-file"
                        id="customFile"
                        accept=".pdf,.doc,.docx"
                      />

                      <div className="mt-3">
                        <strong>{file ? file.name : "No file selected"}</strong>
                      </div>

                      {!editId && (
                        <small className="text-muted d-block mt-2">
                          A document file is required when creating a new manuscript.
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light justify-content-between px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {editId ? "Update Manuscript" : "Create Manuscript"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {showPanel && <div className="modal-backdrop fade show"></div>}
      </div>
    </MainLayout>
  );
};

export default ManuscriptPage;