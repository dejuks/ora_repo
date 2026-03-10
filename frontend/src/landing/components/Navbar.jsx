import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
      if (!event.target.closest('.modules-dropdown-container')) {
        setIsModulesDropdownOpen(false);
      }
      if (!event.target.closest('.profile-dropdown-container')) {
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
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const handleModulesToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModulesDropdownOpen(!isModulesDropdownOpen);
  };

  const handleProfileToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <>
      <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
        <div style={styles.container}>
          {/* Logo with Animation */}
          <Link to="/" style={styles.logo}>
            <div style={styles.logoWrapper}>
              <div style={styles.logoImageWrapper}>
                <img src="/ora.png" alt="ORA Logo" style={styles.logoImage} />
              </div>
              <div style={styles.logoText}>
                <span style={styles.logoOromo}>OR</span>
                <span style={styles.logoResearcher}>A</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={styles.desktopMenu}>
            {/* Home Link */}
            <Link
              to="/"
              style={{
                ...styles.link,
                ...(location.pathname === "/" ? styles.activeLink : {}),
              }}
            >
              <span style={styles.linkIcon}>🏠</span>
              <span>Home</span>
              {location.pathname === "/" && <span style={styles.activeDot} />}
            </Link>

            {/* ORA Modules Dropdown */}
            <div className="modules-dropdown-container" style={styles.dropdownContainer}>
              <button
                onClick={handleModulesToggle}
                style={{
                  ...styles.dropdownButton,
                  ...(isAnyModuleActive() ? styles.activeDropdownButton : {}),
                  ...(isModulesDropdownOpen ? styles.dropdownButtonOpen : {})
                }}
              >
                <span style={styles.linkIcon}>📦</span>
                <span>ORA Modules</span>
                <span style={{
                  ...styles.dropdownArrow,
                  ...(isModulesDropdownOpen ? styles.dropdownArrowOpen : {})
                }}>▼</span>
              </button>
              
              <div style={{
                ...styles.modulesDropdownMenu,
                ...(isModulesDropdownOpen ? styles.modulesDropdownMenuOpen : {})
              }}>
                {modules.map((module) => (
                  <Link
                    key={module.path}
                    to={module.path}
                    style={{
                      ...styles.moduleItem,
                      ...(location.pathname.startsWith(module.path) ? styles.moduleItemActive : {})
                    }}
                    onClick={() => setIsModulesDropdownOpen(false)}
                  >
                    <span style={styles.moduleIcon}>{module.icon}</span>
                    <div style={styles.moduleInfo}>
                      <span style={styles.moduleLabel}>{module.label}</span>
                      <span style={styles.moduleDescription}>{module.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div style={styles.desktopActions}>
              <button 
                style={styles.searchButton}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <span style={styles.searchIcon}>🔍</span>
                <span>Search</span>
              </button>

              {/* Authentication Section */}
              {isLoggedIn ? (
                <div className="profile-dropdown-container" style={styles.profileContainer}>
                  <button
                    onClick={handleProfileToggle}
                    style={{
                      ...styles.profileButton,
                      ...(isProfileDropdownOpen ? styles.profileButtonOpen : {})
                    }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.full_name || user.username} style={styles.profileAvatar} />
                    ) : (
                      <div style={styles.profileInitials}>
                        {getInitials()}
                      </div>
                    )}
                    <span style={styles.profileName}>
                      {user?.full_name || user?.username}
                    </span>
                    <span style={{
                      ...styles.dropdownArrow,
                      ...(isProfileDropdownOpen ? styles.dropdownArrowOpen : {})
                    }}>▼</span>
                  </button>

                  <div style={{
                    ...styles.profileDropdownMenu,
                    ...(isProfileDropdownOpen ? styles.profileDropdownMenuOpen : {})
                  }}>
                    <div style={styles.profileDropdownHeader}>
                      <div style={styles.profileDropdownEmail}>{user?.email}</div>
                    </div>
                    <Link to="/wiki/dashboard" style={styles.profileDropdownItem} onClick={() => setIsProfileDropdownOpen(false)}>
                      <span>📊</span> Dashboard
                    </Link>
                    <Link to="/wiki/profile/edit" style={styles.profileDropdownItem} onClick={() => setIsProfileDropdownOpen(false)}>
                      <span>👤</span> Profile Settings
                    </Link>
                    <Link to="/wiki/my-articles" style={styles.profileDropdownItem} onClick={() => setIsProfileDropdownOpen(false)}>
                      <span>📝</span> My Articles
                    </Link>
                    <div style={styles.profileDropdownDivider}></div>
                    <button onClick={handleLogout} style={styles.profileDropdownLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.authButtons}>
                  <Link to="/wiki/login" style={styles.loginButton}>
                    <span>🔑</span>
                    <span>Login</span>
                  </Link>
                  <Link to="/wiki/register" style={styles.registerButton}>
                    <span>📝</span>
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Actions */}
          <div style={styles.mobileActions}>
            <button 
              style={styles.mobileSearchButton}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              🔍
            </button>

            {isLoggedIn && (
              <div style={styles.mobileProfileIndicator}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={styles.mobileProfileImage} />
                ) : (
                  <div style={styles.mobileProfileInitials}>
                    {getInitials()}
                  </div>
                )}
              </div>
            )}
            
            <button 
              style={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <div style={{
                ...styles.hamburger,
                ...(isMenuOpen ? styles.hamburgerOpen : {})
              }}>
                <span style={styles.hamburgerLine} />
                <span style={styles.hamburgerLine} />
                <span style={styles.hamburgerLine} />
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar - Desktop & Mobile */}
        <div style={{
          ...styles.searchContainer,
          ...(isSearchOpen ? styles.searchContainerOpen : {})
        }}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchInputIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Search resources, articles, books..." 
              style={styles.searchInput}
              autoFocus={isSearchOpen}
            />
            <button 
              style={styles.searchClose}
              onClick={() => setIsSearchOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div style={{
        ...styles.mobileOverlay,
        ...(isMenuOpen ? styles.mobileOverlayOpen : {})
      }}>
        <div style={styles.mobileMenu}>
          <div style={styles.mobileMenuHeader}>
            <div style={styles.mobileLogo}>
              <img src="/ora.png" alt="ORA" style={styles.mobileLogoImage} />
              <span style={styles.mobileLogoText}>ORA</span>
            </div>
            <button 
              style={styles.mobileCloseButton}
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Mobile User Info (if logged in) */}
          {isLoggedIn && (
            <div style={styles.mobileUserInfo}>
              <div style={styles.mobileUserAvatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={styles.mobileUserImage} />
                ) : (
                  <div style={styles.mobileUserInitials}>
                    {getInitials()}
                  </div>
                )}
              </div>
              <div style={styles.mobileUserDetails}>
                <div style={styles.mobileUserName}>{user?.full_name || user?.username}</div>
                <div style={styles.mobileUserEmail}>{user?.email}</div>
              </div>
            </div>
          )}

          <div style={styles.mobileLinks}>
            {/* Home Link */}
            <Link
              to="/"
              style={{
                ...styles.mobileLink,
                ...(location.pathname === "/" ? styles.mobileActiveLink : {})
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              <span style={styles.mobileLinkIcon}>🏠</span>
              <span style={styles.mobileLinkLabel}>Home</span>
              {location.pathname === "/" && (
                <span style={styles.mobileLinkCheck}>✓</span>
              )}
            </Link>

            {/* Modules Section Header */}
            <div style={styles.mobileModulesHeader}>
              <span style={styles.mobileModulesIcon}>📦</span>
              <span style={styles.mobileModulesTitle}>ORA Modules</span>
            </div>

            {/* Mobile Modules */}
            {modules.map((module) => (
              <Link
                key={module.path}
                to={module.path}
                style={{
                  ...styles.mobileModuleLink,
                  ...(location.pathname.startsWith(module.path) ? styles.mobileModuleActive : {})
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <span style={styles.mobileModuleIcon}>{module.icon}</span>
                <div style={styles.mobileModuleInfo}>
                  <span style={styles.mobileModuleLabel}>{module.label}</span>
                  <span style={styles.mobileModuleDescription}>{module.description}</span>
                </div>
                {location.pathname.startsWith(module.path) && (
                  <span style={styles.mobileModuleCheck}>✓</span>
                )}
              </Link>
            ))}

            {/* Authentication Links for Mobile */}
            {isLoggedIn ? (
              <>
                <div style={styles.mobileModulesHeader}>
                  <span style={styles.mobileModulesIcon}>👤</span>
                  <span style={styles.mobileModulesTitle}>Account</span>
                </div>
                <Link
                  to="/wiki/dashboard"
                  style={styles.mobileModuleLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={styles.mobileModuleIcon}>📊</span>
                  <div style={styles.mobileModuleInfo}>
                    <span style={styles.mobileModuleLabel}>Dashboard</span>
                    <span style={styles.mobileModuleDescription}>View your stats and activity</span>
                  </div>
                </Link>
                <Link
                  to="/wiki/profile/edit"
                  style={styles.mobileModuleLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={styles.mobileModuleIcon}>⚙️</span>
                  <div style={styles.mobileModuleInfo}>
                    <span style={styles.mobileModuleLabel}>Profile Settings</span>
                    <span style={styles.mobileModuleDescription}>Edit your profile</span>
                  </div>
                </Link>
                <Link
                  to="/wiki/my-articles"
                  style={styles.mobileModuleLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={styles.mobileModuleIcon}>📝</span>
                  <div style={styles.mobileModuleInfo}>
                    <span style={styles.mobileModuleLabel}>My Articles</span>
                    <span style={styles.mobileModuleDescription}>Manage your articles</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  style={styles.mobileLogoutButton}
                >
                  <span style={styles.mobileModuleIcon}>🚪</span>
                  <div style={styles.mobileModuleInfo}>
                    <span style={styles.mobileModuleLabel}>Logout</span>
                    <span style={styles.mobileModuleDescription}>Sign out of your account</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div style={styles.mobileModulesHeader}>
                  <span style={styles.mobileModulesIcon}>🔑</span>
                  <span style={styles.mobileModulesTitle}>Account</span>
                </div>
                <Link
                  to="/wiki/login"
                  style={styles.mobileModuleLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={styles.mobileModuleIcon}>🔑</span>
                  <div style={styles.mobileModuleInfo}>
                    <span style={styles.mobileModuleLabel}>Login</span>
                    <span style={styles.mobileModuleDescription}>Sign in to your account</span>
                  </div>
                </Link>
                <Link
                  to="/wiki/register"
                  style={styles.mobileModuleLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={styles.mobileModuleIcon}>📝</span>
                  <div style={styles.mobileModuleInfo}>
                    <span style={styles.mobileModuleLabel}>Register</span>
                    <span style={styles.mobileModuleDescription}>Create a new account</span>
                  </div>
                </Link>
              </>
            )}
          </div>

          <div style={styles.mobileFooter}>
            <div style={styles.mobileSocial}>
              <a href="#" style={styles.mobileSocialLink}>📘</a>
              <a href="#" style={styles.mobileSocialLink}>🐦</a>
              <a href="#" style={styles.mobileSocialLink}>📷</a>
              <a href="#" style={styles.mobileSocialLink}>💼</a>
            </div>
            <div style={styles.mobileFooterText}>
              © 2024 ORA. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #9c728d 0%, #7B2D5A 100%)",
    padding: "12px 20px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  navbarScrolled: {
    padding: "8px 20px",
    background: "linear-gradient(135deg, #8B6280 0%, #6B254A 100%)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Logo Styles
  logo: {
    textDecoration: "none",
    zIndex: 1001,
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoImageWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "scale(1.05)",
    },
    "@media (max-width: 480px)": {
      width: "35px",
      height: "35px",
    },
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoText: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.6rem",
    fontWeight: "700",
    "@media (max-width: 480px)": {
      fontSize: "1.3rem",
    },
  },
  logoOromo: {
    color: "#FFFFFF",
  },
  logoResearcher: {
    color: "#C9A227",
    marginLeft: "2px",
  },

  // Desktop Menu
  desktopMenu: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    "@media (max-width: 900px)": {
      display: "none",
    },
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "0.95rem",
    opacity: 0.85,
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "8px",
    position: "relative",
    cursor: "pointer",
    ":hover": {
      opacity: 1,
      background: "rgba(255,255,255,0.1)",
    },
  },
  linkIcon: {
    fontSize: "1.1rem",
  },
  activeLink: {
    opacity: 1,
    color: "#C9A227",
    background: "rgba(201,162,39,0.1)",
  },
  activeDot: {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#C9A227",
  },

  // Dropdown Styles
  dropdownContainer: {
    position: "relative",
  },
  dropdownButton: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "0.95rem",
    opacity: 0.85,
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    ":hover": {
      opacity: 1,
      background: "rgba(255,255,255,0.1)",
    },
  },
  activeDropdownButton: {
    opacity: 1,
    color: "#C9A227",
    background: "rgba(201,162,39,0.1)",
  },
  dropdownButtonOpen: {
    opacity: 1,
    background: "rgba(255,255,255,0.15)",
  },
  dropdownArrow: {
    fontSize: "0.7rem",
    marginLeft: "4px",
    transition: "transform 0.3s ease",
  },
  dropdownArrowOpen: {
    transform: "rotate(180deg)",
  },
  modulesDropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "300px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    padding: "12px 0",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(-10px)",
    transition: "all 0.3s ease",
    zIndex: 1000,
  },
  modulesDropdownMenuOpen: {
    opacity: 1,
    visibility: "visible",
    transform: "translateY(0)",
  },
  moduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#1a2639",
    textDecoration: "none",
    transition: "all 0.2s ease",
    borderLeft: "3px solid transparent",
    ":hover": {
      background: "#f8f9fa",
      borderLeftColor: "#C9A227",
    },
  },
  moduleItemActive: {
    background: "#f8f9fa",
    borderLeftColor: "#7B2D5A",
  },
  moduleIcon: {
    fontSize: "1.5rem",
    width: "32px",
    textAlign: "center",
  },
  moduleInfo: {
    flex: 1,
  },
  moduleLabel: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#1a2639",
  },
  moduleDescription: {
    display: "block",
    fontSize: "0.8rem",
    color: "#5a6a7a",
  },

  // Desktop Actions
  desktopActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginLeft: "10px",
  },
  searchButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "30px",
    padding: "8px 16px",
    color: "white",
    cursor: "pointer",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,255,255,0.2)",
      transform: "scale(1.05)",
    },
  },
  searchIcon: {
    fontSize: "1.1rem",
  },

  // Auth Buttons
  authButtons: {
    display: "flex",
    gap: "8px",
  },
  loginButton: {
    background: "transparent",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "30px",
    padding: "8px 16px",
    color: "white",
    cursor: "pointer",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,255,255,0.1)",
      borderColor: "rgba(255,255,255,0.5)",
    },
  },
  registerButton: {
    background: "#C9A227",
    border: "none",
    borderRadius: "30px",
    padding: "8px 16px",
    color: "#0F3D2E",
    cursor: "pointer",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 5px 15px rgba(201,162,39,0.3)",
    },
  },

  // Profile Dropdown
  profileContainer: {
    position: "relative",
  },
  profileButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "30px",
    padding: "6px 12px 6px 6px",
    color: "white",
    cursor: "pointer",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,255,255,0.2)",
    },
  },
  profileButtonOpen: {
    background: "rgba(255,255,255,0.2)",
  },
  profileAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profileInitials: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#C9A227",
    color: "#0F3D2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  profileName: {
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  profileDropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: "250px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    padding: "8px 0",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(-10px)",
    transition: "all 0.3s ease",
    zIndex: 1000,
  },
  profileDropdownMenuOpen: {
    opacity: 1,
    visibility: "visible",
    transform: "translateY(0)",
  },
  profileDropdownHeader: {
    padding: "16px",
    borderBottom: "1px solid #eaeef2",
  },
  profileDropdownEmail: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    wordBreak: "break-all",
  },
  profileDropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#1a2639",
    textDecoration: "none",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#f8f9fa",
    },
  },
  profileDropdownDivider: {
    height: "1px",
    background: "#eaeef2",
    margin: "8px 0",
  },
  profileDropdownLogout: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    color: "#ff4444",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#fff5f5",
    },
  },

  // Mobile Actions
  mobileActions: {
    display: "none",
    alignItems: "center",
    gap: "12px",
    "@media (max-width: 900px)": {
      display: "flex",
    },
  },
  mobileSearchButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "30px",
    padding: "8px 12px",
    color: "white",
    cursor: "pointer",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileProfileIndicator: {
    width: "35px",
    height: "35px",
  },
  mobileProfileImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  mobileProfileInitials: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#C9A227",
    color: "#0F3D2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  // Hamburger Menu
  menuButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    zIndex: 1001,
  },
  hamburger: {
    width: "24px",
    height: "18px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  hamburgerLine: {
    width: "100%",
    height: "2px",
    background: "white",
    transition: "all 0.3s ease",
    borderRadius: "2px",
  },
  hamburgerOpen: {
    "& span:first-child": {
      transform: "rotate(45deg) translate(5px, 5px)",
    },
    "& span:nth-child(2)": {
      opacity: 0,
    },
    "& span:last-child": {
      transform: "rotate(-45deg) translate(7px, -7px)",
    },
  },

  // Search Container
  searchContainer: {
    maxHeight: 0,
    overflow: "hidden",
    transition: "max-height 0.3s ease",
    background: "rgba(0,0,0,0.1)",
    backdropFilter: "blur(10px)",
  },
  searchContainerOpen: {
    maxHeight: "80px",
  },
  searchWrapper: {
    maxWidth: "600px",
    margin: "12px auto",
    padding: "0 20px",
    position: "relative",
  },
  searchInputIcon: {
    position: "absolute",
    left: "35px",
    top: "50%",
    transform: "translateY(-50%)",
    opacity: 0.5,
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "12px 20px 12px 45px",
    borderRadius: "30px",
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    background: "white",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  searchClose: {
    position: "absolute",
    right: "35px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    opacity: 0.5,
    ":hover": {
      opacity: 1,
    },
  },

  // Mobile Overlay & Menu
  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(5px)",
    zIndex: 999,
    opacity: 0,
    visibility: "hidden",
    transition: "all 0.3s ease",
  },
  mobileOverlayOpen: {
    opacity: 1,
    visibility: "visible",
  },
  mobileMenu: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "85%",
    maxWidth: "400px",
    height: "100vh",
    background: "white",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    boxShadow: "-5px 0 30px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  mobileMenuHeader: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eaeef2",
  },
  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  mobileLogoImage: {
    width: "35px",
    height: "35px",
    borderRadius: "8px",
  },
  mobileLogoText: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#7B2D5A",
  },
  mobileCloseButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#5a6a7a",
    padding: "5px 10px",
    borderRadius: "8px",
    ":hover": {
      background: "#f0f0f0",
    },
  },

  // Mobile User Info
  mobileUserInfo: {
    padding: "20px",
    background: "linear-gradient(135deg, #f8f9fa, #fff)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #eaeef2",
  },
  mobileUserAvatar: {
    width: "50px",
    height: "50px",
  },
  mobileUserImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  mobileUserInitials: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#C9A227",
    color: "#0F3D2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  mobileUserDetails: {
    flex: 1,
  },
  mobileUserName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1a2639",
    marginBottom: "4px",
  },
  mobileUserEmail: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    wordBreak: "break-all",
  },

  // Mobile Links
  mobileLinks: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  mobileLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    color: "#1a2639",
    textDecoration: "none",
    borderRadius: "12px",
    marginBottom: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#f8f9fa",
    },
  },
  mobileActiveLink: {
    background: "linear-gradient(135deg, #f8f9fa, #fff)",
    border: "1px solid #eaeef2",
    color: "#7B2D5A",
    fontWeight: "500",
  },
  mobileLinkIcon: {
    fontSize: "1.4rem",
    width: "30px",
  },
  mobileLinkLabel: {
    flex: 1,
    fontSize: "1.1rem",
  },
  mobileLinkCheck: {
    color: "#C9A227",
    fontSize: "1.2rem",
    fontWeight: "600",
  },

  // Mobile Modules Styles
  mobileModulesHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 15px 10px 15px",
    marginTop: "10px",
    borderBottom: "2px solid #eaeef2",
  },
  mobileModulesIcon: {
    fontSize: "1.4rem",
    color: "#7B2D5A",
  },
  mobileModulesTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#7B2D5A",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  mobileModuleLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px 12px 45px",
    color: "#1a2639",
    textDecoration: "none",
    borderRadius: "8px",
    marginBottom: "4px",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#f8f9fa",
    },
  },
  mobileModuleActive: {
    background: "#f8f9fa",
    color: "#7B2D5A",
  },
  mobileModuleIcon: {
    fontSize: "1.2rem",
    width: "24px",
  },
  mobileModuleInfo: {
    flex: 1,
  },
  mobileModuleLabel: {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "500",
    marginBottom: "2px",
  },
  mobileModuleDescription: {
    display: "block",
    fontSize: "0.75rem",
    color: "#5a6a7a",
  },
  mobileModuleCheck: {
    color: "#C9A227",
    fontSize: "1rem",
    fontWeight: "600",
  },
  mobileLogoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px 12px 45px",
    background: "transparent",
    border: "none",
    color: "#ff4444",
    fontSize: "0.95rem",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#fff5f5",
    },
  },

  // Mobile Footer
  mobileFooter: {
    padding: "20px",
    borderTop: "1px solid #eaeef2",
    background: "#f8f9fa",
    textAlign: "center",
  },
  mobileSocial: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0",
    marginBottom: "10px",
  },
  mobileSocialLink: {
    textDecoration: "none",
    fontSize: "1.5rem",
    opacity: 0.7,
    transition: "opacity 0.3s ease",
    ":hover": {
      opacity: 1,
    },
  },
  mobileFooterText: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
  },
};

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes dropdownFade {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 900px) {
    .mobile-menu-open {
      transform: translateX(0) !important;
    }
  }

  @media (max-width: 480px) {
    .mobile-menu {
      width: 90%;
    }
  }
`;
document.head.appendChild(style);