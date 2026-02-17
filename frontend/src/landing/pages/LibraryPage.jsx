import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <span style={styles.badge}>🏛️ Digital Library</span>
            <h1 style={styles.title}>
              Oromo Research <span style={styles.gradient}>Library</span>
            </h1>
            <p style={styles.subtitle}>
              Access thousands of physical and digital resources on Oromo history, 
              culture, language, and academic research
            </p>
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search for books, journals, archives..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button style={styles.searchButton}>
                🔍 Search Catalog
              </button>
            </div>

            {/* Quick Stats */}
            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>12K+</span>
                <span style={styles.statLabel}>Books</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>3K+</span>
                <span style={styles.statLabel}>Journals</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>1.5K</span>
                <span style={styles.statLabel}>Archives</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={styles.actionsSection}>
          <div style={styles.actionsGrid}>
            <Link to="/library/borrow" style={styles.actionCard}>
              <span style={styles.actionIcon}>📋</span>
              <h3>Borrow Materials</h3>
              <p>Check out books and resources</p>
            </Link>
            <Link to="/library/return" style={styles.actionCard}>
              <span style={styles.actionIcon}>🔄</span>
              <h3>Return Items</h3>
              <p>Manage your borrowed items</p>
            </Link>
            <Link to="/library/reserve" style={styles.actionCard}>
              <span style={styles.actionIcon}>📌</span>
              <h3>Reserve</h3>
              <p>Hold books for pickup</p>
            </Link>
            <Link to="/library/digital" style={styles.actionCard}>
              <span style={styles.actionIcon}>💻</span>
              <h3>Digital Access</h3>
              <p>Online resources & e-books</p>
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        <section style={styles.categoriesSection}>
          <h2 style={styles.sectionTitle}>
            Browse by <span style={styles.gradient}>Category</span>
          </h2>
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
                <h3 style={styles.categoryName}>{cat.name}</h3>
                <p style={styles.categoryCount}>{cat.count} items</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Books */}
        <section style={styles.featuredSection}>
          <h2 style={styles.sectionTitle}>
            Featured <span style={styles.gradient}>Books</span>
          </h2>
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
                <p style={styles.bookAuthor}>By: {book.author}</p>
                <div style={styles.bookDetails}>
                  <span style={styles.bookCopies}>📚 {book.copies}</span>
                  <span style={styles.bookLocation}>📍 {book.location}</span>
                </div>
                <div style={styles.bookActions}>
                  <button style={styles.borrowBtn}>Borrow</button>
                  <Link to={`/library/book/${index}`} style={styles.detailsLink}>
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Acquisitions */}
        <section style={styles.recentSection}>
          <h2 style={styles.sectionTitle}>
            Recently <span style={styles.gradient}>Added</span>
          </h2>
          <div style={styles.recentGrid}>
            {recentAcquisitions.map((book, index) => (
              <div key={index} style={styles.recentCard}>
                <span style={styles.recentIcon}>{book.icon}</span>
                <div style={styles.recentInfo}>
                  <h4 style={styles.recentTitle}>{book.title}</h4>
                  <p style={styles.recentAuthor}>{book.author}</p>
                  <p style={styles.recentDate}>{book.date}</p>
                </div>
                <Link to={`/library/book/${index}`} style={styles.recentLink}>
                  View
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Library Info */}
        <section style={styles.infoSection}>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>🕒</span>
              <h4>Opening Hours</h4>
              <p>Mon-Fri: 9AM - 8PM</p>
              <p>Sat: 10AM - 6PM</p>
              <p>Sun: Closed</p>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>📍</span>
              <h4>Location</h4>
              <p>Oromo Cultural Center</p>
              <p>Addis Ababa, Ethiopia</p>
              <p>Floor 2, Main Library</p>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>📞</span>
              <h4>Contact</h4>
              <p>Phone: +251 123 456 789</p>
              <p>Email: library@oromo.org</p>
              <p>Chat: Available 24/7</p>
            </div>
          </div>
        </section>

        {/* Membership CTA */}
        <section style={styles.membershipSection}>
          <div style={styles.membershipContainer}>
            <h2 style={styles.membershipTitle}>Get a Library Card</h2>
            <p style={styles.membershipText}>
              Free membership for all Oromo researchers and community members
            </p>
            <div style={styles.membershipButtons}>
              <button style={styles.registerBtn}>
                Register Online →
              </button>
              <button style={styles.learnBtn}>
                Learn More
              </button>
            </div>
            <div style={styles.membershipBenefits}>
              <span>✓ Borrow up to 10 items</span>
              <span>✓ Digital access included</span>
              <span>✓ Inter-library loans</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2024 Oromo Researcher Association Library. All rights reserved.
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

  // Hero Section
  hero: {
    position: "relative",
    minHeight: "70vh",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 50%, #C9A227 100%)",
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
      radial-gradient(circle at 80% 70%, rgba(201,162,39,0.2) 0%, transparent 40%)
    `,
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "800px",
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
    maxWidth: "600px",
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
  },
  stats: {
    display: "flex",
    gap: "40px",
    justifyContent: "center",
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

  // Quick Actions
  actionsSection: {
    padding: "40px 20px",
    maxWidth: "90%",
    margin: "0 auto",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  actionCard: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    textDecoration: "none",
    color: "#1a2639",
    transition: "transform 0.3s ease",
    border: "1px solid #eaeef2",
  },
  actionIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "15px",
  },

  // Categories Section
  categoriesSection: {
    padding: "40px 20px",
    maxWidth: "90%",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "center",
    margin: "0 0 40px",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "20px",
  },
  categoryCard: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    textDecoration: "none",
    transition: "transform 0.3s ease",
    border: "1px solid #eaeef2",
  },
  categoryIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 15px",
  },
  categoryName: {
    fontSize: "1.1rem",
    margin: "0 0 5px",
    color: "#1a2639",
  },
  categoryCount: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    margin: 0,
  },

  // Featured Books
  featuredSection: {
    padding: "60px 20px",
    background: "#f8f9fa",
  },
  featuredGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  bookCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    border: "1px solid #eaeef2",
  },
  bookHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  bookIcon: {
    fontSize: "2.5rem",
  },
  bookStatus: {
    padding: "4px 10px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  bookTitle: {
    fontSize: "1.1rem",
    margin: "0 0 5px",
    color: "#1a2639",
  },
  bookAuthor: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 10px",
  },
  bookDetails: {
    display: "flex",
    gap: "15px",
    fontSize: "0.85rem",
    marginBottom: "15px",
  },
  bookCopies: {
    color: "#27AE60",
  },
  bookLocation: {
    color: "#2E86AB",
  },
  bookActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  borrowBtn: {
    padding: "8px 15px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "5px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  detailsLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
  },

  // Recent Acquisitions
  recentSection: {
    padding: "60px 20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  recentGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  recentCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #eaeef2",
  },
  recentIcon: {
    fontSize: "2rem",
    width: "50px",
    textAlign: "center",
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: "1rem",
    margin: "0 0 3px",
    color: "#1a2639",
  },
  recentAuthor: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 3px",
  },
  recentDate: {
    fontSize: "0.8rem",
    color: "#C9A227",
    margin: 0,
  },
  recentLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    padding: "0 10px",
  },

  // Library Info
  infoSection: {
    padding: "60px 20px",
    background: "#f8f9fa",
  },
  infoGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
  },
  infoCard: {
    textAlign: "center",
    padding: "30px",
    background: "white",
    borderRadius: "15px",
    border: "1px solid #eaeef2",
  },
  infoIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "15px",
  },

  // Membership CTA
  membershipSection: {
    padding: "80px 20px",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
  },
  membershipContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  membershipTitle: {
    fontSize: "2.2rem",
    fontWeight: "700",
    margin: "0 0 15px",
  },
  membershipText: {
    fontSize: "1.1rem",
    margin: "0 0 30px",
    opacity: 0.9,
  },
  membershipButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginBottom: "30px",
  },
  registerBtn: {
    padding: "12px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  learnBtn: {
    padding: "12px 30px",
    background: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  membershipBenefits: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
    fontSize: "0.95rem",
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
    fontSize: "0.9rem",
    margin: 0,
  },
};