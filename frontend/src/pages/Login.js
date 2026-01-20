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
    <div className="login-page" style={{ minHeight: "100vh" }}>
      <div className="login-box">
        <div className="login-logo">
          <b>User</b>Management
        </div>

        <div className="card card-outline card-primary">
          <div className="card-body login-card-body">
            <form onSubmit={submit}>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              <button className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
