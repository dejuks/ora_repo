// CreateArticlePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../landing/components/Navbar";
import { FaSave, FaTimes } from "react-icons/fa";

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

    // Optional: check if token expired
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

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData({
      ...formData,
      categories: selectedOptions,
    });
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

      const API_URL = process.env.REACT_APP_API_URL;

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

  // Prevent UI flash before auth check
  if (authChecking) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          Checking authentication...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Article</h1>
          <p style={styles.subtitle}>
            Share your knowledge with the Oromo Wikipedia community
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              style={styles.textarea}
              rows={15}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Edit Summary</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Categories</label>

              <select
                multiple
                value={formData.categories}
                onChange={handleCategoryChange}
                style={styles.select}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="draft">Draft</option>
                <option value="pending">Submit for Review</option>
                <option value="published">Publish</option>
              </select>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
              />{" "}
              Mark as featured article
            </label>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.cancelButton}
            >
              <FaTimes /> Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? "Creating..." : (
                <>
                  <FaSave /> Create Article
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "50px 20px",
    fontFamily: "'Inter', sans-serif",
  },

  header: {
    marginBottom: "35px",
  },

  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0F3D2E",
    marginBottom: "6px",
  },

  subtitle: {
    color: "#6c757d",
    fontSize: "15px",
  },

  form: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  formGroup: {
    marginBottom: "25px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#333",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "2px solid #e4e7ec",
    outline: "none",
    transition: "all 0.25s ease",
    background: "#fafafa",
  },

  textarea: {
    width: "100%",
    padding: "16px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "2px solid #e4e7ec",
    outline: "none",
    minHeight: "220px",
    resize: "vertical",
    background: "#fafafa",
    lineHeight: "1.6",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "2px solid #e4e7ec",
    fontSize: "15px",
    background: "#fafafa",
    outline: "none",
  },

  checkboxGroup: {
    marginBottom: "25px",
    fontSize: "14px",
    color: "#444",
  },

  actions: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
  },

  submitButton: {
    flex: 1,
    padding: "15px",
    background: "linear-gradient(135deg,#C9A227,#B8961E)",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "0.3s",
  },

  cancelButton: {
    flex: 1,
    padding: "15px",
    background: "#f4f4f4",
    border: "2px solid #e4e7ec",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  error: {
    background: "#fff3f3",
    color: "#c62828",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #ffcdd2",
  },
};

export default CreateArticlePage;