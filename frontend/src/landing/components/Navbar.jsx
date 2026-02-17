import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
  <div style={styles.logoWrapper}>
    <img src="/ora.png" alt="ORA Logo" style={styles.logoImage} />
    <span style={styles.logoText}>
      <span style={styles.logoOromo}>OR</span>
      <span style={styles.logoResearcher}>A</span>
    </span>
  </div>
</Link>


        {/* Desktop Navigation */}
        <div style={styles.desktopMenu}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/journal" style={styles.link}>Journal</Link>
          <Link to="/repository" style={styles.link}>Repository</Link>
          <Link to="/ebooks" style={styles.link}>eBooks</Link>
          <Link to="/library" style={styles.link}>Library</Link>
          <Link to="/wikipedia" style={{ ...styles.link, ...styles.activeLink }}>Wikipedia</Link>
          
          <button style={styles.searchButton} onClick={() => setIsSearchOpen(!isSearchOpen)}>
            🔍
          </button>
          
          <Link to="/profile" style={styles.profileLink}>
            <span style={styles.profileIcon}>👤</span>
            <span>Profile</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          style={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div style={styles.mobileSearch}>
          <input 
            type="text" 
            placeholder="Search..." 
            style={styles.searchInput}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink}>Home</Link>
          <Link to="/journal" style={styles.mobileLink}>Journal</Link>
          <Link to="/repository" style={styles.mobileLink}>Repository</Link>
          <Link to="/ebooks" style={styles.mobileLink}>eBooks</Link>
          <Link to="/library" style={styles.mobileLink}>Library</Link>
          <Link to="/wikipedia" style={{ ...styles.mobileLink, ...styles.mobileActive }}>Wikipedia</Link>
          <Link to="/profile" style={styles.mobileLink}>Profile</Link>
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #9c728d 0%, #7B2D5A 100%)", // Dark maroon/purple
    padding: "15px 20px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    textDecoration: "none",
  },
  logoOromo: {
    color: "#FFFFFF",
  },
  logoResearcher: {
    color: "#C9A227", // Gold accent from logo
  },
  desktopMenu: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "0.95rem",
    opacity: 0.9,
    transition: "opacity 0.3s ease",
  },
  activeLink: {
    color: "#C9A227",
    opacity: 1,
    fontWeight: "500",
  },
  searchButton: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "20px",
    padding: "8px 15px",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
  },
  profileLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.1)",
    padding: "8px 15px",
    borderRadius: "25px",
    color: "white",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  profileIcon: {
    fontSize: "1.1rem",
  },
  menuButton: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "1.8rem",
    cursor: "pointer",
  },
  mobileSearch: {
    padding: "15px 20px",
    background: "rgba(0,0,0,0.1)",
  },
  searchInput: {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "25px",
    border: "none",
    outline: "none",
  },
  mobileMenu: {
    display: "none",
    padding: "20px",
    background: "rgba(0,0,0,0.1)",
  },
  mobileLink: {
    display: "block",
    padding: "12px 0",
    color: "white",
    textDecoration: "none",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  mobileActive: {
    color: "#C9A227",
  },
  logo: {
    textDecoration: "none",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoImage: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
    borderRadius: "8px",
  },
  logoText: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  logoOromo: {
    color: "#FFFFFF",
  },
  logoResearcher: {
    color: "#C9A227", // Gold accent from ORA logo
    marginLeft: "2px",
  }
};

// Responsive styles
const mediaStyles = `
  @media (max-width: 768px) {
    .desktopMenu {
      display: none !important;
    }
    .menuButton {
      display: block !important;
    }
    .mobileMenu {
      display: block !important;
    }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mediaStyles;
  document.head.appendChild(style);
}

