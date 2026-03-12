// WikiLoginPage.jsx
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../landing/components/Navbar";

const WikiLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/wiki/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirect to dashboard
      navigate("/wiki/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check for remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.wrapper}>
          {/* Left Side - Branding/Info */}
          <div style={styles.brandSide}>
            <div style={styles.brandContent}>
              <h1 style={styles.brandTitle}>Oromo Wikipedia</h1>
              <p style={styles.brandSubtitle}>
                Join the community of knowledge contributors
              </p>
              
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>📝</span>
                  <span>Create and edit articles</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🖼️</span>
                  <span>Upload media and images</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🌍</span>
                  <span>Preserve Oromo culture</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🏆</span>
                  <span>Build your reputation</span>
                </div>
              </div>

              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>10K+</span>
                  <span style={styles.statLabel}>Articles</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>5K+</span>
                  <span style={styles.statLabel}>Contributors</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>1M+</span>
                  <span style={styles.statLabel}>Readers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div style={styles.formSide}>
            <div style={styles.formContainer}>
              <div style={styles.formHeader}>
                <h2 style={styles.welcomeBack}>Welcome Back! 👋</h2>
                <p style={styles.formSubtitle}>
                  Log in to continue contributing to Oromo Wikipedia
                </p>
              </div>

              {error && (
                <div style={styles.errorMessage}>
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Email Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <FaEnvelope style={styles.inputIcon} />
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={styles.inputGroup}>
                  <div style={styles.passwordHeader}>
                    <label style={styles.label}>Password</label>
                    <Link to="/wiki/forgot-password" style={styles.forgotLink}>
                      Forgot password?
                    </Link>
                  </div>
                  <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      style={styles.input}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div style={styles.rememberContainer}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    ...styles.loginButton,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={styles.loadingSpinner} />
                  ) : (
                    "Log In"
                  )}
                </button>

                {/* Sign Up Link */}
                <div style={styles.signupContainer}>
                  <p style={styles.signupText}>
                    New to Oromo Wikipedia?{" "}
                    <Link to="/wiki/register" style={styles.signupLink}>
                      Create an account
                    </Link>
                  </p>
                </div>
              </form>

              {/* Alternative Login Options */}
              <div style={styles.alternativeSection}>
                <div style={styles.divider}>
                  <span style={styles.dividerText}>Or continue with</span>
                </div>

                <div style={styles.socialButtons}>
                  <button style={styles.socialButton}>
                    <img 
                      src="https://www.google.com/favicon.ico" 
                      alt="Google"
                      style={styles.socialIcon}
                    />
                    Google
                  </button>
                  <button style={styles.socialButton}>
                    <img 
                      src="https://github.com/favicon.ico" 
                      alt="GitHub"
                      style={styles.socialIcon}
                    />
                    GitHub
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f9fa",
    fontFamily: "'Inter', 'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  wrapper: {
    display: "flex",
    width: "1100px",
    maxWidth: "100%",
    height: "600px",
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  brandSide: {
    flex: 1,
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
    padding: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  brandContent: {
    color: "white",
    zIndex: 2,
    width: "100%",
  },
  brandTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "10px",
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: "1rem",
    opacity: 0.9,
    marginBottom: "40px",
    lineHeight: 1.6,
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "40px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "1rem",
    opacity: 0.9,
  },
  featureIcon: {
    fontSize: "1.3rem",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  statLabel: {
    fontSize: "0.85rem",
    opacity: 0.8,
  },
  formSide: {
    flex: 1,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "360px",
  },
  formHeader: {
    marginBottom: "30px",
  },
  welcomeBack: {
    fontSize: "2rem",
    color: "#0F3D2E",
    marginBottom: "8px",
  },
  formSubtitle: {
    color: "#666",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffebee",
    color: "#c62828",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.9rem",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
    marginBottom: "8px",
  },
  forgotLink: {
    fontSize: "0.85rem",
    color: "#C9A227",
    textDecoration: "none",
    fontWeight: "500",
    ":hover": {
      textDecoration: "underline",
    },
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "15px",
    color: "#999",
    fontSize: "1rem",
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 45px",
    border: "2px solid #eaeef2",
    borderRadius: "12px",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    outline: "none",
    ":focus": {
      borderColor: "#C9A227",
      boxShadow: "0 0 0 3px rgba(201,162,39,0.1)",
    },
    ":disabled": {
      background: "#f5f5f5",
      cursor: "not-allowed",
    },
  },
  eyeButton: {
    position: "absolute",
    right: "15px",
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    ":hover": {
      color: "#0F3D2E",
    },
  },
  rememberContainer: {
    marginBottom: "25px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#666",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#C9A227",
  },
  loginButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #C9A227 0%, #B38F1F 100%)",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "20px",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 5px 20px rgba(201,162,39,0.3)",
    },
  },
  loadingSpinner: {
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "2px solid #0F3D2E",
    borderRadius: "50%",
    borderTopColor: "transparent",
    animation: "spin 1s linear infinite",
  },
  signupContainer: {
    textAlign: "center",
  },
  signupText: {
    color: "#666",
    fontSize: "0.9rem",
  },
  signupLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontWeight: "600",
    marginLeft: "5px",
    ":hover": {
      textDecoration: "underline",
    },
  },
  alternativeSection: {
    marginTop: "30px",
  },
  divider: {
    position: "relative",
    textAlign: "center",
    marginBottom: "20px",
    "::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      height: "1px",
      background: "#eaeef2",
    },
  },
  dividerText: {
    position: "relative",
    background: "#fff",
    padding: "0 10px",
    color: "#999",
    fontSize: "0.85rem",
  },
  socialButtons: {
    display: "flex",
    gap: "10px",
  },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    background: "#fff",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#f8f9fa",
      borderColor: "#C9A227",
    },
  },
  socialIcon: {
    width: "18px",
    height: "18px",
  },
};

// Add global animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #C9A227 !important;
    box-shadow: 0 0 0 3px rgba(201,162,39,0.1) !important;
  }
`;
document.head.appendChild(styleSheet);

export default WikiLoginPage;