import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaSearch,
  FaClock,
  FaEye,
  FaUser,
  FaTag,
  FaStar,
  FaFire,
  FaNewspaper,
  FaArrowRight,
  FaGlobe,
  FaBookOpen,
  FaHistory,
  FaLandmark,
  FaMusic,
  FaUsers,
  FaMapMarkedAlt,
} from "react-icons/fa";
import wikiApi from "../../api/api";

/**
 * IMPORTANT:
 * Your error shows wikiApi.getArticles / getFeaturedArticles / getCategories etc
 * are NOT functions. That usually means wikiApi is just an axios instance.
 *
 * So this component uses wikiApi.get(url, { params }) directly.
 *
 * If your backend paths are a little different, only edit ENDPOINTS below.
 */
const ENDPOINTS = {
  articles: "/wiki/articles",
  featuredArticles: "/wiki/articles/featured",
  popularArticles: "/wiki/articles/popular",
  categories: "/wiki/categories",
  languagesStats: "/wiki/languages/stats",
  articlesStats: "/wiki/articles/stats",
};

export default function OromoWikipedia() {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalEditors: 0,
    totalEdits: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isPublished = (article) => {
    return String(article?.status || "").toLowerCase() === "published";
  };

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const extractArrayFromResponse = (response) => {
    // handles:
    // axios => response.data
    // custom => response.data.data
    // custom => response.data.articles
    // direct => response.data as array
    const payload = response?.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.articles)) return payload.articles;
    if (Array.isArray(payload?.data?.articles)) return payload.data.articles;

    return [];
  };

  const extractStatsFromResponse = (response) => {
    const payload = response?.data;

    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
        return payload.data;
      }
      return payload;
    }

    return {
      totalArticles: 0,
      totalEditors: 0,
      totalEdits: 0,
      totalViews: 0,
    };
  };

  const extractPaginationPages = (response, fallbackLength = 0, limit = 12) => {
    const payload = response?.data;

    return (
      payload?.pagination?.pages ||
      payload?.data?.pagination?.pages ||
      Math.max(1, Math.ceil(fallbackLength / limit))
    );
  };

  const fetchDashboardData = async () => {
    try {
      const [featuredRes, popularRes, recentRes] = await Promise.allSettled([
        wikiApi.get(ENDPOINTS.featuredArticles, {
          params: { limit: 4, status: "published" },
        }),
        wikiApi.get(ENDPOINTS.popularArticles, {
          params: { limit: 6, status: "published" },
        }),
        wikiApi.get(ENDPOINTS.articles, {
          params: { limit: 6, status: "published", sort: "latest" },
        }),
      ]);

      const featuredData =
        featuredRes.status === "fulfilled"
          ? extractArrayFromResponse(featuredRes.value).filter(isPublished)
          : [];

      const popularData =
        popularRes.status === "fulfilled"
          ? extractArrayFromResponse(popularRes.value).filter(isPublished)
          : [];

      const recentData =
        recentRes.status === "fulfilled"
          ? extractArrayFromResponse(recentRes.value).filter(isPublished)
          : [];

      setFeaturedArticles(featuredData);
      setPopularArticles(popularData);
      setRecentArticles(recentData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setFeaturedArticles([]);
      setPopularArticles([]);
      setRecentArticles([]);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        status: "published",
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      if (selectedLang !== "all") {
        params.language = selectedLang;
      }

      const response = await wikiApi.get(ENDPOINTS.articles, { params });

      const rows = extractArrayFromResponse(response).filter(isPublished);

      setArticles(rows);
      setTotalPages(extractPaginationPages(response, rows.length, 12));
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await wikiApi.get(ENDPOINTS.categories);
      const rows = extractArrayFromResponse(response);
      setCategories(rows);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await wikiApi.get(ENDPOINTS.languagesStats);
      const rows = extractArrayFromResponse(response);
      setLanguages(rows);
    } catch (error) {
      console.error("Error fetching languages:", error);
      setLanguages([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await wikiApi.get(ENDPOINTS.articlesStats);
      const data = extractStatsFromResponse(response);
      setStats({
        totalArticles: data.totalArticles || data.total_articles || 0,
        totalEditors: data.totalEditors || data.total_editors || 0,
        totalEdits: data.totalEdits || data.total_edits || 0,
        totalViews: data.totalViews || data.total_views || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalArticles: 0,
        totalEditors: 0,
        totalEdits: 0,
        totalViews: 0,
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    fetchLanguages();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedLang, selectedCategory, currentPage, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const formatNumber = (num) => {
    const n = Number(num || 0);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      History: <FaHistory />,
      Culture: <FaLandmark />,
      Language: <FaGlobe />,
      Music: <FaMusic />,
      People: <FaUsers />,
      Geography: <FaMapMarkedAlt />,
    };

    return icons[categoryName] || <FaBookOpen />;
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerOverlay}>
            <div style={styles.headerContent}>
              <h1 style={styles.logo}>
                <span style={styles.logoOromo}>Oromo</span>
                <span style={styles.logoWikipedia}>Wikipedia</span>
              </h1>

              <p style={styles.tagline}>The Free Encyclopedia of Oromo Knowledge</p>

              <div className="searchWrapper" style={styles.searchWrapper}>
                <div style={styles.searchContainer}>
                  <FaSearch style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search published articles..."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>

                <Link to="/auth" style={styles.createButton}>
                  + Create Article
                </Link>
              </div>

              <div className="quickStats" style={styles.quickStats}>
                <div style={styles.quickStat}>
                  <span style={styles.quickStatNumber}>{formatNumber(stats.totalArticles)}</span>
                  <span style={styles.quickStatLabel}>Articles</span>
                </div>
                <div style={styles.quickStat}>
                  <span style={styles.quickStatNumber}>{formatNumber(stats.totalEditors)}</span>
                  <span style={styles.quickStatLabel}>Editors</span>
                </div>
                <div style={styles.quickStat}>
                  <span style={styles.quickStatNumber}>{formatNumber(stats.totalEdits)}</span>
                  <span style={styles.quickStatLabel}>Edits</span>
                </div>
                <div style={styles.quickStat}>
                  <span style={styles.quickStatNumber}>{formatNumber(stats.totalViews)}</span>
                  <span style={styles.quickStatLabel}>Views</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section style={styles.langBar}>
          <div style={styles.langContainer}>
            <span style={styles.langLabel}>Read in:</span>

            <div style={styles.langButtons}>
              <button
                style={{
                  ...styles.langButton,
                  ...(selectedLang === "all" ? styles.langActive : {}),
                }}
                onClick={() => handleLanguageChange("all")}
              >
                <span style={styles.langName}>All Languages</span>
              </button>

              {safeArray(languages).map((lang, index) => (
                <button
                  key={lang.code || lang.id || index}
                  style={{
                    ...styles.langButton,
                    ...(selectedLang === lang.code ? styles.langActive : {}),
                  }}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span style={styles.langName}>{lang.name || lang.code || "Unknown"}</span>
                  <span style={styles.langCount}>{formatNumber(lang.count)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mainGrid" style={styles.mainGrid}>
          <aside style={styles.leftSidebar}>
            <div style={styles.welcomeCard}>
              <h3 style={styles.welcomeTitle}>Welcome to Oromo Wikipedia</h3>
              <p style={styles.welcomeText}>
                A free encyclopedia that anyone can edit. Join us in preserving and
                sharing Oromo knowledge with the world.
              </p>
              <Link to="/wiki/help" style={styles.helpLink}>
                Learn how to contribute →
              </Link>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <FaTag style={styles.sectionIcon} />
                Categories
              </h3>

              <div style={styles.categoryList}>
                <button
                  style={{
                    ...styles.categoryButton,
                    ...(selectedCategory === "all" ? styles.categoryActive : {}),
                  }}
                  onClick={() => handleCategoryChange("all")}
                >
                  <span style={styles.categoryIcon}>📚</span>
                  <span style={styles.categoryName}>All Articles</span>
                  <span style={styles.categoryCount}>
                    {formatNumber(stats.totalArticles)}
                  </span>
                </button>

                {safeArray(categories).map((cat, index) => (
                  <button
                    key={cat.id || index}
                    style={{
                      ...styles.categoryButton,
                      ...(selectedCategory === cat.id ? styles.categoryActive : {}),
                    }}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <span style={styles.categoryIcon}>
                      {getCategoryIcon(cat.name)}
                    </span>
                    <span style={styles.categoryName}>{cat.name || "Unknown"}</span>
                    <span style={styles.categoryCount}>
                      {formatNumber(cat.article_count)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <FaFire style={styles.sectionIcon} />
                Trending Topics
              </h3>

              <div style={styles.trendingList}>
                {safeArray(popularArticles).slice(0, 5).map((article, index) => (
                  <Link
                    key={article.id || article.slug || index}
                    to={`/wiki/article/${article.slug}`}
                    style={styles.trendingItem}
                  >
                    <span style={styles.trendingRank}>#{index + 1}</span>
                    <span style={styles.trendingTitle}>{article.title}</span>
                    <span style={styles.trendingViews}>
                      {formatNumber(article.view_count)} views
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <main style={styles.mainContent}>
            {featuredArticles.length > 0 && (
              <section style={styles.featuredSection}>
                <h2 style={styles.featuredTitle}>
                  <FaStar style={styles.featuredIcon} />
                  Featured Articles
                </h2>

                <div className="featuredGrid" style={styles.featuredGrid}>
                  {safeArray(featuredArticles).map((article, index) => (
                    <Link
                      key={article.id || article.slug || index}
                      to={`/wiki/article/${article.slug}`}
                      style={styles.featuredCard}
                    >
                      <div style={styles.featuredCardHeader}>
                        <span style={styles.featuredEmoji}>{article.emoji || "📖"}</span>
                      </div>

                      <div style={styles.featuredCardBody}>
                        <h4 style={styles.featuredCardTitle}>{article.title}</h4>
                        <p style={styles.featuredCardDesc}>
                          {article.description ||
                            article.excerpt?.substring(0, 100) ||
                            "No description available."}
                          ...
                        </p>

                        <div style={styles.featuredCardMeta}>
                          <span style={styles.featuredCardCategory}>
                            {article.categories?.[0]?.name || "General"}
                          </span>
                          <span style={styles.featuredCardViews}>
                            <FaEye /> {formatNumber(article.view_count)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section style={styles.articlesSection}>
              <div style={styles.articlesHeader}>
                <h2 style={styles.articlesTitle}>
                  <FaNewspaper style={styles.articlesIcon} />
                  Published Articles
                </h2>

                <div>
                  <span style={styles.articlesCount}>
                    Showing {articles.length} article{articles.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="articlesGrid" style={styles.loadingGrid}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} style={styles.skeletonCard}>
                      <div style={styles.skeletonImage}></div>
                      <div style={styles.skeletonTitle}></div>
                      <div style={styles.skeletonText}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="articlesGrid" style={styles.articlesGrid}>
                    {articles.length > 0 ? (
                      articles.map((article, index) => (
                        <Link
                          key={article.id || article.slug || index}
                          to={`/wiki/article/${article.slug}`}
                          style={styles.articleCard}
                        >
                          <div style={styles.articleCardContent}>
                            <h3 style={styles.articleCardTitle}>{article.title}</h3>

                            <p style={styles.articleCardDesc}>
                              {article.excerpt?.substring(0, 120) ||
                                article.description?.substring(0, 120) ||
                                "No summary available."}
                              ...
                            </p>

                            <div style={styles.articleCardFooter}>
                              <div style={styles.articleCardAuthor}>
                                <FaUser style={styles.authorIcon} />
                                <span>
                                  {article.author_name ||
                                    article.author_username ||
                                    "Unknown"}
                                </span>
                              </div>

                              <div style={styles.articleCardStats}>
                                <span title="Views">
                                  <FaEye /> {formatNumber(article.view_count)}
                                </span>
                                <span title="Last edited">
                                  <FaClock /> {formatDate(article.updated_at)}
                                </span>
                              </div>
                            </div>

                            {article.categories && article.categories.length > 0 && (
                              <div style={styles.articleCardCategories}>
                                {article.categories.slice(0, 2).map((cat, i) => (
                                  <span key={cat.id || i} style={styles.articleCardCategory}>
                                    {cat.name}
                                  </span>
                                ))}
                                {article.categories.length > 2 && (
                                  <span style={styles.articleCardCategoryMore}>
                                    +{article.categories.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div style={styles.noResults}>
                        <p>No published articles found. Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div style={styles.pagination}>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          ...styles.pageButton,
                          ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                        }}
                      >
                        Previous
                      </button>

                      <span style={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          ...styles.pageButton,
                          ...(currentPage === totalPages
                            ? styles.pageButtonDisabled
                            : {}),
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>

          <aside style={styles.rightSidebar}>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <FaClock style={styles.sectionIcon} />
                Recent Articles
              </h3>

              <div style={styles.recentList}>
                {safeArray(recentArticles).map((article, index) => (
                  <Link
                    key={article.id || article.slug || index}
                    to={`/wiki/article/${article.slug}`}
                    style={styles.recentItem}
                  >
                    <div style={styles.recentContent}>
                      <h4 style={styles.recentTitle}>{article.title}</h4>
                      <span style={styles.recentDate}>
                        {formatDate(article.created_at || article.updated_at)}
                      </span>
                    </div>
                    <FaArrowRight style={styles.recentArrow} />
                  </Link>
                ))}
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <FaFire style={styles.sectionIcon} />
                Most Popular
              </h3>

              <div style={styles.popularList}>
                {safeArray(popularArticles).map((article, index) => (
                  <Link
                    key={article.id || article.slug || index}
                    to={`/wiki/article/${article.slug}`}
                    style={styles.popularItem}
                  >
                    <span style={styles.popularRank}>{index + 1}</span>
                    <div style={styles.popularContent}>
                      <span style={styles.popularTitle}>{article.title}</span>
                      <span style={styles.popularViews}>
                        <FaEye /> {formatNumber(article.view_count)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <FaUsers style={styles.sectionIcon} />
                Community
              </h3>

              <div style={styles.communityLinks}>
                <Link to="/wiki/help" style={styles.communityLink}>
                  <span style={styles.communityIcon}>📖</span>
                  Help desk
                </Link>
                <Link to="/wiki/request" style={styles.communityLink}>
                  <span style={styles.communityIcon}>📝</span>
                  Request article
                </Link>
                <Link to="/wiki/translate" style={styles.communityLink}>
                  <span style={styles.communityIcon}>🌍</span>
                  Translate
                </Link>
                <Link to="/wiki/discuss" style={styles.communityLink}>
                  <span style={styles.communityIcon}>💬</span>
                  Discussion
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLinks}>
              <Link to="/about" style={styles.footerLink}>
                About
              </Link>
              <Link to="/disclaimer" style={styles.footerLink}>
                Disclaimer
              </Link>
              <Link to="/privacy" style={styles.footerLink}>
                Privacy
              </Link>
              <Link to="/terms" style={styles.footerLink}>
                Terms
              </Link>
              <Link to="/contact" style={styles.footerLink}>
                Contact
              </Link>
            </div>

            <p style={styles.copyright}>
              Oromo Wikipedia is a free encyclopedia. Content available under
              Creative Commons Attribution-ShareAlike License.
            </p>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} Oromo Wikipedia. All rights reserved.
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
    fontFamily: "'Inter', 'Poppins', sans-serif",
    backgroundColor: "#f8f9fa",
  },

  header: {
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
    position: "relative",
  },
  headerOverlay: {
    padding: "60px 20px",
    textAlign: "center",
  },
  headerContent: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  logo: {
    fontSize: "clamp(2.5rem, 8vw, 4rem)",
    margin: "0 0 15px",
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
    color: "rgba(255,255,255,0.9)",
    marginBottom: "40px",
  },

  searchWrapper: {
    display: "flex",
    gap: "15px",
    maxWidth: "700px",
    margin: "0 auto 40px",
  },
  searchContainer: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#999",
    fontSize: "1.2rem",
  },
  searchInput: {
    width: "100%",
    padding: "18px 20px 18px 50px",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    outline: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  createButton: {
    padding: "18px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    textDecoration: "none",
    borderRadius: "50px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 20px rgba(201,162,39,0.3)",
  },

  quickStats: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap",
  },
  quickStat: {
    textAlign: "center",
  },
  quickStatNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#C9A227",
  },
  quickStatLabel: {
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.8)",
  },

  langBar: {
    background: "white",
    borderBottom: "1px solid #eaeef2",
    padding: "15px 20px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  langContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    overflowX: "auto",
  },
  langLabel: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  langButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  langButton: {
    background: "transparent",
    border: "1px solid #eaeef2",
    borderRadius: "30px",
    padding: "8px 16px",
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
  langName: {},
  langCount: {
    fontSize: "0.8rem",
    color: "#5a6a7a",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr 300px",
    gap: "25px",
    maxWidth: "1400px",
    margin: "40px auto",
    padding: "0 20px",
  },

  leftSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  rightSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  welcomeCard: {
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
    borderRadius: "16px",
    padding: "25px",
    color: "white",
  },
  welcomeTitle: {
    fontSize: "1.3rem",
    margin: "0 0 10px",
  },
  welcomeText: {
    fontSize: "0.95rem",
    opacity: 0.9,
    lineHeight: 1.6,
    margin: "0 0 15px",
  },
  helpLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },

  sectionCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    margin: "0 0 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#0F3D2E",
  },
  sectionIcon: {
    color: "#C9A227",
  },

  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "all 0.3s ease",
  },
  categoryActive: {
    background: "#C9A22720",
    borderLeft: "3px solid #C9A227",
  },
  categoryIcon: {
    fontSize: "1.2rem",
    width: "24px",
  },
  categoryName: {
    flex: 1,
    fontSize: "0.95rem",
    color: "#1a2639",
  },
  categoryCount: {
    fontSize: "0.85rem",
    color: "#a0aec0",
  },

  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  featuredSection: {
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  featuredTitle: {
    fontSize: "1.5rem",
    margin: "0 0 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#0F3D2E",
  },
  featuredIcon: {
    color: "#C9A227",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  featuredCard: {
    background: "#f8f9fa",
    borderRadius: "12px",
    overflow: "hidden",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
  featuredCardHeader: {
    background: "linear-gradient(135deg, #C9A22720, #C9A22740)",
    padding: "20px",
    textAlign: "center",
  },
  featuredEmoji: {
    fontSize: "3rem",
  },
  featuredCardBody: {
    padding: "20px",
  },
  featuredCardTitle: {
    fontSize: "1.2rem",
    margin: "0 0 10px",
    color: "#0F3D2E",
  },
  featuredCardDesc: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    margin: "0 0 15px",
    lineHeight: 1.6,
  },
  featuredCardMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
  },
  featuredCardCategory: {
    color: "#C9A227",
  },
  featuredCardViews: {
    color: "#a0aec0",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  articlesSection: {
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  articlesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  articlesTitle: {
    fontSize: "1.5rem",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#0F3D2E",
  },
  articlesIcon: {
    color: "#C9A227",
  },
  articlesCount: {
    fontSize: "0.9rem",
    color: "#a0aec0",
  },
  articlesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#a0aec0",
  },

  articleCard: {
    background: "#f8f9fa",
    borderRadius: "12px",
    overflow: "hidden",
    textDecoration: "none",
    transition: "all 0.3s ease",
    border: "1px solid #eaeef2",
  },
  articleCardContent: {
    padding: "20px",
  },
  articleCardTitle: {
    fontSize: "1.1rem",
    margin: "0 0 10px",
    color: "#0F3D2E",
  },
  articleCardDesc: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
    margin: "0 0 15px",
    lineHeight: 1.5,
  },
  articleCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
    fontSize: "0.85rem",
    flexWrap: "wrap",
  },
  articleCardAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#0F3D2E",
  },
  authorIcon: {
    color: "#C9A227",
  },
  articleCardStats: {
    display: "flex",
    gap: "15px",
    color: "#a0aec0",
    flexWrap: "wrap",
  },
  articleCardCategories: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  articleCardCategory: {
    background: "#eaeef2",
    color: "#5a6a7a",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
  },
  articleCardCategoryMore: {
    color: "#a0aec0",
    fontSize: "0.75rem",
  },

  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  skeletonCard: {
    background: "#f8f9fa",
    borderRadius: "12px",
    padding: "20px",
    animation: "pulse 1.5s infinite",
  },
  skeletonImage: {
    height: "40px",
    background: "#eaeef2",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  skeletonTitle: {
    height: "20px",
    background: "#eaeef2",
    borderRadius: "4px",
    marginBottom: "10px",
    width: "70%",
  },
  skeletonText: {
    height: "60px",
    background: "#eaeef2",
    borderRadius: "4px",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  pageButton: {
    padding: "10px 20px",
    border: "1px solid #eaeef2",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "0.95rem",
    color: "#5a6a7a",
  },

  trendingList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  trendingItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    textDecoration: "none",
    borderRadius: "8px",
  },
  trendingRank: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#C9A227",
    minWidth: "30px",
  },
  trendingTitle: {
    flex: 1,
    fontSize: "0.95rem",
    color: "#1a2639",
  },
  trendingViews: {
    fontSize: "0.8rem",
    color: "#a0aec0",
  },

  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recentItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px",
    textDecoration: "none",
    borderRadius: "8px",
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: "0.95rem",
    color: "#1a2639",
    marginBottom: "4px",
  },
  recentDate: {
    fontSize: "0.8rem",
    color: "#a0aec0",
  },
  recentArrow: {
    color: "#C9A227",
    fontSize: "0.9rem",
  },

  popularList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  popularItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    textDecoration: "none",
    borderRadius: "8px",
  },
  popularRank: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#C9A227",
    minWidth: "25px",
  },
  popularContent: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  popularTitle: {
    fontSize: "0.95rem",
    color: "#1a2639",
  },
  popularViews: {
    fontSize: "0.8rem",
    color: "#a0aec0",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  communityLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  communityLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    background: "#f8f9fa",
    textDecoration: "none",
    color: "#1a2639",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  communityIcon: {
    fontSize: "1.1rem",
  },

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
    gap: "30px",
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
    margin: "5px 0",
  },
};

const existingStyleTagId = "oromo-wikipedia-page-styles";

if (!document.getElementById(existingStyleTagId)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = existingStyleTagId;
  styleSheet.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    @media (max-width: 1024px) {
      .mainGrid {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 768px) {
      .featuredGrid,
      .articlesGrid {
        grid-template-columns: 1fr !important;
      }

      .searchWrapper {
        flex-direction: column !important;
      }

      .quickStats {
        gap: 20px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}