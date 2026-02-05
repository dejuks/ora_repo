import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import axios from "../../api/axios";
import Swal from "sweetalert2";

function RepositoryEdit() {
  const { uuid } = useParams(); // UUID id
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    item_type: "article",
    language: "en",
    status: "draft",
    access_level: "open",
    embargo_until: "",
    doi: "",
    handle: "",
    file: null,
  });

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`repository-items/${uuid}`);
      setItem(res.data);
      setFormData({
        title: res.data.title || "",
        abstract: res.data.abstract || "",
        item_type: res.data.item_type || "article",
        language: res.data.language || "en",
        status: res.data.status || "draft",
        access_level: res.data.access_level || "open",
        embargo_until: res.data.embargo_until || "",
        doi: res.data.doi || "",
        handle: res.data.handle || "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in formData) {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }

      await axios.put(`repository-items/${uuid}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success", "Item updated successfully", "success");
      navigate(`/repository/author/submit/list`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update item", "error");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center mt-5">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
        </div>
      </MainLayout>
    );
  }

  if (!item) {
    return (
      <MainLayout>
        <div className="alert alert-danger">Repository item not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Edit Repository Item</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/repository">Repository</Link>
                </li>
                <li className="breadcrumb-item active">Edit</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-outline card-info">
            <div className="card-header">
              <h3 className="card-title">Edit Metadata</h3>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="card-body">
                {/* Title */}
                <div className="form-group">
                  <label>Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Abstract */}
                <div className="form-group">
                  <label>Abstract</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.abstract}
                    onChange={(e) =>
                      setFormData({ ...formData, abstract: e.target.value })
                    }
                  />
                </div>

                <div className="row">
                  {/* Type */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Item Type</label>
                      <select
                        className="form-control"
                        value={formData.item_type}
                        onChange={(e) =>
                          setFormData({ ...formData, item_type: e.target.value })
                        }
                      >
                        <option value="article">Article</option>
                        <option value="thesis">Thesis</option>
                        <option value="report">Report</option>
                        <option value="book">Book</option>
                        <option value="dataset">Dataset</option>
                      </select>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        className="form-control"
                        value={formData.language}
                        onChange={(e) =>
                          setFormData({ ...formData, language: e.target.value })
                        }
                      >
                        <option value="en">English</option>
                        <option value="am">Amharic</option>
                        <option value="om">Afaan Oromo</option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="form-control"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submit</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* DOI and Handle */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>DOI</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.doi}
                        onChange={(e) =>
                          setFormData({ ...formData, doi: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Handle</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.handle}
                        onChange={(e) =>
                          setFormData({ ...formData, handle: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Access Level */}
                <div className="form-group">
                  <label>Access Level</label>
                  <select
                    className="form-control"
                    value={formData.access_level}
                    onChange={(e) =>
                      setFormData({ ...formData, access_level: e.target.value })
                    }
                  >
                    <option value="open">Open</option>
                    <option value="restricted">Restricted</option>
                    <option value="embargoed">Embargoed</option>
                  </select>
                </div>

                {formData.access_level === "embargoed" && (
                  <div className="form-group">
                    <label>Embargo Until</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.embargo_until}
                      onChange={(e) =>
                        setFormData({ ...formData, embargo_until: e.target.value })
                      }
                    />
                  </div>
                )}

                {/* File Upload */}
                <div className="form-group">
                  <label>Upload Document</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files[0] })
                    }
                  />
                  {item.file_path && (
                    <small className="text-muted d-block mt-1">
                      Current file:{" "}
                      <a
                        href={item.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </small>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <button type="submit" className="btn btn-info">
                  <i className="fas fa-save"></i> Save Changes
                </button>
                <Link
                  to={`/repository/${uuid}`}
                  className="btn btn-secondary ml-2"
                >
                  <i className="fas fa-arrow-left"></i> Back
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default RepositoryEdit;
