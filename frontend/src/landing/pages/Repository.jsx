import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RepositoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Research Papers", count: "4.5K", icon: "📄", color: "#C9A227" },
    { name: "Historical Documents", count: "2.3K", icon: "📜", color: "#2E86AB" },
    { name: "Oral Histories", count: "892", icon: "🎤", color: "#A569BD" },
    { name: "Photographs", count: "567", icon: "🖼️", color: "#E67E22" },
    { name: "Audio Recordings", count: "678", icon: "🎵", color: "#27AE60" },
  ];

  const featuredItems = [
    {
      title: "The Gadaa System Archive",
      author: "Oromo Heritage Foundation",
      downloads: "34.5K",
      icon: "📚",
    },
    {
      title: "Oromo Oral Traditions",
      author: "Dr. Abdi Mohammed",
      downloads: "23.4K",
      icon: "🎤",
    },
    {
      title: "Historical Photographs",
      author: "Oromo Historical Society",
      downloads: "18.7K",
      icon: "🖼️",
    },
    {
      title: "Oromo Language Dictionary",
      author: "Prof. Lemma Dibaba",
      downloads: "43.2K",
      icon: "📖",
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
            <span style={styles.badge}>📚 Digital Repository</span>
            <h1 style={styles.title}>
              Oromo Knowledge <span style={styles.gradient}>Archive</span>
            </h1>
            <p style={styles.subtitle}>
              Preserving Oromo cultural heritage, historical documents, 
              and academic research for generations to come
            </p>
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search the repository..."
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
                <span style={styles.statNumber}>15K+</span>
                <span style={styles.statLabel}>Items</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>2.3M</span>
                <span style={styles.statLabel}>Downloads</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>1.2K</span>
                <span style={styles.statLabel}>Contributors</span>
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
                to={`/repository/category/${cat.name}`} 
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

        {/* Featured Items Section */}
        <section style={styles.featuredSection}>
          <h2 style={styles.sectionTitle}>
            Featured <span style={styles.pink}>Items</span>
          </h2>
          <div style={styles.featuredGrid}>
            {featuredItems.map((item, index) => (
              <div key={index} style={styles.featuredCard}>
                <span style={styles.itemIcon}>{item.icon}</span>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemAuthor}>{item.author}</p>
                <div style={styles.itemFooter}>
                  <span style={styles.itemDownloads}>⬇️ {item.downloads} downloads</span>
                  <Link to={`/repository/item/${index}`} style={styles.viewLink}>
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contribute Section */}
        <section style={styles.contributeSection}>
          <div style={styles.contributeContainer}>
            <h2 style={styles.contributeTitle}>Contribute to the Archive</h2>
            <p style={styles.contributeText}>
              Help preserve Oromo heritage by sharing your materials
            </p>
            <div style={styles.contributeButtons}>
              <button style={styles.primaryButton}>
                Start Contributing →
              </button>
              <button style={styles.secondaryButton}>
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2024 Oromo Researcher Association. All rights reserved.
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
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 60%, #2E86AB 100%)",
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
      radial-gradient(circle at 80% 70%, rgba(46,134,171,0.2) 0%, transparent 40%)
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
    textAlign: "center",
    margin: "0 0 40px",
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
  featuredCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    border: "1px solid #eaeef2",
    transition: "transform 0.3s ease",
  },
  itemIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "15px",
  },
  itemTitle: {
    fontSize: "1.1rem",
    margin: "0 0 5px",
    color: "#1a2639",
  },
  itemAuthor: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 15px",
  },
  itemFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemDownloads: {
    fontSize: "0.85rem",
    color: "#2E86AB",
  },
  viewLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  // Contribute Section
  contributeSection: {
    padding: "60px 20px",
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
    textAlign: "center",
  },
  contributeContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    color: "white",
  },
  contributeTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 15px",
  },
  contributeText: {
    fontSize: "1.1rem",
    margin: "0 0 30px",
    opacity: 0.9,
  },
  contributeButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  primaryButton: {
    padding: "12px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 30px",
    background: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "50px",
    fontSize: "1rem",
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