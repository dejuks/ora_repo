import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const ManuscriptPage = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
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

  const BASE = `${API}/ebook/manuscripts/drafts`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!storedUser || !token) window.location.href = "/login";
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editId) return alert("Please upload a file");

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
    setForm({ ...m });
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

  const filteredList = list.filter(
    (m) =>
      m.title.toLowerCase().includes(search) ||
      m.isbn.toLowerCase().includes(search) ||
      m.publication_year.toString().includes(search)
  );

  return (
    <MainLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Draft eBook Manuscripts</h3>
          <button
            className="btn btn-success"
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
            }}
          >
            + Create Manuscript
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by Title, ISBN, or Year..."
          value={search}
          onChange={handleSearch}
        />

        {/* Manuscript Table */}
        <div className="card shadow-sm">
          <div className="card-body">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>ISBN</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No manuscripts found
                    </td>
                  </tr>
                ) : (
                  filteredList.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>{m.isbn}</td>
                      <td>{m.publication_year}</td>
                      <td>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        
                      </td>
                      <td>
                        <a
                          href={`/ebook/manuscripts/show/${m.id}`}
                          className="btn btn-primary btn-sm me-1"
                        >
                          Show
                        </a>
                        <button
                          className="btn btn-info btn-sm me-1"
                          onClick={() => handleEdit(m)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(m.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Form Panel */}
        {showPanel && (
          <div
            className="position-fixed top-0 end-0 bg-white shadow p-4"
            style={{
              width: "600px",
              height: "100vh",
              zIndex: 1050,
              overflowY: "auto",
              transition: "0.3s",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>{editId ? "Edit Manuscript" : "Create Manuscript"}</h5>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowPanel(false)}
              >
                X
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                name="title"
                value={form.title}
                placeholder="Title"
                onChange={handleChange}
                className="form-control mb-2"
              />
              <textarea
                name="abstract"
                value={form.abstract}
                placeholder="Abstract"
                onChange={handleChange}
                className="form-control mb-2"
              />
              <input
                name="isbn"
                value={form.isbn}
                placeholder="ISBN"
                onChange={handleChange}
                className="form-control mb-2"
              />
              <input
                name="publication_year"
                value={form.publication_year}
                placeholder="Year"
                onChange={handleChange}
                className="form-control mb-2"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-control mb-2"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="form-control mb-2"
              />
              <button className="btn btn-primary w-100">
                {editId ? "Update Manuscript" : "Submit Manuscript"}
              </button>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManuscriptPage;