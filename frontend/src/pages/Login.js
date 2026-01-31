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

      // ✅ normalize module name
      const module = user.module_name?.toLowerCase().trim();

      // ✅ module → dashboard mapping
      const dashboardMap = {
        "system-wide": "/admin-dashboard",
        "ebook publishing": "/ebook-dashboard",
        "journal management": "/journal-dashboard",
        "library management": "/library-dashboard",
        "ora repository management": "/repository-dashboard",
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
 <div className="login-page">
  <div className="login-box">
    {/* Logo */}
    <div className="login-logo">
      <b>ORA</b> Platform
    </div>

    {/* Card */}
    <div className="card card-outline card-primary">
      <div className="card-header text-center">
        <h1 className="h4 mb-0"><b>ORA</b> Login</h1>
      </div>

      <div className="card-body login-card-body">
        <p className="login-box-msg">
          Sign in to start your session
        </p>

        <form onSubmit={submit}>
          {/* Email */}
          <div className="input-group mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
            <div className="input-group-append">
              <div className="input-group-text">
                <span className="fas fa-envelope"></span>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="input-group mb-4">
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
            <div className="input-group-append">
              <div className="input-group-text">
                <span className="fas fa-lock"></span>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="row">
            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer links */}
        <p className="mb-1 mt-3 text-center">
          <a href="/forgot-password">I forgot my password</a>
        </p>
      </div>
    </div>
  </div>
</div>

  );
}
