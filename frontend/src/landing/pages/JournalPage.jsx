import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../../api/publication.api";

export default function JournalPage() {
  const [manuscripts, setManuscripts] = useState([]);
  const [recentManuscripts, setRecentManuscripts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    loadJournalData();
  }, []);

  useEffect(() => {
    loadManuscripts();
  }, [pagination.page, searchQuery]);

  const loadJournalData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [manuscriptsData, recentData, statsData] = await Promise.all([
        publicationAPI.getPublishedManuscripts(1, 6),
        publicationAPI.getRecentManuscripts(5),
        publicationAPI.getJournalStats()
      ]);

      if (manuscriptsData?.success) {
        setManuscripts(manuscriptsData.manuscripts);
        setPagination(prev => ({
          ...prev,
          total: manuscriptsData.pagination.total,
          pages: manuscriptsData.pagination.pages
        }));
      }

      if (recentData?.success) {
        setRecentManuscripts(recentData.manuscripts);
      }

      if (statsData?.success) {
        setStats(statsData.stats);
      }

    } catch (err) {
      console.error("Error loading journal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadManuscripts = async () => {
    try {
      const data = await publicationAPI.getPublishedManuscripts(
        pagination.page,
        pagination.limit,
        searchQuery
      );

      if (data?.success) {
        setManuscripts(data.manuscripts);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (err) {
      console.error("Error loading manuscripts:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadManuscripts();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <span style={styles.heroBadge}>📚 International Peer-Reviewed Journal</span>
            <h1 style={styles.heroTitle}>
              Oromo Research Journal
            </h1>
            <p style={styles.heroSubtitle}>
              Advancing knowledge and understanding of Oromo history, culture, language, 
              and development through rigorous academic scholarship
            </p>
            <div style={styles.heroMetrics}>
              <div style={styles.metric}>
                <span style={styles.metricNumber}>4.2</span>
                <span style={styles.metricLabel}>Impact Factor</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricNumber}>{stats?.total_manuscripts || 0}</span>
                <span style={styles.metricLabel}>Published</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricNumber}>{stats?.total_authors || 0}</span>
                <span style={styles.metricLabel}>Authors</span>
              </div>
            </div>
            <div style={styles.heroButtons}>
              <Link to="/journal/author" style={styles.primaryButton}>
                Submit Manuscript
                <span style={styles.buttonArrow}>→</span>
              </Link>
              <a href="#articles" style={styles.secondaryButton}>
                Browse Articles
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statIcon}>📚</span>
              <div style={styles.statNumber}>{stats?.total_manuscripts || 0}</div>
              <div style={styles.statLabel}>Published Articles</div>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statIcon}>👥</span>
              <div style={styles.statNumber}>{stats?.total_authors || 0}</div>
              <div style={styles.statLabel}>Authors</div>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statIcon}>📅</span>
              <div style={styles.statNumber}>
                {stats?.latest_publication ? new Date(stats.latest_publication).getFullYear() : '2024'}
              </div>
              <div style={styles.statLabel}>Latest Publication</div>
            </div>
          </div>
        </section>

        {/* Recent Manuscripts */}
        {recentManuscripts.length > 0 && (
          <section style={styles.recentSection}>
            <h2 style={styles.sectionTitle}>
              Recent <span style={styles.gradientText}>Publications</span>
            </h2>
            <div style={styles.recentGrid}>
              {recentManuscripts.map((m) => (
                <div key={m.id} style={styles.recentCard}>
                  <h3 style={styles.articleTitle}>
                    <Link to={`/journal/manuscript/${m.id}`} style={styles.articleLink}>
                      {m.title}
                    </Link>
                  </h3>
                  <p style={styles.articleAuthors}>{m.author_name}</p>
                  <p style={styles.articleDate}>Published: {formatDate(m.published_at)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search Section */}
        <section id="articles" style={styles.searchSection}>
          <form onSubmit={handleSearch} style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search articles by title or author..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" style={styles.searchButton}>
              🔍 Search
            </button>
          </form>
        </section>

        {/* Manuscripts Grid */}
        <section style={styles.articlesSection}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.articlesHeader}>
                <h2 style={styles.sectionTitle}>
                  All <span style={styles.gradientText}>Publications</span>
                </h2>
                <span style={styles.articleCount}>
                  {pagination.total} articles found
                </span>
              </div>

              <div style={styles.articlesGrid}>
                {manuscripts.length === 0 ? (
                  <div style={styles.noResults}>
                    <p>No manuscripts found</p>
                  </div>
                ) : (
                  manuscripts.map((m) => (
                    <div key={m.id} style={styles.articleCard}>
                      <h3 style={styles.articleTitle}>
                        <Link to={`/journal/manuscript/${m.id}`} style={styles.articleLink}>
                          {m.title}
                        </Link>
                      </h3>
                      <p style={styles.articleAuthors}>{m.author_name}</p>
                      <p style={styles.articleAffiliation}>{m.author_affiliation}</p>
                      <p style={styles.articleAbstract}>{m.abstract?.substring(0, 200)}...</p>
                      <div style={styles.articleMeta}>
                        <span>📅 {formatDate(m.published_at || m.updated_at)}</span>
                      </div>
                      <div style={styles.articleActions}>
                        {m.file_path && (
                          <a
                            href={`http://localhost:5000/${m.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.downloadLink}
                          >
                            📥 Download PDF
                          </a>
                        )}
                        <Link to={`/journal/manuscript/${m.id}`} style={styles.readMore}>
                          Read More →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    style={styles.paginationButton}
                  >
                    ← Previous
                  </button>
                  <span style={styles.paginationInfo}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    style={styles.paginationButton}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
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
    fontFamily: "'Poppins', sans-serif",
  },
  hero: {
    position: "relative",
    minHeight: "60vh",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 50%, #C9A227 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "800px",
    padding: "0 20px",
  },
  heroBadge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "30px",
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    margin: "0 0 20px",
  },
  heroSubtitle: {
    fontSize: "1.1rem",
    lineHeight: 1.6,
    marginBottom: "30px",
  },
  heroMetrics: {
    display: "flex",
    gap: "40px",
    justifyContent: "center",
    marginBottom: "30px",
  },
  metric: {
    textAlign: "center",
  },
  metricNumber: {
    display: "block",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  metricLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
  },
  heroButtons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
  },
  primaryButton: {
    padding: "12px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "30px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
  },
  secondaryButton: {
    padding: "12px 30px",
    background: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "30px",
    fontWeight: "600",
    textDecoration: "none",
  },
  buttonArrow: {
    fontSize: "1.2rem",
  },
  statsSection: {
    padding: "40px 20px",
    background: "#f8f9fa",
  },
  statsGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
  },
  statCard: {
    textAlign: "center",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  statIcon: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "10px",
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#C9A227",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#666",
  },
  recentSection: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  recentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  recentCard: {
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
    border: "1px solid #eaeef2",
  },
  searchSection: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  searchContainer: {
    display: "flex",
    gap: "10px",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "2px solid #eaeef2",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  searchButton: {
    padding: "12px 30px",
    background: "#0F3D2E",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  articlesSection: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  articlesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "2rem",
    margin: 0,
  },
  gradientText: {
    background: "linear-gradient(135deg, #C9A227, #0F3D2E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  articleCount: {
    color: "#666",
  },
  articlesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
  },
  articleCard: {
    padding: "25px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    border: "1px solid #eaeef2",
  },
  articleTitle: {
    fontSize: "1.2rem",
    margin: "0 0 10px",
  },
  articleLink: {
    color: "#1a2639",
    textDecoration: "none",
  },
  articleAuthors: {
    fontSize: "0.95rem",
    color: "#C9A227",
    margin: "0 0 5px",
  },
  articleAffiliation: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "0 0 10px",
  },
  articleAbstract: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: 1.6,
    margin: "0 0 15px",
  },
  articleMeta: {
    fontSize: "0.85rem",
    color: "#999",
    marginBottom: "15px",
  },
  articleActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eaeef2",
    paddingTop: "15px",
  },
  downloadLink: {
    color: "#27AE60",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  readMore: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
  },
  noResults: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
    gridColumn: "1 / -1",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "40px",
  },
  paginationButton: {
    padding: "8px 20px",
    background: "#f8f9fa",
    border: "1px solid #eaeef2",
    borderRadius: "5px",
    cursor: "pointer",
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  paginationInfo: {
    fontSize: "0.95rem",
    color: "#666",
  },
};