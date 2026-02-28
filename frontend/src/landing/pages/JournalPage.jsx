import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../../api/publication.api";

const API_BASE =
  process.env.REACT_APP_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export default function JournalPage() {
  const [manuscripts, setManuscripts] = useState([]);
  const [recentManuscripts, setRecentManuscripts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  });

  /* ================= LOAD DATA ================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [manuscriptsData, recentData, statsData] = await Promise.all([
        publicationAPI.getPublishedManuscripts(
          pagination.page,
          pagination.limit,
          searchQuery
        ),
        publicationAPI.getRecentManuscripts(5),
        publicationAPI.getJournalStats(),
      ]);

      if (manuscriptsData?.success) {
        setManuscripts(manuscriptsData.manuscripts || []);
        setPagination((prev) => ({
          ...prev,
          total: manuscriptsData.pagination?.total || 0,
          pages: manuscriptsData.pagination?.pages || 1,
        }));
      }

      if (recentData?.success) {
        setRecentManuscripts(recentData.manuscripts || []);
      }

      if (statsData?.success) {
        setStats(statsData.stats || null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load journal data");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ================= SEARCH ================= */

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadData();
  };

  /* ================= HELPERS ================= */

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const buildFileUrl = (path) => {
    if (!path) return null;
    return `${API_BASE}/${path}`;
  };

  /* ================= RENDER ================= */

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
                International Peer-Reviewed Journal
              </span>
            </div>

            <h1 style={styles.heroTitle}>
              Oromo Research 
              <span style={styles.heroTitleAccent}>Journal</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Advancing knowledge and understanding of Oromo history,
              culture, language, and development through rigorous
              academic scholarship.
            </p>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📊</div>
                <div>
                  <span style={styles.statNumber}>4.2</span>
                  <span style={styles.statLabel}>Impact Factor</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>📚</div>
                <div>
                  <span style={styles.statNumber}>
                    {stats?.total_manuscripts || 0}
                  </span>
                  <span style={styles.statLabel}>Articles Published</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <div>
                  <span style={styles.statNumber}>
                    {stats?.total_authors || 0}
                  </span>
                  <span style={styles.statLabel}>Contributors</span>
                </div>
              </div>
            </div>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search articles by title, author, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                <span style={styles.searchIcon}>🔍</span>
                Search
              </button>
            </form>
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
              Latest <span style={styles.sectionTitleAccent}>Articles</span>
            </h2>
            <p style={styles.sectionSubtitle}>
              Discover the latest research and scholarly work
            </p>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading articles...</p>
            </div>
          ) : (
            <>
              <div style={styles.articlesGrid}>
                {manuscripts.length === 0 ? (
                  <div style={styles.noResults}>
                    <span style={styles.noResultsIcon}>📭</span>
                    <h3>No manuscripts found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                ) : (
                  manuscripts.map((m, index) => (
                    <div key={m.id} style={styles.articleCard}>
                      <div style={styles.cardHeader}>
                        <span style={styles.cardNumber}>
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </span>
                      </div>
                      
                      <h3 style={styles.cardTitle}>
                        <Link to={`/journal/manuscript/${m.id}`} style={styles.cardLink}>
                          {m.title}
                        </Link>
                      </h3>

                      <div style={styles.authorInfo}>
                        <div style={styles.authorAvatar}>
                          {m.author_name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p style={styles.authorName}>{m.author_name}</p>
                          <p style={styles.authorAffiliation}>{m.author_affiliation}</p>
                        </div>
                      </div>

                      <p style={styles.cardAbstract}>
                        {m.abstract?.substring(0, 180)}...
                      </p>

                      <div style={styles.cardFooter}>
                        <div style={styles.dateBadge}>
                          <span style={styles.calendarIcon}>📅</span>
                          {formatDate(m.published_at)}
                        </div>

                        {m.file_path && (
                          <a
                            href={buildFileUrl(m.file_path)}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.downloadButton}
                          >
                            <span style={styles.downloadIcon}>📥</span>
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              {pagination.pages > 1 && (
                <div style={styles.pagination}>
                  <button
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    style={{
                      ...styles.paginationButton,
                      ...(pagination.page === 1 && styles.paginationButtonDisabled)
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={styles.pageNumbers}>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                        style={{
                          ...styles.pageNumber,
                          ...(pagination.page === i + 1 && styles.pageNumberActive)
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    style={{
                      ...styles.paginationButton,
                      ...(pagination.page === pagination.pages && styles.paginationButtonDisabled)
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* RECENT PUBLICATIONS SIDEBAR - Optional, you can add this as a separate section */}
          {recentManuscripts.length > 0 && !loading && (
            <div style={styles.recentSection}>
              <h3 style={styles.recentTitle}>
                <span style={styles.recentIcon}>🆕</span>
                Recent Publications
              </h3>
              <div style={styles.recentList}>
                {recentManuscripts.map((m) => (
                  <Link 
                    key={m.id} 
                    to={`/journal/manuscript/${m.id}`}
                    style={styles.recentItem}
                  >
                    <span style={styles.recentItemTitle}>{m.title}</span>
                    <span style={styles.recentItemAuthor}>by {m.author_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
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
    minHeight: "70vh",
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
    maxWidth: "1000px",
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
    marginBottom: "40px",
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
    opacity: 0.9,
    animation: "fadeInUp 0.8s ease 0.3s both",
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
    ":hover": {
      transform: "translateY(-5px)",
      background: "rgba(255,255,255,0.15)",
    },
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
    "::placeholder": {
      color: "#999",
    },
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
    ":hover": {
      background: "#B88F1F",
    },
  },
  searchIcon: {
    fontSize: "1.1rem",
  },

  // Articles Section
  articlesSection: {
    padding: "80px 20px",
    maxWidth: "1400px",
    margin: "0 auto",
    position: "relative",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "60px",
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
    "::after": {
      content: '""',
      position: "absolute",
      bottom: "-5px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "50px",
      height: "3px",
      background: "#C9A227",
      borderRadius: "2px",
    },
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#666",
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
    ":hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(10, 47, 31, 0.1)",
      borderColor: "rgba(201, 162, 39, 0.3)",
    },
  },
  cardHeader: {
    marginBottom: "20px",
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
  cardTitle: {
    fontSize: "1.4rem",
    margin: "0 0 20px",
    lineHeight: "1.4",
  },
  cardLink: {
    color: "#0A2F1F",
    textDecoration: "none",
    transition: "color 0.3s ease",
    ":hover": {
      color: "#C9A227",
    },
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
    marginBottom: "25px",
    fontSize: "0.95rem",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "20px",
    borderTop: "1px solid #eef2f6",
  },
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#666",
    fontSize: "0.9rem",
  },
  calendarIcon: {
    fontSize: "1rem",
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(201, 162, 39, 0.1)",
    color: "#C9A227",
    textDecoration: "none",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#C9A227",
      color: "white",
      transform: "scale(1.05)",
    },
  },
  downloadIcon: {
    fontSize: "1rem",
  },

  // Pagination
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "60px",
    flexWrap: "wrap",
  },
  paginationButton: {
    padding: "12px 24px",
    background: "white",
    border: "1px solid #eef2f6",
    borderRadius: "40px",
    color: "#0A2F1F",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#0A2F1F",
      color: "white",
      borderColor: "#0A2F1F",
    },
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  pageNumbers: {
    display: "flex",
    gap: "8px",
  },
  pageNumber: {
    width: "45px",
    height: "45px",
    border: "1px solid #eef2f6",
    background: "white",
    borderRadius: "12px",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#f8fafc",
      borderColor: "#C9A227",
    },
  },
  pageNumberActive: {
    background: "#0A2F1F",
    borderColor: "#0A2F1F",
    color: "white",
  },

  // Recent Section
  recentSection: {
    marginTop: "80px",
    padding: "40px",
    background: "white",
    borderRadius: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    border: "1px solid #eef2f6",
  },
  recentTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1.8rem",
    color: "#0A2F1F",
    margin: "0 0 30px",
  },
  recentIcon: {
    fontSize: "2rem",
  },
  recentList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  recentItem: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "16px",
    textDecoration: "none",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(201, 162, 39, 0.05)",
      transform: "translateX(5px)",
    },
  },
  recentItemTitle: {
    display: "block",
    color: "#0A2F1F",
    fontWeight: "600",
    marginBottom: "8px",
    fontSize: "1.1rem",
  },
  recentItemAuthor: {
    display: "block",
    color: "#666",
    fontSize: "0.9rem",
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
    gridColumn: "1 / -1",
    background: "white",
    borderRadius: "30px",
    border: "2px dashed #eef2f6",
  },
  noResultsIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "20px",
  },

  // Keyframes (add to your global CSS or style tag)
  "@keyframes fadeInDown": {
    from: {
      opacity: 0,
      transform: "translateY(-20px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "@keyframes fadeInUp": {
    from: {
      opacity: 0,
      transform: "translateY(20px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.5,
    },
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};