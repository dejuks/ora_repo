import { Link } from "react-router-dom";

export default function PublicLayout({ children }) {
  return (
    <div className="wrapper">
      {/* ================= NAVBAR ================= */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        {/* Left navbar */}
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="navbar-brand">
              <strong>ORA</strong> Repository
            </Link>
          </li>
        </ul>

        {/* Right navbar */}
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to="/repository" className="nav-link">
              Browse
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/login"
              className="btn btn-outline-primary btn-sm mr-2"
            >
              Login
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/register"
              className="btn btn-primary btn-sm"
            >
              Create Account
            </Link>
          </li>
        </ul>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="content-wrapper">
        <section className="content pt-4">
          <div className="container-fluid">
            {children}
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
