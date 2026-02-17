import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function WikipediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");

  const featuredArticles = [
    {
      title: "Gadaa System",
      description: "Traditional Oromo governance system and democratic process",
      image: "📜",
      category: "History & Culture",
      views: "12.5K",
      lang: "en",
    },
    {
      title: "Oromo Language",
      description: "Cushitic language spoken by the Oromo people in Ethiopia",
      image: "🔤",
      category: "Language",
      views: "10.2K",
      lang: "en",
    },
    {
      title: "Irreecha",
      description: "Annual Oromo thanksgiving festival celebrating nature",
      image: "🌿",
      category: "Culture",
      views: "8.9K",
      lang: "en",
    },
    {
      title: "Oromia Region",
      description: "Cultural and historical region in Ethiopia",
      image: "🗺️",
      category: "Geography",
      views: "15.3K",
      lang: "en",
    },
  ];

  const languages = [
    { code: "om", name: "Afaan Oromoo", articles: "12,345" },
    { code: "en", name: "English", articles: "8,901" },
    { code: "am", name: "አማርኛ", articles: "3,456" },
    { code: "fr", name: "Français", articles: "2,123" },
    { code: "ar", name: "العربية", articles: "1,567" },
    { code: "sw", name: "Kiswahili", articles: "890" },
  ];

  const categories = [
    { name: "History", icon: "📜", count: "2,345" },
    { name: "Culture", icon: "🎭", count: "3,210" },
    { name: "Language", icon: "🔤", count: "1,876" },
    { name: "Geography", icon: "🗺️", count: "2,567" },
    { name: "People", icon: "👥", count: "3,789" },
    { name: "Music", icon: "🎵", count: "1,234" },
    { name: "Literature", icon: "📚", count: "1,567" },
    { name: "Politics", icon: "🏛️", count: "2,890" },
  ];

  const todayFeatArticles = [
    {
      title: "Abbaa Gadaa",
      description: "The elected leader of the Gadaa system",
      image: "👑",
    },
    {
      title: "Oromo Music",
      description: "Traditional and modern Oromo musical traditions",
      image: "🎵",
    },
    {
      title: "Coffee Ceremony",
      description: "Traditional Oromo coffee preparation and serving",
      image: "☕",
    },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.logo}>
              <span style={styles.logoOromo}>Oromo</span> 
              <span style={styles.logoWikipedia}>Wikipedia</span>
            </h1>
            <p style={styles.tagline}>
              The Free Encyclopedia of Oromo Knowledge
            </p>
          </div>
        </header>

        {/* Language Bar */}
        <section style={styles.langBar}>
          <div style={styles.langContainer}>
            <span style={styles.langLabel}>Read in:</span>
            <div style={styles.langButtons}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  style={{
                    ...styles.langButton,
                    ...(selectedLang === lang.code ? styles.langActive : {}),
                  }}
                  onClick={() => setSelectedLang(lang.code)}
                >
                  <span style={styles.langName}>{lang.name}</span>
                  <span style={styles.langCount}>{lang.articles} articles</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Search */}
        <section style={styles.heroSection}>
          <div style={styles.heroContent}>
            <div style={styles.searchWrapper}>
              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search Oromo Wikipedia..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button style={styles.searchButton}>
                  🔍 Search
                </button>
              </div>
              <div style={styles.searchLinks}>
                <Link to="/wikipedia/random" style={styles.searchLink}>
                  Random Article
                </Link>
                <span style={styles.searchLinkDivider}>•</span>
                <Link to="/wikipedia/new" style={styles.searchLink}>
                  New Articles
                </Link>
                <span style={styles.searchLinkDivider}>•</span>
                <Link to="/wikipedia/help" style={styles.searchLink}>
                  Help
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div style={styles.mainGrid}>
          {/* Left Column - Categories */}
          <aside style={styles.leftColumn}>
            <div style={styles.welcomeBox}>
              <h3 style={styles.welcomeTitle}>Welcome to Oromo Wikipedia</h3>
              <p style={styles.welcomeText}>
                The Oromo Wikipedia is a free, open-content encyclopedia 
                that anyone can edit. Started in 2015, it now contains 
                over 12,000 articles in Afaan Oromoo and other languages.
              </p>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>12,345</span>
                  <span style={styles.statLabel}>Articles</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>1,234</span>
                  <span style={styles.statLabel}>Editors</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>45K</span>
                  <span style={styles.statLabel}>Edits</span>
                </div>
              </div>
            </div>

            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>Categories</h3>
              <div style={styles.categoryList}>
                {categories.map((cat) => (
                  <Link 
                    key={cat.name}
                    to={`/wikipedia/category/${cat.name}`}
                    style={styles.categoryItem}
                  >
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <span style={styles.categoryName}>{cat.name}</span>
                    <span style={styles.categoryCount}>{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>Sister Projects</h3>
              <div style={styles.sisterProjects}>
                <Link to="/journal" style={styles.sisterProject}>
                  <span style={styles.sisterIcon}>📚</span>
                  <span>Oromo Journal</span>
                </Link>
                <Link to="/repository" style={styles.sisterProject}>
                  <span style={styles.sisterIcon}>📦</span>
                  <span>Repository</span>
                </Link>
                <Link to="/ebooks" style={styles.sisterProject}>
                  <span style={styles.sisterIcon}>📖</span>
                  <span>eBooks</span>
                </Link>
                <Link to="/library" style={styles.sisterProject}>
                  <span style={styles.sisterIcon}>🏛️</span>
                  <span>Library</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Center Column - Featured Content */}
          <main style={styles.centerColumn}>
            {/* Today's Featured Article */}
            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>⭐</span>
                Today's Featured Article
              </h3>
              <div style={styles.featuredArticle}>
                <span style={styles.featuredIcon}>📜</span>
                <div style={styles.featuredContent}>
                  <h4 style={styles.featuredTitle}>
                    <Link to="/wikipedia/gadaa" style={styles.featuredLink}>
                      Gadaa System
                    </Link>
                  </h4>
                  <p style={styles.featuredDescription}>
                    The Gadaa system is a traditional Oromo system of governance 
                    that has been practiced for centuries. It is a democratic system 
                    where leaders are elected every eight years...
                  </p>
                  <Link to="/wikipedia/gadaa" style={styles.readMore}>
                    Read more →
                  </Link>
                </div>
              </div>
            </div>

            {/* In the News */}
            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📰</span>
                In the News
              </h3>
              <div style={styles.newsList}>
                <div style={styles.newsItem}>
                  <span style={styles.newsDate}>Mar 15</span>
                  <span style={styles.newsText}>
                    Irreecha festival celebrated in Addis Ababa
                  </span>
                </div>
                <div style={styles.newsItem}>
                  <span style={styles.newsDate}>Mar 10</span>
                  <span style={styles.newsText}>
                    New Oromo language learning resources added
                  </span>
                </div>
                <div style={styles.newsItem}>
                  <span style={styles.newsDate}>Mar 5</span>
                  <span style={styles.newsText}>
                    Gadaa System recognized by UNESCO
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Articles Grid */}
            <h3 style={styles.sectionTitle}>Featured Articles</h3>
            <div style={styles.featuredGrid}>
              {featuredArticles.map((article, index) => (
                <Link 
                  key={index}
                  to={`/wikipedia/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                  style={styles.articleCard}
                >
                  <span style={styles.articleImage}>{article.image}</span>
                  <div style={styles.articleInfo}>
                    <h4 style={styles.articleCardTitle}>{article.title}</h4>
                    <p style={styles.articleCardDesc}>{article.description}</p>
                    <div style={styles.articleMeta}>
                      <span style={styles.articleCategory}>{article.category}</span>
                      <span style={styles.articleViews}>👁️ {article.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Did You Know */}
            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>❓</span>
                Did You Know?
              </h3>
              <div style={styles.didYouKnow}>
                <ul style={styles.factsList}>
                  <li>The Oromo calendar has 12 months of 30 days each</li>
                  <li>The Gadaa system is over 500 years old</li>
                  <li>Oromia is the largest region in Ethiopia</li>
                  <li>The Oromo language has over 30 million speakers</li>
                </ul>
              </div>
            </div>
          </main>

          {/* Right Column - Community */}
          <aside style={styles.rightColumn}>
            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>👥</span>
                Community Portal
              </h3>
              <div style={styles.communityLinks}>
                <Link to="/wikipedia/help" style={styles.communityLink}>
                  📖 Help desk
                </Link>
                <Link to="/wikipedia/request" style={styles.communityLink}>
                  📝 Request an article
                </Link>
                <Link to="/wikipedia/translate" style={styles.communityLink}>
                  🌍 Translate articles
                </Link>
                <Link to="/wikipedia/discuss" style={styles.communityLink}>
                  💬 Community discussion
                </Link>
                <Link to="/wikipedia/upload" style={styles.communityLink}>
                  📤 Upload media
                </Link>
              </div>
            </div>

            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📌</span>
                Today's Featured Articles
              </h3>
              {todayFeatArticles.map((article, index) => (
                <Link 
                  key={index}
                  to={`/wikipedia/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                  style={styles.todayArticle}
                >
                  <span style={styles.todayIcon}>{article.image}</span>
                  <div style={styles.todayInfo}>
                    <h4 style={styles.todayTitle}>{article.title}</h4>
                    <p style={styles.todayDesc}>{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div style={styles.sectionBox}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>🔗</span>
                Other Languages
              </h3>
              <div style={styles.otherLangs}>
                {languages.slice(0, 5).map((lang) => (
                  <button
                    key={lang.code}
                    style={styles.otherLang}
                    onClick={() => setSelectedLang(lang.code)}
                  >
                    <span style={styles.otherLangName}>{lang.name}</span>
                    <span style={styles.otherLangCount}>{lang.articles}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLinks}>
              <Link to="/wikipedia/about" style={styles.footerLink}>About</Link>
              <Link to="/wikipedia/disclaimer" style={styles.footerLink}>Disclaimer</Link>
              <Link to="/wikipedia/privacy" style={styles.footerLink}>Privacy</Link>
              <Link to="/wikipedia/terms" style={styles.footerLink}>Terms</Link>
              <Link to="/wikipedia/contact" style={styles.footerLink}>Contact</Link>
            </div>
            <p style={styles.copyright}>
              Oromo Wikipedia is a free encyclopedia. All content is available under 
              the Creative Commons Attribution-ShareAlike License.
            </p>
            <p style={styles.copyright}>
              © 2024 Oromo Researcher Association. All rights reserved.
            </p>
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
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#f8f9fa",
  },

  // Header
  header: {
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
    padding: "40px 20px",
    textAlign: "center",
    color: "white",
  },
  headerContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  logo: {
    fontSize: "clamp(2rem, 8vw, 3.5rem)",
    margin: "0 0 10px",
    fontWeight: "700",
  },
  logoOromo: {
    color: "#FFFFFF",
  },
  logoWikipedia: {
    background: "linear-gradient(135deg, #F5D76E, #C9A227)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  tagline: {
    fontSize: "1.2rem",
    opacity: 0.9,
    margin: 0,
  },

  // Language Bar
  langBar: {
    background: "white",
    borderBottom: "1px solid #eaeef2",
    padding: "15px 20px",
    overflowX: "auto",
  },
  langContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  langLabel: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  langButtons: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  langButton: {
    background: "transparent",
    border: "1px solid #eaeef2",
    borderRadius: "20px",
    padding: "5px 15px",
    cursor: "pointer",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
  langActive: {
    background: "#C9A227",
    borderColor: "#C9A227",
    color: "#0F3D2E",
  },
  langName: {
    fontWeight: "500",
  },
  langCount: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
  },

  // Hero Search
  heroSection: {
    padding: "40px 20px",
    background: "white",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  searchWrapper: {
    textAlign: "center",
  },
  searchContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  searchInput: {
    flex: 1,
    padding: "15px 20px",
    border: "2px solid #eaeef2",
    borderRadius: "50px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  searchButton: {
    padding: "15px 40px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  searchLinks: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
  },
  searchLink: {
    color: "#2E86AB",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  searchLinkDivider: {
    color: "#cbd5e0",
  },

  // Main Grid
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "250px 1fr 280px",
    gap: "20px",
    maxWidth: "1400px",
    margin: "40px auto",
    padding: "0 20px",
  },

  // Columns
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  centerColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // Boxes
  sectionBox: {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    border: "1px solid #eaeef2",
  },
  welcomeBox: {
    background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
    borderRadius: "10px",
    padding: "25px",
    border: "1px solid #eaeef2",
  },
  welcomeTitle: {
    fontSize: "1.3rem",
    margin: "0 0 10px",
    color: "#1a2639",
  },
  welcomeText: {
    fontSize: "0.95rem",
    color: "#5a6a7a",
    lineHeight: 1.6,
    margin: "0 0 20px",
  },

  // Stats
  stats: {
    display: "flex",
    gap: "20px",
    justifyContent: "space-around",
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#C9A227",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
  },

  // Section Titles
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    margin: "0 0 15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionIcon: {
    fontSize: "1.3rem",
  },

  // Categories
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    textDecoration: "none",
    color: "#1a2639",
    borderRadius: "5px",
    transition: "background 0.3s ease",
  },
  categoryIcon: {
    fontSize: "1.2rem",
    width: "25px",
  },
  categoryName: {
    flex: 1,
    fontSize: "0.95rem",
  },
  categoryCount: {
    fontSize: "0.85rem",
    color: "#a0aec0",
  },

  // Sister Projects
  sisterProjects: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  sisterProject: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px",
    textDecoration: "none",
    color: "#1a2639",
    fontSize: "0.9rem",
    background: "#f8f9fa",
    borderRadius: "5px",
  },
  sisterIcon: {
    fontSize: "1.2rem",
  },

  // Featured Article
  featuredArticle: {
    display: "flex",
    gap: "15px",
  },
  featuredIcon: {
    fontSize: "3rem",
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: "1.1rem",
    margin: "0 0 5px",
  },
  featuredLink: {
    color: "#1a2639",
    textDecoration: "none",
  },
  featuredDescription: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    lineHeight: 1.6,
    margin: "0 0 10px",
  },
  readMore: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },

  // News
  newsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  newsItem: {
    display: "flex",
    gap: "10px",
    fontSize: "0.9rem",
  },
  newsDate: {
    color: "#C9A227",
    fontWeight: "500",
    minWidth: "60px",
  },
  newsText: {
    color: "#1a2639",
  },

  // Featured Grid
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },
  articleCard: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    textDecoration: "none",
    border: "1px solid #eaeef2",
    transition: "transform 0.3s ease",
  },
  articleImage: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "10px",
  },
  articleInfo: {
    flex: 1,
  },
  articleCardTitle: {
    fontSize: "1rem",
    margin: "0 0 5px",
    color: "#1a2639",
  },
  articleCardDesc: {
    fontSize: "0.85rem",
    color: "#5a6a7a",
    margin: "0 0 8px",
  },
  articleMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
  },
  articleCategory: {
    color: "#C9A227",
  },
  articleViews: {
    color: "#a0aec0",
  },

  // Did You Know
  didYouKnow: {
    padding: "0 10px",
  },
  factsList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#1a2639",
    "& li": {
      marginBottom: "8px",
      fontSize: "0.9rem",
    },
  },

  // Community
  communityLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  communityLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    textDecoration: "none",
    color: "#1a2639",
    background: "#f8f9fa",
    borderRadius: "5px",
    fontSize: "0.9rem",
  },

  // Today's Articles
  todayArticle: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    textDecoration: "none",
    borderBottom: "1px solid #eaeef2",
  },
  todayIcon: {
    fontSize: "1.5rem",
  },
  todayInfo: {
    flex: 1,
  },
  todayTitle: {
    fontSize: "0.95rem",
    margin: "0 0 3px",
    color: "#1a2639",
  },
  todayDesc: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
    margin: 0,
  },

  // Other Languages
  otherLangs: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  otherLang: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  otherLangName: {
    fontSize: "0.9rem",
    color: "#1a2639",
  },
  otherLangCount: {
    fontSize: "0.8rem",
    color: "#a0aec0",
  },

  // Footer
  footer: {
    background: "#0a1f17",
    color: "white",
    padding: "40px 20px 20px",
    marginTop: "40px",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
  },
  footerLinks: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "white",
    textDecoration: "none",
    opacity: 0.8,
    fontSize: "0.9rem",
  },
  copyright: {
    fontSize: "0.85rem",
    opacity: 0.6,
    margin: "10px 0 0",
  },
};

// Add responsive styles
const mediaStyles = `
  @media (max-width: 1024px) {
    .mainGrid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 768px) {
    .searchContainer {
      flex-direction: column;
    }
    
    .searchButton {
      width: 100%;
    }
    
    .featuredGrid {
      grid-template-columns: 1fr !important;
    }
    
    .sisterProjects {
      grid-template-columns: 1fr !important;
    }
  }
`;