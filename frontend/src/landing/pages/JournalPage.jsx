import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");

  const journalStats = [
    { label: "ISSN", value: "1234-5678 (Print) | 2345-6789 (Online)" },
    { label: "Impact Factor", value: "4.2" },
    { label: "Acceptance Rate", value: "18%" },
    { label: "Time to First Decision", value: "21 days" },
    { label: "Indexing", value: "Scopus, Web of Science, DOAJ" },
    { label: "Open Access", value: "Since 2015" },
  ];

  const recentArticles = [
    {
      id: 1,
      title: "Oral Traditions and Historical Narratives: Preserving Oromo Heritage Through Digital Archives",
      authors: "Dr. Abdi Mohammed, Prof. Fatuma Hassan",
      date: "March 15, 2024",
      views: 1245,
      citations: 8,
      category: "Cultural Studies",
      abstract: "This study examines the preservation of Oromo oral traditions through digital archiving methods...",
      doi: "10.1234/orj.2024.001",
      openAccess: true
    },
    {
      id: 2,
      title: "Indigenous Knowledge Systems in Oromo Agricultural Practices: A Systematic Review",
      authors: "Dr. Tsegaye Bekele, Sara Ahmed",
      date: "February 28, 2024",
      views: 987,
      citations: 5,
      category: "Agriculture",
      abstract: "A comprehensive review of traditional Oromo farming techniques and their modern applications...",
      doi: "10.1234/orj.2024.002",
      openAccess: true
    },
    {
      id: 3,
      title: "Language Preservation Through Technology: Developing Oromo Language Processing Tools",
      authors: "Prof. Lemma Dibaba, Dr. Helen Williams",
      date: "January 10, 2024",
      views: 1567,
      citations: 12,
      category: "Linguistics",
      abstract: "Exploring computational approaches to preserving and promoting the Oromo language...",
      doi: "10.1234/orj.2024.003",
      openAccess: false
    },
    {
      id: 4,
      title: "Women's Leadership in Oromo Society: Historical Perspectives and Contemporary Challenges",
      authors: "Dr. Aisha Mohammed, Prof. Sarah Johnson",
      date: "December 5, 2023",
      views: 876,
      citations: 4,
      category: "Gender Studies",
      abstract: "An analysis of women's roles in Oromo social and political structures throughout history...",
      doi: "10.1234/orj.2024.004",
      openAccess: true
    },
    {
      id: 5,
      title: "Climate Change Adaptation Strategies in Oromo Pastoral Communities",
      authors: "Dr. Gemechu Kebede, Michael Chen",
      date: "November 20, 2023",
      views: 1102,
      citations: 7,
      category: "Environmental Studies",
      abstract: "Examining traditional and modern approaches to climate adaptation among Oromo pastoralists...",
      doi: "10.1234/orj.2024.005",
      openAccess: true
    },
    {
      id: 6,
      title: "The Gadaa System: Democratic Principles in Traditional Oromo Governance",
      authors: "Prof. Asafa Jalata, Dr. Miriam Cohen",
      date: "October 15, 2023",
      views: 2345,
      citations: 23,
      category: "Political Science",
      abstract: "A comprehensive analysis of the Gadaa system and its relevance to modern democratic practices...",
      doi: "10.1234/orj.2024.006",
      openAccess: true
    }
  ];

  const specialIssues = [
    {
      title: "Oromo Diaspora: Identity, Culture, and Integration",
      editor: "Dr. Elizabeth Wilson",
      deadline: "June 30, 2024",
      submissions: 12,
      status: "Open"
    },
    {
      title: "Traditional Medicine and Healthcare in Oromo Communities",
      editor: "Prof. Tekle Mariam",
      deadline: "August 15, 2024",
      submissions: 8,
      status: "Open"
    },
    {
      title: "Oromo Literature and Contemporary Writing",
      editor: "Dr. Abdulaziz Ali",
      deadline: "September 30, 2024",
      submissions: 15,
      status: "Open"
    }
  ];

  const editorialBoard = [
    {
      name: "Prof. Mohammed Hassan",
      role: "Editor-in-Chief",
      institution: "Addis Ababa University",
      country: "Ethiopia",
      expertise: "Cultural Anthropology"
    },
    {
      name: "Dr. Sarah Williams",
      role: "Senior Editor",
      institution: "Oxford University",
      country: "UK",
      expertise: "Linguistics"
    },
    {
      name: "Prof. Tekle Berhan",
      role: "Associate Editor",
      institution: "University of Toronto",
      country: "Canada",
      expertise: "History"
    },
    {
      name: "Dr. Fatima Ahmed",
      role: "Associate Editor",
      institution: "Cairo University",
      country: "Egypt",
      expertise: "Islamic Studies"
    },
    {
      name: "Prof. John Smith",
      role: "Editorial Board Member",
      institution: "Harvard University",
      country: "USA",
      expertise: "Political Science"
    },
    {
      name: "Dr. Elena Petrova",
      role: "Editorial Board Member",
      institution: "Max Planck Institute",
      country: "Germany",
      expertise: "Anthropology"
    }
  ];

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
              <span style={styles.metricNumber}>Scopus</span>
              <span style={styles.metricLabel}>Indexed</span>
            </div>
            <div style={styles.metric}>
              <span style={styles.metricNumber}>21</span>
              <span style={styles.metricLabel}>Days to Decision</span>
            </div>
          </div>
          <div style={styles.heroButtons}>
            <Link to={`/journal/author`} style={styles.primaryButton}>
              Submit Manuscript
              <span style={styles.buttonArrow}>→</span>
            </Link>
            <button style={styles.secondaryButton}>
              Browse Articles
            </button>
          </div>
        </div>
      </section>

      {/* Journal Info Bar */}
      <section style={styles.infoBar}>
        <div style={styles.infoBarContent}>
          <span style={styles.infoItem}>
            <strong>ISSN:</strong> 1234-5678 (Print) | 2345-6789 (Online)
          </span>
          <span style={styles.infoItem}>
            <strong>Frequency:</strong> Quarterly
          </span>
          <span style={styles.infoItem}>
            <strong>Open Access:</strong> Yes
          </span>
          <span style={styles.infoItem}>
            <strong>APC:</strong> $0 (Free)
          </span>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📥</span>
            <div style={styles.statNumber}>150K+</div>
            <div style={styles.statLabel}>Annual Downloads</div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🌍</span>
            <div style={styles.statNumber}>85</div>
            <div style={styles.statLabel}>Countries Reached</div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📚</span>
            <div style={styles.statNumber}>450+</div>
            <div style={styles.statLabel}>Published Articles</div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <div style={styles.statNumber}>28</div>
            <div style={styles.statLabel}>Editorial Board Members</div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search articles by title, author, or keywords..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button style={styles.searchButton}>
            🔍 Search
          </button>
        </div>
        <div style={styles.filterTabs}>
          <button
            style={{
              ...styles.filterTab,
              ...(activeTab === "current" ? styles.activeFilter : {})
            }}
            onClick={() => setActiveTab("current")}
          >
            Current Issue
          </button>
          <button
            style={{
              ...styles.filterTab,
              ...(activeTab === "archive" ? styles.activeFilter : {})
            }}
            onClick={() => setActiveTab("archive")}
          >
            Archive
          </button>
          <button
            style={{
              ...styles.filterTab,
              ...(activeTab === "early" ? styles.activeFilter : {})
            }}
            onClick={() => setActiveTab("early")}
          >
            Early View
          </button>
          <button
            style={{
              ...styles.filterTab,
              ...(activeTab === "special" ? styles.activeFilter : {})
            }}
            onClick={() => setActiveTab("special")}
          >
            Special Issues
          </button>
        </div>
      </section>

      {/* Articles Section */}
      <section style={styles.articlesSection}>
        <div style={styles.articlesHeader}>
          <h2 style={styles.sectionTitle}>
            Recent <span style={styles.gradientText}>Articles</span>
          </h2>
          <Link to="/journal/archive" style={styles.viewAllLink}>
            View All Articles →
          </Link>
        </div>

        <div style={styles.articlesGrid}>
          {recentArticles.map((article) => (
            <div key={article.id} style={styles.articleCard}>
              {article.openAccess && (
                <span style={styles.openAccessBadge}>Open Access</span>
              )}
              <span style={styles.articleCategory}>{article.category}</span>
              <h3 style={styles.articleTitle}>
                <Link to={`/journal/article/${article.id}`} style={styles.articleLink}>
                  {article.title}
                </Link>
              </h3>
              <p style={styles.articleAuthors}>{article.authors}</p>
              <p style={styles.articleAbstract}>{article.abstract}</p>
              <div style={styles.articleMeta}>
                <span style={styles.articleDate}>
                  📅 {article.date}
                </span>
                <span style={styles.articleViews}>
                  👁️ {article.views.toLocaleString()} views
                </span>
                <span style={styles.articleCitations}>
                  📊 {article.citations} citations
                </span>
              </div>
              <div style={styles.articleActions}>
                <span style={styles.articleDoi}>DOI: {article.doi}</span>
                <Link to={`/journal/article/${article.id}`} style={styles.readMore}>
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Issues Section */}
      <section style={styles.specialIssuesSection}>
        <h2 style={styles.sectionTitle}>
          Special <span style={styles.gradientText}>Issues</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Call for papers on emerging topics in Oromo studies
        </p>
        <div style={styles.specialIssuesGrid}>
          {specialIssues.map((issue, index) => (
            <div key={index} style={styles.specialIssueCard}>
              <span style={styles.issueStatus}>{issue.status}</span>
              <h3 style={styles.issueTitle}>{issue.title}</h3>
              <p style={styles.issueEditor}>Guest Editor: {issue.editor}</p>
              <div style={styles.issueDetails}>
                <span style={styles.issueDeadline}>
                  ⏰ Deadline: {issue.deadline}
                </span>
                <span style={styles.issueSubmissions}>
                  📝 {issue.submissions} submissions
                </span>
              </div>
              <button style={styles.submitButton}>
                Submit to Special Issue →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Board Section */}
      <section style={styles.boardSection}>
        <div style={styles.boardHeader}>
          <h2 style={styles.sectionTitle}>
            Editorial <span style={styles.gradientText}>Board</span>
          </h2>
          <p style={styles.sectionSubtitle}>
            International scholars committed to advancing Oromo research
          </p>
        </div>
        <div style={styles.boardGrid}>
          {editorialBoard.map((member, index) => (
            <div key={index} style={styles.boardCard}>
              <div style={styles.boardAvatar}>
                {member.name.charAt(0)}
              </div>
              <h3 style={styles.boardName}>{member.name}</h3>
              <p style={styles.boardRole}>{member.role}</p>
              <p style={styles.boardInstitution}>{member.institution}</p>
              <span style={styles.boardCountry}>📍 {member.country}</span>
              <p style={styles.boardExpertise}>{member.expertise}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Submission Guidelines */}
      <section style={styles.guidelinesSection}>
        <div style={styles.guidelinesContainer}>
          <div style={styles.guidelinesContent}>
            <h2 style={styles.guidelinesTitle}>
              Submit Your Research
            </h2>
            <p style={styles.guidelinesText}>
              Join hundreds of researchers publishing with the Oromo Research Journal. 
              We offer fast peer review, global visibility, and no publication fees.
            </p>
            <div style={styles.guidelinesGrid}>
              <div style={styles.guidelineItem}>
                <span style={styles.guidelineIcon}>📝</span>
                <h4>Author Guidelines</h4>
                <p>Formatting and submission requirements</p>
              </div>
              <div style={styles.guidelineItem}>
                <span style={styles.guidelineIcon}>⚖️</span>
                <h4>Ethics & Policies</h4>
                <p>Publication ethics and standards</p>
              </div>
              <div style={styles.guidelineItem}>
                <span style={styles.guidelineIcon}>⏱️</span>
                <h4>Peer Review Process</h4>
                <p>Double-blind review explained</p>
              </div>
              <div style={styles.guidelineItem}>
                <span style={styles.guidelineIcon}>💰</span>
                <h4>No APC</h4>
                <p>Free publication for all authors</p>
              </div>
            </div>
            <div style={styles.guidelinesButtons}>
              <button style={styles.guidelinesPrimary}>
                Submit Manuscript
              </button>
              <button style={styles.guidelinesSecondary}>
                Download Guidelines
              </button>
            </div>
          </div>
          <div style={styles.guidelinesImage}>
            <span style={styles.imageEmoji}>📚</span>
          </div>
        </div>
      </section>

      {/* Indexing Section */}
      <section style={styles.indexingSection}>
        <h2 style={styles.sectionTitle}>
          Indexed in Leading <span style={styles.gradientText}>Databases</span>
        </h2>
        <div style={styles.indexingGrid}>
          <div style={styles.indexingItem}>Scopus</div>
          <div style={styles.indexingItem}>Web of Science</div>
          <div style={styles.indexingItem}>DOAJ</div>
          <div style={styles.indexingItem}>Google Scholar</div>
          <div style={styles.indexingItem}>PubMed Central</div>
          <div style={styles.indexingItem}>JSTOR</div>
          <div style={styles.indexingItem}>ProQuest</div>
          <div style={styles.indexingItem}>EBSCO</div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={styles.newsletterSection}>
        <div style={styles.newsletterContainer}>
          <h2 style={styles.newsletterTitle}>
            Stay Updated with New Research
          </h2>
          <p style={styles.newsletterText}>
            Get email alerts when new articles are published
          </p>
          <div style={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email address"
              style={styles.newsletterInput}
            />
            <button style={styles.newsletterButton}>
              Subscribe
            </button>
          </div>
          <p style={styles.newsletterNote}>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
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
    backgroundColor: "#ffffff",
  },

  // Hero Section
  hero: {
    position: "relative",
    minHeight: "80vh",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 50%, #C9A227 100%)",
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
      radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 30%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 8px)
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
  heroBadge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    fontSize: "0.9rem",
    marginBottom: "30px",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 8vw, 4rem)",
    fontWeight: "700",
    margin: "0 0 20px",
    lineHeight: 1.2,
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    lineHeight: 1.8,
    margin: "0 auto 40px",
    opacity: 0.95,
    maxWidth: "700px",
  },
  heroMetrics: {
    display: "flex",
    gap: "50px",
    justifyContent: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  metric: {
    textAlign: "center",
  },
  metricNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "5px",
  },
  metricLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
  },
  heroButtons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "15px 40px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "50px",
    fontWeight: "600",
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 25px rgba(201,162,39,0.4)",
  },
  secondaryButton: {
    padding: "15px 40px",
    background: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "50px",
    fontWeight: "600",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  buttonArrow: {
    fontSize: "1.3rem",
    transition: "transform 0.3s ease",
  },

  // Info Bar
  infoBar: {
    background: "#f8f9fa",
    borderBottom: "1px solid #eaeef2",
    padding: "15px 0",
    overflowX: "auto",
  },
  infoBarContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    gap: "30px",
    padding: "0 20px",
    whiteSpace: "nowrap",
  },
  infoItem: {
    fontSize: "0.9rem",
    color: "#4a5568",
    "& strong": {
      color: "#0F3D2E",
    },
  },

  // Stats Section
  statsSection: {
    padding: "60px 20px",
    background: "#ffffff",
  },
  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
  },
  statCard: {
    textAlign: "center",
    padding: "30px",
    background: "#f8f9fa",
    borderRadius: "15px",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
    display: "block",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#C9A227",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
  },

  // Search Section
  searchSection: {
    padding: "0 20px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  searchContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 1,
    padding: "15px 20px",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#C9A227",
    },
  },
  searchButton: {
    padding: "15px 30px",
    background: "#0F3D2E",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  filterTabs: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  filterTab: {
    padding: "10px 25px",
    background: "transparent",
    border: "2px solid #eaeef2",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "#5a6a7a",
  },
  activeFilter: {
    background: "#C9A227",
    borderColor: "#C9A227",
    color: "white",
  },

  // Articles Section
  articlesSection: {
    padding: "60px 20px",
    background: "#f8f9fa",
  },
  articlesHeader: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  sectionTitle: {
    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
    fontWeight: "700",
    margin: 0,
  },
  gradientText: {
    background: "linear-gradient(135deg, #C9A227, #0F3D2E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  viewAllLink: {
    color: "#C9A227",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "gap 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
  articlesGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
  },
  articleCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    position: "relative",
    border: "1px solid #eaeef2",
  },
  openAccessBadge: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#27AE60",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  articleCategory: {
    color: "#C9A227",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "10px",
    display: "inline-block",
  },
  articleTitle: {
    fontSize: "1.3rem",
    margin: "0 0 15px",
    lineHeight: 1.4,
  },
  articleLink: {
    color: "#1a2639",
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  articleAuthors: {
    fontSize: "0.95rem",
    color: "#4a5568",
    margin: "0 0 15px",
    fontStyle: "italic",
  },
  articleAbstract: {
    fontSize: "0.9rem",
    color: "#718096",
    lineHeight: 1.6,
    margin: "0 0 20px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  articleMeta: {
    display: "flex",
    gap: "15px",
    fontSize: "0.8rem",
    color: "#a0aec0",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  articleActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eaeef2",
    paddingTop: "15px",
  },
  articleDoi: {
    fontSize: "0.8rem",
    color: "#a0aec0",
  },
  readMore: {
    color: "#C9A227",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  // Special Issues Section
  specialIssuesSection: {
    padding: "80px 20px",
    background: "#ffffff",
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#5a6a7a",
    textAlign: "center",
    margin: "0 0 50px",
  },
  specialIssuesGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  specialIssueCard: {
    background: "#f8f9fa",
    padding: "40px",
    borderRadius: "15px",
    position: "relative",
    transition: "transform 0.3s ease",
    border: "1px solid #eaeef2",
  },
  issueStatus: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#27AE60",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  issueTitle: {
    fontSize: "1.4rem",
    margin: "0 0 15px",
    color: "#1a2639",
    lineHeight: 1.4,
  },
  issueEditor: {
    fontSize: "0.95rem",
    color: "#4a5568",
    margin: "0 0 20px",
  },
  issueDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "25px",
  },
  issueDeadline: {
    fontSize: "0.9rem",
    color: "#E74C3C",
  },
  issueSubmissions: {
    fontSize: "0.9rem",
    color: "#27AE60",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "2px solid #C9A227",
    color: "#C9A227",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Editorial Board Section
  boardSection: {
    padding: "80px 20px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
  },
  boardHeader: {
    textAlign: "center",
    marginBottom: "50px",
  },
  boardGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
  },
  boardCard: {
    background: "white",
    padding: "30px 20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease",
    border: "1px solid #eaeef2",
  },
  boardAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #C9A227, #0F3D2E)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "600",
    margin: "0 auto 20px",
  },
  boardName: {
    fontSize: "1.2rem",
    margin: "0 0 5px",
    color: "#1a2639",
  },
  boardRole: {
    fontSize: "0.9rem",
    color: "#C9A227",
    fontWeight: "600",
    margin: "0 0 5px",
  },
  boardInstitution: {
    fontSize: "0.85rem",
    color: "#4a5568",
    margin: "0 0 5px",
  },
  boardCountry: {
    fontSize: "0.8rem",
    color: "#718096",
    display: "inline-block",
    marginBottom: "10px",
  },
  boardExpertise: {
    fontSize: "0.8rem",
    color: "#a0aec0",
    margin: 0,
  },

  // Guidelines Section
  guidelinesSection: {
    padding: "80px 20px",
    background: "#ffffff",
  },
  guidelinesContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "50px",
    alignItems: "center",
  },
  guidelinesContent: {
    padding: "40px",
  },
  guidelinesTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 20px",
    color: "#1a2639",
  },
  guidelinesText: {
    fontSize: "1.1rem",
    color: "#5a6a7a",
    lineHeight: 1.8,
    margin: "0 0 30px",
  },
  guidelinesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  guidelineItem: {
    textAlign: "center",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
  },
  guidelineIcon: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "10px",
  },
  guidelinesButtons: {
    display: "flex",
    gap: "15px",
  },
  guidelinesPrimary: {
    padding: "15px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  guidelinesSecondary: {
    padding: "15px 30px",
    background: "transparent",
    color: "#0F3D2E",
    border: "2px solid #0F3D2E",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  guidelinesImage: {
    background: "linear-gradient(135deg, #C9A227 0%, #0F3D2E 100%)",
    borderRadius: "20px",
    padding: "60px",
    textAlign: "center",
  },
  imageEmoji: {
    fontSize: "8rem",
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
  },

  // Indexing Section
  indexingSection: {
    padding: "60px 20px",
    background: "#f8f9fa",
  },
  indexingGrid: {
    maxWidth: "1000px",
    margin: "40px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
  },
  indexingItem: {
    background: "white",
    padding: "15px",
    textAlign: "center",
    borderRadius: "8px",
    fontWeight: "500",
    color: "#1a2639",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    border: "1px solid #eaeef2",
  },

  // Newsletter Section
  newsletterSection: {
    padding: "80px 20px",
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
  },
  newsletterContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  newsletterTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 15px",
  },
  newsletterText: {
    fontSize: "1.1rem",
    margin: "0 0 30px",
    opacity: 0.9,
  },
  newsletterForm: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  newsletterInput: {
    flex: 1,
    padding: "15px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  newsletterButton: {
    padding: "15px 30px",
    background: "#C9A227",
    color: "#0F3D2E",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  newsletterNote: {
    fontSize: "0.85rem",
    opacity: 0.7,
    margin: 0,
  },
};