import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

const ManuscriptEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    isbn: "",
    language: "English",
    publication_year: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/ebook/manuscripts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          title: res.data.title || "",
          abstract: res.data.abstract || "",
          isbn: res.data.isbn || "",
          language: res.data.language || "English",
          publication_year: res.data.publication_year || "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load manuscript");
        navigate("/ebook/manuscripts");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("abstract", form.abstract);
    formData.append("isbn", form.isbn);
    formData.append("language", form.language);
    formData.append("publication_year", form.publication_year);
    if (file) formData.append("file", file);

    try {
      await axios.put(`${API}/ebook/manuscripts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      
      alert("Updated successfully");
      navigate("/ebook/manuscripts");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="content-wrapper">
          <section className="content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2">Loading manuscript data...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Edit Manuscript</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="/ebook/dashboard">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/ebook/manuscripts">Manuscripts</a>
                  </li>
                  <li className="breadcrumb-item active">Edit</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">Edit Manuscript Information</h3>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="card-body">
                      <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                          id="title"
                          name="title"
                          value={form.title}
                          placeholder="Enter manuscript title"
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="abstract">Abstract</label>
                        <textarea
                          id="abstract"
                          name="abstract"
                          value={form.abstract}
                          placeholder="Enter abstract or description"
                          onChange={handleChange}
                          className="form-control"
                          rows="5"
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="isbn">ISBN</label>
                            <input
                              id="isbn"
                              name="isbn"
                              value={form.isbn}
                              placeholder="ISBN number"
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="publication_year">Publication Year</label>
                            <input
                              id="publication_year"
                              name="publication_year"
                              value={form.publication_year}
                              placeholder="YYYY"
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="language">Language</label>
                        <select
                          id="language"
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

                      <div className="form-group">
                        <label htmlFor="file">Manuscript File (Optional)</label>
                        <input
                          type="file"
                          id="file"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="form-control"
                        />
                        <small className="form-text text-muted">
                          Upload a new version only if you want to replace the existing file
                        </small>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? "Updating..." : "Update Manuscript"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-default float-right"
                        onClick={() => navigate("/ebook/manuscripts")}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ManuscriptEditPage;