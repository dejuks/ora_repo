import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [publishedItems, setPublishedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    books: "0",
    journals: "0",
    archives: "0",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fallbackCategories = [
    { name: "Academic Texts", count: "0", icon: "📚", color: "#C9A227" },
    { name: "Historical Archives", count: "0", icon: "📜", color: "#2E86AB" },
    { name: "Cultural Collection", count: "0", icon: "🏛️", color: "#A569BD" },
    { name: "Language Resources", count: "0", icon: "🔤", color: "#27AE60" },
    { name: "Rare Books", count: "0", icon: "📖", color: "#E67E22" },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadLibraryLanding() {
      try {
        setLoading(true);
        setError("");

        const [catalogRes, categoriesRes] = await Promise.allSettled([
          fetch(
            `${API_BASE}/library/catalog?status=published&per_page=12`,
            {
              headers: { Accept: "application/json" },
            }
          ),
          fetch(`${API_BASE}/library/categories`, {
            headers: { Accept: "application/json" },
          }),
        ]);

        let catalogData = [];
        let categoriesData = [];

        if (
          catalogRes.status === "fulfilled" &&
          catalogRes.value &&
          catalogRes.value.ok
        ) {
          const json = await catalogRes.value.json();
          catalogData = normalizeCatalogResponse(json);
        }

        if (
          categoriesRes.status === "fulfilled" &&
          categoriesRes.value &&
          categoriesRes.value.ok
        ) {
          const json = await categoriesRes.value.json();
          categoriesData = normalizeCategoriesResponse(json);
        }

        if (!mounted) return;

        const publishedOnly = catalogData.filter(
          (item) =>
            String(item.status || "").toLowerCase() === "published" ||
            item.is_published === true ||
            item.visibility === "public" ||
            item.access_level === "public" ||
            !item.status
        );

        const mappedPublished = publishedOnly.map(mapCatalogItemToCard);
        const mappedRecent = [...publishedOnly]
          .sort((a, b) => {
            const aDate = new Date(
              a.created_at || a.updated_at || a.published_at || 0
            ).getTime();
            const bDate = new Date(
              b.created_at || b.updated_at || b.published_at || 0
            ).getTime();
            return bDate - aDate;
          })
          .slice(0, 6)
          .map(mapCatalogItemToRecentCard);

        const mappedCategories =
          categoriesData.length > 0
            ? categoriesData.map((cat, index) => ({
                name: cat.name || "Uncategorized",
                count: String(cat.material_count || cat.count || 0),
                icon: pickCategoryIcon(cat.name),
                color: pickCategoryColor(index),
              }))
            : fallbackCategories;

        const computedStats = computeStats(publishedOnly);

        setPublishedItems(mappedPublished);
        setRecentItems(mappedRecent);
        setCategories(mappedCategories);
        setStats(computedStats);
      } catch (err) {
        if (!mounted) return;
        console.error("Library landing load error:", err);
        setError("Failed to load published library contents.");
        setCategories(fallbackCategories);
        setPublishedItems([]);
        setRecentItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLibraryLanding();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPublishedItems = useMemo(() => {
    let items = [...publishedItems];

    if (activeCategory !== "all") {
      items = items.filter(
        (item) =>
          String(item.category || "").toLowerCase() ===
          String(activeCategory).toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return items;
  }, [publishedItems, activeCategory, searchQuery]);

  return (
    <>
      <Navbar />
      <div style={styles.container}>
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
              Access published physical and digital resources on Oromo history,
              culture, language, and academic research
            </p>

            <div style={styles.searchContainer}>
              <div style={styles.searchWrapper}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search published books, journals..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Link
                to={`/library/opac${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
                style={{ ...styles.searchButton, textDecoration: "none" }}
              >
                <span style={styles.searchButtonText}>Search</span>
                <span style={styles.searchButtonIcon}>→</span>
              </Link>
            </div>

            <div style={styles.statsContainer}>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>{stats.books}</span>
                  <span style={styles.statLabel}>Books</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statNumber}>{stats.journals}</span>
                  <span style={styles.statLabel}>Journals</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statNumber}>{stats.archives}</span>
                  <span style={styles.statLabel}>Archives</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.actionsSection}>
          <h2 style={styles.sectionTitleSmall}>Quick Actions</h2>
          <div style={styles.actionsScroll}>
            <div style={styles.actionsGrid}>
              <Link to="/library/opac" style={styles.actionCard}>
                <span style={styles.actionIcon}>📋</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Browse</h3>
                  <p style={styles.actionDesc}>Find published items</p>
                </div>
              </Link>

              <Link to="/library/new" style={styles.actionCard}>
                <span style={styles.actionIcon}>🆕</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>New Items</h3>
                  <p style={styles.actionDesc}>Recently published</p>
                </div>
              </Link>

              <Link to="/library/categories" style={styles.actionCard}>
                <span style={styles.actionIcon}>📚</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Categories</h3>
                  <p style={styles.actionDesc}>Browse by topic</p>
                </div>
              </Link>

              <Link to="/library/digital" style={styles.actionCard}>
                <span style={styles.actionIcon}>💻</span>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>Digital</h3>
                  <p style={styles.actionDesc}>Public resources</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.categoriesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Browse by <span style={styles.gradient}>Category</span>
            </h2>
            <Link to="/library/categories" style={styles.viewAllLink}>
              View All →
            </Link>
          </div>

          <div style={styles.categoryFilterRow}>
            <button
              onClick={() => setActiveCategory("all")}
              style={{
                ...styles.filterChip,
                ...(activeCategory === "all" ? styles.filterChipActive : {}),
              }}
            >
              All
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                style={{
                  ...styles.filterChip,
                  ...(activeCategory === cat.name
                    ? styles.filterChipActive
                    : {}),
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link
                to={`/library/category/${encodeURIComponent(cat.name)}`}
                key={cat.name}
                style={styles.categoryCard}
              >
                <div
                  style={{
                    ...styles.categoryIcon,
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
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

        <section style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Published <span style={styles.gradient}>Contents</span>
            </h2>
            <Link to="/library/opac" style={styles.viewAllLink}>
              See All →
            </Link>
          </div>

          {loading ? (
            <div style={styles.emptyCard}>Loading published contents...</div>
          ) : error ? (
            <div style={styles.emptyCard}>{error}</div>
          ) : filteredPublishedItems.length === 0 ? (
            <div style={styles.emptyCard}>No published contents found.</div>
          ) : (
            <div style={styles.featuredGrid}>
              {filteredPublishedItems.slice(0, 8).map((book) => (
                <div key={book.id} style={styles.bookCard}>
                  <div style={styles.bookHeader}>
                    <span style={styles.bookIcon}>{book.icon}</span>
                    <span style={styles.bookStatus}>{book.status}</span>
                  </div>

                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>By {book.author}</p>

                  <div style={styles.bookDetails}>
                    <span style={styles.bookCopies}>📚 {book.copies}</span>
                    <span style={styles.bookLocation}>🏷️ {book.category}</span>
                  </div>

                  <div style={styles.bookActions}>
                    <Link
                      to={book.link}
                      style={{
                        ...styles.borrowBtn,
                        textDecoration: "none",
                        textAlign: "center",
                      }}
                    >
                      <span>View</span>
                    </Link>

                    <Link to={book.link} style={styles.detailsLink}>
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Recently <span style={styles.gradient}>Published</span>
            </h2>
            <Link to="/library/new" style={styles.viewAllLink}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={styles.emptyCard}>Loading recent publications...</div>
          ) : recentItems.length === 0 ? (
            <div style={styles.emptyCard}>No recent published items.</div>
          ) : (
            <div style={styles.recentGrid}>
              {recentItems.map((book) => (
                <Link to={book.link} key={book.id} style={styles.recentCard}>
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
          )}
        </section>

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

        <section style={styles.membershipSection}>
          <div style={styles.membershipContainer}>
            <h2 style={styles.membershipTitle}>Explore the Library</h2>
            <p style={styles.membershipText}>
              Browse publicly available published contents and discover new
              Oromo knowledge resources
            </p>
            <div style={styles.membershipButtons}>
              <Link
                to="/library/opac"
                style={{ ...styles.registerBtn, textDecoration: "none" }}
              >
                Browse Published Content
                <span style={styles.btnArrow}>→</span>
              </Link>
              <Link
                to="/library/categories"
                style={{ ...styles.learnBtn, textDecoration: "none", textAlign: "center" }}
              >
                Learn More
              </Link>
            </div>
            <div style={styles.membershipBenefits}>
              <span style={styles.benefitItem}>✓ Public published catalog</span>
              <span style={styles.benefitItem}>✓ Digital access where allowed</span>
              <span style={styles.benefitItem}>✓ Research-friendly discovery</span>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <p style={styles.footerText}>
              © 2026 Oromo Researcher Association Library
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

function normalizeCatalogResponse(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  return [];
}

function normalizeCategoriesResponse(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  return [];
}

function mapCatalogItemToCard(item, index) {
  const id = item.material_id || item.id || item.uuid || index;
  const title = item.title || item.name || "Untitled";
  const author = buildAuthor(item);
  const category =
    item.category_name ||
    item.category ||
    item.material_type_name ||
    item.type ||
    "General";
  const copies = item.available_copies
    ? `${item.available_copies} available`
    : item.copy_count
      ? `${item.copy_count} copies`
      : "Published";
  const status = "Published";

  return {
    id,
    title,
    author,
    category,
    copies,
    status,
    icon: pickMaterialIcon(item),
    link: `/library/book/${id}`,
  };
}

function mapCatalogItemToRecentCard(item, index) {
  const id = item.material_id || item.id || item.uuid || index;
  return {
    id,
    title: item.title || item.name || "Untitled",
    author: buildAuthor(item),
    date: formatRecentDate(
      item.published_at || item.created_at || item.updated_at
    ),
    icon: pickMaterialIcon(item),
    link: `/library/book/${id}`,
  };
}

function buildAuthor(item) {
  if (Array.isArray(item.authors) && item.authors.length > 0) {
    return item.authors.join(", ");
  }
  if (item.author) return item.author;
  if (item.author_name) return item.author_name;
  if (item.creator) return item.creator;
  if (item.publisher_name) return item.publisher_name;
  return "Unknown Author";
}

function pickMaterialIcon(item) {
  const type = String(
    item.material_format || item.type || item.material_type_name || ""
  ).toLowerCase();

  if (type.includes("journal")) return "📙";
  if (type.includes("archive")) return "📜";
  if (type.includes("digital")) return "💻";
  if (type.includes("book")) return "📘";
  return "📚";
}

function pickCategoryIcon(name = "") {
  const n = String(name).toLowerCase();
  if (n.includes("history")) return "📜";
  if (n.includes("culture")) return "🏛️";
  if (n.includes("language")) return "🔤";
  if (n.includes("archive")) return "🗂️";
  if (n.includes("rare")) return "📖";
  return "📚";
}

function pickCategoryColor(index) {
  const colors = ["#C9A227", "#2E86AB", "#A569BD", "#27AE60", "#E67E22", "#E74C3C"];
  return colors[index % colors.length];
}

function computeStats(items) {
  const books = items.filter((x) =>
    String(x.material_format || x.type || "").toLowerCase().includes("book")
  ).length;

  const journals = items.filter((x) =>
    String(x.material_format || x.type || "").toLowerCase().includes("journal")
  ).length;

  const archives = items.filter((x) =>
    String(x.material_format || x.type || "").toLowerCase().includes("archive")
  ).length;

  return {
    books: formatCompactNumber(books || items.length),
    journals: formatCompactNumber(journals),
    archives: formatCompactNumber(archives),
  };
}

function formatCompactNumber(num) {
  if (!num) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function formatRecentDate(dateValue) {
  if (!dateValue) return "Recently published";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently published";
  return `Published ${date.toLocaleDateString()}`;
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#ffffff",
  },
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
    inset: 0,
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
  badgeIcon: { fontSize: "1rem" },
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
  searchButtonText: { flex: 1 },
  searchButtonIcon: { fontSize: "1.2rem" },
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
  stat: { textAlign: "center", minWidth: "70px" },
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
  statLabel: { fontSize: "0.8rem", opacity: 0.9 },
  actionsSection: { padding: "24px 16px" },
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
  actionIcon: { fontSize: "2rem", display: "block" },
  actionContent: { textAlign: "center" },
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
  categoriesSection: { padding: "24px 16px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    padding: "0 4px",
    gap: "12px",
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
    whiteSpace: "nowrap",
  },
  categoryFilterRow: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    padding: "0 4px 16px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  filterChip: {
    border: "1px solid #d9e2ea",
    background: "#fff",
    color: "#1a2639",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  filterChipActive: {
    background: "#0F3D2E",
    color: "#fff",
    borderColor: "#0F3D2E",
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
  categoryContent: { flex: 1, minWidth: 0 },
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
  bookIcon: { fontSize: "2.2rem" },
  bookStatus: {
    padding: "6px 12px",
    borderRadius: "30px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
    backgroundColor: "#27AE60",
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
  bookCopies: { color: "#27AE60" },
  bookLocation: { color: "#2E86AB" },
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
  recentSection: { padding: "32px 16px" },
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
  recentInfo: { flex: 1, minWidth: 0 },
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
  btnArrow: { fontSize: "1.2rem" },
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
  emptyCard: {
    marginTop: "16px",
    padding: "20px",
    borderRadius: "20px",
    background: "#fff",
    border: "1px solid #eaeef2",
    color: "#5a6a7a",
  },
};