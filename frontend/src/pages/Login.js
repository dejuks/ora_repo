import React, { useState } from "react";
import { login } from "../api/auth.api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const getRoleNames = (user) => {
    return (user.roles || [])
      .map((r) => (r.role_name || r.name || r.code || "").toUpperCase().trim())
      .filter(Boolean);
  };

  const getRedirectPath = (user) => {
    const roleNames = getRoleNames(user);

    const roleDashboardMap = {
      SUPER_ADMIN: "/admin-dashboard",

      // Library
      LIBRARY_ADMIN: "/library/admin/dashboard",
      LIBRARY_MANAGER: "/library/manager/dashboard",
      LIBRARIAN: "/library/librarian/dashboard",
      CATALOGER: "/library/cataloger/dashboard",
      ACQUISITION_OFFICER: "/library/acquisition/dashboard",
      INVENTORY_MANAGER: "/library/inventory/dashboard",
      CONTENT_UPLOADER: "/library/uploader/dashboard",
      LIBRARY_MEMBER: "/library/member/dashboard",

      // eBook
      EBOOK_ADMIN: "/ebook/dashboard",
      EBOOK_EDITOR: "/ebook/dashboard",
      EBOOK_AUTHOR: "/ebook/dashboard",
      EBOOK_REVIEWER: "/ebook/dashboard",
      EBOOK_DIGITAL_CONTENT_MANAGER: "/ebook/dashboard",
      EBOOK_FINANCE_OFFICER: "/ebook/dashboard",

      // Journal
      JOURNAL_MANAGER: "/journal-dashboard",
      JOURNAL_AUTHOR: "/journal/author-dashboard",
      JOURNAL_EIC: "/journal-dashboard",
      JOURNAL_ASSOCIATE_EDITOR: "/journal-dashboard",
      JOURNAL_REFREE: "/journal-dashboard",
      REVIEWER: "/journal-dashboard",
      EDITOR: "/journal-dashboard",

      // Repository
      REPOSITORY_ADMIN: "/repository/admin/dashboard",
      REPOSITORY_CURATOR: "/repository/curator/dashboard",
      REPOSITORY_CONTENT_REVIEWER: "/repository/reviewer/dashboard",
      RESEARCHER_AUTHOR: "/repository/author/dashboard",
      REPOSITORY_PUBLIC_USER: "/repository/search",
      REPOSITORY_GUEST: "/repository/search",

      // Oromo Wiki
      ORO_WIKI_MANAGER: "/wiki/dashboard",
      ORO_WIKI_EDITOR: "/wiki/dashboard",
      ORO_WIKI_BUREAUCRAT: "/wiki/dashboard",
      ORO_WIKI_OVERSIGHTER: "/wiki/dashboard",
      ORO_WIKI_PUBLISHER: "/wiki/dashboard",

      // Researcher Network
      RESEARCHER_NETWORK_MANAGER: "/research-network/dashboard",
      RESEARCHER_NETWORK_MODERATOR: "/research-network/dashboard",
    };

    const rolePriority = [
      "SUPER_ADMIN",

      "LIBRARY_ADMIN",
      "LIBRARY_MANAGER",
      "LIBRARIAN",
      "CATALOGER",
      "ACQUISITION_OFFICER",
      "INVENTORY_MANAGER",
      "CONTENT_UPLOADER",
      "LIBRARY_MEMBER",

      "EBOOK_ADMIN",
      "EBOOK_EDITOR",
      "EBOOK_DIGITAL_CONTENT_MANAGER",
      "EBOOK_FINANCE_OFFICER",
      "EBOOK_REVIEWER",
      "EBOOK_AUTHOR",

      "JOURNAL_MANAGER",
      "JOURNAL_EIC",
      "JOURNAL_ASSOCIATE_EDITOR",
      "EDITOR",
      "REVIEWER",
      "JOURNAL_REFREE",
      "JOURNAL_AUTHOR",

      "REPOSITORY_ADMIN",
      "REPOSITORY_CURATOR",
      "REPOSITORY_CONTENT_REVIEWER",
      "RESEARCHER_AUTHOR",
      "REPOSITORY_PUBLIC_USER",
      "REPOSITORY_GUEST",

      "ORO_WIKI_MANAGER",
      "ORO_WIKI_BUREAUCRAT",
      "ORO_WIKI_OVERSIGHTER",
      "ORO_WIKI_PUBLISHER",
      "ORO_WIKI_EDITOR",

      "RESEARCHER_NETWORK_MANAGER",
      "RESEARCHER_NETWORK_MODERATOR",
    ];

    const matchedRole = rolePriority.find((role) => roleNames.includes(role));
    if (matchedRole && roleDashboardMap[matchedRole]) {
      return roleDashboardMap[matchedRole];
    }

    const module = user.module_name?.toLowerCase().trim();
    const moduleDashboardMap = {
      "system-wide": "/admin-dashboard",
      "ebook publishing": "/ebook/dashboard",
      "journal management": "/journal-dashboard",
      "library management": "/library/member/dashboard",
      "ora repository management": "/repository/admin/dashboard",
      "oromo wikipedia": "/wiki/dashboard",
      "researchers' network": "/research-network/dashboard",
    };

    return moduleDashboardMap[module] || "/dashboard";
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const redirectTo = getRedirectPath(user);
      window.location.href = redirectTo;
    } catch (err) {
      alert(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ora-login-page">
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

        @media (max-width: 900px) {
          .ora-login-wrapper {
            grid-template-columns: 1fr;
          }

          .ora-illustration {
            display: none;
          }
        }
      `}</style>

      <div className="ora-login-wrapper">
        <div className="ora-illustration">
          <img src="/login.png" width={340} alt="Secure Login Illustration" />
          <h2>Welcome Back 👋</h2>
          <p>
            Access ORA securely.
            Research, knowledge, and collaboration — all in one place.
          </p>
        </div>

        <div className="ora-login-card">
          <div className="ora-logo">ORA</div>
          <p className="ora-subtitle">Sign in to continue</p>

          <form onSubmit={submit}>
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