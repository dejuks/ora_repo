import React, { useMemo, useState } from "react";

export default function EbookAuthorLogin() {
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const LOGIN_URL = useMemo(() => `${API_BASE}/api/ebook/login`, [API_BASE]);

  const readResponseBody = async (res) => {
    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("application/json")) {
      return await res.json().catch(() => ({}));
    }

    const text = await res.text().catch(() => "");
    return { __nonJsonText: text, __contentType: contentType };
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: form.emailOrUsername.trim(), // ✅ FIX: backend expects "email"
          password: form.password,
        }),
      });

      const data = await readResponseBody(res);

      // If server returned HTML (e.g. Cannot POST), show preview
      if (data && data.__nonJsonText !== undefined) {
        const preview = String(data.__nonJsonText || "").slice(0, 220);
        throw new Error(
          `Server returned non-JSON response (status ${res.status}). Preview: ${preview}`
        );
      }

      if (!res.ok) {
        throw new Error(data?.message || "Invalid credentials");
      }

      const token =
        data?.data?.token ||
        data?.token ||
        data?.access_token ||
        data?.data?.access_token ||
        null;

      const user = data?.data?.user || data?.user || null;

      if (!token) throw new Error("Login succeeded but no token returned from API.");

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect to requested page (submit / my-submissions) if present
      const params = new URLSearchParams(window.location.search);
      const next =
        params.get("next") || localStorage.getItem("ebook_next") || "/ebook/dashboard";

      localStorage.removeItem("ebook_next");
      window.location.href = next;
    } catch (e2) {
      setErr(e2?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ora-login-page">
      <style>{`
        .ora-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0F3D2E, #1A5439, #C9A227);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Poppins", sans-serif;
          padding: 18px;
        }

        .ora-login-wrapper {
          width: 100%;
          max-width: 1100px;
          background: rgba(255, 255, 255, 0.97);
          border-radius: 18px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

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
          margin: 0 auto 25px auto;
          display: block;
        }

        .ora-illustration h2 {
          font-weight: 700;
          color: #0F3D2E;
        }

        .ora-illustration p {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .ora-login-card {
          padding: 60px 50px;
        }

        .ora-logo {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0F3D2E;
          text-align: center;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }

        .ora-subtitle {
          text-align: center;
          color: #6c757d;
          margin-bottom: 30px;
        }

        .ora-error {
          background: #ffebee;
          color: #b71c1c;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 14px;
          font-size: 0.92rem;
        }

        .form-control {
          height: 48px;
          border-radius: 10px;
          border: 1px solid #d7dbe0;
          padding: 10px 12px;
          width: 100%;
          outline: none;
        }

        .form-control:focus {
          border-color: #C9A227;
          box-shadow: 0 0 0 3px rgba(201,162,39,0.15);
        }

        .btn-ora {
          background: linear-gradient(135deg, #C9A227, #0F3D2E);
          border: none;
          height: 48px;
          border-radius: 12px;
          font-weight: 700;
          width: 100%;
        }

        .btn-ora:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .forgot-link {
          display: block;
          text-align: center;
          margin-top: 18px;
          color: #0F3D2E;
          font-weight: 600;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .register-link {
          display: block;
          text-align: center;
          margin-top: 14px;
          color: #555;
        }

        .register-link a {
          color: #0F3D2E;
          font-weight: 700;
          text-decoration: none;
        }

        .register-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .ora-login-wrapper {
            grid-template-columns: 1fr;
          }
          .ora-illustration {
            display: none;
          }
          .ora-login-card {
            padding: 42px 22px;
          }
        }
      `}</style>

      <div className="ora-login-wrapper">
        <div className="ora-illustration">
          <img src="/login.png" width={340} alt="Author Login" />
          <h2>Author Portal ✍️</h2>
          <p>
            Sign in to manage your ebooks, upload revisions, track screening & reviews,
            and publish to readers worldwide.
          </p>
        </div>

        <div className="ora-login-card">
          <div className="ora-logo">ORA EBOOKS</div>
          <p className="ora-subtitle">Sign in as an Author</p>

          {err && (
            <div className="ora-error">
              {err}
              <div style={{ marginTop: 6, fontSize: "0.85rem", opacity: 0.9 }}>
                Endpoint: {LOGIN_URL}
              </div>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-group mb-3" style={{ marginBottom: 14 }}>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={form.emailOrUsername}
                onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
                required
              />
            </div>

            <div className="form-group mb-4" style={{ marginBottom: 16 }}>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-ora text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <a href="/ebook/forgot-password" className="forgot-link">
            Forgot your password?
          </a>

          <div className="register-link">
            Don’t have an author account? <a href="/ebooks/author-registration">Register</a>
          </div>
        </div>
      </div>
    </div>
  );
}