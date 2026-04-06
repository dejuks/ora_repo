// pages/EbookDashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import publicEbookApi from "../../api/public_ebook.api.js";

export default function EbookDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [featuredEbooks, setFeaturedEbooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [trendingEbooks, setTrendingEbooks] = useState([]);
  const [stats, setStats] = useState({
    totalEbooks: 0,
    totalDownloads: 0,
    totalAuthors: 0,
    languages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [hoveredBook, setHoveredBook] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Fetch dashboard data from public API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          publications,
          categoriesData,
          statsData,
          trendingData,
          newReleasesData,
          featuredData
        ] = await Promise.all([
          publicEbookApi.listPublications({ limit: 50 }),
          publicEbookApi.getCategories().catch(() => []),
          publicEbookApi.getPublicStats().catch(() => null),
          publicEbookApi.getTrendingEbooks(6).catch(() => ({ rows: [] })),
          publicEbookApi.getNewReleases(5).catch(() => ({ rows: [] })),
          publicEbookApi.getFeaturedEbooks(4).catch(() => ({ rows: [] }))
        ]);
        
        // Set categories
        setCategories(categoriesData.length > 0 ? categoriesData : []);
        
        // Process publications
        const ebookList = publications.rows || [];
        
        // Set stats from API or calculate
        if (statsData) {
          setStats(statsData);
        } else {
          const uniqueAuthors = new Set(ebookList.map(book => book.author_id || book.author_name));
          const languages = new Set(ebookList.map(book => book.language).filter(Boolean));
          
          setStats({
            totalEbooks: ebookList.length,
            totalDownloads: ebookList.reduce((sum, book) => sum + (book.downloads || 0), 0),
            totalAuthors: uniqueAuthors.size,
            languages: languages.size
          });
        }
        
        // Set featured, trending, new releases
        setFeaturedEbooks(featuredData.rows || []);
        setTrendingEbooks(trendingData.rows || []);
        setNewReleases(newReleasesData.rows || []);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Helper functions for categories
  const getCategoryIcon = (category) => {
    const icons = {
      'Fiction': '📖',
      'Science': '🔬',
      'History': '🏛️',
      'Poetry': '🎭',
      'Children': '🧸',
      'Education': '🎓',
      'Religion': '🕊️',
      'Culture': '🌍',
      'Default': '📚'
    };
    return icons[category] || icons.Default;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Fiction': '#FF6B6B',
      'Science': '#4ECDC4',
      'History': '#45B7D1',
      'Poetry': '#96CEB4',
      'Children': '#FFEAA7',
      'Education': '#DDA0DD',
      'Religion': '#B0C4DE',
      'Culture': '#F4A460',
      'Default': '#2E86AB'
    };
    return colors[category] || colors.Default;
  };

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ebooks/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDownload = async (publicationId) => {
    try {
      await publicEbookApi.downloadEbook(publicationId, 'pdf');
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download. Please try again.");
    }
  };

  const filterByLanguage = (language) => {
    setSelectedLanguage(language);
    publicEbookApi.listPublications({ 
      language: language === "all" ? undefined : language, 
      limit: 4 
    })
      .then(response => {
        setFeaturedEbooks(response.rows || []);
      })
      .catch(err => console.error("Error filtering by language:", err));
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    try {
      await publicEbookApi.subscribeNewsletter(email);
      alert("Subscribed successfully!");
      e.target.reset();
    } catch (err) {
      alert("Failed to subscribe. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={responsiveStyles.loadingContainer}>
          <div style={responsiveStyles.spinner}></div>
          <p style={responsiveStyles.loadingText}>Loading amazing ebooks...</p>
          <div style={responsiveStyles.skeletonGrid}>
            {[1,2,3,4].map(n => (
              <div key={n} style={responsiveStyles.skeletonCard}></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={responsiveStyles.errorContainer}>
          <div style={responsiveStyles.errorContent}>
            <span style={responsiveStyles.errorIcon}>📚</span>
            <h2 style={responsiveStyles.errorTitle}>Oops! Something went wrong</h2>
            <p style={responsiveStyles.errorMessage}>{error}</p>
            <button onClick={() => window.location.reload()} style={responsiveStyles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={responsiveStyles.container}>
        {/* Hero Section */}
        <section style={responsiveStyles.hero}>
          <div style={responsiveStyles.heroOverlay} />
          <div style={responsiveStyles.heroPattern} />
          <div style={responsiveStyles.heroContent}>
            <span style={responsiveStyles.badge}>
              <span style={responsiveStyles.badgeDot}></span>
              Digital Library
            </span>
            {/* start contribution link /ebook/author/register */}
            <Link to="/ebook/author/register" style={responsiveStyles.contributeLink}>
              Contribute an eBook
            </Link>
            <h1 style={responsiveStyles.title}>
              Oromo <span style={responsiveStyles.gradient}>eBooks</span>
            </h1>
            <p style={responsiveStyles.subtitle}>
              Free access to {stats.totalEbooks.toLocaleString()} Oromo books, academic texts, 
              and cultural literature
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={responsiveStyles.searchContainer}>
              <div style={responsiveStyles.searchWrapper}>
                <span style={responsiveStyles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search books by title, author, or category..."
                  style={responsiveStyles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    type="button"
                    style={responsiveStyles.clearButton}
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
              {!isMobile && (
                <button type="submit" style={responsiveStyles.searchButton}>
                  Search
                </button>
              )}
            </form>
            {isMobile && (
              <button type="submit" form="searchForm" style={responsiveStyles.mobileSearchButton}>
                Search eBooks
              </button>
            )}
            
            {/* Language Filters */}
            <div style={responsiveStyles.languageFiltersWrapper}>
              <div style={responsiveStyles.languageFilters}>
                <button 
                  style={selectedLanguage === "all" ? responsiveStyles.languageFilterActive : responsiveStyles.languageFilter}
                  onClick={() => filterByLanguage("all")}
                >
                  All
                </button>
                <button 
                  style={selectedLanguage === "Oromo" ? responsiveStyles.languageFilterActive : responsiveStyles.languageFilter}
                  onClick={() => filterByLanguage("Oromo")}
                >
                  Afaan Oromo
                </button>
                <button 
                  style={selectedLanguage === "English" ? responsiveStyles.languageFilterActive : responsiveStyles.languageFilter}
                  onClick={() => filterByLanguage("English")}
                >
                  English
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div style={responsiveStyles.stats}>
              <div style={responsiveStyles.stat}>
                <span style={responsiveStyles.statNumber}>{stats.totalEbooks.toLocaleString()}</span>
                <span style={responsiveStyles.statLabel}>eBooks</span>
              </div>
              <div style={responsiveStyles.statDivider}></div>
              <div style={responsiveStyles.stat}>
                <span style={responsiveStyles.statNumber}>{Math.floor(stats.totalDownloads / 1000)}K+</span>
                <span style={responsiveStyles.statLabel}>Downloads</span>
              </div>
              <div style={responsiveStyles.statDivider}></div>
              <div style={responsiveStyles.stat}>
                <span style={responsiveStyles.statNumber}>{stats.languages}</span>
                <span style={responsiveStyles.statLabel}>Languages</span>
              </div>
              <div style={responsiveStyles.statDivider}></div>
              <div style={responsiveStyles.stat}>
                <span style={responsiveStyles.statNumber}>{stats.totalAuthors}</span>
                <span style={responsiveStyles.statLabel}>Authors</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section style={responsiveStyles.categoriesSection}>
            <div style={responsiveStyles.sectionHeader}>
              <h2 style={responsiveStyles.sectionTitle}>
                Browse by <span style={responsiveStyles.gradient}>Category</span>
              </h2>
              <Link to="/categories" style={responsiveStyles.viewAllSmall}>
                {isMobile ? "View all →" : "View all categories →"}
              </Link>
            </div>
            <div style={responsiveStyles.categoriesGrid}>
              {categories.slice(0, isMobile ? 6 : 8).map((cat) => (
                <Link 
                  to={`/ebooks/category/${cat.slug}`}
                  key={cat.id}
                  style={responsiveStyles.categoryCard}
                >
                  <div style={{
                    ...responsiveStyles.categoryIcon,
                    backgroundColor: `${cat.color || '#2E86AB'}15`,
                    color: cat.color || '#2E86AB'
                  }}>
                    {cat.icon || getCategoryIcon(cat.name)}
                  </div>
                  <h3 style={responsiveStyles.categoryName}>{cat.name}</h3>
                  <p style={responsiveStyles.categoryCount}>{cat.count} books</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingEbooks.length > 0 && (
          <section style={responsiveStyles.trendingSection}>
            <div style={responsiveStyles.sectionHeader}>
              <h2 style={responsiveStyles.sectionTitle}>
                🔥 Trending <span style={responsiveStyles.gradient}>Now</span>
              </h2>
              <Link to="/ebooks/trending" style={responsiveStyles.viewAllSmall}>
                {isMobile ? "View all →" : "View all trending →"}
              </Link>
            </div>
            <div style={isMobile ? responsiveStyles.trendingScroll : responsiveStyles.featuredGrid}>
              {trendingEbooks.map((book, index) => (
                <div 
                  key={book.publication_id || book.id}
                  style={{
                    ...(isMobile ? responsiveStyles.trendingCard : responsiveStyles.bookCard),
                    ...(hoveredBook === book.id ? responsiveStyles.bookCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredBook(book.id)}
                  onMouseLeave={() => setHoveredBook(null)}
                >
                  <div style={{
                    ...responsiveStyles.bookCover,
                    background: `linear-gradient(135deg, ${book.cover_color || '#2E86AB'}, ${book.cover_color || '#2E86AB'}dd)`,
                  }}>
                    <span style={responsiveStyles.bookIcon}>{book.icon || getCategoryIcon(book.category)}</span>
                    <span style={responsiveStyles.trendingBadge}>#{index + 1}</span>
                  </div>
                  <div style={responsiveStyles.bookInfo}>
                    <h3 style={responsiveStyles.bookTitle}>{book.title}</h3>
                    <p style={responsiveStyles.bookAuthor}>By: {book.author_name || book.author}</p>
                    <div style={responsiveStyles.bookMeta}>
                      <span style={responsiveStyles.bookRating}>
                        ⭐ {book.rating || 4.5} 
                        <span style={responsiveStyles.ratingCount}>({Math.floor((book.downloads || 0)/1000)}k)</span>
                      </span>
                      <span style={responsiveStyles.bookLanguage}>{book.language || "Multiple"}</span>
                    </div>
                    <div style={responsiveStyles.bookActions}>
                      <button 
                        onClick={() => handleDownload(book.publication_id || book.id)}
                        style={responsiveStyles.downloadBtn}
                      >
                        Download
                      </button>
                      <Link to={`/ebooks/${book.publication_id || book.id}`} style={responsiveStyles.viewLink}>
                        {isMobile ? "View" : "Details"} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New Releases Section */}
        {newReleases.length > 0 && (
          <section style={responsiveStyles.newSection}>
            <div style={responsiveStyles.sectionHeader}>
              <h2 style={responsiveStyles.sectionTitle}>
                🆕 New <span style={responsiveStyles.gradient}>Releases</span>
              </h2>
              <Link to="/ebooks/new" style={responsiveStyles.viewAllSmall}>
                {isMobile ? "View all →" : "View all new releases →"}
              </Link>
            </div>
            <div style={responsiveStyles.timelineGrid}>
              {newReleases.slice(0, isMobile ? 3 : 5).map((book) => (
                <div key={book.publication_id || book.id} style={responsiveStyles.timelineCard}>
                  <div style={responsiveStyles.timelineDate}>
                    <span style={responsiveStyles.timelineMonth}>
                      {new Date(book.published_at || book.created_at || Date.now()).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span style={responsiveStyles.timelineDay}>
                      {new Date(book.published_at || book.created_at || Date.now()).getDate()}
                    </span>
                  </div>
                  <div style={responsiveStyles.timelineContent}>
                    <div style={responsiveStyles.timelineHeader}>
                      <span style={responsiveStyles.timelineIcon}>{book.icon || getCategoryIcon(book.category)}</span>
                      <div style={responsiveStyles.timelineInfo}>
                        <h4 style={responsiveStyles.timelineTitle}>{book.title}</h4>
                        <p style={responsiveStyles.timelineAuthor}>{book.author_name || book.author}</p>
                      </div>
                    </div>
                    {!isMobile && (
                      <p style={responsiveStyles.timelineDescription}>{book.description || "No description available."}</p>
                    )}
                    <div style={responsiveStyles.timelineFooter}>
                      <span style={responsiveStyles.timelineFormat}>{book.format || "PDF, EPUB"}</span>
                      <Link to={`/ebooks/${book.publication_id || book.id}`} style={responsiveStyles.timelineLink}>
                        {isMobile ? "View" : "Read more"} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured eBooks Section
        {featuredEbooks.length > 0 && (
          <section style={responsiveStyles.featuredSection}>
            <div style={responsiveStyles.sectionHeader}>
              <h2 style={responsiveStyles.sectionTitle}>
                📚 Featured <span style={responsiveStyles.gradient}>Collections</span>
              </h2>
              <Link to="/ebooks/all" style={responsiveStyles.viewAllButton}>
                {isMobile ? "Browse All →" : "Browse All eBooks →"}
              </Link>
            </div>
            <div style={isMobile ? responsiveStyles.featuredGridMobile : responsiveStyles.featuredGrid}>
              {featuredEbooks.map((book) => (
                <div key={book.publication_id || book.id} style={responsiveStyles.bookCardSmall}>
                  <div style={{
                    ...responsiveStyles.bookCoverSmall,
                    background: `linear-gradient(135deg, ${book.cover_color || '#2E86AB'}, ${book.cover_color || '#2E86AB'}dd)`,
                  }}>
                    <span style={responsiveStyles.bookIconSmall}>{book.icon || getCategoryIcon(book.category)}</span>
                  </div>
                  <div style={responsiveStyles.bookInfoSmall}>
                    <h3 style={responsiveStyles.bookTitleSmall}>{book.title}</h3>
                    <p style={responsiveStyles.bookAuthorSmall}>{book.author_name || book.author}</p>
                    <div style={responsiveStyles.bookMetaSmall}>
                      <span style={responsiveStyles.bookRatingSmall}>⭐ {book.rating || 4.5}</span>
                      <span style={responsiveStyles.bookPages}>{book.pages || 200}p</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(book.publication_id || book.id)}
                      style={responsiveStyles.downloadBtnSmall}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )} */}

        {/* Features Grid */}
        <section style={responsiveStyles.featuresSection}>
          <div style={responsiveStyles.featuresContainer}>
            <div style={responsiveStyles.featureCard}>
              <div style={responsiveStyles.featureIconWrapper}>
                <span style={responsiveStyles.featureIcon}>📱</span>
              </div>
              <h4 style={responsiveStyles.featureTitle}>Read Anywhere</h4>
              <p style={responsiveStyles.featureDescription}>On any device</p>
            </div>
            <div style={responsiveStyles.featureCard}>
              <div style={responsiveStyles.featureIconWrapper}>
                <span style={responsiveStyles.featureIcon}>⚡</span>
              </div>
              <h4 style={responsiveStyles.featureTitle}>Instant Access</h4>
              <p style={responsiveStyles.featureDescription}>Download now</p>
            </div>
            <div style={responsiveStyles.featureCard}>
              <div style={responsiveStyles.featureIconWrapper}>
                <span style={responsiveStyles.featureIcon}>🆓</span>
              </div>
              <h4 style={responsiveStyles.featureTitle}>Always Free</h4>
              <p style={responsiveStyles.featureDescription}>No subscription</p>
            </div>
            <div style={responsiveStyles.featureCard}>
              <div style={responsiveStyles.featureIconWrapper}>
                <span style={responsiveStyles.featureIcon}>🌍</span>
              </div>
              <h4 style={responsiveStyles.featureTitle}>Multi-language</h4>
              <p style={responsiveStyles.featureDescription}>Oromo & English</p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section style={responsiveStyles.newsletterSection}>
          <div style={responsiveStyles.newsletterPattern}></div>
          <div style={responsiveStyles.newsletterContainer}>
            <span style={responsiveStyles.newsletterBadge}>📬 Stay Updated</span>
            <h3 style={responsiveStyles.newsletterTitle}>Get New eBooks Alerts</h3>
            <p style={responsiveStyles.newsletterText}>
              Be the first to know when new Oromo books are added
            </p>
            <form 
              onSubmit={handleNewsletterSubscribe}
              style={responsiveStyles.newsletterForm}
            >
              <input
                type="email"
                name="email"
                placeholder="Your email"
                style={responsiveStyles.newsletterInput}
                required
              />
              <button type="submit" style={responsiveStyles.newsletterButton}>
                {isMobile ? "Subscribe" : "Subscribe →"}
              </button>
            </form>
            <p style={responsiveStyles.newsletterPrivacy}>
              Unsubscribe anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={responsiveStyles.footer}>
          <div style={responsiveStyles.footerContent}>
            <div style={responsiveStyles.footerSection}>
              <h4 style={responsiveStyles.footerTitle}>Oromo eBooks</h4>
              <p style={responsiveStyles.footerText}>
                Free digital library preserving Oromo literature
              </p>
            </div>
            <div style={responsiveStyles.footerSection}>
              <h4 style={responsiveStyles.footerTitle}>Quick Links</h4>
              <Link to="/about" style={responsiveStyles.footerLink}>About</Link>
              <Link to="/contact" style={responsiveStyles.footerLink}>Contact</Link>
              <Link to="/faq" style={responsiveStyles.footerLink}>FAQ</Link>
            </div>
            <div style={responsiveStyles.footerSection}>
              <h4 style={responsiveStyles.footerTitle}>Legal</h4>
              <Link to="/privacy" style={responsiveStyles.footerLink}>Privacy</Link>
              <Link to="/terms" style={responsiveStyles.footerLink}>Terms</Link>
            </div>
          </div>
          <div style={responsiveStyles.footerBottom}>
            <p style={responsiveStyles.copyright}>
              © {new Date().getFullYear()} Oromo Researcher Association
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

// Responsive CSS-in-JS styles
const responsiveStyles = {
  // Base container
  container: {
    minHeight: "100vh",
    background: "#f8fafc",
  },

  // Hero Section
  hero: {
    position: "relative",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "80px 24px 120px",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 50%, rgba(46, 134, 171, 0.15) 0%, transparent 50%)",
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  heroContent: {
    position: "relative",
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
    zIndex: 2,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    padding: "8px 16px",
    borderRadius: "100px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#e2e8f0",
    marginBottom: "24px",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    background: "#4ECDC4",
    borderRadius: "50%",
    display: "inline-block",
    animation: "pulse 2s infinite",
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "16px",
    letterSpacing: "-0.02em",
  },
  gradient: {
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  subtitle: {
    fontSize: "clamp(1rem, 3vw, 1.25rem)",
    color: "#cbd5e1",
    maxWidth: "600px",
    margin: "0 auto 32px",
    lineHeight: "1.6",
  },
  searchContainer: {
    maxWidth: "600px",
    margin: "0 auto 32px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  searchWrapper: {
    flex: 1,
    minWidth: "250px",
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "14px 40px 14px 44px",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    background: "#ffffff",
    outline: "none",
    transition: "box-shadow 0.2s",
  },
  clearButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "4px",
  },
  searchButton: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  mobileSearchButton: {
    width: "100%",
    maxWidth: "300px",
    margin: "0 auto 24px",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
  },
  languageFiltersWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "40px",
  },
  languageFilters: {
    display: "flex",
    gap: "12px",
    background: "rgba(255,255,255,0.05)",
    padding: "8px",
    borderRadius: "100px",
    backdropFilter: "blur(10px)",
  },
  languageFilter: {
    padding: "8px 20px",
    background: "transparent",
    border: "none",
    borderRadius: "100px",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  languageFilterActive: {
    padding: "8px 20px",
    background: "#2E86AB",
    border: "none",
    borderRadius: "100px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  stats: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    flexWrap: "wrap",
    marginTop: "40px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  statNumber: {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(255,255,255,0.1)",
  },

  // Section Common
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: "700",
    color: "#1e293b",
  },
  viewAllSmall: {
    color: "#2E86AB",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
  },
  viewAllButton: {
    padding: "10px 20px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#2E86AB",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s",
  },

  // Categories Section
  categoriesSection: {
    maxWidth: "1200px",
    margin: "60px auto",
    padding: "0 24px",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "24px",
  },
  categoryCard: {
    background: "#ffffff",
    padding: "24px 16px",
    borderRadius: "16px",
    textAlign: "center",
    textDecoration: "none",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  categoryIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "28px",
    fontSize: "28px",
  },
  categoryName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "8px",
  },
  categoryCount: {
    fontSize: "13px",
    color: "#64748b",
  },

  // Trending Section
  trendingSection: {
    maxWidth: "1200px",
    margin: "60px auto",
    padding: "0 24px",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  bookCard: {
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
  },
  bookCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
  },
  bookCover: {
    width: "120px",
    minWidth: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bookIcon: {
    fontSize: "40px",
  },
  trendingBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "#FF6B6B",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "20px",
  },
  bookInfo: {
    padding: "16px",
    flex: 1,
  },
  bookTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "6px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  bookAuthor: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "10px",
  },
  bookMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  bookRating: {
    fontSize: "13px",
    color: "#f59e0b",
  },
  ratingCount: {
    fontSize: "11px",
    color: "#94a3b8",
    marginLeft: "4px",
  },
  bookLanguage: {
    fontSize: "11px",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "12px",
    color: "#475569",
  },
  bookActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  downloadBtn: {
    flex: 1,
    padding: "8px 12px",
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  viewLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
  },
  trendingScroll: {
    display: "flex",
    overflowX: "auto",
    gap: "16px",
    paddingBottom: "8px",
    scrollSnapType: "x mandatory",
  },
  trendingCard: {
    minWidth: "280px",
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    scrollSnapAlign: "start",
    display: "flex",
    flexDirection: "column",
  },

  // New Releases Section
  newSection: {
    maxWidth: "1200px",
    margin: "60px auto",
    padding: "0 24px",
  },
  timelineGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  timelineCard: {
    display: "flex",
    gap: "20px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  timelineDate: {
    minWidth: "60px",
    textAlign: "center",
    paddingRight: "16px",
    borderRight: "2px solid #e2e8f0",
  },
  timelineMonth: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2E86AB",
    textTransform: "uppercase",
  },
  timelineDay: {
    display: "block",
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  timelineIcon: {
    fontSize: "24px",
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
  },
  timelineAuthor: {
    fontSize: "13px",
    color: "#64748b",
  },
  timelineDescription: {
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  timelineFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineFormat: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  timelineLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
  },

  // Featured Section
  featuredSection: {
    maxWidth: "1200px",
    margin: "60px auto",
    padding: "0 24px",
  },
  featuredGridMobile: {
    display: "flex",
    overflowX: "auto",
    gap: "16px",
    paddingBottom: "8px",
  },
  bookCardSmall: {
    minWidth: "160px",
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  bookCoverSmall: {
    height: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bookIconSmall: {
    fontSize: "48px",
  },
  bookInfoSmall: {
    padding: "12px",
  },
  bookTitleSmall: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bookAuthorSmall: {
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bookMetaSmall: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  bookRatingSmall: {
    fontSize: "11px",
    color: "#f59e0b",
  },
  bookPages: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  downloadBtnSmall: {
    width: "100%",
    padding: "8px",
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },

  // Features Section
  featuresSection: {
    background: "#ffffff",
    padding: "60px 24px",
    marginTop: "60px",
  },
  featuresContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "32px",
  },
  featureCard: {
    textAlign: "center",
    padding: "24px",
  },
  featureIconWrapper: {
    width: "64px",
    height: "64px",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    borderRadius: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    fontSize: "28px",
  },
  featureTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "8px",
  },
  featureDescription: {
    fontSize: "14px",
    color: "#64748b",
  },

  // Newsletter Section
  newsletterSection: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "80px 24px",
    position: "relative",
    overflow: "hidden",
  },
  newsletterPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  newsletterContainer: {
    position: "relative",
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center",
    zIndex: 2,
  },
  newsletterBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.1)",
    padding: "6px 12px",
    borderRadius: "100px",
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "16px",
  },
  newsletterTitle: {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "12px",
  },
  newsletterText: {
    fontSize: "16px",
    color: "#cbd5e1",
    marginBottom: "24px",
  },
  newsletterForm: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  newsletterInput: {
    flex: 1,
    minWidth: "200px",
    padding: "14px 20px",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    background: "#ffffff",
    outline: "none",
  },
  newsletterButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #4ECDC4, #2E86AB)",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
  newsletterPrivacy: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "16px",
  },

  // Footer
  footer: {
    background: "#0f172a",
    padding: "48px 24px 24px",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "32px",
    marginBottom: "32px",
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "4px",
  },
  footerText: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "13px",
    transition: "color 0.2s",
  },
  footerBottom: {
    textAlign: "center",
    paddingTop: "24px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  copyright: {
    fontSize: "12px",
    color: "#64748b",
  },

  // Loading States
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#2E86AB",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    color: "#64748b",
    fontSize: "14px",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    marginTop: "48px",
    padding: "0 24px",
  },
  skeletonCard: {
    height: "200px",
    background: "#e2e8f0",
    borderRadius: "16px",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  // Error States
  errorContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },
  errorContent: {
    textAlign: "center",
    padding: "24px",
  },
  errorIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  errorTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  errorMessage: {
    color: "#64748b",
    marginBottom: "24px",
  },
  retryButton: {
    padding: "10px 24px",
    background: "#2E86AB",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: "500",
    cursor: "pointer",
  },
};

// Add keyframe animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(styleSheet);