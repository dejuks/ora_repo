// pages/EbookDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function EbookDashboard() {
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

  const handleDownload = async (ebookId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/ebook/download/${ebookId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
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
    margin: "0 auto 30px",
    opacity: 0.95,
    maxWidth: "700px",
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