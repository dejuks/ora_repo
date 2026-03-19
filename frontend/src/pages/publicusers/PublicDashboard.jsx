import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBookOpen,
  FiFileText,
  FiUser,
  FiLogOut,
  FiTrendingUp
} from "react-icons/fi";

export default function PublicDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("public_user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem("public_token");
    localStorage.removeItem("public_user");
    navigate("/login");
  };

  return (
    <div className="wrapper">
      {/* ================= NAVBAR ================= */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <span className="navbar-brand">
              <strong>ORA</strong> Repository
            </span>
          </li>
        </ul>

        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <button
              onClick={logout}
              className="btn btn-danger btn-sm"
            >
              <FiLogOut className="mr-1" /> Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* ================= SIDEBAR ================= */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <span className="brand-link text-center">
          <span className="brand-text font-weight-light">
            ORA Dashboard
          </span>
        </span>

        <div className="sidebar">
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              role="menu"
            >
              <li className="nav-item">
                <button
                  className="nav-link active"
                  onClick={() => navigate("/public/dashboard")}
                >
                  <FiTrendingUp className="nav-icon" />
                  <p>Dashboard</p>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() =>
                    navigate("/repository/public/search")
                  }
                >
                  <FiSearch className="nav-icon" />
                  <p>Repository</p>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => navigate("/journals/public")}
                >
                  <FiFileText className="nav-icon" />
                  <p>Journals</p>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => navigate("/public/profile")}
                >
                  <FiUser className="nav-icon" />
                  <p>My Profile</p>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <div className="content-wrapper">
        <section className="content pt-4">
          <div className="container-fluid">
            {/* Welcome */}
            <div className="row mb-3">
              <div className="col-12">
                <h3>
                  Welcome{user ? `, ${user.full_name}` : ""} 👋
                </h3>
                <p className="text-muted">
                  Discover open-access research, journals, and academic resources.
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="row">
              <DashboardCard
                title="Search Repository"
                desc="Browse thousands of research documents"
                icon={<FiSearch />}
                color="primary"
                onClick={() =>
                  navigate("/repository/public/search")
                }
              />

              <DashboardCard
                title="Browse Journals"
                desc="Explore peer-reviewed journals"
                icon={<FiBookOpen />}
                color="success"
                onClick={() =>
                  navigate("/journals/public")
                }
              />

              <DashboardCard
                title="My Profile"
                desc="Update your public profile"
                icon={<FiUser />}
                color="info"
                onClick={() =>
                  navigate("/public/profile")
                }
              />
            </div>

            {/* EMPTY STATE */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="card card-outline card-secondary">
                  <div className="card-header">
                    <h3 className="card-title">
                      Your activity
                    </h3>
                  </div>
                  <div className="card-body text-muted">
                    You haven’t downloaded or saved any items yet.
                    Start exploring research content now.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="main-footer text-center">
        <strong>
          © {new Date().getFullYear()} ORA Research Repository
        </strong>
      </footer>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */

function DashboardCard({ title, desc, icon, color, onClick }) {
  return (
    <div className="col-md-4">
      <div
        className={`card card-outline card-${color}`}
        style={{ cursor: "pointer" }}
        onClick={onClick}
      >
        <div className="card-body text-center">
          <div className={`text-${color} mb-2`} style={{ fontSize: 28 }}>
            {icon}
          </div>
          <h5>{title}</h5>
          <p className="text-muted">{desc}</p>
        </div>
      </div>
    </div>
  );
}
