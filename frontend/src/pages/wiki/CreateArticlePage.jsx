import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes, FaStar, FaRegEdit } from "react-icons/fa";
import Navbar from "../../landing/components/Navbar";
import MainLayout from "../../components/layout/MainLayout";

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    status: "draft",
    categories: [],
    is_featured: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/wiki/login?redirect=/wiki/create-article", { replace: true });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/wiki/login", { replace: true });
        return;
      }
    } catch (err) {
      console.error("Invalid token");
      navigate("/wiki/login", { replace: true });
      return;
    }

    setAuthChecking(false);
    fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/wiki/categories`);

      if (!res.ok) throw new Error("Failed to fetch categories");

      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData((prev) => ({
      ...prev,
      categories: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/wiki/login");
        return;
      }

      const res = await fetch(`${API_URL}/wiki/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create article");
      }

      navigate(`/wiki/article/${data.data.slug}`);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <>
        <Navbar />
        <div className="content-wrapper">
          <section className="content pt-4">
            <div className="container-fluid">
              <div className="card">
                <div className="card-body text-center">
                  Checking authentication...
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <MainLayout>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>
                  <FaRegEdit className="mr-2 text-primary" />
                  Create New Article
                </h1>
                <p className="text-muted mb-0">
                  Share your knowledge with the Oromo Wikipedia community
                </p>
              </div>
              <div className="col-sm-6 text-sm-right mt-2 mt-sm-0">
                <span className="badge badge-primary p-2">
                  Article Editor
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title">Article Information</h3>
                </div>

                <div className="card-body">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter article title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Content *</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      className="form-control"
                      rows="12"
                      placeholder="Write your article content here..."
                      required
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label>Edit Summary</label>
                    <input
                      type="text"
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Brief summary of the article"
                    />
                  </div>
                </div>
              </div>

              <div className="card card-warning card-outline">
                <div className="card-header">
                  <h3 className="card-title">Publishing Settings</h3>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Categories</label>
                        <select
                          multiple
                          value={formData.categories}
                          onChange={handleCategoryChange}
                          className="form-control"
                          style={{ minHeight: "180px" }}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <small className="form-text text-muted">
                          Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                          categories.
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="form-control"
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Submit for Review</option>
                          <option value="published">Publish</option>
                        </select>
                      </div>

                      <div className="card bg-light mt-4">
                        <div className="card-body">
                          <div className="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="featuredArticle"
                              name="is_featured"
                              checked={formData.is_featured}
                              onChange={handleChange}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="featuredArticle"
                            >
                              <FaStar className="text-warning mr-2" />
                              Mark as featured article
                            </label>
                          </div>
                          <small className="text-muted d-block mt-2">
                            Featured articles get more visibility on the
                            platform.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer d-flex justify-content-between">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-default"
                  >
                    <FaTimes className="mr-1" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    <FaSave className="mr-1" />
                    {loading ? "Creating..." : "Create Article"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
    </MainLayout>
  );
};

export default CreateArticlePage;