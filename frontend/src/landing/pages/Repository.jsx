// src/landing/pages/Repository.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../../api/repository/public.api";

export default function RepositoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalDownloads: 0,
    totalContributors: 0,
  });
  const [loading, setLoading] = useState({
    featured: true,
    categories: true,
    stats: true,
  });

  // Fetch initial data
  useEffect(() => {
    fetchFeaturedItems();
    fetchCategories();
    fetchStats();
  }, []);

  // Search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 2) handleSearch();
      else if (searchQuery.trim().length === 0) setSearchResults([]);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch featured items
  const fetchFeaturedItems = async () => {
    try {
      setLoading((prev) => ({ ...prev, featured: true }));
      const res = await publicationAPI.getPublishedManuscripts(1, 4, "");
      setFeaturedItems(res.items || []);
    } catch (err) {
      console.error(err);
      setFeaturedItems([]);
    } finally {
      setLoading((prev) => ({ ...prev, featured: false }));
    }
  };

  // Fetch categories (group by category)
  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, categories: true }));
      const res = await publicationAPI.getPublishedManuscripts(1, 100);
      const categoryMap = new Map();
      (res.items || []).forEach((item) => {
        const cat = item.category || "Uncategorized";
        if (!categoryMap.has(cat)) categoryMap.set(cat, { name: cat, count: 0, icon: getCategoryIcon(cat), color: getCategoryColor(cat) });
        categoryMap.get(cat).count++;
      });
      setCategories(Array.from(categoryMap.values()));
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));
      const res = await publicationAPI.getJournalStats();
      setStats({
        totalItems: res.totalItems || 0,
        totalDownloads: res.totalDownloads || 0,
        totalContributors: res.totalContributors || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await publicationAPI.searchPublicItems(searchQuery);
      setSearchResults(res.items || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Track view
  const handleItemClick = async (uuid) => {
    try { await publicationAPI.trackView(uuid); } 
    catch (err) { console.error(err); }
  };

  // Track download
  const handleDownload = async (uuid, e) => {
    e.preventDefault();
    e.stopPropagation();
    try { 
      await publicationAPI.trackDownload(uuid); 
      window.open(`/api/repository/public/item/${uuid}/download`, "_blank");
    } catch (err) { console.error(err); }
  };

  // Helpers
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getCategoryIcon = (category) => {
    const icons = { 
      "Research Papers": "📄", 
      "Historical Documents": "📜", 
      "Oral Histories": "🎤", 
      "Photographs": "🖼️", 
      "Audio Recordings": "🎵", 
      "Videos": "🎥", 
      Theses: "📚", 
      Books: "📖", 
      Articles: "📰", 
      "Data Sets": "📊" 
    };
    return icons[category] || "📁";
  };

  const getCategoryColor = (category) => {
    const colors = { 
      "Research Papers": "#C9A227", 
      "Historical Documents": "#2E86AB", 
      "Oral Histories": "#A569BD", 
      Photographs: "#E67E22", 
      "Audio Recordings": "#27AE60", 
      Videos: "#E74C3C", 
      Theses: "#3498DB", 
      Books: "#F39C12", 
      Articles: "#1ABC9C", 
      "Data Sets": "#9B59B6" 
    };
    return colors[category] || "#95A5A6";
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Hero Section with Animated Background */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay}>
            <div style={styles.animatedGrid}></div>
            <div style={styles.floatingOrbs}>
              <div style={{...styles.orb, ...styles.orb1}}></div>
              <div style={{...styles.orb, ...styles.orb2}}></div>
              <div style={{...styles.orb, ...styles.orb3}}></div>
            </div>
          </div>
          
          <div style={styles.heroContent}>
            <div style={styles.badgeWrapper}>
              <span style={styles.badge}>
                <span style={styles.badgeIcon}>📚</span>
                Digital Repository
              </span>
            </div>
            
            <h1 style={styles.title}>
              Oromo Knowledge{' '}
              <span style={styles.gradientText}>Archive</span>
            </h1>
            
            <p style={styles.subtitle}>
              Preserving Oromo cultural heritage, historical documents, 
              and academic research for generations to come
            </p>
            
            {/* Enhanced Search */}
            <div style={styles.searchWrapper}>
              <div style={styles.searchContainer}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search manuscripts, documents, audio recordings..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && <div style={styles.searchSpinner}></div>}
              </div>
              <button 
                style={styles.searchButton} 
                onClick={handleSearch} 
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search Repository'}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div style={styles.searchResults}>
                <div style={styles.resultsHeader}>
                  <span>Search Results</span>
                  <span style={styles.resultCount}>{searchResults.length} items</span>
                </div>
                {searchResults.map((item) => (
                  <Link 
                    key={item.uuid} 
                    to={`/repository/item/${item.uuid}`} 
                    style={styles.searchResultItem}
                    onClick={() => handleItemClick(item.uuid)}
                  >
                    <div style={{
                      ...styles.resultIcon,
                      backgroundColor: `${getCategoryColor(item.category)}15`,
                      color: getCategoryColor(item.category)
                    }}>
                      {getCategoryIcon(item.category)}
                    </div>
                    <div style={styles.resultInfo}>
                      <div style={styles.resultTitle}>{item.title}</div>
                      <div style={styles.resultMeta}>
                        <span>{item.author}</span>
                        <span>• {item.year}</span>
                        <span>• ⬇️ {formatNumber(item.downloads)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Stats with Animation */}
            <div style={styles.statsContainer}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{formatNumber(stats.totalItems)}</div>
                <div style={styles.statLabel}>Items</div>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{formatNumber(stats.totalDownloads)}</div>
                <div style={styles.statLabel}>Downloads</div>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{formatNumber(stats.totalContributors)}</div>
                <div style={styles.statLabel}>Contributors</div>
              </div>
            </div>
          </div>
          
          <div style={styles.scrollIndicator}>
            <span style={styles.scrollText}>Scroll to explore</span>
            <div style={styles.scrollArrow}>↓</div>
          </div>
        </section>

        {/* Categories Section */}
        <section style={styles.categoriesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Browse by <span style={styles.gradientText}>Category</span>
            </h2>
            <p style={styles.sectionSubtitle}>
              Discover materials organized by type and topic
            </p>
          </div>
          
          <div style={styles.categoriesGrid}>
            {categories.map((cat, index) => (
              <Link 
                key={cat.name} 
                to={`/repository/category/${encodeURIComponent(cat.name)}`} 
                style={styles.categoryCard}
                className="category-card"
              >
                <div style={styles.categoryCardInner}>
                  <div style={{
                    ...styles.categoryIconWrapper,
                    backgroundColor: `${cat.color}15`,
                    color: cat.color
                  }}>
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <div style={{
                      ...styles.categoryIconGlow,
                      backgroundColor: cat.color
                    }}></div>
                  </div>
                  <h3 style={styles.categoryName}>{cat.name}</h3>
                  <p style={styles.categoryCount}>
                    {formatNumber(cat.count)} {cat.count === 1 ? 'item' : 'items'}
                  </p>
                  <div style={styles.categoryArrow}>→</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Items Section */}
        <section style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Featured <span style={styles.gradientText}>Items</span>
            </h2>
            <p style={styles.sectionSubtitle}>
              Most popular and recently added materials
            </p>
          </div>
          
          <div style={styles.featuredGrid}>
            {featuredItems.map((item, index) => (
              <Link 
                key={item.uuid} 
                to={`/repository/item/${item.uuid}`} 
                style={styles.featuredCard}
                className="featured-card"
                onClick={() => handleItemClick(item.uuid)}
              >
                <div style={styles.featuredCardHeader}>
                  <div style={{
                    ...styles.featuredIcon,
                    backgroundColor: `${getCategoryColor(item.category)}15`,
                    color: getCategoryColor(item.category)
                  }}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <span style={styles.featuredBadge}>Featured</span>
                </div>
                
                <h3 style={styles.featuredTitle}>{item.title}</h3>
                <p style={styles.featuredAuthor}>by {item.author}</p>
                
                <div style={styles.featuredFooter}>
                  <div style={styles.featuredStats}>
                    <span style={styles.featuredDownloads}>
                      ⬇️ {formatNumber(item.downloads)}
                    </span>
                    {item.year && (
                      <span style={styles.featuredYear}>{item.year}</span>
                    )}
                  </div>
                  <button 
                    style={styles.featuredDownloadBtn}
                    onClick={(e) => handleDownload(item.uuid, e)}
                  >
                    Download
                  </button>
                </div>
              </Link>
            ))}
          </div>
          
          <div style={styles.viewAllContainer}>
            <Link to="/repository/browse" style={styles.viewAllLink}>
              View All Items <span style={styles.viewAllArrow}>→</span>
            </Link>
          </div>
        </section>

        {/* Contribute CTA Section */}
        <section style={styles.contributeSection}>
          <div style={styles.contributeBackground}>
            <div style={styles.contributePattern}></div>
          </div>
          
          <div style={styles.contributeContent}>
            <div style={styles.contributeBadge}>✨ Share Your Knowledge</div>
            <h2 style={styles.contributeTitle}>
              Contribute to the <span style={styles.gradientText}>Archive</span>
            </h2>
            <p style={styles.contributeText}>
              Help preserve Oromo heritage by sharing your materials, 
              research, and cultural artifacts with our community
            </p>
            
            <div style={styles.contributeFeatures}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📝</span>
                <span>Academic Papers</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🎵</span>
                <span>Oral Histories</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📸</span>
                <span>Photographs</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📚</span>
                <span>Historical Docs</span>
              </div>
            </div>
            
            <div style={styles.contributeButtons}>
              <Link to="/repository/author/deposit" style={styles.primaryButton}>
                Start Contributing
                <span style={styles.buttonArrow}>→</span>
              </Link>
              <Link to="/repository/guidelines" style={styles.secondaryButton}>
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLogo}>
              <span style={styles.footerLogoIcon}>📚</span>
              <span style={styles.footerLogoText}>Oromo Knowledge Archive</span>
            </div>
            <p style={styles.footerCopyright}>
              © {new Date().getFullYear()} Oromo Researcher Association. 
              All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      
      {/* Add dynamic styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .category-card, .featured-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15);
        }
        
        .category-card:hover .category-icon-wrapper {
          transform: scale(1.1);
        }
        
        .featured-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 40px -15px rgba(0,0,0,0.2);
        }
        
        .search-result-item:hover {
          background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%);
          border-left-color: #C9A227;
        }
        
        .search-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(201, 162, 39, 0.3);
        }
        
        .featured-download-btn:hover {
          background: #C9A227;
          color: white;
        }
        
        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(201, 162, 39, 0.4);
        }
        
        .primary-button:hover .button-arrow {
          transform: translateX(5px);
        }
        
        .secondary-button:hover {
          background: rgba(255,255,255,0.15);
        }
        
        .stat-value {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      ` }} />
    </>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#ffffff",
    overflowX: "hidden",
  },
  
  // Hero Section
  hero: {
    position: "relative",
    minHeight: "85vh",
    background: "linear-gradient(135deg, #0B2A20 0%, #1A4C3A 50%, #1A5F7A 100%)",
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
    zIndex: 1,
  },
  
  animatedGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    animation: "pulse 4s ease-in-out infinite",
  },
  
  floatingOrbs: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "float 15s ease-in-out infinite",
  },
  
  orb1: {
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(201,162,39,0.2) 0%, transparent 70%)",
    top: "10%",
    left: "5%",
  },
  
  orb2: {
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(46,134,171,0.2) 0%, transparent 70%)",
    bottom: "10%",
    right: "5%",
    animationDelay: "-5s",
  },
  
  orb3: {
    width: "250px",
    height: "250px",
    background: "radial-gradient(circle, rgba(165,105,189,0.15) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    animationDelay: "-2s",
  },
  
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "900px",
    padding: "0 24px",
    animation: "fadeInUp 1s ease-out",
  },
  
  badgeWrapper: {
    marginBottom: "24px",
  },
  
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "100px",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.5px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  
  badgeIcon: {
    fontSize: "16px",
  },
  
  title: {
    fontSize: "clamp(40px, 8vw, 72px)",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "24px",
    letterSpacing: "-0.02em",
  },
  
  gradientText: {
    background: "linear-gradient(135deg, #FDBB2F 0%, #C9A227 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  
  subtitle: {
    fontSize: "clamp(16px, 4vw, 20px)",
    lineHeight: "1.6",
    color: "rgba(255,255,255,0.9)",
    maxWidth: "700px",
    margin: "0 auto 48px",
    fontWeight: "400",
  },
  
  // Search
  searchWrapper: {
    display: "flex",
    gap: "12px",
    maxWidth: "600px",
    margin: "0 auto 40px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  
  searchContainer: {
    flex: 1,
    minWidth: "300px",
    position: "relative",
  },
  
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    color: "#999",
    zIndex: 1,
  },
  
  searchInput: {
    width: "100%",
    padding: "16px 20px 16px 48px",
    fontSize: "16px",
    border: "2px solid transparent",
    borderRadius: "12px",
    background: "white",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
    outline: "none",
    transition: "all 0.3s ease",
  },
  
  searchSpinner: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #C9A227",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  
  searchButton: {
    padding: "0 32px",
    height: "56px",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #FDBB2F 0%, #C9A227 100%)",
    color: "#0B2A20",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
  
  // Search Results
  searchResults: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    top: "calc(100% - 20px)",
    width: "600px",
    maxHeight: "400px",
    overflowY: "auto",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
    background: "#fafafa",
    borderRadius: "16px 16px 0 0",
  },
  
  resultCount: {
    padding: "4px 8px",
    background: "#f0f0f0",
    borderRadius: "100px",
    fontSize: "12px",
  },
  
  searchResultItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    textDecoration: "none",
    borderLeft: "3px solid transparent",
    transition: "all 0.2s ease",
  },
  
  resultIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    fontSize: "24px",
  },
  
  resultInfo: {
    flex: 1,
  },
  
  resultTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  
  resultMeta: {
    fontSize: "14px",
    color: "#666",
    display: "flex",
    gap: "8px",
  },
  
  // Stats
  statsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    marginTop: "40px",
  },
  
  statItem: {
    textAlign: "center",
  },
  
  statValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "white",
    marginBottom: "4px",
    lineHeight: "1.2",
  },
  
  statLabel: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: "1px",
  },
  
  statDivider: {
    width: "2px",
    height: "30px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "2px",
  },
  
  // Scroll Indicator
  scrollIndicator: {
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  
  scrollText: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "1px",
  },
  
  scrollArrow: {
    fontSize: "20px",
    color: "white",
    animation: "bounce 2s infinite",
  },
  
  // Categories Section
  categoriesSection: {
    padding: "80px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  
  sectionHeader: {
    textAlign: "center",
    marginBottom: "48px",
  },
  
  sectionTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#1a1a1a",
  },
  
  sectionSubtitle: {
    fontSize: "18px",
    color: "#666",
  },
  
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  
  categoryCard: {
    textDecoration: "none",
    display: "block",
  },
  
  categoryCardInner: {
    padding: "32px 24px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 5px 20px -5px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  
  categoryIconWrapper: {
    width: "64px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    fontSize: "32px",
    marginBottom: "20px",
    position: "relative",
    transition: "all 0.3s ease",
  },
  
  categoryIconGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    filter: "blur(20px)",
    opacity: 0.3,
    zIndex: -1,
  },
  
  categoryName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  
  categoryCount: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  
  categoryArrow: {
    position: "absolute",
    top: "24px",
    right: "24px",
    fontSize: "20px",
    color: "#ccc",
    transition: "all 0.3s ease",
    opacity: 0,
    transform: "translateX(-10px)",
  },
  
  // Featured Section
  featuredSection: {
    padding: "80px 24px",
    background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
  },
  
  featuredGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  
  featuredCard: {
    textDecoration: "none",
    background: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  },
  
  featuredCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  
  featuredIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    fontSize: "24px",
  },
  
  featuredBadge: {
    padding: "4px 8px",
    background: "linear-gradient(135deg, #FDBB2F 0%, #C9A227 100%)",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#0B2A20",
  },
  
  featuredTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "8px",
    lineHeight: "1.4",
  },
  
  featuredAuthor: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  
  featuredFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  featuredStats: {
    display: "flex",
    gap: "12px",
    fontSize: "14px",
    color: "#666",
  },
  
  featuredYear: {
    padding: "2px 8px",
    background: "#f0f0f0",
    borderRadius: "100px",
  },
  
  featuredDownloadBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "2px solid #C9A227",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#C9A227",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  
  viewAllContainer: {
    textAlign: "center",
    marginTop: "48px",
  },
  
  viewAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    textDecoration: "none",
    borderBottom: "2px solid #C9A227",
    transition: "all 0.3s ease",
  },
  
  viewAllArrow: {
    transition: "transform 0.3s ease",
  },
  
  // Contribute CTA
  contributeSection: {
    position: "relative",
    padding: "100px 24px",
    overflow: "hidden",
  },
  
  contributeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #0B2A20 0%, #1A4C3A 100%)",
    zIndex: 0,
  },
  
  contributePattern: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(253,187,47,0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(46,134,171,0.1) 0%, transparent 40%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px)
    `,
  },
  
  contributeContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  
  contributeBadge: {
    display: "inline-block",
    padding: "8px 16px",
    background: "rgba(253,187,47,0.2)",
    borderRadius: "100px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "24px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(253,187,47,0.3)",
  },
  
  contributeTitle: {
    fontSize: "clamp(36px, 6vw, 56px)",
    fontWeight: "800",
    marginBottom: "24px",
    lineHeight: "1.2",
  },
  
  contributeText: {
    fontSize: "18px",
    lineHeight: "1.6",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "40px",
    maxWidth: "600px",
    margin: "0 auto 40px",
  },
  
  contributeFeatures: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "100px",
    fontSize: "14px",
    fontWeight: "500",
  },
  
  featureIcon: {
    fontSize: "16px",
  },
  
  contributeButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 32px",
    background: "linear-gradient(135deg, #FDBB2F 0%, #C9A227 100%)",
    color: "#0B2A20",
    textDecoration: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.3s ease",
  },
  
  buttonArrow: {
    transition: "transform 0.3s ease",
  },
  
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "16px 32px",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    textDecoration: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "16px",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },
  
  // Footer
  footer: {
    background: "#0B2A20",
    padding: "40px 24px",
  },
  
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  
  footerLogoIcon: {
    fontSize: "24px",
  },
  
  footerLogoText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
  },
  
  footerCopyright: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
};

// Add keyframes to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: translateY(-50%) rotate(0deg); }
    100% { transform: translateY(-50%) rotate(360deg); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-20px) translateX(10px); }
    50% { transform: translateY(10px) translateX(-10px); }
    75% { transform: translateY(-10px) translateX(-5px); }
  }
`;
document.head.appendChild(styleSheet);