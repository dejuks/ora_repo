import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  fetchPublicManuscripts,
  downloadFile
} from "../../api/manuscript.api";

const API_BASE =
  process.env.REACT_APP_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export default function PublicManuscriptsPage() {
  const navigate = useNavigate();
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPublicManuscripts();
        setManuscripts(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load manuscripts");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get unique stages for filtering
  const stages = ["all", ...new Set(manuscripts.map(m => m.stage_name).filter(Boolean))];

  // Filter manuscripts based on category and search
  const filteredManuscripts = manuscripts.filter(m => {
    const matchesCategory = selectedCategory === "all" || m.stage_name === selectedCategory;
    const matchesSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.abstract?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const buildFileUrl = (path) => {
    if (!path) return null;
    return `${API_BASE}/${path}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      published: "#10b981",
      accepted: "#3b82f6",
      review: "#f59e0b",
      submitted: "#8b5cf6",
      draft: "#6b7280"
    };
    return colors[status?.toLowerCase()] || "#6b7280";
  };

  // Handle contribute click - redirect to login/register
  const handleContributeClick = () => {
    // You can pass a redirect URL to come back to this page after login
    navigate("/journal/author-login?redirect=/manuscripts/contribute");
    // Or if you want to go directly to registration:
    // navigate("/register?redirect=/manuscripts/contribute");
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        {/* HERO SECTION - REDESIGNED */}
        <section style={styles.hero}>
          <div style={styles.heroPattern} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <div style={styles.heroBadgeWrapper}>
              <span style={styles.heroBadge}>
                <span style={styles.badgeDot} />
                Academic Research Journal
              </span>
            </div>

            <h1 style={styles.heroTitle}>
              Discover Academic 
              <span style={styles.heroTitleAccent}>Manuscripts</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Explore a collection of scholarly works from researchers around the world,
              advancing knowledge across multiple disciplines.
            </p>

            {/* CONTRIBUTE BUTTON - NEW */}
            <div style={styles.contributeWrapper}>
              <button 
                onClick={handleContributeClick}
                style={styles.contributeButton}
                className="contribute-button"
              >
                <span style={styles.contributeIcon}>✍️</span>
                Start Contributing
                <span style={styles.contributeArrow}>→</span>
              </button>
              <p style={styles.contributeText}>
                Join our community of researchers and share your work
              </p>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📚</div>
                <div>
                  <span style={styles.statNumber}>{manuscripts.length}</span>
                  <span style={styles.statLabel}>Total Manuscripts</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>✍️</div>
                <div>
                  <span style={styles.statNumber}>
                    {new Set(manuscripts.map(m => m.author_name)).size}
                  </span>
                  <span style={styles.statLabel}>Contributors</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏷️</div>
                <div>
                  <span style={styles.statNumber}>{stages.length - 1}</span>
                  <span style={styles.statLabel}>Categories</span>
                </div>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by title, author, or abstract..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                <span style={styles.searchIcon}>🔍</span>
                Search
              </button>
            </div>
          </div>
        </section>

        {/* ERROR STATE */}
        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* ARTICLES SECTION */}
        <section style={styles.articlesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Browse by <span style={styles.sectionTitleAccent}>Category</span>
            </h2>
            <p style={styles.sectionSubtitle}>
              Filter manuscripts by research area and field of study
            </p>
          </div>

          {/* Category Filter */}
          <div style={styles.filterSection}>
            <div style={styles.categoryTabs}>
              {stages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedCategory(stage)}
                  style={{
                    ...styles.categoryTab,
                    ...(selectedCategory === stage ? styles.categoryTabActive : {})
                  }}
                >
                  {stage === "all" ? "All Manuscripts" : stage}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Discovering manuscripts...</p>
            </div>
          ) : (
            <>
              {filteredManuscripts.length === 0 ? (
                <div style={styles.noResults}>
                  <span style={styles.noResultsIcon}>📭</span>
                  <h3>No manuscripts found</h3>
                  <p>Try adjusting your search or filter to find what you're looking for</p>
                  
                  {/* CONTRIBUTE CTA IN EMPTY STATE */}
                  <button 
                    onClick={handleContributeClick}
                    style={styles.emptyStateContributeButton}
                  >
                    Be the first to contribute →
                  </button>
                </div>
              ) : (
                <>
                  <div style={styles.resultsInfo}>
                    <p style={styles.resultsCount}>
                      Showing <strong>{filteredManuscripts.length}</strong> {filteredManuscripts.length === 1 ? 'manuscript' : 'manuscripts'}
                    </p>
                  </div>

                  <div style={styles.articlesGrid}>
                    {filteredManuscripts.map((manuscript, index) => (
                      <Link 
                        to={`/manuscript/${manuscript.id}`} 
                        key={manuscript.id}
                        style={styles.articleCard}
                        className="article-card"
                      >
                        <div style={styles.cardHeader}>
                          <span style={styles.cardNumber}>
                            {index + 1}
                          </span>
                          <span style={{
                            ...styles.cardStatus,
                            backgroundColor: getStatusColor(manuscript.status)
                          }}>
                            {manuscript.status || 'Published'}
                          </span>
                        </div>
                        
                        <h3 style={styles.cardTitle}>
                          {manuscript.title}
                        </h3>

                        <div style={styles.authorInfo}>
                          <div style={styles.authorAvatar}>
                            {manuscript.author_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p style={styles.authorName}>{manuscript.author_name || 'Anonymous'}</p>
                            <p style={styles.authorAffiliation}>{manuscript.stage_name || 'Researcher'}</p>
                          </div>
                        </div>

                        {manuscript.abstract && (
                          <p style={styles.cardAbstract}>
                            {manuscript.abstract.length > 180
                              ? `${manuscript.abstract.substring(0, 180)}...`
                              : manuscript.abstract}
                          </p>
                        )}

                        <div style={styles.metadata}>
                          <div style={styles.metadataItem}>
                            <span style={styles.metadataIcon}>📅</span>
                            <span>{formatDate(manuscript.created_at)}</span>
                          </div>
                          
                          {manuscript.files && manuscript.files.length > 0 && (
                            <div style={styles.metadataItem}>
                              <span style={styles.metadataIcon}>📎</span>
                              <span>{manuscript.files.length} {manuscript.files.length === 1 ? 'file' : 'files'}</span>
                            </div>
                          )}
                        </div>

                        {manuscript.files && manuscript.files.length > 0 && (
                          <div style={styles.fileTags}>
                            {manuscript.files.slice(0, 2).map((file, idx) => (
                              <span key={file.id} style={styles.fileTag}>
                                📄 File {idx + 1}
                              </span>
                            ))}
                            {manuscript.files.length > 2 && (
                              <span style={styles.fileTagMore}>
                                +{manuscript.files.length - 2} more
                              </span>
                            )}
                          </div>
                        )}

                        <div style={styles.cardFooter}>
                          <span style={styles.readMore}>
                            Read Full Manuscript
                            <span style={styles.arrow}>→</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* CONTRIBUTE CTA AFTER ARTICLES */}
                  <div style={styles.bottomCTA}>
                    <div style={styles.bottomCTAContent}>
                      <h3 style={styles.bottomCTATitle}>Ready to share your research?</h3>
                      <p style={styles.bottomCTAText}>
                        Join our community of scholars and contribute your manuscripts to the academic world.
                      </p>
                      <button 
                        onClick={handleContributeClick}
                        style={styles.bottomCTAButton}
                      >
                        Start Contributing Now
                        <span style={styles.bottomCTAArrow}>→</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            © 2024 Academic Journal. All rights reserved.
          </p>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>About</span>
            <span style={styles.footerLink}>Privacy</span>
            <span style={styles.footerLink}>Terms</span>
            <span style={styles.footerLink}>Contact</span>
          </div>
        </div>
      </footer>
    </>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f8fafc",
  },
  
  // Hero Section
  hero: {
    position: "relative",
    minHeight: "80vh",
    background: "linear-gradient(135deg, #0A2F1F 0%, #1B4A2C 50%, #8B6B3C 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(201, 162, 39, 0.1) 0%, transparent 50%)",
    zIndex: 1,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(45deg, rgba(10, 47, 31, 0.9) 0%, rgba(27, 74, 44, 0.8) 100%)",
    zIndex: 2,
  },
  heroContent: {
    position: "relative",
    zIndex: 3,
    textAlign: "center",
    color: "white",
    maxWidth: "1200px",
    padding: "0 20px",
  },
  heroBadgeWrapper: {
    marginBottom: "30px",
    animation: "fadeInDown 0.8s ease",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 24px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "50px",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "0.95rem",
    fontWeight: "500",
    letterSpacing: "0.5px",
    color: "white",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    background: "#C9A227",
    borderRadius: "50%",
    display: "inline-block",
    animation: "pulse 2s infinite",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
    fontWeight: "700",
    margin: "0 0 20px",
    lineHeight: "1.1",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    animation: "fadeInUp 0.8s ease 0.2s both",
  },
  heroTitleAccent: {
    color: "#C9A227",
    display: "block",
    fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
    fontWeight: "400",
    letterSpacing: "2px",
  },
  heroSubtitle: {
    fontSize: "clamp(1rem, 2vw, 1.2rem)",
    lineHeight: 1.8,
    marginBottom: "30px",
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
    opacity: 0.9,
    animation: "fadeInUp 0.8s ease 0.3s both",
  },

  // Contribute Button
  contributeWrapper: {
    marginBottom: "40px",
    animation: "fadeInUp 0.8s ease 0.35s both",
  },
  contributeButton: {
    background: "linear-gradient(135deg, #C9A227, #B88F1F)",
    color: "white",
    border: "none",
    padding: "16px 40px",
    borderRadius: "50px",
    fontSize: "1.2rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 10px 25px rgba(201, 162, 39, 0.3)",
    transition: "all 0.3s ease",
    marginBottom: "12px",
  },
  contributeIcon: {
    fontSize: "1.4rem",
  },
  contributeArrow: {
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },
  contributeText: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.8)",
    margin: 0,
  },

  // Stats Grid
  statsGrid: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    marginBottom: "50px",
    flexWrap: "wrap",
    animation: "fadeInUp 0.8s ease 0.4s both",
  },
  statCard: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    padding: "25px 35px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minWidth: "200px",
    transition: "transform 0.3s ease, background 0.3s ease",
    cursor: "default",
  },
  statIcon: {
    fontSize: "2.5rem",
    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
  },
  statNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.8,
    display: "block",
  },

  // Search Bar
  searchContainer: {
    display: "flex",
    maxWidth: "600px",
    margin: "0 auto",
    background: "white",
    borderRadius: "60px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    animation: "fadeInUp 0.8s ease 0.5s both",
  },
  searchInput: {
    flex: 1,
    padding: "18px 25px",
    border: "none",
    outline: "none",
    fontSize: "1rem",
    background: "white",
  },
  searchButton: {
    padding: "18px 35px",
    background: "#C9A227",
    border: "none",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background 0.3s ease",
  },
  searchIcon: {
    fontSize: "1.1rem",
  },

  // Articles Section
  articlesSection: {
    padding: "80px 20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 15px",
  },
  sectionTitleAccent: {
    color: "#C9A227",
    position: "relative",
    display: "inline-block",
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#666",
  },

  // Filter Section
  filterSection: {
    marginBottom: "3rem",
  },
  categoryTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    justifyContent: "center",
  },
  categoryTab: {
    padding: "0.75rem 1.5rem",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "500",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  categoryTabActive: {
    backgroundColor: "#0A2F1F",
    color: "white",
    borderColor: "#0A2F1F",
  },

  // Results Info
  resultsInfo: {
    marginBottom: "2rem",
  },
  resultsCount: {
    fontSize: "1rem",
    color: "#64748b",
  },

  // Article Cards
  articlesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "35px",
    marginBottom: "50px",
  },
  articleCard: {
    background: "white",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    position: "relative",
    border: "1px solid rgba(201, 162, 39, 0.1)",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardNumber: {
    display: "inline-block",
    padding: "5px 12px",
    background: "rgba(201, 162, 39, 0.1)",
    color: "#C9A227",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  cardStatus: {
    padding: "0.35rem 1rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  cardTitle: {
    fontSize: "1.4rem",
    margin: "0 0 20px",
    lineHeight: "1.4",
    color: "#0A2F1F",
  },
  authorInfo: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "16px",
  },
  authorAvatar: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  authorName: {
    margin: "0 0 5px",
    fontWeight: "600",
    color: "#0A2F1F",
  },
  authorAffiliation: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#666",
  },
  cardAbstract: {
    color: "#444",
    lineHeight: "1.7",
    marginBottom: "20px",
    fontSize: "0.95rem",
    flex: 1,
  },
  metadata: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1rem",
  },
  metadataItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#64748b",
  },
  metadataIcon: {
    fontSize: "1rem",
  },
  fileTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "20px",
  },
  fileTag: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "#f1f5f9",
    borderRadius: "16px",
    fontSize: "0.75rem",
    color: "#475569",
  },
  fileTagMore: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "transparent",
    borderRadius: "16px",
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  cardFooter: {
    paddingTop: "20px",
    borderTop: "1px solid #eef2f6",
  },
  readMore: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#0A2F1F",
    fontWeight: "500",
    fontSize: "0.95rem",
  },
  arrow: {
    fontSize: "1.25rem",
    transition: "transform 0.2s ease",
  },

  // Empty State Contribute Button
  emptyStateContributeButton: {
    marginTop: "20px",
    padding: "12px 30px",
    background: "#C9A227",
    border: "none",
    borderRadius: "30px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Bottom CTA
  bottomCTA: {
    marginTop: "60px",
    padding: "40px",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    borderRadius: "30px",
    textAlign: "center",
  },
  bottomCTAContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  bottomCTATitle: {
    fontSize: "2rem",
    color: "white",
    margin: "0 0 15px",
  },
  bottomCTAText: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "30px",
    lineHeight: "1.6",
  },
  bottomCTAButton: {
    background: "#C9A227",
    color: "white",
    border: "none",
    padding: "15px 40px",
    borderRadius: "50px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
  },
  bottomCTAArrow: {
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },

  // Loading & Error States
  loadingContainer: {
    textAlign: "center",
    padding: "80px 20px",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #C9A227",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#c00",
  },
  errorIcon: {
    fontSize: "1.5rem",
  },
  noResults: {
    textAlign: "center",
    padding: "80px 20px",
    background: "white",
    borderRadius: "30px",
    border: "2px dashed #eef2f6",
  },
  noResultsIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "20px",
  },

  // Footer
  footer: {
    background: "#0A2F1F",
    color: "white",
    padding: "3rem 2rem",
  },
  footerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "2rem",
  },
  footerText: {
    fontSize: "0.95rem",
    opacity: 0.8,
    margin: 0,
  },
  footerLinks: {
    display: "flex",
    gap: "2rem",
  },
  footerLink: {
    fontSize: "0.95rem",
    opacity: 0.8,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
};

// Add global styles
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .article-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(10, 47, 31, 0.1);
    border-color: rgba(201, 162, 39, 0.3);
  }

  .article-card:hover .arrow {
    transform: translateX(4px);
  }

  .category-tab:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }

  .category-tab.active:hover {
    background-color: #0A2F1F;
  }

  .search-button:hover {
    background: #B88F1F;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }

  .footer-link:hover {
    opacity: 1;
  }

  .contribute-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(201, 162, 39, 0.4);
  }

  .contribute-button:hover .contribute-arrow {
    transform: translateX(5px);
  }

  .empty-state-contribute-button:hover {
    background: #B88F1F;
    transform: translateY(-2px);
  }

  .bottom-cta-button:hover {
    background: #B88F1F;
    transform: translateY(-2px);
  }

  .bottom-cta-button:hover .bottom-cta-arrow {
    transform: translateX(5px);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}