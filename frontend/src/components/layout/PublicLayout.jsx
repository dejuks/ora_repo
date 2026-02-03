import { Link } from "react-router-dom";
import "./publicLayout.css";

export default function PublicLayout({ children }) {
  return (
    <>
      {/* TOP NAV (MINIMAL) */}
      <header className="public-header">
        <div className="container header-flex">
          <Link to="/" className="logo">
            ORA<span> Repository</span>
          </Link>

          <nav className="public-nav">
            <Link to="/repository">Browse</Link>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Create Account</Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="public-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} ORA  Research Repository</p>
        </div>
      </footer>
    </>
  );
}
