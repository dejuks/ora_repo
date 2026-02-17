import React, { useState } from "react";
import { login } from "../api/auth.api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const module = user.module_name?.toLowerCase().trim();

      const dashboardMap = {
        "system-wide": "/admin-dashboard",
        "ebook publishing": "/ebook-dashboard",
        "journal management": "/journal-dashboard",
        "library management": "/library-dashboard",
        "ora repository management": "/repository/admin/dashboard",
        "oromo wikipedia": "/wikipedia-dashboard",
        "researchers' network": "/researcher-dashboard",
      };

      window.location.href = dashboardMap[module] || "/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ora-login-page">
      {/* ====== STYLES ====== */}
      <style>{`
        .ora-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ec93db, #cf61e2, #983da3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Poppins", sans-serif;
        }

        .ora-login-wrapper {
          width: 100%;
          max-width: 1100px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

        /* LEFT – Illustration */
        .ora-illustration {
          background: linear-gradient(135deg, #eef2f3, #dfe9f3);
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }

        .ora-illustration img {
          max-width: 100%;
          margin-bottom: 25px;
        }

        .ora-illustration h2 {
          font-weight: 700;
          color: #203a43;
        }

        .ora-illustration p {
          color: #555;
          font-size: 0.95rem;
        }

        /* RIGHT – Login Card */
        .ora-login-card {
          padding: 60px 50px;
        }

        .ora-logo {
          font-size: 1.8rem;
          font-weight: 800;
          color: #2c5364;
          text-align: center;
          margin-bottom: 10px;
        }

        .ora-subtitle {
          text-align: center;
          color: #6c757d;
          margin-bottom: 35px;
        }

        .form-control {
          height: 48px;
          border-radius: 10px;
        }

        .btn-ora {
          background: linear-gradient(135deg, #2c5364, #203a43);
          border: none;
          height: 48px;
          border-radius: 12px;
          font-weight: 600;
        }

        .btn-ora:hover {
          opacity: 0.95;
        }

        .forgot-link {
          display: block;
          text-align: center;
          margin-top: 18px;
        }

        /* Mobile */
        @media (max-width: 900px) {
          .ora-login-wrapper {
            grid-template-columns: 1fr;
          }

          .ora-illustration {
            display: none;
          }
        }
      `}</style>

      {/* ====== CONTENT ====== */}
      <div className="ora-login-wrapper">
        {/* LEFT PANEL */}
        <div className="ora-illustration">
          <img
            src="/login.png" width={340}
            alt="Secure Login Illustration"
          />
          <h2>Welcome Back 👋</h2>
          <p>
            Access ORA securely.  
            Research, knowledge, and collaboration — all in one place.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="ora-login-card">
          <div className="ora-logo">ORA</div>
          <p className="ora-subtitle">Sign in to continue</p>

          <form onSubmit={submit}>
            {/* Email */}
            <div className="form-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            {/* Password */}
            <div className="form-group mb-4">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="btn btn-ora btn-block text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <a href="/forgot-password" className="forgot-link">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}
