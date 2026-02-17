import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function EbooksPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Academic", count: "234", icon: "📚", color: "#C9A227" },
    { name: "Literature", count: "156", icon: "📖", color: "#2E86AB" },
    { name: "History", count: "189", icon: "📜", color: "#A569BD" },
    { name: "Language", count: "98", icon: "🔤", color: "#27AE60" },
    { name: "Culture", count: "145", icon: "🏛️", color: "#E67E22" },
  ];

  const featuredEbooks = [
    {
      title: "History of the Oromo People",
      author: "Prof. Mohammed Hassan",
      downloads: "12.5K",
      rating: "4.8",
      icon: "📜",
      format: "PDF, EPUB",
    },
    {
      title: "Gadaa System: Democracy & Governance",
      author: "Dr. Abdi Mohammed",
      downloads: "10.2K",
      rating: "4.9",
      icon: "📚",
      format: "PDF",
    },
    {
      title: "Oromo-English Dictionary",
      author: "Prof. Lemma Dibaba",
      downloads: "15.8K",
      rating: "5.0",
      icon: "📖",
      format: "PDF, EPUB, MOBI",
    },
    {
      title: "Oromo Oral Poetry Collection",
      author: "Dr. Fatuma Hassan",
      downloads: "8.9K",
      rating: "4.7",
      icon: "🎵",
      format: "EPUB",
    },
  ];

  const newReleases = [
    {
      title: "Women in Oromo Society",
      author: "Dr. Aisha Mohammed",
      date: "2024",
      icon: "📘",
    },
    {
      title: "Traditional Oromo Medicine",
      author: "Prof. Tekle Berhan",
      date: "2024",
      icon: "📙",
    },
    {
      title: "Oromo Proverbs & Wisdom",
      author: "Dr. Gemechu Kebede",
      date: "2023",
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
            <span style={styles.badge}>📱 Digital Library</span>
            <h1 style={styles.title}>
              Oromo <span style={styles.gradient}>eBooks</span>
            </h1>
            <p style={styles.subtitle}>
              Free access to hundreds of Oromo books, academic texts, 
              and cultural literature in multiple formats
            </p>
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search for eBooks by title, author, or topic..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button style={styles.searchButton}>
                🔍 Search
              </button>
            </div>

            {/* Quick Stats */}
            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>850+</span>
                <span style={styles.statLabel}>eBooks</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>125K</span>
                <span style={styles.statLabel}>Downloads</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>45+</span>
                <span style={styles.statLabel}>Languages</span>
              </div>
            </div>
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
                to={`/ebooks/category/${cat.name}`} 
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
                <p style={styles.categoryCount}>{cat.count} books</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured eBooks */}
        <section style={styles.featuredSection}>
          <h2 style={styles.sectionTitle}>
            Featured <span style={styles.gradient}>eBooks</span>
          </h2>
          <div style={styles.featuredGrid}>
            {featuredEbooks.map((book, index) => (
              <div key={index} style={styles.bookCard}>
                <span style={styles.bookIcon}>{book.icon}</span>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                <p style={styles.bookAuthor}>By: {book.author}</p>
                <div style={styles.bookMeta}>
                  <span style={styles.bookRating}>⭐ {book.rating}</span>
                  <span style={styles.bookDownloads}>⬇️ {book.downloads}</span>
                </div>
                <p style={styles.bookFormat}>{book.format}</p>
                <div style={styles.bookActions}>
                  <button style={styles.downloadBtn}>Download</button>
                  <Link to={`/ebooks/${index}`} style={styles.viewLink}>
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

        {/* New Releases */}
        <section style={styles.newSection}>
          <h2 style={styles.sectionTitle}>
            New <span style={styles.gradient}>Releases</span>
          </h2>
          <div style={styles.newGrid}>
            {newReleases.map((book, index) => (
              <div key={index} style={styles.newCard}>
                <span style={styles.newIcon}>{book.icon}</span>
                <div style={styles.newInfo}>
                  <h4 style={styles.newTitle}>{book.title}</h4>
                  <p style={styles.newAuthor}>{book.author}</p>
                  <p style={styles.newDate}>{book.date}</p>
                </div>
                <Link to={`/ebooks/new/${index}`} style={styles.newLink}>
                  →
                </Link>
              </div>
            ))}
          </div>
        </section>


        {/* Newsletter */}
        <section style={styles.newsletterSection}>
          <div style={styles.newsletterContainer}>
            <h3 style={styles.newsletterTitle}>Get New eBooks Alerts</h3>
            <p style={styles.newsletterText}>
              Be the first to know when new Oromo books are added
            </p>
            <div style={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.newsletterInput}
              />
              <button style={styles.newsletterButton}>
                Subscribe
              </button>
            </div>
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

  // Categories Section
  categoriesSection: {
    padding: "60px 20px",
    maxWidth: "90%",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "left",
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

  // Featured Section
  featuredSection: {
    padding: "60px 20px",
    background: "#f8f9fa",
  },
  featuredGrid: {
    maxWidth: "90%",
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
    transition: "transform 0.3s ease",
  },
  bookIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "15px",
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
  bookMeta: {
    display: "flex",
    gap: "15px",
    fontSize: "0.85rem",
    marginBottom: "8px",
  },
  bookRating: {
    color: "#C9A227",
  },
  bookDownloads: {
    color: "#2E86AB",
  },
  bookFormat: {
    fontSize: "0.8rem",
    color: "#A569BD",
    margin: "0 0 15px",
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
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  viewLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  viewAllContainer: {
    textAlign: "center",
    marginTop: "30px",
  },
  viewAllLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "600",
  },

  // New Releases
  newSection: {
    padding: "60px 20px",
    maxWidth: "90%",
    margin: "0 auto",
  },
  newGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  newCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #eaeef2",
  },
  newIcon: {
    fontSize: "2rem",
    width: "50px",
    textAlign: "center",
  },
  newInfo: {
    flex: 1,
  },
  newTitle: {
    fontSize: "1rem",
    margin: "0 0 3px",
    color: "#1a2639",
  },
  newAuthor: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 3px",
  },
  newDate: {
    fontSize: "0.8rem",
    color: "#C9A227",
    margin: 0,
  },
  newLink: {
    fontSize: "1.5rem",
    color: "#C9A227",
    textDecoration: "none",
    padding: "0 10px",
  },

  // Features
  featuresSection: {
    padding: "40px 20px",
    background: "white",
  },
  featuresGrid: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  feature: {
    textAlign: "center",
    padding: "20px",
  },
  featureIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "10px",
  },

  // Newsletter
  newsletterSection: {
    padding: "60px 20px",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
  },
  newsletterContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  newsletterTitle: {
    fontSize: "1.5rem",
    margin: "0 0 10px",
  },
  newsletterText: {
    fontSize: "1rem",
    margin: "0 0 20px",
    opacity: 0.9,
  },
  newsletterForm: {
    display: "flex",
    gap: "10px",
  },
  newsletterInput: {
    flex: 1,
    padding: "12px 15px",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
  },
  newsletterButton: {
    padding: "12px 25px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
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