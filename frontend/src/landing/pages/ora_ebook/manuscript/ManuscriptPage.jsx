import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const ManuscriptPage = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    isbn: "",
    language: "English",
    publication_year: "",
    status: "draft",
  });
  const [file, setFile] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState(null);

  const BASE = `${API}/ebook/manuscripts`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }
    setUser(storedUser);
    loadData(token);
  }, []);

  const loadData = async (token) => {
    try {
      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(res.data);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to load manuscripts");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    try {
      if (editId) {
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

      setForm({
        title: "",
        abstract: "",
        isbn: "",
        language: "English",
        publication_year: "",
        status: "draft",
      });
      setFile(null);
      setEditId(null);
      setShowPanel(false);
      loadData(token);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Submit failed");
    }
  };

  const handleEdit = (m) => {
    setForm({
      title: m.title,
      abstract: m.abstract,
      isbn: m.isbn,
      language: m.language,
      publication_year: m.publication_year,
      status: m.status,
    });
    setEditId(m.id);
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this manuscript?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData(token);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "badge badge-secondary";
      case "submitted":
        return "badge badge-primary";
      case "revision_required":
        return "badge badge-warning";
      case "approved":
        return "badge badge-success";
      default:
        return "badge badge-secondary";
    }
  };

  return (
    <MainLayout>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>ORA eBook Manuscripts</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="/ebook/dashboard">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Manuscripts</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">All Manuscripts</h3>
                    <div className="card-tools">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setShowPanel(true);
                          setEditId(null);
                          setForm({
                            title: "",
                            abstract: "",
                            isbn: "",
                            language: "English",
                            publication_year: "",
                            status: "draft",
                          });
                          setFile(null);
                        }}
                      >
                        <i className="fas fa-plus"></i> Create Manuscript
                      </button>
                    </div>
                  </div>

                  <div className="card-body table-responsive p-0">
                    <table className="table table-hover text-nowrap">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>ISBN</th>
                          <th>Year</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">
                              <div className="alert alert-info mb-0">
                                <i className="fas fa-info-circle"></i> No manuscripts found
                              </div>
                            </td>
                          </tr>
                        ) : (
                          list.map((m) => (
                            <tr key={m.id}>
                              <td>
                                <strong>{m.title}</strong>
                              </td>
                              <td>{m.isbn}</td>
                              <td>
                                  {m.publication_year}
                              </td>
                              <td>
                                {m.status.toUpperCase()}
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <a
                                    href={`/ebook/manuscripts/show/${m.id}`}
                                    className="btn btn-primary"
                                    title="View Details"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </a>
                                  <button
                                    className="btn btn-info"
                                    onClick={() => handleEdit(m)}
                                    title="Edit"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(m.id)}
                                    title="Delete"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-footer clearfix">
                    <div className="row">
                      <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info">
                          Showing {list.length} manuscript{list.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Modal Panel instead of floating div */}
      <div className={`modal fade ${showPanel ? 'show d-block' : ''}`} 
           style={{ display: showPanel ? 'block' : 'none' }}
           tabIndex="-1" 
           role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-book"></i> {editId ? "Edit Manuscript" : "Create Manuscript"}
              </h5>
              <button
                type="button"
                className="close"
                onClick={() => setShowPanel(false)}
              >
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    name="title"
                    value={form.title}
                    placeholder="Enter manuscript title"
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Abstract</label>
                  <textarea
                    name="abstract"
                    value={form.abstract}
                    placeholder="Enter abstract"
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>ISBN</label>
                      <input
                        name="isbn"
                        value={form.isbn}
                        placeholder="ISBN"
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Publication Year</label>
                      <input
                        name="publication_year"
                        value={form.publication_year}
                        placeholder="Year"
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        name="language"
                        value={form.language}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Manuscript File (PDF/DOC)</label>
                  <div className="custom-file">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="custom-file-input"
                      id="customFile"
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                      {file ? file.name : "Choose file"}
                    </label>
                  </div>
                  {!editId && (
                    <small className="form-text text-muted">
                      * Required for new manuscripts
                    </small>
                  )}
                </div>
              </div>

              <div className="modal-footer justify-content-between">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => setShowPanel(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> {editId ? "Update" : "Create"} Manuscript
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Modal backdrop */}
      {showPanel && <div className="modal-backdrop fade show"></div>}
    </MainLayout>
  );
};

export default ManuscriptPage;