// src/ebook/pages/EbookHomePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function EbookHomePage() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({ items: "12K+", downloads: "1.8M", contributors: "980+" });

  const categories = useMemo(
    () => [
      { name: "New Submissions", count: "1.2K", icon: "🆕", color: "#2E86AB", to: "/ebook/submissions" },
      { name: "Under Review", count: "620", icon: "🕵️", color: "#C9A227", to: "/ebook/under-review" },
      { name: "Accepted", count: "310", icon: "✅", color: "#27AE60", to: "/ebook/accepted" },
      { name: "Published", count: "4.9K", icon: "📚", color: "#8E44AD", to: "/ebook/published" },
      { name: "Guidelines", count: "—", icon: "📌", color: "#E67E22", to: "/author-guide" },
    ],
    []
  );

  const featuredItems = useMemo(
    () => [
      { title: "AI for Low-Resource Languages", author: "Temam Aman", downloads: "12.4K", icon: "🤖", id: "demo-1" },
      { title: "Water Quality Monitoring in Ethiopia", author: "Dr. Hana Bekele", downloads: "9.1K", icon: "💧", id: "demo-2" },
      { title: "Blockchain for Academic Publishing", author: "Prof. Dawit Girma", downloads: "7.8K", icon: "⛓️", id: "demo-3" },
      { title: "Open Science & Peer Review", author: "Journal Editorial Team", downloads: "15.2K", icon: "🔎", id: "demo-4" },
    ],
    []
  );

  const quickLinks = useMemo(
    () => [
      { title: "Submit Manuscript", desc: "Start a new submission in minutes", icon: "📤", to: "/ebook/submit", tone: "primary", auth: true },
      { title: "My Submissions", desc: "Track status & history", icon: "🗂️", to: "/ebook/my-submissions", tone: "info", auth: true },
      { title: "My Drafts", desc: "Continue unfinished work", icon: "✍️", to: "/ebook/drafts", tone: "warning", auth: true },
      { title: "Help & Support", desc: "FAQs and contact", icon: "🛟", to: "/faq", tone: "success", auth: false },
    ],
    []
  );

  // ✅ basic auth check
  const isLoggedIn = () => {
    try {
      const token = localStorage.getItem("token");
      return !!token;
    } catch {
      return false;
    }
  };

  // ✅ redirect to author login and remember destination
  const goProtected = (to) => {
    if (isLoggedIn()) {
      nav(to);
      return;
    }
    // store next path so login can redirect back
    try {
      localStorage.setItem("ebook_next", to);
    } catch {}

    // also pass as query param (works even if storage blocked)
    nav(`/author/login?next=${encodeURIComponent(to)}`);
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    nav(`/ebook/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  useEffect(() => {
    // optional: load public stats
  }, []);

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <span style={styles.badge}>📘 eBook Publishing Platform</span>

            <h1 style={styles.title}>
              Digital <span style={styles.gradient}>Publishing</span> Workflow
            </h1>

            <p style={styles.subtitle}>
              Submit manuscripts, track peer review, manage revisions, and publish validated research — all in one modern workflow.
            </p>

            {/* Search */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search manuscripts by title, keyword, author..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button style={styles.searchButton} onClick={handleSearch}>
                🔍 Search
              </button>
              
            </div>

            {/* CTA (protected) */}
            <div style={styles.ctaRow}>
              <button
                type="button"
                onClick={() => goProtected("/ebook/submit")}
                style={styles.ctaPrimaryBtn}
              >
                🚀 Submit Manuscript
              </button>

              <button
                type="button"
                onClick={() => goProtected("/ebook/my-submissions")}
                style={styles.ctaSecondaryBtn}
              >
                📌 Track My Submissions
              </button>
            </div>

            {/* Stats */}
            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.items}</span>
                <span style={styles.statLabel}>Manuscripts</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.downloads}</span>
                <span style={styles.statLabel}>Downloads</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{stats.contributors}</span>
                <span style={styles.statLabel}>Contributors</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={styles.quickSection}>
          <h2 style={styles.sectionTitle}>
            Quick <span style={styles.gradient}>Actions</span>
          </h2>

          <div style={styles.quickGrid}>
            {quickLinks.map((x) =>
              x.auth ? (
                <button
                  key={x.title}
                  type="button"
                  onClick={() => goProtected(x.to)}
                  style={{ ...styles.quickCard, cursor: "pointer", textAlign: "left" }}
                >
                  <div style={styles.quickCardTop}>
                    <div style={styles.quickIcon}>{x.icon}</div>
                    <span style={{ ...styles.quickPill, ...tonePill(x.tone) }}>{x.title}</span>
                  </div>
                  <div style={styles.quickDesc}>{x.desc}</div>
                  <div style={styles.quickArrow}>Open →</div>
                </button>
              ) : (
                <Link key={x.title} to={x.to} style={styles.quickCard}>
                  <div style={styles.quickCardTop}>
                    <div style={styles.quickIcon}>{x.icon}</div>
                    <span style={{ ...styles.quickPill, ...tonePill(x.tone) }}>{x.title}</span>
                  </div>
                  <div style={styles.quickDesc}>{x.desc}</div>
                  <div style={styles.quickArrow}>Open →</div>
                </Link>
              )
            )}
          </div>
        </section>

        {/* Browse by Stage */}
        <section style={styles.categoriesSection}>
          <h2 style={styles.sectionTitle}>
            Browse by <span style={styles.gradient}>Stage</span>
          </h2>

          <div style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link to={cat.to} key={cat.name} style={styles.categoryCard}>
                <div
                  style={{
                    ...styles.categoryIcon,
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
                  {cat.icon}
                </div>
                <h3 style={styles.categoryName}>{cat.name}</h3>
                <p style={styles.categoryCount}>{cat.count === "—" ? "View" : `${cat.count} items`}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section style={styles.featuredSection}>
          <h2 style={styles.sectionTitle}>
            Featured <span style={styles.pink}>eBooks</span>
          </h2>

          <div style={styles.featuredGrid}>
            {featuredItems.map((item, index) => (
              <div key={index} style={styles.featuredCard}>
                <span style={styles.itemIcon}>{item.icon}</span>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemAuthor}>{item.author}</p>
                <div style={styles.itemFooter}>
                  <span style={styles.itemDownloads}>⬇️ {item.downloads} downloads</span>
                  <Link to={`/ebook/published/${item.id}`} style={styles.viewLink}>
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Workflow */}
        <section style={styles.workflowSection}>
          <div style={styles.workflowWrap}>
            <h2 style={styles.workflowTitle}>How Publishing Works</h2>

            <div style={styles.workflowGrid}>
              <div style={styles.workflowCard}>
                <div style={styles.workflowStep}>1</div>
                <h4 style={styles.workflowCardTitle}>Submit</h4>
                <p style={styles.workflowCardText}>Upload manuscript, add title, abstract, and keywords.</p>
              </div>
              <div style={styles.workflowCard}>
                <div style={styles.workflowStep}>2</div>
                <h4 style={styles.workflowCardTitle}>Screening</h4>
                <p style={styles.workflowCardText}>Editorial scope check and initial assessment.</p>
              </div>
              <div style={styles.workflowCard}>
                <div style={styles.workflowStep}>3</div>
                <h4 style={styles.workflowCardTitle}>Peer Review</h4>
                <p style={styles.workflowCardText}>Reviewers accept/decline, submit feedback & recommendation.</p>
              </div>
              <div style={styles.workflowCard}>
                <div style={styles.workflowStep}>4</div>
                <h4 style={styles.workflowCardTitle}>Decision</h4>
                <p style={styles.workflowCardText}>Accept, request revision, or reject based on evaluations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute */}
        <section style={styles.contributeSection}>
          <div style={styles.contributeContainer}>
            <h2 style={styles.contributeTitle}>Ready to Publish?</h2>
            <p style={styles.contributeText}>Start your submission, track the workflow, and reach publication faster.</p>
            <div style={styles.contributeButtons}>
              <button type="button" onClick={() => goProtected("/ebook/submit")} style={styles.primaryButtonBtn}>
                Start Submission →
              </button>
              <Link to="/author-guide" style={{ ...styles.secondaryButton, textDecoration: "none" }}>
                Author Guidelines
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>© {new Date().getFullYear()} eBook Publishing Platform. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

function tonePill(tone) {
  const map = {
    primary: { background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" },
    info: { background: "rgba(46,134,171,0.18)", border: "1px solid rgba(46,134,171,0.25)" },
    warning: { background: "rgba(201,162,39,0.20)", border: "1px solid rgba(201,162,39,0.28)" },
    success: { background: "rgba(39,174,96,0.18)", border: "1px solid rgba(39,174,96,0.24)" },
  };
  return map[tone] || map.primary;
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#ffffff",
  },

  hero: {
    position: "relative",
    minHeight: "72vh",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 55%, #2E86AB 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10) 0%, transparent 32%),
      radial-gradient(circle at 85% 65%, rgba(46,134,171,0.22) 0%, transparent 42%)
    `,
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "900px",
    padding: "0 20px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 18px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    fontSize: "0.9rem",
    marginBottom: "18px",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  title: {
    fontSize: "clamp(2rem, 6vw, 3.6rem)",
    fontWeight: "800",
    margin: "0 0 14px",
    lineHeight: 1.15,
    letterSpacing: "-0.5px",
  },
  gradient: {
    background: "linear-gradient(135deg, #F5D76E, #FFFFFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  pink: {
    background: "linear-gradient(135deg, #FF6B9E, #FFFFFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "1.08rem",
    lineHeight: 1.6,
    margin: "0 auto 28px",
    opacity: 0.96,
    maxWidth: "680px",
  },

  searchContainer: { display: "flex", gap: "10px", maxWidth: "660px", margin: "0 auto 18px" },
  searchInput: {
    flex: 1,
    padding: "15px 20px",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    outline: "none",
    boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
  },
  searchButton: {
    padding: "15px 28px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
  },

  ctaRow: { display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 26 },

  // ✅ buttons instead of Link (so we can guard)
  ctaPrimaryBtn: {
    padding: "12px 22px",
    borderRadius: "999px",
    background: "#C9A227",
    color: "#0F3D2E",
    fontWeight: 800,
    boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
    border: "none",
    cursor: "pointer",
  },
  ctaSecondaryBtn: {
    padding: "12px 22px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    color: "white",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.22)",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
  },

  stats: { display: "flex", gap: "42px", justifyContent: "center", flexWrap: "wrap" },
  stat: { textAlign: "center", minWidth: 120 },
  statNumber: { display: "block", fontSize: "1.85rem", fontWeight: "800", marginBottom: "4px" },
  statLabel: { fontSize: "0.9rem", opacity: 0.92 },

  quickSection: { padding: "62px 20px", maxWidth: "92%", margin: "0 auto" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  quickCard: {
    background: "linear-gradient(135deg, #0F3D2E, #1A5439)",
    color: "white",
    borderRadius: 18,
    padding: 18,
    textDecoration: "none",
    border: "1px solid rgba(15,61,46,0.12)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
    transition: "transform 0.25s ease",
    appearance: "none",
    width: "100%",
    borderColor: "rgba(15,61,46,0.12)",
  },
  quickCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  quickIcon: { fontSize: 26 },
  quickPill: { padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "white" },
  quickDesc: { opacity: 0.92, fontSize: 13, lineHeight: 1.45, marginBottom: 12 },
  quickArrow: { fontWeight: 800, color: "#F5D76E" },

  categoriesSection: { padding: "10px 20px 62px", maxWidth: "92%", margin: "0 auto" },
  sectionTitle: { fontSize: "2rem", fontWeight: "800", textAlign: "center", margin: "0 0 38px" },
  categoriesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 },
  categoryCard: {
    background: "#f8f9fa",
    padding: "24px",
    borderRadius: "16px",
    textAlign: "center",
    textDecoration: "none",
    transition: "transform 0.25s ease",
    border: "1px solid #eaeef2",
  },
  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 14px",
  },
  categoryName: { fontSize: "1.06rem", margin: "0 0 6px", color: "#1a2639", fontWeight: 800 },
  categoryCount: { fontSize: "0.9rem", color: "#5a6a7a", margin: 0 },

  featuredSection: { padding: "62px 20px", background: "#f8f9fa" },
  featuredGrid: { maxWidth: "92%", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 },
  featuredCard: {
    background: "white",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #eaeef2",
    transition: "transform 0.25s ease",
    boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
  },
  itemIcon: { fontSize: "2.4rem", display: "block", marginBottom: 12 },
  itemTitle: { fontSize: "1.08rem", margin: "0 0 6px", color: "#1a2639", fontWeight: 800 },
  itemAuthor: { fontSize: "0.88rem", color: "#5a6a7a", margin: "0 0 14px" },
  itemFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemDownloads: { fontSize: "0.88rem", color: "#2E86AB", fontWeight: 700 },
  viewLink: { color: "#C9A227", textDecoration: "none", fontSize: "0.92rem", fontWeight: "800" },

  workflowSection: { padding: "62px 20px", maxWidth: "92%", margin: "0 auto" },
  workflowWrap: {
    borderRadius: 18,
    padding: 26,
    border: "1px solid #eaeef2",
    background: "linear-gradient(180deg, #ffffff, #fbfcfd)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
  },
  workflowTitle: { textAlign: "center", fontSize: "1.9rem", fontWeight: 900, margin: "0 0 22px", color: "#1a2639" },
  workflowGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  workflowCard: { padding: 18, borderRadius: 16, border: "1px solid #eef2f5", background: "#fff" },
  workflowStep: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    background: "rgba(201,162,39,0.16)",
    color: "#0F3D2E",
    marginBottom: 10,
  },
  workflowCardTitle: { margin: "0 0 6px", fontWeight: 900, color: "#1a2639" },
  workflowCardText: { margin: 0, color: "#5a6a7a", fontSize: 14, lineHeight: 1.5 },

  contributeSection: { padding: "62px 20px", background: "linear-gradient(135deg, #0F3D2E, #1A5439)", textAlign: "center" },
  contributeContainer: { maxWidth: 640, margin: "0 auto", color: "white" },
  contributeTitle: { fontSize: "2rem", fontWeight: 900, margin: "0 0 12px" },
  contributeText: { fontSize: "1.05rem", margin: "0 0 26px", opacity: 0.92 },
  contributeButtons: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },

  primaryButtonBtn: {
    padding: "12px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 30px",
    background: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: 800,
    cursor: "pointer",
  },

  footer: { padding: "30px 20px", background: "#0a1f17", textAlign: "center" },
  footerText: { color: "white", opacity: 0.75, fontSize: "0.92rem", margin: 0 },
};