// pages/journals/authors/JournalAuthPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaPhone, FaGoogle, FaGithub, FaTwitter } from "react-icons/fa";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Navbar from "../../../landing/components/Navbar";

const JournalAuthPage = ({ initialMode = "login", redirectPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = redirectPath || queryParams.get('redirect') || '/journal/contribute';

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user) {
      // If already logged in, redirect to the intended page
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  // Validation
  if (!isLogin && formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  if (!isLogin && !formData.agreeToTerms) {
    setError("You must agree to the Terms of Service and Privacy Policy");
    setLoading(false);
    return;
  }

  try {
    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          full_name: formData.full_name,
          email: formData.email, 
          phone: formData.phone,
          password: formData.password,
          role: 'author' // Set role as author for journal contributors
        };

    // Get API base URL from environment variable or use relative path
    const apiBase = process.env.REACT_APP_API_URL || '';
    
    // Construct the full URL
    const url = `${apiBase}/auth/${endpoint}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    }

    if (isLogin) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to the intended page
      navigate(redirect);
    } else {
      setSuccess(true);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
const handleSocialLogin = (provider) => {
  // Store redirect URL in session storage for after OAuth
  sessionStorage.setItem('oauth_redirect', redirect);
  
  // Use relative path - this will work in both development and production
  // as long as the API is on the same domain
  window.location.href = `/api/auth/${provider}`;
};

  if (success && !isLogin) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Registration Successful!</h2>
            <p style={styles.successText}>
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            <p style={styles.successSubtext}>
              Please check your email to verify your account. After verification, you'll be able to submit manuscripts.
            </p>
            <button 
              onClick={() => setIsLogin(true)} 
              style={styles.successButton}
            >
              Go to Login
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
        {/* Background Pattern */}
        <div style={styles.backgroundPattern}>
          <div style={styles.patternCircle1}></div>
          <div style={styles.patternCircle2}></div>
        </div>

        <div style={styles.container}>
          {/* Left Column - Branding */}
          <div style={styles.brandColumn}>
            <div style={styles.brandContent}>
              <div style={styles.brandIcon}>📚</div>
              <h1 style={styles.brandTitle}>Oromo Research Journal</h1>
              <p style={styles.brandSubtitle}>
                Join our community of scholars and researchers advancing knowledge in Oromo studies and beyond.
              </p>
              
              <div style={styles.brandFeatures}>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>Publish your research</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>Connect with peers</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>Access exclusive content</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>Track your impact</span>
                </div>
              </div>

              <div style={styles.testimonial}>
                <p style={styles.testimonialText}>
                  "The Oromo Research Journal has been instrumental in sharing my work with a global audience. The submission process is seamless and the review process is rigorous."
                </p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>Dr. A.B.</div>
                  <div>
                    <p style={styles.testimonialName}>Dr. Abebech Bekele</p>
                    <p style={styles.testimonialRole}>Contributing Author</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div style={styles.formColumn}>
            <div style={styles.formCard}>
              {/* Redirect Info Banner */}
              {redirect !== '/journal/contribute' && (
                <div style={styles.redirectBanner}>
                  <span style={styles.redirectIcon}>📝</span>
                  <span>Please login to continue to manuscript submission</span>
                </div>
              )}

              {/* Toggle */}
              <div style={styles.toggleContainer}>
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    ...styles.toggleButton,
                    ...(isLogin ? styles.toggleButtonActive : {})
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    ...styles.toggleButton,
                    ...(!isLogin ? styles.toggleButtonActive : {})
                  }}
                >
                  Register
                </button>
              </div>

              {/* Form Title */}
              <h2 style={styles.formTitle}>
                {isLogin ? 'Welcome Back!' : 'Create Your Account'}
              </h2>
              <p style={styles.formSubtitle}>
                {isLogin 
                  ? 'Please enter your details to sign in' 
                  : 'Join our community of researchers'}
              </p>

              {/* Error Message */}
              {error && (
                <div style={styles.errorContainer}>
                  <span style={styles.errorIcon}>⚠️</span>
                  <p style={styles.errorText}>{error}</p>
                </div>
              )}

              {/* Social Login Buttons */}
              {/* <div style={styles.socialContainer}>
                <button 
                  onClick={() => handleSocialLogin('google')}
                  style={styles.socialButton}
                >
                  <FaGoogle style={styles.socialIcon} />
                  Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('github')}
                  style={styles.socialButton}
                >
                  <FaGithub style={styles.socialIcon} />
                  GitHub
                </button>
                <button 
                  onClick={() => handleSocialLogin('twitter')}
                  style={styles.socialButton}
                >
                  <FaTwitter style={styles.socialIcon} />
                  Twitter
                </button>
              </div> */}

              <div style={styles.divider}>
                <span style={styles.dividerLine}></span>
                <span style={styles.dividerText}>or</span>
                <span style={styles.dividerLine}></span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={styles.form}>
                {!isLogin && (
                  <Input 
                    icon={<FaUser />} 
                    name="full_name" 
                    type="text"
                    placeholder="Full Name" 
                    value={formData.full_name}
                    onChange={handleChange} 
                    required
                  />
                )}

                <Input 
                  icon={<MdEmail />} 
                  name="email" 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={handleChange} 
                  required
                />

                {!isLogin && (
                  <Input 
                    icon={<FaPhone />} 
                    name="phone" 
                    type="tel"
                    placeholder="Phone Number (optional)" 
                    value={formData.phone}
                    onChange={handleChange} 
                  />
                )}

                <div style={styles.passwordContainer}>
                  <Input 
                    icon={<MdLock />} 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Password" : "Create Password"} 
                    value={formData.password}
                    onChange={handleChange} 
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>

                {!isLogin && (
                  <Input 
                    icon={<MdLock />} 
                    name="confirmPassword" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password" 
                    value={formData.confirmPassword}
                    onChange={handleChange} 
                    required
                  />
                )}

                {/* Remember Me & Forgot Password */}
                {isLogin && (
                  <div style={styles.row}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        name="rememberMe"
                        style={styles.checkbox}
                      />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => {/* Implement forgot password */}}
                      style={styles.forgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Terms Agreement */}
                {!isLogin && (
                  <label style={styles.termsLabel}>
                    <input 
                      type="checkbox" 
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      style={styles.checkbox}
                      required
                    />
                    <span>
                      I agree to the <Link to="/terms" style={styles.termsLink}>Terms of Service</Link> and{' '}
                      <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
                    </span>
                  </label>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  style={styles.submitButton}
                  disabled={loading || (!isLogin && !formData.agreeToTerms)}
                >
                  {loading ? (
                    <span style={styles.loadingSpinner}></span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

                {/* Redirect Link for Mobile */}
                <div style={styles.mobileRedirect}>
                  {isLogin ? (
                    <p>
                      Don't have an account?{' '}
                      <button 
                        onClick={() => setIsLogin(false)}
                        style={styles.redirectLink}
                      >
                        Sign up
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{' '}
                      <button 
                        onClick={() => setIsLogin(true)}
                        style={styles.redirectLink}
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* INPUT COMPONENT */
const Input = ({ icon, ...props }) => (
  <div style={styles.inputGroup}>
    <span style={styles.inputIcon}>{icon}</span>
    <input {...props} style={styles.input} />
  </div>
);

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },

  patternCircle1: {
    position: "absolute",
    top: "-10%",
    right: "-5%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(10, 47, 31, 0.03) 0%, rgba(201, 162, 39, 0.03) 100%)",
  },

  patternCircle2: {
    position: "absolute",
    bottom: "-10%",
    left: "-5%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(201, 162, 39, 0.03) 0%, rgba(10, 47, 31, 0.03) 100%)",
  },

  container: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "100vh",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
  },

  // Brand Column
  brandColumn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
  },

  brandContent: {
    maxWidth: "450px",
  },

  brandIcon: {
    fontSize: "4rem",
    marginBottom: "1.5rem",
  },

  brandTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#0A2F1F",
    margin: "0 0 1rem",
    lineHeight: "1.2",
  },

  brandSubtitle: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "2rem",
  },

  brandFeatures: {
    marginBottom: "3rem",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    fontSize: "1rem",
    color: "#1e293b",
  },

  featureIcon: {
    color: "#C9A227",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },

  testimonial: {
    padding: "2rem",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },

  testimonialText: {
    fontSize: "0.95rem",
    color: "#475569",
    lineHeight: "1.7",
    fontStyle: "italic",
    marginBottom: "1.5rem",
  },

  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  testimonialAvatar: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
  },

  testimonialName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 0.25rem",
  },

  testimonialRole: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
  },

  // Form Column
  formColumn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },

  formCard: {
    background: "white",
    borderRadius: "32px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  redirectBanner: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem",
    background: "rgba(201, 162, 39, 0.1)",
    border: "1px solid rgba(201, 162, 39, 0.2)",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    color: "#0A2F1F",
    fontSize: "0.95rem",
  },

  redirectIcon: {
    fontSize: "1.25rem",
  },

  toggleContainer: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.5rem",
    background: "#f1f5f9",
    borderRadius: "16px",
    marginBottom: "2rem",
  },

  toggleButton: {
    flex: 1,
    padding: "0.75rem",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "transparent",
    color: "#64748b",
  },

  toggleButtonActive: {
    background: "white",
    color: "#0A2F1F",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },

  formTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#0A2F1F",
    margin: "0 0 0.5rem",
  },

  formSubtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "2rem",
  },

  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    marginBottom: "1.5rem",
  },

  errorIcon: {
    fontSize: "1.25rem",
  },

  errorText: {
    color: "#dc2626",
    fontSize: "0.95rem",
    margin: 0,
  },

  socialContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },

  socialButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  socialIcon: {
    fontSize: "1rem",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },

  dividerText: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },

  inputIcon: {
    color: "#C9A227",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
  },

  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "0.95rem",
    color: "#0f172a",
    width: "100%",
  },

  passwordContainer: {
    position: "relative",
  },

  passwordToggle: {
    position: "absolute",
    right: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "1.2rem",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    color: "#475569",
    cursor: "pointer",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#C9A227",
    cursor: "pointer",
  },

  forgotPassword: {
    background: "transparent",
    border: "none",
    fontSize: "0.95rem",
    color: "#C9A227",
    cursor: "pointer",
  },

  termsLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.95rem",
    color: "#475569",
    cursor: "pointer",
    marginTop: "0.5rem",
  },

  termsLink: {
    color: "#C9A227",
    textDecoration: "none",
  },

  submitButton: {
    padding: "1rem",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "48px",
  },

  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid white",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  mobileRedirect: {
    display: "none",
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.95rem",
    color: "#64748b",
  },

  redirectLink: {
    background: "transparent",
    border: "none",
    color: "#C9A227",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Success Page
  successCard: {
    background: "white",
    padding: "3rem",
    borderRadius: "32px",
    textAlign: "center",
    maxWidth: "450px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  successIcon: {
    fontSize: "4rem",
    marginBottom: "1.5rem",
  },

  successTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0A2F1F",
    margin: "0 0 1rem",
  },

  successText: {
    fontSize: "1.1rem",
    color: "#475569",
    marginBottom: "0.5rem",
  },

  successSubtext: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "2rem",
  },

  successButton: {
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Media Queries
  "@media (max-width: 968px)": {
    container: {
      gridTemplateColumns: "1fr",
    },
    brandColumn: {
      display: "none",
    },
    mobileRedirect: {
      display: "block",
    },
  },
};

// Add global styles
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .input-group:focus-within {
    border-color: #C9A227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
  }

  .social-button:hover {
    background: #f8fafc;
    border-color: #C9A227;
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(10, 47, 31, 0.2);
  }

  .toggle-button:hover {
    background: white;
  }

  .forgot-password:hover {
    text-decoration: underline;
  }

  .terms-link:hover {
    text-decoration: underline;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

export default JournalAuthPage;