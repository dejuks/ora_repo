// pages/EbookDashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../../api/axios"; // Your configured axios instance

export default function EbookDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [featuredEbooks, setFeaturedEbooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [stats, setStats] = useState({
    totalEbooks: 0,
    totalDownloads: 0,
    totalAuthors: 0,
    languages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authForm, setAuthForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dob: ""
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [categoriesRes, ebooksRes, statsRes] = await Promise.all([
        fetch("http://localhost:5000/api/ebook/categories"),
        fetch("http://localhost:5000/api/ebook/all"),
        fetch("http://localhost:5000/api/ebook/stats")
      ]);

      const categoriesData = await categoriesRes.json();
      const ebooksData = await ebooksRes.json();
      const statsData = await statsRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }

      if (ebooksData.success) {
        // Set featured ebooks (most downloaded)
        const featured = ebooksData.data
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 4);
        setFeaturedEbooks(featured);

        // Set new releases (most recent)
        const releases = ebooksData.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setNewReleases(releases);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ebooks/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSubmitManuscript = () => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // If logged in, navigate to submission page
      navigate("/ebook/submissions/create");
    } else {
      // If not logged in, show auth modal
      setShowAuthModal(true);
      setAuthMode("login");
      setAuthError("");
    }
  };

  const handleAuthInputChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
    setAuthError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Close modal
      setShowAuthModal(false);
      
      // Navigate to submission page
      navigate("/ebook/submissions/create");
      
      // Reset form
      setAuthForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "",
        dob: ""
      });

    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    // Validation
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match");
      setAuthLoading(false);
      return;
    }

    if (authForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      setAuthLoading(false);
      return;
    }

    try {
      // Create FormData for user registration (supports file upload if needed)
      const formData = new FormData();
      formData.append("full_name", authForm.full_name);
      formData.append("email", authForm.email);
      formData.append("password", authForm.password);
      formData.append("phone", authForm.phone || "");
      formData.append("gender", authForm.gender || "");
      formData.append("dob", authForm.dob || "");
      
      // Assign author role (using the author role ID from your system)
      // You might want to fetch this dynamically or set it from env
      formData.append("module_id", "ebook"); // or appropriate module ID
      
      // Note: The role assignment might be handled differently in your system
      // You may need to assign the author role after user creation

      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        body: formData
        // Don't set Content-Type header - it will be set automatically with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Email already registered" || data.error?.includes("duplicate")) {
          throw new Error("This email is already registered. Please login instead.");
        }
        throw new Error(data.error || data.message || "Registration failed");
      }

      // Registration successful - now login
      const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Auto-login failed");
      }

      // Store token and user data
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      // Close modal
      setShowAuthModal(false);
      
      // Navigate to submission page
      navigate("/ebook/submissions/create");
      
      // Reset form
      setAuthForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "",
        dob: ""
      });

    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDownload = async (ebookId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/ebook/download/${ebookId}`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      const data = await res.json();
      if (data.success && data.data.downloadUrl) {
        // Trigger download
        window.open(data.data.downloadUrl, "_blank");
        // Refresh stats
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading amazing ebooks...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.errorContainer}>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <span style={styles.badge}>📱 Digital Library</span>
            <h1 style={styles.title}>
              Oromo <span style={styles.gradient}>eBooks</span>
            </h1>
            <p style={styles.subtitle}>
              Free access to hundreds of Oromo books, academic texts, 
              and cultural literature in multiple formats
            </p>
            
            {/* Submit Manuscript Button */}
            <button 
              onClick={handleSubmitManuscript}
              style={styles.submitButton}
            >
              📝 Submit Your Manuscript
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search for eBooks by title, author, or topic..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" style={styles.searchButton}>
                🔍 Search
              </button>
            </form>

            {/* Quick Stats */}
            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.totalEbooks}+</span>
                <span style={styles.statLabel}>eBooks</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.totalDownloads}K+</span>
                <span style={styles.statLabel}>Downloads</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.languages}+</span>
                <span style={styles.statLabel}>Languages</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.totalAuthors}+</span>
                <span style={styles.statLabel}>Authors</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section style={styles.categoriesSection}>
            <h2 style={styles.sectionTitle}>
              Browse by <span style={styles.gradient}>Category</span>
            </h2>
            <div style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Link 
                  to={`/ebooks/category/${cat.slug || cat.name}`} 
                  key={cat.id || cat.name} 
                  style={styles.categoryCard}
                >
                  <div style={{
                    ...styles.categoryIcon,
                    backgroundColor: `${cat.color || '#C9A227'}15`,
                    color: cat.color || '#C9A227'
                  }}>
                    {cat.icon || '📚'}
                  </div>
                  <h3 style={styles.categoryName}>{cat.name}</h3>
                  <p style={styles.categoryCount}>{cat.count} books</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured eBooks */}
        {featuredEbooks.length > 0 && (
          <section style={styles.featuredSection}>
            <h2 style={styles.sectionTitle}>
              Featured <span style={styles.gradient}>eBooks</span>
            </h2>
            <div style={styles.featuredGrid}>
              {featuredEbooks.map((book) => (
                <div key={book.id} style={styles.bookCard}>
                  <span style={styles.bookIcon}>{book.icon || '📚'}</span>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>By: {book.author_name || book.author}</p>
                  <div style={styles.bookMeta}>
                    <span style={styles.bookRating}>⭐ {book.rating || '4.5'}</span>
                    <span style={styles.bookDownloads}>⬇️ {book.downloads}K</span>
                  </div>
                  <p style={styles.bookFormat}>{book.format || 'PDF, EPUB'}</p>
                  <div style={styles.bookActions}>
                    <button 
                      onClick={() => handleDownload(book.id)}
                      style={styles.downloadBtn}
                    >
                      Download
                    </button>
                    <Link to={`/ebooks/${book.slug || book.id}`} style={styles.viewLink}>
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.viewAllContainer}>
              <Link to="/ebooks/all" style={styles.viewAllLink}>
                View All eBooks →
              </Link>
            </div>
          </section>
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <section style={styles.newSection}>
            <h2 style={styles.sectionTitle}>
              New <span style={styles.gradient}>Releases</span>
            </h2>
            <div style={styles.newGrid}>
              {newReleases.map((book) => (
                <div key={book.id} style={styles.newCard}>
                  <span style={styles.newIcon}>{book.icon || '📘'}</span>
                  <div style={styles.newInfo}>
                    <h4 style={styles.newTitle}>{book.title}</h4>
                    <p style={styles.newAuthor}>{book.author_name || book.author}</p>
                    <p style={styles.newDate}>
                      {new Date(book.created_at).getFullYear()}
                    </p>
                  </div>
                  <Link to={`/ebooks/${book.slug || book.id}`} style={styles.newLink}>
                    →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <section style={styles.featuresSection}>
          <div style={styles.featuresGrid}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>📱</span>
              <h4>Read Anywhere</h4>
              <p>On phone, tablet, or computer</p>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>⚡</span>
              <h4>Instant Access</h4>
              <p>Download and read immediately</p>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🆓</span>
              <h4>Always Free</h4>
              <p>No subscription required</p>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🌍</span>
              <h4>Multiple Languages</h4>
              <p>Available in various formats</p>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section style={styles.newsletterSection}>
          <div style={styles.newsletterContainer}>
            <h3 style={styles.newsletterTitle}>Get New eBooks Alerts</h3>
            <p style={styles.newsletterText}>
              Be the first to know when new Oromo books are added
            </p>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                try {
                  await fetch("http://localhost:5000/api/newsletter/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                  });
                  alert("Subscribed successfully!");
                  e.target.reset();
                } catch (err) {
                  console.error("Newsletter error:", err);
                }
              }}
              style={styles.newsletterForm}
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                style={styles.newsletterInput}
                required
              />
              <button type="submit" style={styles.newsletterButton}>
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2024 Oromo Researcher Association. Free Oromo eBooks for everyone.
          </p>
        </footer>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={styles.modalClose}
            >
              ×
            </button>
            
            <h2 style={styles.modalTitle}>
              {authMode === "login" ? "Welcome Back!" : "Join as Author"}
            </h2>
            
            <p style={styles.modalSubtitle}>
              {authMode === "login" 
                ? "Login to submit your manuscript" 
                : "Create an account to start publishing your eBooks"}
            </p>

            {authError && (
              <div style={styles.authError}>
                {authError}
              </div>
            )}

            <form onSubmit={authMode === "login" ? handleLogin : handleRegister} style={styles.authForm}>
              {authMode === "register" && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={authForm.full_name}
                      onChange={handleAuthInputChange}
                      style={styles.formInput}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={authForm.phone}
                      onChange={handleAuthInputChange}
                      style={styles.formInput}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={{...styles.formGroup, flex: 1}}>
                      <label style={styles.formLabel}>Gender</label>
                      <select
                        name="gender"
                        value={authForm.gender}
                        onChange={handleAuthInputChange}
                        style={styles.formInput}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div style={{...styles.formGroup, flex: 1}}>
                      <label style={styles.formLabel}>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={authForm.dob}
                        onChange={handleAuthInputChange}
                        style={styles.formInput}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  style={styles.formInput}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  style={styles.formInput}
                  required
                  placeholder={authMode === "login" ? "Enter your password" : "Create a password (min. 6 characters)"}
                  minLength={authMode === "register" ? 6 : undefined}
                />
              </div>

              {authMode === "register" && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={authForm.confirmPassword}
                    onChange={handleAuthInputChange}
                    style={styles.formInput}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button 
                type="submit" 
                style={styles.authButton}
                disabled={authLoading}
              >
                {authLoading ? (
                  <span style={styles.buttonLoader}>⏳ Processing...</span>
                ) : (
                  authMode === "login" ? "Login" : "Create Account"
                )}
              </button>
            </form>

            <div style={styles.authSwitch}>
              {authMode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }} style={styles.switchButton}>
                    Register as Author
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }} style={styles.switchButton}>
                    Login here
                  </button>
                </p>
              )}
            </div>

            <div style={styles.authFooter}>
              <p style={styles.authFooterText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#ffffff",
  },

  // Loading
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
    color: "white",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #C9A227",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },

  // Error
  errorContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    color: "#1a2639",
  },
  retryButton: {
    padding: "12px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
  },

  // Hero Section
  hero: {
    position: "relative",
    minHeight: "70vh",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 50%, #A569BD 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(165,105,189,0.2) 0%, transparent 40%)
    `,
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "900px",
    padding: "0 20px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    fontSize: "0.9rem",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  title: {
    fontSize: "clamp(2rem, 6vw, 3.5rem)",
    fontWeight: "700",
    margin: "0 0 15px",
    lineHeight: 1.2,
  },
  gradient: {
    background: "linear-gradient(135deg, #F5D76E, #FFFFFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "1.1rem",
    lineHeight: 1.6,
    margin: "0 auto 20px",
    opacity: 0.95,
    maxWidth: "700px",
  },
  submitButton: {
    padding: "15px 40px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    margin: "0 auto 20px",
    display: "inline-block",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
    },
  },
  searchContainer: {
    display: "flex",
    gap: "10px",
    maxWidth: "600px",
    margin: "0 auto 30px",
  },
  searchInput: {
    flex: 1,
    padding: "15px 20px",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    outline: "none",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  searchButton: {
    padding: "15px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
  stats: {
    display: "flex",
    gap: "40px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    display: "block",
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
  },

  // Categories Section
  categoriesSection: {
    padding: "60px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "left",
    margin: "0 0 40px",
    color: "#1a2639",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },
  categoryCard: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    textDecoration: "none",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid #eaeef2",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    },
  },
  categoryIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.2rem",
    margin: "0 auto 15px",
  },
  categoryName: {
    fontSize: "1.1rem",
    margin: "0 0 5px",
    color: "#1a2639",
    fontWeight: "600",
  },
  categoryCount: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    margin: 0,
  },

  // Featured Section
  featuredSection: {
    padding: "60px 20px",
    background: "#f8f9fa",
  },
  featuredGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "25px",
  },
  bookCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    border: "1px solid #eaeef2",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
    },
  },
  bookIcon: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "15px",
  },
  bookTitle: {
    fontSize: "1.2rem",
    margin: "0 0 5px",
    color: "#1a2639",
    fontWeight: "600",
  },
  bookAuthor: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    margin: "0 0 10px",
  },
  bookMeta: {
    display: "flex",
    gap: "15px",
    fontSize: "0.85rem",
    marginBottom: "8px",
  },
  bookRating: {
    color: "#C9A227",
    fontWeight: "600",
  },
  bookDownloads: {
    color: "#2E86AB",
    fontWeight: "600",
  },
  bookFormat: {
    fontSize: "0.8rem",
    color: "#A569BD",
    margin: "0 0 15px",
    fontWeight: "500",
  },
  bookActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  downloadBtn: {
    padding: "8px 15px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "5px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s ease",
    ":hover": {
      background: "#b88c1f",
    },
  },
  viewLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    ":hover": {
      textDecoration: "underline",
    },
  },
  viewAllContainer: {
    textAlign: "center",
    marginTop: "40px",
  },
  viewAllLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "600",
    padding: "10px 20px",
    borderRadius: "30px",
    border: "2px solid #C9A227",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#C9A227",
      color: "#0F3D2E",
    },
  },

  // New Releases
  newSection: {
    padding: "60px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  newGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "15px",
  },
  newCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #eaeef2",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    ":hover": {
      transform: "translateX(5px)",
      boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    },
  },
  newIcon: {
    fontSize: "2.2rem",
    width: "60px",
    textAlign: "center",
  },
  newInfo: {
    flex: 1,
  },
  newTitle: {
    fontSize: "1.1rem",
    margin: "0 0 3px",
    color: "#1a2639",
    fontWeight: "600",
  },
  newAuthor: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    margin: "0 0 3px",
  },
  newDate: {
    fontSize: "0.8rem",
    color: "#C9A227",
    margin: 0,
    fontWeight: "500",
  },
  newLink: {
    fontSize: "1.5rem",
    color: "#C9A227",
    textDecoration: "none",
    padding: "0 10px",
    fontWeight: "bold",
    ":hover": {
      transform: "translateX(3px)",
    },
  },

  // Features
  featuresSection: {
    padding: "60px 20px",
    background: "white",
  },
  featuresGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
  },
  feature: {
    textAlign: "center",
    padding: "20px",
  },
  featureIcon: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "15px",
  },

  // Newsletter
  newsletterSection: {
    padding: "80px 20px",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
  },
  newsletterContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  newsletterTitle: {
    fontSize: "2rem",
    margin: "0 0 10px",
    fontWeight: "700",
  },
  newsletterText: {
    fontSize: "1.1rem",
    margin: "0 0 30px",
    opacity: 0.9,
  },
  newsletterForm: {
    display: "flex",
    gap: "10px",
  },
  newsletterInput: {
    flex: 1,
    padding: "15px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  newsletterButton: {
    padding: "15px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
    },
  },

  // Footer
  footer: {
    padding: "30px 20px",
    background: "#0a1f17",
    textAlign: "center",
  },
  footerText: {
    color: "white",
    opacity: 0.7,
    fontSize: "0.95rem",
    margin: 0,
  },

  // Auth Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(5px)",
  },
  modal: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  modalClose: {
    position: "absolute",
    top: "15px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#5a6a7a",
    ":hover": {
      color: "#1a2639",
    },
  },
  modalTitle: {
    fontSize: "1.8rem",
    margin: "0 0 10px",
    color: "#0F3D2E",
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: "1rem",
    color: "#5a6a7a",
    margin: "0 0 25px",
  },
  authError: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.95rem",
    border: "1px solid #fcc",
  },
  authForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  formRow: {
    display: "flex",
    gap: "10px",
  },
  formLabel: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1a2639",
  },
  formInput: {
    padding: "12px 15px",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    outline: "none",
    ":focus": {
      borderColor: "#C9A227",
    },
  },
  authButton: {
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    transition: "transform 0.3s ease, background 0.3s ease",
    ":hover": {
      background: "#b88c1f",
      transform: "translateY(-2px)",
    },
    ":disabled": {
      opacity: 0.7,
      cursor: "not-allowed",
    },
  },
  buttonLoader: {
    display: "inline-block",
  },
  authSwitch: {
    marginTop: "20px",
    textAlign: "center",
    color: "#5a6a7a",
    fontSize: "0.95rem",
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#C9A227",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "0.95rem",
    ":hover": {
      color: "#b88c1f",
    },
  },
  authFooter: {
    marginTop: "20px",
    textAlign: "center",
    borderTop: "1px solid #eaeef2",
    paddingTop: "20px",
  },
  authFooterText: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
    margin: 0,
  },
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);