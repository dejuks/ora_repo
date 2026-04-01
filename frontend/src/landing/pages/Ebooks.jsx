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

        {/* Featured eBooks Section */}
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
        )}

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

// [Keep all the responsiveStyles from your original code]
const responsiveStyles = {
  // ... (keep all your existing styles from the original component)
};