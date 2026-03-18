// components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Create this CSS file

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isModulesDropdownOpen, setIsModulesDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage events (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsModulesDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.modules-dropdown')) {
        setIsModulesDropdownOpen(false);
      }
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  const modules = [
    { path: "/journal", label: "Journal", icon: "📚", description: "Academic journals and publications" },
    { path: "/repository", label: "Repository", icon: "🗂️", description: "Research data and papers" },
    { path: "/ebooks", label: "eBooks", icon: "📱", description: "Digital books and audiobooks" },
    { path: "/library", label: "Library", icon: "🏛️", description: "Digital library catalog" },
    { path: "/wikipedia", label: "Wikipedia", icon: "🌐", description: "Collaborative encyclopedia" },
    { path: "/researcher", label: "Researcher Network", icon: "👥", description: "Connect with Oromo researchers worldwide" },
  ];

  const isActive = (path) => location.pathname === path;
  const isAnyModuleActive = () => modules.some(module => location.pathname.startsWith(module.path));

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-wrapper">
            <div className="logo-image-wrapper">
              <img src="/ora.png" alt="ORA Logo" className="logo-image" />
            </div>
            <div className="logo-text">
              <span className="logo-oromo">OR</span>
              <span className="logo-researcher">A</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-menu">
          {/* Home Link */}
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? 'active-link' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
            {location.pathname === "/" && <span className="active-dot" />}
          </Link>

          {/* ORA Modules Dropdown */}
          <div className="modules-dropdown">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsModulesDropdownOpen(!isModulesDropdownOpen);
              }}
              className={`dropdown-button ${isAnyModuleActive() ? 'active-dropdown' : ''} ${isModulesDropdownOpen ? 'dropdown-open' : ''}`}
            >
              <span className="nav-icon">📦</span>
              <span>ORA Modules</span>
              <span className={`dropdown-arrow ${isModulesDropdownOpen ? 'arrow-open' : ''}`}>▼</span>
            </button>
            
            <div className={`modules-dropdown-menu ${isModulesDropdownOpen ? 'menu-open' : ''}`}>
              {modules.map((module) => (
                <Link
                  key={module.path}
                  to={module.path}
                  className={`module-item ${location.pathname.startsWith(module.path) ? 'module-active' : ''}`}
                  onClick={() => setIsModulesDropdownOpen(false)}
                >
                  <span className="module-icon">{module.icon}</span>
                  <div className="module-info">
                    <span className="module-label">{module.label}</span>
                    <span className="module-description">{module.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="desktop-actions">
            <button 
              className="search-button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <span className="search-icon">🔍</span>
              <span>Search</span>
            </button>

            {/* Authentication Section */}
            {isLoggedIn ? (
              <div className="profile-dropdown">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  }}
                  className={`profile-button ${isProfileDropdownOpen ? 'profile-open' : ''}`}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.full_name || user.username} className="profile-avatar" />
                  ) : (
                    <div className="profile-initials">
                      {getInitials()}
                    </div>
                  )}
                  <span className="profile-name">
                    {user?.full_name || user?.username}
                  </span>
                  <span className={`dropdown-arrow ${isProfileDropdownOpen ? 'arrow-open' : ''}`}>▼</span>
                </button>

                <div className={`profile-dropdown-menu ${isProfileDropdownOpen ? 'menu-open' : ''}`}>
                  <div className="profile-header">
                    <div className="profile-email">{user?.email}</div>
                  </div>
                  <div className="profile-divider"></div>
                  <button onClick={handleLogout} className="profile-logout">
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/auth/login" className="login-button">
                  <span>🔑</span>
                  <span>Login</span>
                </Link>
                
              </div>
            )}
          </div>
        </div>

        {/* Mobile Right Actions */}
        <div className="mobile-actions">
          <button 
            className="mobile-search-button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            🔍
          </button>

          {isLoggedIn && (
            <div className="mobile-profile-indicator">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="mobile-profile-image" />
              ) : (
                <div className="mobile-profile-initials">
                  {getInitials()}
                </div>
              )}
            </div>
          )}
          
          <button 
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            <div className={`hamburger ${isMenuOpen ? 'hamburger-open' : ''}`}>
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </div>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`search-container ${isSearchOpen ? 'search-open' : ''}`}>
        <div className="search-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search resources, articles, books..." 
            className="search-input"
            autoFocus={isSearchOpen}
          />
          <button 
            className="search-close"
            onClick={() => setIsSearchOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${isMenuOpen ? 'overlay-open' : ''}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="mobile-logo">
              <img src="/ora.png" alt="ORA" className="mobile-logo-image" />
              <span className="mobile-logo-text">ORA</span>
            </div>
            <button 
              className="mobile-close-button"
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Mobile User Info */}
          {isLoggedIn && (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="mobile-user-image" />
                ) : (
                  <div className="mobile-user-initials">
                    {getInitials()}
                  </div>
                )}
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{user?.full_name || user?.username}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
          )}

          <div className="mobile-links">
            {/* Home Link */}
            <Link
              to="/"
              className={`mobile-link ${location.pathname === "/" ? 'mobile-active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mobile-icon">🏠</span>
              <span className="mobile-label">Home</span>
              {location.pathname === "/" && (
                <span className="mobile-check">✓</span>
              )}
            </Link>

            {/* Modules Section */}
            <div className="mobile-modules-header">
              <span className="mobile-modules-icon">📦</span>
              <span className="mobile-modules-title">ORA Modules</span>
            </div>

            {/* Mobile Modules */}
            {modules.map((module) => (
              <Link
                key={module.path}
                to={module.path}
                className={`mobile-module-link ${location.pathname.startsWith(module.path) ? 'mobile-module-active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mobile-module-icon">{module.icon}</span>
                <div className="mobile-module-info">
                  <span className="mobile-module-label">{module.label}</span>
                  <span className="mobile-module-description">{module.description}</span>
                </div>
                {location.pathname.startsWith(module.path) && (
                  <span className="mobile-module-check">✓</span>
                )}
              </Link>
            ))}

            {/* Account Section */}
            <div className="mobile-modules-header">
              <span className="mobile-modules-icon">👤</span>
              <span className="mobile-modules-title">Account</span>
            </div>

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="mobile-module-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-module-icon">📊</span>
                  <div className="mobile-module-info">
                    <span className="mobile-module-label">Dashboard</span>
                    <span className="mobile-module-description">View your stats</span>
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className="mobile-module-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-module-icon">⚙️</span>
                  <div className="mobile-module-info">
                    <span className="mobile-module-label">Profile Settings</span>
                    <span className="mobile-module-description">Edit your profile</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-logout-button"
                >
                  <span className="mobile-module-icon">🚪</span>
                  <div className="mobile-module-info">
                    <span className="mobile-module-label">Logout</span>
                    <span className="mobile-module-description">Sign out</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="mobile-module-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-module-icon">🔑</span>
                  <div className="mobile-module-info">
                    <span className="mobile-module-label">Login</span>
                    <span className="mobile-module-description">Sign in to your account</span>
                  </div>
                </Link>
                
              </>
            )}
          </div>

      
        </div>
      </div>
    </nav>
  );
}