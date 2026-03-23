// pages/EbookDashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../../api/axios"; // Your configured axios instance

// Mock Data (same as before)
const MOCK_CATEGORIES = [
  { id: 1, name: "Fiction", slug: "fiction", icon: "📖", color: "#FF6B6B", count: 234 },
  { id: 2, name: "Science", slug: "science", icon: "🔬", color: "#4ECDC4", count: 156 },
  { id: 3, name: "History", slug: "history", icon: "🏛️", color: "#45B7D1", count: 98 },
  { id: 4, name: "Poetry", slug: "poetry", icon: "🎭", color: "#96CEB4", count: 67 },
  { id: 5, name: "Children", slug: "children", icon: "🧸", color: "#FFEAA7", count: 145 },
  { id: 6, name: "Education", slug: "education", icon: "🎓", color: "#DDA0DD", count: 189 },
  { id: 7, name: "Religion", slug: "religion", icon: "🕊️", color: "#B0C4DE", count: 112 },
  { id: 8, name: "Culture", slug: "culture", icon: "🌍", color: "#F4A460", count: 203 },
];

const MOCK_EBOOKS = [
  {
    id: 1,
    title: "Oromo Wisdom: Traditional Stories",
    author: "Dr. Tsegaye Gebre",
    author_name: "Dr. Tsegaye Gebre",
    downloads: 15400,
    rating: 4.8,
    format: "PDF, EPUB, MOBI",
    icon: "📘",
    coverColor: "#2E86AB",
    created_at: "2024-01-15",
    description: "Collection of ancient Oromo proverbs and wisdom tales",
    language: "Oromo/English",
    pages: 342,
  },
  {
    id: 2,
    title: "Gadaa System: The Democratic Philosophy",
    author: "Prof. Asmarom Legesse",
    author_name: "Prof. Asmarom Legesse",
    downloads: 23200,
    rating: 4.9,
    format: "PDF, EPUB",
    icon: "📚",
    coverColor: "#A569BD",
    created_at: "2024-02-20",
    description: "Comprehensive guide to the Gadaa democratic system",
    language: "English",
    pages: 520,
  },
  {
    id: 3,
    title: "Learning Afaan Oromo: Book 1",
    author: "Oromo Language Institute",
    author_name: "Oromo Language Institute",
    downloads: 42100,
    rating: 4.7,
    format: "PDF, EPUB, AUDIO",
    icon: "🗣️",
    coverColor: "#C9A227",
    created_at: "2024-03-10",
    description: "Beginner's guide to learning Afaan Oromo",
    language: "Oromo/English",
    pages: 210,
  },
  {
    id: 4,
    title: "Oromo Poetry Anthology",
    author: "Various Poets",
    author_name: "Various Poets",
    downloads: 8900,
    rating: 4.6,
    format: "PDF, EPUB",
    icon: "🎭",
    coverColor: "#E67E22",
    created_at: "2024-02-05",
    description: "Collection of modern and classical Oromo poetry",
    language: "Oromo",
    pages: 178,
  },
  {
    id: 5,
    title: "The History of Oromo People",
    author: "Dr. Mohammed Hassen",
    author_name: "Dr. Mohammed Hassen",
    downloads: 18700,
    rating: 4.9,
    format: "PDF, EPUB",
    icon: "🏛️",
    coverColor: "#16A085",
    created_at: "2024-01-28",
    description: "Comprehensive history from ancient times to present",
    language: "English",
    pages: 680,
  },
  {
    id: 6,
    title: "Children's Stories: Oromo Tales",
    author: "Almaz Tilahun",
    author_name: "Almaz Tilahun",
    downloads: 15300,
    rating: 4.8,
    format: "PDF, EPUB, AUDIO",
    icon: "🧸",
    coverColor: "#E67E22",
    created_at: "2024-03-15",
    description: "Delightful stories for children with illustrations",
    language: "Oromo/English",
    pages: 120,
  },
  {
    id: 7,
    title: "Traditional Oromo Medicine",
    author: "Dr. Worku Fufa",
    author_name: "Dr. Worku Fufa",
    downloads: 11200,
    rating: 4.7,
    format: "PDF",
    icon: "🌿",
    coverColor: "#27AE60",
    created_at: "2024-02-18",
    description: "Guide to traditional healing practices",
    language: "Oromo",
    pages: 445,
  },
  {
    id: 8,
    title: "Oromo Music and Culture",
    author: "Tesfaye Lemma",
    author_name: "Tesfaye Lemma",
    downloads: 9800,
    rating: 4.6,
    format: "PDF, EPUB",
    icon: "🎵",
    coverColor: "#8E44AD",
    created_at: "2024-03-01",
    description: "Exploration of Oromo musical traditions",
    language: "English",
    pages: 290,
  },
];

const MOCK_STATS = {
  totalEbooks: 1243,
  totalDownloads: 456,
  totalAuthors: 342,
  languages: 12
};

export default function EbookDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [featuredEbooks, setFeaturedEbooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [trendingEbooks, setTrendingEbooks] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(false);
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
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load mock data
    setTimeout(() => {
      const featured = [...MOCK_EBOOKS]
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 4);
      setFeaturedEbooks(featured);

      const releases = [...MOCK_EBOOKS]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setNewReleases(releases);

      const trending = [...MOCK_EBOOKS]
        .sort((a, b) => (b.rating * b.downloads) - (a.rating * a.downloads))
        .slice(0, 6);
      setTrendingEbooks(trending);
    }, 1000);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ebooks/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleDownload = (ebookId) => {
    alert(`Download started for book ID: ${ebookId}`);
  };

  const filterByLanguage = (language) => {
    setSelectedLanguage(language);
    if (language === "all") {
      setFeaturedEbooks(MOCK_EBOOKS.sort((a, b) => b.downloads - a.downloads).slice(0, 4));
    } else {
      const filtered = MOCK_EBOOKS
        .filter(book => book.language.includes(language))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 4);
      setFeaturedEbooks(filtered);
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
        {/* Hero Section - Mobile Optimized */}
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
              Free access to hundreds of Oromo books, academic texts, 
              and cultural literature
            </p>
            
            {/* Search Bar - Mobile Friendly */}
            <form onSubmit={handleSearch} style={responsiveStyles.searchContainer}>
              <div style={responsiveStyles.searchWrapper}>
                <span style={responsiveStyles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search books..."
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

            {/* Language Filters - Horizontal Scroll on Mobile */}
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

            {/* Quick Stats - Responsive Grid */}
            <div style={responsiveStyles.stats}>
              <div style={responsiveStyles.stat}>
                <span style={responsiveStyles.statNumber}>{stats.totalEbooks.toLocaleString()}</span>
                <span style={responsiveStyles.statLabel}>eBooks</span>
              </div>
              <div style={responsiveStyles.statDivider}></div>
              <div style={responsiveStyles.stat}>
                <span style={responsiveStyles.statNumber}>{stats.totalDownloads}K+</span>
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

        {/* Categories Section - Mobile Grid */}
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
                  backgroundColor: `${cat.color}15`,
                  color: cat.color
                }}>
                  {cat.icon}
                </div>
                <h3 style={responsiveStyles.categoryName}>{cat.name}</h3>
                <p style={responsiveStyles.categoryCount}>{cat.count} books</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Section - Horizontal Scroll on Mobile */}
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
                key={book.id} 
                style={{
                  ...(isMobile ? responsiveStyles.trendingCard : responsiveStyles.bookCard),
                  ...(hoveredBook === book.id ? responsiveStyles.bookCardHover : {})
                }}
                onMouseEnter={() => setHoveredBook(book.id)}
                onMouseLeave={() => setHoveredBook(null)}
              >
                <div style={{
                  ...responsiveStyles.bookCover,
                  background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)`,
                }}>
                  <span style={responsiveStyles.bookIcon}>{book.icon}</span>
                  <span style={responsiveStyles.trendingBadge}>#{index + 1}</span>
                </div>
                <div style={responsiveStyles.bookInfo}>
                  <h3 style={responsiveStyles.bookTitle}>{book.title}</h3>
                  <p style={responsiveStyles.bookAuthor}>By: {book.author_name}</p>
                  <div style={responsiveStyles.bookMeta}>
                    <span style={responsiveStyles.bookRating}>
                      ⭐ {book.rating} 
                      <span style={responsiveStyles.ratingCount}>({Math.floor(book.downloads/1000)}k)</span>
                    </span>
                    <span style={responsiveStyles.bookLanguage}>{book.language}</span>
                  </div>
                  <div style={responsiveStyles.bookActions}>
                    <button 
                      onClick={() => handleDownload(book.id)}
                      style={responsiveStyles.downloadBtn}
                    >
                      Download
                    </button>
                    <Link to={`/ebooks/${book.id}`} style={responsiveStyles.viewLink}>
                      {isMobile ? "View" : "Details"} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Releases - Stack on Mobile */}
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
              <div key={book.id} style={responsiveStyles.timelineCard}>
                <div style={responsiveStyles.timelineDate}>
                  <span style={responsiveStyles.timelineMonth}>
                    {new Date(book.created_at).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span style={responsiveStyles.timelineDay}>
                    {new Date(book.created_at).getDate()}
                  </span>
                </div>
                <div style={responsiveStyles.timelineContent}>
                  <div style={responsiveStyles.timelineHeader}>
                    <span style={responsiveStyles.timelineIcon}>{book.icon}</span>
                    <div style={responsiveStyles.timelineInfo}>
                      <h4 style={responsiveStyles.timelineTitle}>{book.title}</h4>
                      <p style={responsiveStyles.timelineAuthor}>{book.author_name}</p>
                    </div>
                  </div>
                  {!isMobile && (
                    <p style={responsiveStyles.timelineDescription}>{book.description}</p>
                  )}
                  <div style={responsiveStyles.timelineFooter}>
                    <span style={responsiveStyles.timelineFormat}>{book.format}</span>
                    <Link to={`/ebooks/${book.id}`} style={responsiveStyles.timelineLink}>
                      {isMobile ? "View" : "Read more"} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured eBooks - Grid with 2 columns on mobile */}
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
              <div key={book.id} style={responsiveStyles.bookCardSmall}>
                <div style={{
                  ...responsiveStyles.bookCoverSmall,
                  background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)`,
                }}>
                  <span style={responsiveStyles.bookIconSmall}>{book.icon}</span>
                </div>
                <div style={responsiveStyles.bookInfoSmall}>
                  <h3 style={responsiveStyles.bookTitleSmall}>{book.title}</h3>
                  <p style={responsiveStyles.bookAuthorSmall}>{book.author_name}</p>
                  <div style={responsiveStyles.bookMetaSmall}>
                    <span style={responsiveStyles.bookRatingSmall}>⭐ {book.rating}</span>
                    <span style={responsiveStyles.bookPages}>{book.pages}p</span>
                  </div>
                  <button 
                    onClick={() => handleDownload(book.id)}
                    style={responsiveStyles.downloadBtnSmall}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid - Stack on Mobile */}
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

        {/* Newsletter - Mobile Optimized */}
        <section style={responsiveStyles.newsletterSection}>
          <div style={responsiveStyles.newsletterPattern}></div>
          <div style={responsiveStyles.newsletterContainer}>
            <span style={responsiveStyles.newsletterBadge}>📬 Stay Updated</span>
            <h3 style={responsiveStyles.newsletterTitle}>Get New eBooks Alerts</h3>
            <p style={responsiveStyles.newsletterText}>
              Be the first to know when new Oromo books are added
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed successfully!");
                e.target.reset();
              }}
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

        {/* Footer - Mobile Stack */}
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
              © 2024 Oromo Researcher Association
            </p>
          </div>
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

// Responsive Styles with Media Queries
const responsiveStyles = {
  // Base styles (mobile first)
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#ffffff",
    overflowX: "hidden",
  },

  // Loading States
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
    padding: "20px",
  },
  loadingText: {
    color: "white",
    fontSize: "clamp(1rem, 4vw, 1.2rem)",
    marginTop: "20px",
    fontWeight: "500",
    textAlign: "center",
  },
  spinner: {
    width: "clamp(40px, 8vw, 60px)",
    height: "clamp(40px, 8vw, 60px)",
    border: "4px solid rgba(255,255,255,0.1)",
    borderTop: "4px solid #C9A227",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginTop: "30px",
    width: "100%",
    maxWidth: "1000px",
    padding: "0 20px",
  },
  skeletonCard: {
    height: "150px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  // Hero Section - Mobile First
  hero: {
    position: "relative",
    minHeight: "clamp(500px, 80vh, 700px)",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 50%, #2E4057 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "60px 0",
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(255,215,0,0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(165,105,189,0.1) 0%, transparent 40%)
    `,
    zIndex: 1,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "900px",
    padding: "0 16px",
    width: "100%",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    background: "#C9A227",
    borderRadius: "50%",
    display: "inline-block",
  },
  title: {
    fontSize: "clamp(2rem, 8vw, 4.5rem)",
    fontWeight: "800",
    margin: "0 0 15px",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  gradient: {
    background: "linear-gradient(135deg, #F5D76E, #FFFFFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "clamp(1rem, 4vw, 1.2rem)",
    lineHeight: 1.5,
    margin: "0 auto 30px",
    opacity: 0.95,
    maxWidth: "650px",
    color: "rgba(255,255,255,0.9)",
    padding: "0 10px",
  },

  // Search - Mobile Optimized
  searchContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "600px",
    margin: "0 auto 20px",
    padding: "0 10px",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#999",
    fontSize: "1.1rem",
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "14px 20px 14px 45px",
    border: "none",
    borderRadius: "50px",
    fontSize: "clamp(0.9rem, 4vw, 1rem)",
    outline: "none",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
    WebkitAppearance: "none",
  },
  clearButton: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "5px",
  },
  searchButton: {
    padding: "14px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  mobileSearchButton: {
    width: "calc(100% - 20px)",
    margin: "0 10px",
    padding: "16px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Language Filters - Horizontal Scroll on Mobile
  languageFiltersWrapper: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    marginBottom: "30px",
    padding: "5px 0",
    "::-webkit-scrollbar": {
      display: "none",
    },
  },
  languageFilters: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-start",
    padding: "0 16px",
    minWidth: "max-content",
  },
  languageFilter: {
    padding: "8px 20px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "30px",
    color: "white",
    fontSize: "clamp(0.85rem, 3.5vw, 0.9rem)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  languageFilterActive: {
    padding: "8px 20px",
    background: "#C9A227",
    border: "1px solid #C9A227",
    borderRadius: "30px",
    color: "#0F3D2E",
    fontSize: "clamp(0.85rem, 3.5vw, 0.9rem)",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  // Stats - Responsive Grid
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    padding: "20px 16px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "20px",
    margin: "20px 10px 0",
    backdropFilter: "blur(10px)",
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    display: "block",
    fontSize: "clamp(1.5rem, 6vw, 2rem)",
    fontWeight: "700",
    marginBottom: "5px",
    background: "linear-gradient(135deg, #F5D76E, #FFFFFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  statLabel: {
    fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  statDivider: {
    display: "none",
    "@media (min-width: 640px)": {
      display: "block",
      width: "2px",
      height: "40px",
      background: "rgba(255,255,255,0.2)",
      alignSelf: "center",
    },
  },

  // Section Common - Mobile Optimized
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  sectionTitle: {
    fontSize: "clamp(1.5rem, 6vw, 2rem)",
    fontWeight: "700",
    color: "#1a2639",
    margin: 0,
  },
  viewAllButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #C9A227, #F5D76E)",
    color: "#0F3D2E",
    textDecoration: "none",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "clamp(0.9rem, 4vw, 1rem)",
    whiteSpace: "nowrap",
  },
  viewAllSmall: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "clamp(0.9rem, 4vw, 1rem)",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  // Categories - Mobile Grid (2 columns)
  categoriesSection: {
    padding: "40px 0",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    padding: "0 16px",
    "@media (min-width: 480px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(6, 1fr)",
    },
  },
  categoryCard: {
    background: "#ffffff",
    padding: "20px 10px",
    borderRadius: "16px",
    textAlign: "center",
    textDecoration: "none",
    transition: "all 0.3s ease",
    border: "1px solid #eaeef2",
    boxShadow: "0 5px 15px rgba(0,0,0,0.02)",
  },
  categoryIcon: {
    width: "clamp(50px, 15vw, 80px)",
    height: "clamp(50px, 15vw, 80px)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(1.8rem, 6vw, 2.5rem)",
    margin: "0 auto 12px",
  },
  categoryName: {
    fontSize: "clamp(0.95rem, 4vw, 1.2rem)",
    margin: "0 0 3px",
    color: "#1a2639",
    fontWeight: "600",
  },
  categoryCount: {
    fontSize: "clamp(0.8rem, 3.5vw, 0.9rem)",
    color: "#5a6a7a",
    margin: 0,
  },

  // Trending - Horizontal Scroll on Mobile
  trendingSection: {
    padding: "40px 0",
    background: "#f8faff",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  trendingScroll: {
    display: "flex",
    overflowX: "auto",
    gap: "15px",
    padding: "10px 16px 20px",
    WebkitOverflowScrolling: "touch",
    scrollSnapType: "x mandatory",
    "::-webkit-scrollbar": {
      height: "5px",
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "10px",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#C9A227",
      borderRadius: "10px",
    },
  },
  trendingCard: {
    minWidth: "280px",
    maxWidth: "300px",
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    scrollSnapAlign: "start",
  },
  bookCard: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #eaeef2",
  },
  bookCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 15px 40px rgba(201,162,39,0.15)",
  },
  bookCover: {
    padding: "30px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bookIcon: {
    fontSize: "clamp(3rem, 8vw, 4rem)",
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
  },
  trendingBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#C9A227",
    color: "#0F3D2E",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.9rem",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  },
  bookInfo: {
    padding: "20px",
  },
  bookTitle: {
    fontSize: "clamp(1rem, 4vw, 1.2rem)",
    margin: "0 0 3px",
    color: "#1a2639",
    fontWeight: "600",
    lineHeight: 1.3,
  },
  bookAuthor: {
    fontSize: "clamp(0.85rem, 3.5vw, 0.95rem)",
    color: "#5a6a7a",
    margin: "0 0 12px",
  },
  bookMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "8px",
  },
  bookRating: {
    color: "#C9A227",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "clamp(0.85rem, 3.5vw, 0.95rem)",
  },
  ratingCount: {
    color: "#5a6a7a",
    fontSize: "0.8rem",
  },
  bookLanguage: {
    fontSize: "0.8rem",
    color: "#2E86AB",
    background: "#e6f3ff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  bookActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  downloadBtn: {
    flex: 1,
    padding: "10px",
    background: "linear-gradient(135deg, #C9A227, #F5D76E)",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "8px",
    fontSize: "clamp(0.85rem, 3.5vw, 0.95rem)",
    fontWeight: "600",
    cursor: "pointer",
  },
  viewLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "clamp(0.85rem, 3.5vw, 0.95rem)",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  // New Releases - Timeline
  newSection: {
    padding: "40px 0",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  timelineGrid: {
    display: "grid",
    gap: "12px",
    padding: "0 16px",
  },
  timelineCard: {
    display: "flex",
    gap: "15px",
    background: "white",
    padding: "15px",
    borderRadius: "16px",
    border: "1px solid #eaeef2",
    transition: "all 0.3s ease",
  },
  timelineDate: {
    minWidth: "60px",
    textAlign: "center",
    padding: "8px",
    background: "#f8faff",
    borderRadius: "12px",
  },
  timelineMonth: {
    display: "block",
    fontSize: "0.8rem",
    color: "#C9A227",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timelineDay: {
    display: "block",
    fontSize: "clamp(1.4rem, 5vw, 1.8rem)",
    fontWeight: "700",
    color: "#1a2639",
    lineHeight: 1,
  },
  timelineContent: {
    flex: 1,
    minWidth: 0,
  },
  timelineHeader: {
    display: "flex",
    gap: "10px",
    marginBottom: "8px",
    alignItems: "center",
  },
  timelineIcon: {
    fontSize: "clamp(1.6rem, 5vw, 2rem)",
  },
  timelineInfo: {
    flex: 1,
    minWidth: 0,
  },
  timelineTitle: {
    fontSize: "clamp(0.95rem, 4vw, 1.1rem)",
    margin: "0 0 2px",
    color: "#1a2639",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  timelineAuthor: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  timelineDescription: {
    fontSize: "0.9rem",
    color: "#2c3e50",
    margin: "0 0 10px",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  timelineFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  timelineFormat: {
    fontSize: "0.75rem",
    color: "#A569BD",
    background: "#f3e5f5",
    padding: "3px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  timelineLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  // Featured Collections - Mobile Grid (2 columns)
  featuredSection: {
    padding: "40px 0",
    background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  featuredGridMobile: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    padding: "0 16px",
  },
  bookCardSmall: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    border: "1px solid #eaeef2",
  },
  bookCoverSmall: {
    padding: "20px 10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  bookIconSmall: {
    fontSize: "clamp(2rem, 8vw, 3rem)",
  },
  bookInfoSmall: {
    padding: "15px",
  },
  bookTitleSmall: {
    fontSize: "clamp(0.9rem, 4vw, 1rem)",
    margin: "0 0 2px",
    color: "#1a2639",
    fontWeight: "600",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "2.4em",
  },
  bookAuthorSmall: {
    fontSize: "0.75rem",
    color: "#5a6a7a",
    margin: "0 0 8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bookMetaSmall: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "0.75rem",
  },
  bookRatingSmall: {
    color: "#C9A227",
    fontWeight: "600",
  },
  bookPages: {
    color: "#2E86AB",
  },
  downloadBtnSmall: {
    width: "100%",
    padding: "8px",
    background: "linear-gradient(135deg, #C9A227, #F5D76E)",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Features - Stack on Mobile
  featuresSection: {
    padding: "40px 16px",
    background: "#ffffff",
  },
  featuresContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
  },
  featureCard: {
    textAlign: "center",
    padding: "20px 10px",
    borderRadius: "16px",
    transition: "all 0.3s ease",
  },
  featureIconWrapper: {
    width: "clamp(50px, 15vw, 80px)",
    height: "clamp(50px, 15vw, 80px)",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #C9A22715, #F5D76E15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
  },
  featureIcon: {
    fontSize: "clamp(1.8rem, 6vw, 2.5rem)",
  },
  featureTitle: {
    fontSize: "clamp(1rem, 4vw, 1.2rem)",
    margin: "0 0 5px",
    color: "#1a2639",
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: "clamp(0.8rem, 3.5vw, 0.95rem)",
    color: "#5a6a7a",
    margin: 0,
    lineHeight: 1.4,
  },

  // Newsletter - Mobile Optimized
  newsletterSection: {
    padding: "60px 16px",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
    position: "relative",
    overflow: "hidden",
  },
  newsletterPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      radial-gradient(circle at 10% 20%, rgba(255,215,0,0.1) 0%, transparent 20%),
      radial-gradient(circle at 90% 80%, rgba(165,105,189,0.1) 0%, transparent 30%)
    `,
    zIndex: 1,
  },
  newsletterContainer: {
    position: "relative",
    zIndex: 2,
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  newsletterBadge: {
    display: "inline-block",
    padding: "6px 16px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "30px",
    fontSize: "0.85rem",
    marginBottom: "15px",
    backdropFilter: "blur(10px)",
  },
  newsletterTitle: {
    fontSize: "clamp(1.8rem, 7vw, 2.5rem)",
    margin: "0 0 12px",
    fontWeight: "700",
  },
  newsletterText: {
    fontSize: "clamp(1rem, 4vw, 1.1rem)",
    margin: "0 0 25px",
    opacity: 0.9,
    lineHeight: 1.5,
  },
  newsletterForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "12px",
    "@media (min-width: 480px)": {
      flexDirection: "row",
    },
  },
  newsletterInput: {
    flex: 1,
    padding: "14px 16px",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    outline: "none",
    width: "100%",
  },
  newsletterButton: {
    padding: "14px 24px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    width: "100%",
    "@media (min-width: 480px)": {
      width: "auto",
    },
  },
  newsletterPrivacy: {
    fontSize: "0.8rem",
    opacity: 0.7,
    margin: 0,
  },

  // Footer - Mobile Stack
  footer: {
    background: "#0a1f17",
    padding: "40px 16px 20px",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto 30px",
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "center",
    "@media (min-width: 640px)": {
      textAlign: "left",
    },
  },
  footerTitle: {
    color: "white",
    fontSize: "1.1rem",
    margin: "0 0 5px",
    fontWeight: "600",
  },
  footerText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
    margin: 0,
    lineHeight: 1.5,
  },
  footerLink: {
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.3s ease",
    padding: "3px 0",
  },
  footerBottom: {
    maxWidth: "1200px",
    margin: "0 auto",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
  },
  copyright: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
    margin: 0,
  },

  // Error States
  errorContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    padding: "20px",
  },
  errorContent: {
    textAlign: "center",
    maxWidth: "400px",
    padding: "30px 20px",
  },
  errorIcon: {
    fontSize: "3.5rem",
    display: "block",
    marginBottom: "20px",
  },
  errorTitle: {
    fontSize: "clamp(1.5rem, 6vw, 1.8rem)",
    color: "#1a2639",
    margin: "0 0 10px",
  },
  errorMessage: {
    color: "#5a6a7a",
    margin: "0 0 25px",
    fontSize: "clamp(0.95rem, 4vw, 1rem)",
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

// Add global styles and animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.3; }
  }
  
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  input, button, textarea {
    font-family: inherit;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Better touch targets on mobile */
  @media (max-width: 768px) {
    button, a, .clickable {
      min-height: 44px;
      min-width: 44px;
    }
    
    input, select, textarea {
      font-size: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);