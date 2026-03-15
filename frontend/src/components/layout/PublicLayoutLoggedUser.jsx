import { Link } from "react-router-dom";

export default function PublicLayoutLoggedUser({ children }) {
  return (
    <div className="public-shell">
      <header className="public-shell__header">
        <Link to="/" className="public-shell__brand">
          <strong>ORA</strong> Repository
        </Link>
        <nav className="public-shell__nav">
          <Link to="/repository">Browse</Link>
          <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
        </nav>
      </header>
      <main className="public-shell__content">
        <div className="container-fluid">{children}</div>
      </main>
      <footer className="public-shell__footer">
        © {new Date().getFullYear()} ORA Research Repository
      </footer>
    </div>
  );
}
