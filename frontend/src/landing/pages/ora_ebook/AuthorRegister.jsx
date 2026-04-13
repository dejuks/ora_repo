// pages/AuthorRegister.jsx - Modern Attractive Design
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_URL = process.env.REACT_APP_API_URL;

const AuthorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    affiliation: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.password) {
      alert("Please fill required fields");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/ebook_authors/register-author`,
        form
      );

      alert("Author Registered Successfully!");
      navigate("/auth");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Error registering author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="author-register-container">
        <div className="register-wrapper">
          {/* Left Side - Image & Info */}
          <div className="register-left">
            <div className="left-content">
              <div className="ebook-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <h2>Become an Author</h2>
              <p>Join our community of writers and share your knowledge with the world</p>
              
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">📚</span>
                  <div>
                    <h4>Publish Your Work</h4>
                    <p>Share your eBooks with thousands of readers</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <div>
                    <h4>Earn Royalties</h4>
                    <p>Get paid for your published work</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <div>
                    <h4>Global Reach</h4>
                    <p>Reach readers from around the world</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <div>
                    <h4>Analytics Dashboard</h4>
                    <p>Track your sales and reader engagement</p>
                  </div>
                </div>
              </div>

              <div className="testimonial">
                <div className="quote-icon">"</div>
                <p>Publishing with Oromo eBooks has been amazing! I've reached thousands of readers worldwide.</p>
                <div className="testimonial-author">
                  <strong>- Alemitu Bekele</strong>
                  <span>Bestselling Author</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="register-right">
            <div className="form-container">
              <div className="form-header">
                <h3>Create Account</h3>
                <p>Join as an author and start publishing</p>
              </div>

              <form onSubmit={handleSubmit} className="author-form">
                <div className="form-group">
                  <label htmlFor="full_name">
                    Full Name <span className="required">*</span>
                  </label>
                  <div className={`input-wrapper ${focusedField === 'full_name' ? 'focused' : ''}`}>
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.full_name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('full_name')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="password-hint">Must be at least 6 characters</p>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className={`input-wrapper ${focusedField === 'phone' ? 'focused' : ''}`}>
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+251 XXX XXX XXX"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="affiliation">Affiliation</label>
                  <div className={`input-wrapper ${focusedField === 'affiliation' ? 'focused' : ''}`}>
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <input
                      id="affiliation"
                      name="affiliation"
                      type="text"
                      placeholder="University / Organization"
                      value={form.affiliation}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('affiliation')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Short Bio</label>
                  <div className={`input-wrapper textarea-wrapper ${focusedField === 'bio' ? 'focused' : ''}`}>
                    <svg className="input-icon bio-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself and your writing experience..."
                      value={form.bio}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('bio')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input form-textarea"
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Register as Author
                      </>
                    )}
                  </button>
                </div>

                <div className="form-footer">
                  <p>
                    Already have an account?{" "}
                    <Link to="/auth" className="login-link">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .author-register-container {
          min-height: calc(100vh - 70px);
          background: linear-gradient(135deg, #f5f2eb 0%, #e8dfd3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .register-wrapper {
          display: flex;
          max-width: 1300px;
          width: 100%;
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Left Side */
        .register-left {
          flex: 1;
          background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
          padding: 3rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .register-left::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .left-content {
          position: relative;
          z-index: 1;
        }

        .ebook-icon-large {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .ebook-icon-large svg {
          width: 50px;
          height: 50px;
          color: #4ECDC4;
        }

        .register-left h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .register-left > p {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .features-list {
          margin: 2rem 0;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .feature-icon {
          font-size: 1.5rem;
          min-width: 40px;
        }

        .feature-item h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .feature-item p {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .testimonial {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-top: 2rem;
          position: relative;
        }

        .quote-icon {
          font-size: 3rem;
          position: absolute;
          top: 0.5rem;
          left: 1rem;
          opacity: 0.3;
          font-family: serif;
        }

        .testimonial p {
          font-style: italic;
          margin-bottom: 1rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .testimonial-author span {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        /* Right Side */
        .register-right {
          flex: 1;
          padding: 3rem;
          background: white;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h3 {
          font-size: 1.5rem;
          color: #2c1810;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #8b7355;
        }

        .author-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #2c1810;
        }

        .required {
          color: #e74c3c;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 1px solid #e8dfd3;
          border-radius: 0.5rem;
          transition: all 0.3s;
          background: #faf7f2;
        }

        .input-wrapper.focused {
          border-color: #8b5e3c;
          box-shadow: 0 0 0 3px rgba(139, 94, 60, 0.1);
        }

        .textarea-wrapper {
          align-items: flex-start;
        }

        .input-icon {
          width: 1.25rem;
          height: 1.25rem;
          margin: 0 0.75rem;
          color: #8b7355;
        }

        .bio-icon {
          margin-top: 0.75rem;
        }

        .form-input {
          flex: 1;
          padding: 0.75rem 0.75rem 0.75rem 0;
          border: none;
          background: transparent;
          font-size: 0.875rem;
          outline: none;
          color: #2c1810;
        }

        .form-textarea {
          padding: 0.75rem 0.75rem 0.75rem 0;
          resize: vertical;
          font-family: inherit;
        }

        .password-toggle {
          background: none;
          border: none;
          color: #8b5e3c;
          cursor: pointer;
          padding: 0 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .password-hint {
          font-size: 0.7rem;
          color: #8b7355;
        }

        .form-actions {
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #8b5e3c, #4a2c1a);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(139, 94, 60, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-button svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .spinner-small {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e8dfd3;
        }

        .form-footer p {
          font-size: 0.875rem;
          color: #8b7355;
        }

        .login-link {
          color: #8b5e3c;
          text-decoration: none;
          font-weight: 600;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .register-wrapper {
            flex-direction: column;
            max-width: 600px;
          }

          .register-left {
            padding: 2rem;
          }

          .register-right {
            padding: 2rem;
          }

          .features-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .feature-item {
            margin-bottom: 0;
          }
        }

        @media (max-width: 568px) {
          .author-register-container {
            padding: 1rem;
          }

          .register-left,
          .register-right {
            padding: 1.5rem;
          }

          .features-list {
            grid-template-columns: 1fr;
          }

          .register-left h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default AuthorRegister;