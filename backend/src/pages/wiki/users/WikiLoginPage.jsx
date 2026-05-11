// WikiLoginPage.jsx
import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../landing/components/Navbar";

const WikiLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/wiki/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token & user
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      if (rememberMe) localStorage.setItem("rememberedEmail", formData.email);
      else localStorage.removeItem("rememberedEmail");

      navigate("/wiki/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="wiki-login-container">
        <div className="wiki-login-wrapper">
          {/* Branding Side */}
          <div className="wiki-login-brand">
            <h1>Oromo Wikipedia</h1>
            <p>Join the community of knowledge contributors</p>

            <div className="features-list">
              <div>📝 Create and edit articles</div>
              <div>🖼️ Upload media and images</div>
              <div>🌍 Preserve Oromo culture</div>
              <div>🏆 Build your reputation</div>
            </div>

            <div className="stats-container">
              <div><strong>10K+</strong> Articles</div>
              <div><strong>5K+</strong> Contributors</div>
              <div><strong>1M+</strong> Readers</div>
            </div>
          </div>

          {/* Form Side */}
          <div className="wiki-login-form-side">
            <form className="wiki-login-form" onSubmit={handleSubmit}>
              <h2>Welcome Back! 👋</h2>
              <p>Log in to continue contributing to Oromo Wikipedia</p>

              {error && <div className="error-message">{error}</div>}

              {/* Email */}
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope />
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <div className="password-header">
                  <label>Password</label>
                  <Link to="/wiki/forgot-password">Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <FaLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading}>
                {loading ? "Loading..." : "Log In"}
              </button>

              {/* Signup */}
              <p className="signup-text">
                New to Oromo Wikipedia? <Link to="/wiki/register">Create an account</Link>
              </p>

              {/* Social Login */}
              <div className="social-login">
                <button><img src="https://www.google.com/favicon.ico" alt="Google"/> Google</button>
                <button><img src="https://github.com/favicon.ico" alt="GitHub"/> GitHub</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .wiki-login-container { min-height: 100vh; display:flex; align-items:center; justify-content:center; background:#f8f9fa; padding:20px; font-family: 'Inter','Poppins',sans-serif;}
        .wiki-login-wrapper { display:flex; width:1100px; max-width:100%; height:600px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.1);}
        .wiki-login-brand { flex:1; background:linear-gradient(135deg,#0F3D2E 0%,#1A5439 100%); color:#fff; padding:40px; display:flex; flex-direction:column; justify-content:center; }
        .features-list { margin-top:20px; display:flex; flex-direction:column; gap:15px; }
        .stats-container { display:flex; justify-content:space-between; margin-top:20px; }
        .wiki-login-form-side { flex:1; display:flex; justify-content:center; align-items:center; padding:40px; }
        .wiki-login-form { width:100%; max-width:360px; display:flex; flex-direction:column; }
        .input-group { margin-bottom:20px; }
        .input-wrapper { position:relative; display:flex; align-items:center; }
        .input-wrapper input { width:100%; padding:14px 14px 14px 40px; border-radius:12px; border:2px solid #eaeef2; outline:none; font-size:0.95rem; }
        .input-wrapper svg { position:absolute; left:10px; color:#999; }
        .toggle-password { position:absolute; right:10px; background:none; border:none; cursor:pointer; }
        .checkbox-label { display:flex; align-items:center; gap:8px; margin-bottom:20px; cursor:pointer; color:#666; }
        button[type="submit"] { padding:14px; border-radius:12px; border:none; font-weight:600; background:linear-gradient(135deg,#C9A227,#B38F1F); color:#0F3D2E; cursor:pointer; margin-bottom:20px; transition:0.3s; }
        button[type="submit"]:disabled { opacity:0.7; cursor:not-allowed; }
        .signup-text { text-align:center; color:#666; font-size:0.9rem; margin-bottom:15px; }
        .social-login { display:flex; gap:10px; justify-content:center; }
        .social-login button { flex:1; display:flex; align-items:center; gap:5px; padding:10px; border:2px solid #eaeef2; border-radius:10px; cursor:pointer; background:#fff; }
        .social-login img { width:18px; height:18px; }
        .error-message { background:#ffebee; color:#c62828; padding:12px 16px; border-radius:8px; margin-bottom:20px; }
      `}</style>
    </>
  );
};

export default WikiLoginPage;