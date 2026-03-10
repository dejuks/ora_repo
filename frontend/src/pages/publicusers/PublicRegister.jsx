import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicRegister } from "../../api/publicUsers.api";
import "../../pages/publicusers/publicAuth.css";
import { FiUser, FiMail, FiLock, FiGlobe, FiBriefcase, FiArrowRight, FiCheck } from "react-icons/fi";

export default function PublicRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    affiliation: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Password strength calculation
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate password strength
    if (passwordStrength < 75) {
      setError("Please use a stronger password");
      setLoading(false);
      return;
    }

    try {
      await publicRegister(form);
      setSuccess("Registration successful! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength >= 75) return "#10b981";
    if (strength >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: form.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "One number", met: /[0-9]/.test(form.password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(form.password) },
  ];

  return (
    <div className="auth-page">
      {/* ENHANCED LANDING HEADER */}
      <header className="auth-hero">
        <div className="auth-hero-background"></div>
        <div className="container auth-hero-content">
          <div className="auth-hero-text">
            <div className="auth-brand">
              <div className="auth-logo">ORR</div>
              <span className="auth-brand-tag">Open Access Research</span>
            </div>
            <h1 className="auth-hero-title">
              Join the <span className="highlight">Global Research</span> Community
            </h1>
            <p className="auth-hero-description">
              Register for free access to thousands of scholarly publications, 
              research papers, datasets, and theses from the Oromo academic community.
            </p>
            <div className="auth-benefits">
              <div className="benefit-item">
                <FiCheck /> Free forever
              </div>
              <div className="benefit-item">
                <FiCheck /> Open access
              </div>
              <div className="benefit-item">
                <FiCheck /> Global community
              </div>
              <div className="benefit-item">
                <FiCheck /> Secure platform
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* REGISTER FORM SECTION */}
      <div className="auth-container">
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-title">Create Your Account</h2>
              <p className="auth-subtitle">
                Join thousands of researchers worldwide
              </p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="auth-message auth-error">
                <div className="message-icon">!</div>
                <div>{error}</div>
              </div>
            )}
            
            {success && (
              <div className="auth-message auth-success">
                <div className="message-icon">✓</div>
                <div>{success}</div>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">
                    <FiUser className="form-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`form-input ${touched.full_name && !form.full_name ? 'input-error' : ''}`}
                  />
                  {touched.full_name && !form.full_name && (
                    <span className="form-error">Full name is required</span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">
                    <FiMail className="form-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="researcher@university.edu"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`form-input ${touched.email && !form.email.includes('@') ? 'input-error' : ''}`}
                  />
                  {touched.email && !form.email.includes('@') && (
                    <span className="form-error">Valid email is required</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group form-group-full">
                  <label className="form-label">
                    <FiLock className="form-icon" />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`form-input ${touched.password && passwordStrength < 75 ? 'input-error' : ''}`}
                  />
                  
                  {/* Password Strength */}
                  {form.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill"
                          style={{
                            width: `${passwordStrength}%`,
                            backgroundColor: getStrengthColor(passwordStrength)
                          }}
                        />
                      </div>
                      <span className="strength-text">
                        {passwordStrength >= 75 ? 'Strong' : 
                         passwordStrength >= 50 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="password-requirements">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className={`requirement ${req.met ? 'met' : ''}`}>
                        <div className="requirement-check">
                          {req.met ? '✓' : '○'}
                        </div>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affiliation */}
                <div className="form-group">
                  <label className="form-label">
                    <FiBriefcase className="form-icon" />
                    Affiliation
                  </label>
                  <input
                    type="text"
                    name="affiliation"
                    placeholder="University, Institution, or Organization"
                    value={form.affiliation}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                {/* Country */}
                <div className="form-group">
                  <label className="form-label">
                    <FiGlobe className="form-icon" />
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Your country"
                    value={form.country}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-agreement">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="terms-checkbox"
                />
                <label htmlFor="terms" className="terms-label">
                  I agree to the <a href="/terms" className="terms-link">Terms of Service</a> and{" "}
                  <a href="/privacy" className="terms-link">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    Create Account
                    <FiArrowRight className="btn-icon" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            {/* Login Link */}
            <div className="auth-footer">
              <button 
                onClick={() => navigate("/login")}
                className="auth-link-btn"
              >
                Sign in to your account
              </button>
              <p className="auth-help">
                Need help? <a href="/support" className="help-link">Contact support</a>
              </p>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="auth-stats">
            <div className="stats-card">
              <h3 className="stats-title">Why Join ORR?</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">10,000+</div>
                  <div className="stat-label">Research Papers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">5,000+</div>
                  <div className="stat-label">Active Researchers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Open Access</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">10+</div>
                  <div className="stat-label">Countries</div>
                </div>
              </div>
              <div className="stats-note">
                Join researchers from around the world sharing knowledge freely
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}