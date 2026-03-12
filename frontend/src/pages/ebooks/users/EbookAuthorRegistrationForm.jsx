import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPen, FaCheckCircle } from "react-icons/fa";
import Navbar from "../../../landing/components/Navbar";

/* ✅ Default module ID for Ebook module */
const EBOOK_MODULE_ID =
  process.env.REACT_APP_EBOOK_MODULE_ID || "aeca9002-e3e1-498d-a9da-34066db00744";

const EbookAuthorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    biography: "",
    affiliation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const REGISTER_URL = `${API_BASE}/api/ebook/register`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({ ...p, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((p) => ({ ...p, [name]: "" }));
    }

    if (name === "password") calculatePasswordStrength(value);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";

    if (!formData.full_name.trim()) errors.full_name = "Full name is required";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Correct: only treat as non-JSON if content-type is not JSON
  const readResponseBody = async (res) => {
    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("application/json")) {
      const json = await res.json().catch(() => ({}));
      return { json, isJson: true, contentType };
    }

    const text = await res.text().catch(() => "");
    return { text, isJson: false, contentType };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          module_id: EBOOK_MODULE_ID, // ✅ default module id
          biography: formData.biography || null,
          affiliation: formData.affiliation || null,
        }),
      });

      const body = await readResponseBody(res);

      // ✅ If backend returned HTML/text, show preview (fixes "Unexpected token <")
      if (!body.isJson) {
        const preview = String(body.text || "").slice(0, 220);
        throw new Error(
          `Server returned non-JSON response (status ${res.status}). Preview: ${preview}`
        );
      }

      const data = body.json;

      if (!res.ok) throw new Error(data?.message || "Registration failed");

      const token =
        data?.data?.token ||
        data?.token ||
        data?.access_token ||
        data?.data?.access_token ||
        null;

      const user = data?.data?.user || data?.user || null;

      if (!token) throw new Error("Registration succeeded but no token returned from API.");

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      setSuccess(true);
    } catch (err2) {
      setError(err2?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const colors = ["#ff4444", "#ff7744", "#ffaa44", "#44ff44", "#00cc44"];
    return colors[passwordStrength] || "#ccc";
  };

  const getPasswordStrengthText = () => {
    const texts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return texts[passwordStrength] || "";
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.successCard}>
            <FaCheckCircle style={{ fontSize: "4rem", color: "#4CAF50", marginBottom: "20px" }} />
            <h2 style={{ color: "#0F3D2E", marginBottom: 8 }}>Welcome to Oromo Ebook Platform 📚</h2>
            <p style={{ marginTop: 0, color: "#555" }}>Your author account has been created successfully.</p>
            <button
              style={{ ...styles.button, marginTop: 16 }}
              onClick={() => (window.location.href = "/ebook/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.infoSide}>
            <h2 style={styles.infoTitle}>Become an Ebook Author</h2>

            <p style={styles.infoText}>
              Join the Oromo ebook publishing platform and share your knowledge with readers worldwide.
            </p>

            <div style={styles.benefitsList}>
              <div>📚 Publish ebooks</div>
              <div>💰 Earn royalties</div>
              <div>🌍 Reach global readers</div>
              <div>📊 Track your sales</div>
            </div>
          </div>

          <form style={styles.card} onSubmit={handleSubmit}>
            <h2 style={styles.title}>Ebook Author Registration</h2>

            {error && (
              <div style={styles.error}>
                {error}
                <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>
                  Endpoint: {REGISTER_URL}
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <FaEnvelope style={styles.icon} />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            {fieldErrors.email && <span style={styles.fieldError}>{fieldErrors.email}</span>}

            <div style={styles.inputGroup}>
              <FaUser style={styles.icon} />
              <input
                type="text"
                name="full_name"
                placeholder="Full Name *"
                value={formData.full_name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            {fieldErrors.full_name && <span style={styles.fieldError}>{fieldErrors.full_name}</span>}

            <div style={styles.inputGroup}>
              <FaPen style={styles.icon} />
              <textarea
                name="biography"
                placeholder="Biography (Optional)"
                value={formData.biography}
                onChange={handleChange}
                style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
              />
            </div>

            <div style={styles.inputGroup}>
              <FaUser style={styles.icon} />
              <input
                type="text"
                name="affiliation"
                placeholder="Affiliation (Optional)"
                value={formData.affiliation}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <FaLock style={styles.icon} />
              <input
                type="password"
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            {fieldErrors.password && <span style={styles.fieldError}>{fieldErrors.password}</span>}

            {formData.password && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: i < passwordStrength ? getPasswordStrengthColor() : "#eee",
                      }}
                    />
                  ))}
                </div>

                <span style={{ fontSize: 12, color: "#666" }}>{getPasswordStrengthText()}</span>
              </div>
            )}

            <div style={styles.inputGroup}>
              <FaLock style={styles.icon} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            {fieldErrors.confirmPassword && (
              <span style={styles.fieldError}>{fieldErrors.confirmPassword}</span>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            <p style={styles.loginText}>
              Already have an account?{" "}
              <a href="/ebook/login" style={styles.link}>
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

/* Styles */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7f8",
    padding: 16,
  },

  wrapper: {
    display: "flex",
    width: "1000px",
    maxWidth: "95%",
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },

  infoSide: {
    flex: 1,
    background: "#0F3D2E",
    color: "#fff",
    padding: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  infoTitle: { fontSize: 28, marginBottom: 20 },
  infoText: { marginBottom: 20, lineHeight: 1.6, opacity: 0.92 },
  benefitsList: { display: "flex", flexDirection: "column", gap: 10, opacity: 0.95 },

  card: { flex: 1, padding: 40 },

  title: { marginBottom: 20, color: "#0F3D2E" },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    padding: "12px 14px",
    borderRadius: 8,
    marginBottom: 12,
    background: "#fff",
  },

  icon: { marginRight: 10, color: "#C9A227" },

  input: { border: "none", outline: "none", width: "100%", fontSize: 14 },

  button: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    border: "none",
    background: "#C9A227",
    color: "#0F3D2E",
    fontWeight: "bold",
    marginTop: 6,
  },

  fieldError: { color: "red", fontSize: 12, marginBottom: 8, display: "block" },

  error: {
    background: "#ffebee",
    color: "#b71c1c",
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 14,
  },

  successCard: {
    background: "#fff",
    padding: 50,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    maxWidth: 520,
  },

  loginText: { textAlign: "center", marginTop: 15, color: "#555" },

  link: { color: "#0F3D2E", fontWeight: "bold", textDecoration: "none" },
};

export default EbookAuthorRegistrationForm;