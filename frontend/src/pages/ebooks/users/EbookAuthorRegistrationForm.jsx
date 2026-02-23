// EbookAuthorRegistrationForm.jsx
import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPen, FaCheckCircle } from "react-icons/fa";
import Navbar from "../../../landing/components/Navbar";

const EbookAuthorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    biography: "",
    affiliation: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }

    // Check password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
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

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ebook/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          biography: formData.biography || null,
          affiliation: formData.affiliation || null
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const colors = ["#ff4444", "#ff7744", "#ffaa44", "#44ff44", "#00cc44"];
    return colors[passwordStrength] || "#cccccc";
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
            <h2 style={{ color: "#0F3D2E", marginBottom: "15px" }}>Welcome to Oromo Ebook Platform! 📚</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Your author account has been created successfully. 
              Start publishing your ebooks and reach readers worldwide.
            </p>
            <button 
              onClick={() => window.location.href = "/ebook/dashboard"}
              style={{
                ...styles.button,
                width: "auto",
                padding: "12px 30px"
              }}
            >
              Go to Author Dashboard
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
          {/* Left side - Ebook Info */}
          <div style={styles.infoSide}>
            <h2 style={styles.infoTitle}>Become an Ebook Author</h2>
            <p style={styles.infoText}>
              Join the premier Oromo language ebook platform. Share your stories, 
              knowledge, and expertise with readers around the world.
            </p>
            <div style={styles.benefitsList}>
              <div style={styles.benefitItem}>📚 Publish and sell your ebooks</div>
              <div style={styles.benefitItem}>💰 Earn royalties on every sale</div>
              <div style={styles.benefitItem}>🌍 Reach a global audience</div>
              <div style={styles.benefitItem}>📊 Track your sales and analytics</div>
            </div>
          </div>

          {/* Right side - Form */}
          <form style={styles.card} onSubmit={handleSubmit}>
            <h2 style={styles.title}>Ebook Author Registration</h2>
            <p style={styles.subtitle}>Start your publishing journey today</p>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.inputContainer}>
              <div style={styles.inputGroup}>
                <FaUser style={styles.icon} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username *"
                  value={formData.username}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              {fieldErrors.username && <span style={styles.fieldError}>{fieldErrors.username}</span>}
            </div>

            <div style={styles.inputContainer}>
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
            </div>

            <div style={styles.inputContainer}>
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
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.inputGroup}>
                <FaPen style={styles.icon} />
                <textarea
                  name="biography"
                  placeholder="Biography - Tell readers about yourself (Optional)"
                  value={formData.biography}
                  onChange={handleChange}
                  style={{...styles.input, minHeight: "100px"}}
                  maxLength="2000"
                />
              </div>
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.inputGroup}>
                <FaUser style={styles.icon} />
                <input
                  type="text"
                  name="affiliation"
                  placeholder="Affiliation (e.g., University, Organization) - Optional"
                  value={formData.affiliation}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputContainer}>
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
            </div>

            {formData.password && (
              <div style={styles.passwordStrength}>
                <div style={styles.strengthBarContainer}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.strengthBar,
                        backgroundColor: index < passwordStrength 
                          ? getPasswordStrengthColor() 
                          : "#eaeef2",
                      }}
                    />
                  ))}
                </div>
                <span style={styles.strengthText}>
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}

            <div style={styles.inputContainer}>
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
              {fieldErrors.confirmPassword && <span style={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
            </div>

            <div style={styles.termsContainer}>
              <input type="checkbox" id="terms" required style={styles.checkbox} />
              <label htmlFor="terms" style={styles.termsLabel}>
                I agree to the <a href="/ebook/terms" style={styles.link}>Terms of Service</a>
              </label>
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }} 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Become an Ebook Author"}
            </button>

            <p style={styles.loginText}>
              Already have an author account? <a href="/ebook/login" style={styles.link}>Login here</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f4f7f6 0%, #e8f0f2 100%)",
    fontFamily: "'Inter', sans-serif",
  },
  wrapper: {
    display: "flex",
    width: "1000px",
    maxWidth: "95%",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  infoSide: {
    flex: 1,
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
    padding: "40px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "white",
  },
  infoText: {
    fontSize: "1rem",
    marginBottom: "30px",
    opacity: 0.9,
    lineHeight: 1.6,
  },
  benefitsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  benefitItem: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  card: {
    flex: 1,
    padding: "40px",
    background: "#fff",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#0F3D2E",
    fontSize: "1.8rem",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#666",
    fontSize: "0.95rem",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    border: "2px solid #ddd",
    borderRadius: "10px",
    padding: "12px 15px",
    transition: "all 0.3s ease",
    ":focus-within": {
      borderColor: "#C9A227",
    },
  },
  icon: {
    color: "#C9A227",
    marginRight: "10px",
    fontSize: "1.1rem",
  },
  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "0.95rem",
    background: "transparent",
    fontFamily: "'Inter', sans-serif",
  },
  fieldError: {
    color: "#ff4444",
    fontSize: "0.85rem",
    marginTop: "5px",
    display: "block",
  },
  passwordStrength: {
    marginTop: "-10px",
    marginBottom: "15px",
  },
  strengthBarContainer: {
    display: "flex",
    gap: "5px",
    marginBottom: "5px",
  },
  strengthBar: {
    height: "4px",
    flex: 1,
    borderRadius: "2px",
    transition: "backgroundColor 0.3s ease",
  },
  strengthText: {
    fontSize: "0.85rem",
    color: "#666",
  },
  termsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  termsLabel: {
    fontSize: "0.9rem",
    color: "#666",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#C9A227",
    color: "#0F3D2E",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 5px 20px rgba(201,162,39,0.3)",
    },
  },
  error: {
    color: "#ff4444",
    textAlign: "center",
    marginBottom: "20px",
    padding: "10px",
    background: "#ffebee",
    borderRadius: "8px",
  },
  successCard: {
    background: "#fff",
    padding: "50px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    maxWidth: "400px",
  },
  loginText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#666",
  },
  link: {
    color: "#0F3D2E",
    textDecoration: "none",
    fontWeight: "600",
    margin: "0 5px",
    ":hover": {
      textDecoration: "underline",
    },
  },
};

export default EbookAuthorRegistrationForm;