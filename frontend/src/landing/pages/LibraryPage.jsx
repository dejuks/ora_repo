import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { name: "Academic Texts", count: "1.2K", icon: "📚", color: "#C9A227" },
    { name: "Historical Archives", count: "890", icon: "📜", color: "#2E86AB" },
    { name: "Cultural Collection", count: "567", icon: "🏛️", color: "#A569BD" },
    { name: "Language Resources", count: "432", icon: "🔤", color: "#27AE60" },
    { name: "Rare Books", count: "123", icon: "📖", color: "#E67E22" },
  ];

  const featuredBooks = [
    {
      title: "The Oromo People: A Complete History",
      author: "Prof. Mohammed Hassan",
      copies: "12 available",
      location: "Section A-12",
      icon: "📘",
      status: "Available",
    },
    {
      title: "Gadaa System: Origins & Practice",
      author: "Dr. Abdi Mohammed",
      copies: "5 available",
      location: "Section B-08",
      icon: "📙",
      status: "Available",
    },
    {
      title: "Oromo-English Dictionary (3rd Ed)",
      author: "Prof. Lemma Dibaba",
      copies: "8 available",
      location: "Section C-15",
      icon: "📕",
      status: "Available",
    },
    {
      title: "Oral Traditions of Oromia",
      author: "Dr. Fatuma Hassan",
      copies: "3 available",
      location: "Section A-05",
      icon: "📗",
      status: "Limited",
    },
  ];

  const recentAcquisitions = [
    {
      title: "Women in Oromo Society",
      author: "Dr. Aisha Mohammed",
      date: "Added 2 days ago",
      icon: "📘",
    },
    {
      title: "Traditional Oromo Medicine",
      author: "Prof. Tekle Berhan",
      date: "Added 5 days ago",
      icon: "📙",
    },
    {
      title: "Oromo Proverbs Collection",
      author: "Dr. Gemechu Kebede",
      date: "Added 1 week ago",
      icon: "📗",
    },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Hero Section - Mobile Optimized */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <span style={styles.badge}>
              <span style={styles.badgeIcon}>🏛️</span>
              Digital Library
            </span>
            <h1 style={styles.title}>
              Oromo Research <span style={styles.gradient}>Library</span>
            </h1>
            <p style={styles.subtitle}>
              Access thousands of physical and digital resources on Oromo history, 
              culture, language, and academic research
            </p>
            
            {/* Search Bar - Mobile Friendly */}
            <div style={styles.searchContainer}>
              <div style={styles.searchWrapper}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search books, journals..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button style={styles.searchButton}>
                <span style={styles.searchButtonText}>Search</span>
                <span style={styles.searchButtonIcon}>→</span>
              </button>
            </div>

            {/* Quick Stats - Scrollable on Mobile */}
            <div style={styles.statsContainer}>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>12K+</span>
                  <span style={styles.statLabel}>Books</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statNumber}>3K+</span>
                  <span style={styles.statLabel}>Journals</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statNumber}>1.5K</span>
                  <span style={styles.statLabel}>Archives</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions - Horizontal Scroll on Mobile */}
        <section style={styles.actionsSection}>
          <h2 style={styles.sectionTitleSmall}>Quick Actions</h2>
          <div style={styles.actionsScroll}>
            <div style={styles.actionsGrid}>
              <Link to="/library/borrow" style={styles.actionCard}>
                <span style={styles.actionIcon}>📋</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Borrow</h3>
                  <p style={styles.actionDesc}>Check out books</p>
                </div>
              </Link>
              <Link to="/library/return" style={styles.actionCard}>
                <span style={styles.actionIcon}>🔄</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Return</h3>
                  <p style={styles.actionDesc}>Manage items</p>
                </div>
              </Link>
              <Link to="/library/reserve" style={styles.actionCard}>
                <span style={styles.actionIcon}>📌</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Reserve</h3>
                  <p style={styles.actionDesc}>Hold for pickup</p>
                </div>
              </Link>
              <Link to="/library/digital" style={styles.actionCard}>
                <span style={styles.actionIcon}>💻</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Digital</h3>
                  <p style={styles.actionDesc}>E-books & more</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section - Grid with Touch Targets */}
        <section style={styles.categoriesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Browse by <span style={styles.gradient}>Category</span>
            </h2>
            <Link to="/library/categories" style={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          <div style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link 
                to={`/library/category/${cat.name}`} 
                key={cat.name} 
                style={styles.categoryCard}
              >
                <div style={{
                  ...styles.categoryIcon,
                  backgroundColor: `${cat.color}15`,
                  color: cat.color
                }}>
                  {cat.icon}
                </div>
                <div style={styles.categoryContent}>
                  <h3 style={styles.categoryName}>{cat.name}</h3>
                  <p style={styles.categoryCount}>{cat.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Books - Card Grid */}
        <section style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Featured <span style={styles.gradient}>Books</span>
            </h2>
            <Link to="/library/featured" style={styles.viewAllLink}>
              See All →
            </Link>
          </div>
          <div style={styles.featuredGrid}>
            {featuredBooks.map((book, index) => (
              <div key={index} style={styles.bookCard}>
                <div style={styles.bookHeader}>
                  <span style={styles.bookIcon}>{book.icon}</span>
                  <span style={{
                    ...styles.bookStatus,
                    backgroundColor: book.status === "Available" ? "#27AE60" : "#E67E22",
                  }}>
                    {book.status}
                  </span>
                </div>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                <p style={styles.bookAuthor}>By {book.author}</p>
                <div style={styles.bookDetails}>
                  <span style={styles.bookCopies}>📚 {book.copies}</span>
                  <span style={styles.bookLocation}>📍 {book.location}</span>
                </div>
                <div style={styles.bookActions}>
                  <button style={styles.borrowBtn}>
                    <span>Borrow</span>
                  </button>
                  <Link to={`/library/book/${index}`} style={styles.detailsLink}>
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Acquisitions - List View */}
        <section style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Recently <span style={styles.gradient}>Added</span>
            </h2>
            <Link to="/library/new" style={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          <div style={styles.recentGrid}>
            {recentAcquisitions.map((book, index) => (
              <Link to={`/library/book/${index}`} key={index} style={styles.recentCard}>
                <span style={styles.recentIcon}>{book.icon}</span>
                <div style={styles.recentInfo}>
                  <h4 style={styles.recentTitle}>{book.title}</h4>
                  <p style={styles.recentAuthor}>{book.author}</p>
                  <p style={styles.recentDate}>{book.date}</p>
                </div>
                <span style={styles.recentArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Library Info - Cards */}
        <section style={styles.infoSection}>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>🕒</span>
              <h4 style={styles.infoTitle}>Opening Hours</h4>
              <div style={styles.infoContent}>
                <p>Mon-Fri: 9AM - 8PM</p>
                <p>Sat: 10AM - 6PM</p>
                <p style={styles.infoHighlight}>Sun: Closed</p>
              </div>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>📍</span>
              <h4 style={styles.infoTitle}>Location</h4>
              <div style={styles.infoContent}>
                <p>Oromo Cultural Center</p>
                <p>Addis Ababa, Ethiopia</p>
                <p style={styles.infoHighlight}>Floor 2, Main Library</p>
              </div>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>📞</span>
              <h4 style={styles.infoTitle}>Contact</h4>
              <div style={styles.infoContent}>
                <p>📞 +251 123 456 789</p>
                <p>✉️ library@oromo.org</p>
                <p style={styles.infoHighlight}>💬 Chat 24/7</p>
              </div>
            </div>
          </div>
        </section>

        {/* Membership CTA - Mobile Optimized */}
        <section style={styles.membershipSection}>
          <div style={styles.membershipContainer}>
            <h2 style={styles.membershipTitle}>Get a Library Card</h2>
            <p style={styles.membershipText}>
              Free membership for all Oromo researchers and community members
            </p>
            <div style={styles.membershipButtons}>
              <button style={styles.registerBtn}>
                Register Online
                <span style={styles.btnArrow}>→</span>
              </button>
              <button style={styles.learnBtn}>
                Learn More
              </button>
            </div>
            <div style={styles.membershipBenefits}>
              <span style={styles.benefitItem}>✓ Borrow up to 10 items</span>
              <span style={styles.benefitItem}>✓ Digital access included</span>
              <span style={styles.benefitItem}>✓ Inter-library loans</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <p style={styles.footerText}>
              © 2024 Oromo Researcher Association Library
            </p>
            <div style={styles.footerLinks}>
              <Link to="/privacy" style={styles.footerLink}>Privacy</Link>
              <span style={styles.footerDot}>•</span>
              <Link to="/terms" style={styles.footerLink}>Terms</Link>
              <span style={styles.footerDot}>•</span>
              <Link to="/help" style={styles.footerLink}>Help</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#ffffff",
  },

  // Hero Section - Mobile First
  hero: {
    position: "relative",
    minHeight: "60vh",
    background: "linear-gradient(145deg, #0F3D2E 0%, #1A5439 60%, #C9A227 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "20px 0",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    width: "100%",
    padding: "0 16px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    fontSize: "0.85rem",
    marginBottom: "16px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  badgeIcon: {
    fontSize: "1rem",
  },
  title: {
    fontSize: "clamp(1.8rem, 8vw, 2.8rem)",
    fontWeight: "700",
    margin: "0 0 12px",
    lineHeight: 1.2,
  },
  gradient: {
    background: "linear-gradient(135deg, #F5D76E, #FFFFFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "0.95rem",
    lineHeight: 1.5,
    margin: "0 auto 24px",
    opacity: 0.95,
    maxWidth: "400px",
    padding: "0 10px",
  },

  // Search Bar - Mobile Optimized
  searchContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "400px",
    margin: "0 auto 24px",
    padding: "0 10px",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.1rem",
    opacity: 0.6,
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "14px 16px 14px 45px",
    border: "none",
    borderRadius: "16px",
    fontSize: "0.95rem",
    outline: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    backgroundColor: "white",
    WebkitAppearance: "none",
  },
  searchButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 20px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  searchButtonText: {
    flex: 1,
  },
  searchButtonIcon: {
    fontSize: "1.2rem",
  },

  // Stats - Mobile Optimized
  statsContainer: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  stats: {
    display: "inline-flex",
    alignItems: "center",
    gap: "20px",
    padding: "12px 24px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "40px",
    margin: "0 auto",
  },
  stat: {
    textAlign: "center",
    minWidth: "70px",
  },
  statDivider: {
    width: "1px",
    height: "30px",
    background: "rgba(255,255,255,0.3)",
  },
  statNumber: {
    display: "block",
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "2px",
  },
  statLabel: {
    fontSize: "0.8rem",
    opacity: 0.9,
  },

  // Quick Actions - Horizontal Scroll
  actionsSection: {
    padding: "24px 16px",
  },
  sectionTitleSmall: {
    fontSize: "1.1rem",
    fontWeight: "600",
    margin: "0 0 16px 4px",
    color: "#1a2639",
  },
  actionsScroll: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    margin: "0 -16px",
    padding: "0 16px",
  },
  actionsGrid: {
    display: "inline-flex",
    gap: "12px",
    minWidth: "100%",
  },
  actionCard: {
    flex: "0 0 auto",
    width: "140px",
    background: "#f8f9fa",
    padding: "16px",
    borderRadius: "20px",
    textDecoration: "none",
    color: "#1a2639",
    border: "1px solid #eaeef2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  actionIcon: {
    fontSize: "2rem",
    display: "block",
  },
  actionContent: {
    textAlign: "center",
  },
  actionTitle: {
    fontSize: "1rem",
    margin: "0 0 4px",
    fontWeight: "600",
  },
  actionDesc: {
    fontSize: "0.8rem",
    margin: 0,
    color: "#5a6a7a",
  },

  // Categories Section
  categoriesSection: {
    padding: "24px 16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    padding: "0 4px",
  },
  sectionTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    margin: 0,
  },
  viewAllLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  categoryCard: {
    background: "#f8f9fa",
    padding: "16px",
    borderRadius: "20px",
    textDecoration: "none",
    border: "1px solid #eaeef2",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  categoryIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.6rem",
    flexShrink: 0,
  },
  categoryContent: {
    flex: 1,
    minWidth: 0,
  },
  categoryName: {
    fontSize: "0.95rem",
    margin: "0 0 4px",
    color: "#1a2639",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  categoryCount: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
    margin: 0,
  },

  // Featured Books
  featuredSection: {
    padding: "32px 16px",
    background: "#f8f9fa",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    marginTop: "16px",
  },
  bookCard: {
    background: "white",
    padding: "20px",
    borderRadius: "24px",
    border: "1px solid #eaeef2",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  bookHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  bookIcon: {
    fontSize: "2.2rem",
  },
  bookStatus: {
    padding: "6px 12px",
    borderRadius: "30px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  bookTitle: {
    fontSize: "1.1rem",
    margin: "0 0 4px",
    color: "#1a2639",
    lineHeight: 1.3,
  },
  bookAuthor: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 12px",
  },
  bookDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "0.85rem",
    marginBottom: "16px",
  },
  bookCopies: {
    color: "#27AE60",
  },
  bookLocation: {
    color: "#2E86AB",
  },
  bookActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  borrowBtn: {
    flex: 1,
    padding: "12px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "14px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  detailsLink: {
    padding: "12px 16px",
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  // Recent Acquisitions
  recentSection: {
    padding: "32px 16px",
  },
  recentGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
  },
  recentCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    background: "white",
    borderRadius: "20px",
    border: "1px solid #eaeef2",
    textDecoration: "none",
  },
  recentIcon: {
    fontSize: "2rem",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    borderRadius: "16px",
  },
  recentInfo: {
    flex: 1,
    minWidth: 0,
  },
  recentTitle: {
    fontSize: "1rem",
    margin: "0 0 4px",
    color: "#1a2639",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  recentAuthor: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 4px",
  },
  recentDate: {
    fontSize: "0.75rem",
    color: "#C9A227",
    margin: 0,
  },
  recentArrow: {
    color: "#C9A227",
    fontSize: "1.2rem",
    fontWeight: "600",
  },

  // Library Info
  infoSection: {
    padding: "32px 16px",
    background: "#f8f9fa",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  infoCard: {
    padding: "24px",
    background: "white",
    borderRadius: "24px",
    border: "1px solid #eaeef2",
  },
  infoIcon: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "16px",
  },
  infoTitle: {
    fontSize: "1.1rem",
    margin: "0 0 12px",
    color: "#1a2639",
  },
  infoContent: {
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#5a6a7a",
  },
  infoHighlight: {
    color: "#C9A227",
    fontWeight: "500",
  },

  // Membership CTA
  membershipSection: {
    padding: "48px 16px",
    background: "linear-gradient(145deg, #0F3D2E, #1A5439)",
  },
  membershipContainer: {
    maxWidth: "400px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  membershipTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: "0 0 12px",
  },
  membershipText: {
    fontSize: "1rem",
    margin: "0 0 24px",
    opacity: 0.9,
    lineHeight: 1.5,
  },
  membershipButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  registerBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "16px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  learnBtn: {
    padding: "16px",
    background: "transparent",
    color: "white",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  btnArrow: {
    fontSize: "1.2rem",
  },
  membershipBenefits: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontSize: "0.95rem",
  },
  benefitItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  // Footer
  footer: {
    padding: "24px 16px",
    background: "#0a1f17",
  },
  footerContent: {
    maxWidth: "400px",
    margin: "0 auto",
    textAlign: "center",
  },
  footerText: {
    color: "white",
    opacity: 0.7,
    fontSize: "0.85rem",
    margin: "0 0 12px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    fontSize: "0.85rem",
  },
  footerLink: {
    color: "white",
    opacity: 0.7,
    textDecoration: "none",
  },
  footerDot: {
    color: "white",
    opacity: 0.3,
  },
};