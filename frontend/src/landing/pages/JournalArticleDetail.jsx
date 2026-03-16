import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../../api/publication.api";

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function JournalArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Use getManuscriptById instead of getArticleById
      const data = await publicationAPI.getManuscriptById(id);
      
      if (data?.success) {
        setArticle(data.article || data.manuscript);
        
        // Load related articles if category exists
        if (data.article?.category_name || data.manuscript?.category_name) {
          const category = data.article?.category_name || data.manuscript?.category_name;
          loadRelatedArticles(category);
        }
      } else {
        setError("Article not found");
      }
    } catch (err) {
      console.error("Error loading article:", err);
      setError(err.message || "Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async (category) => {
    try {
      // Check if getRelatedArticles exists
      if (publicationAPI.getRelatedArticles) {
        const data = await publicationAPI.getRelatedArticles(category, id, 3);
        if (data?.success) {
          setRelatedArticles(data.articles || []);
        }
      }
    } catch (err) {
      console.error("Error loading related articles:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const buildFileUrl = (path) => {
    if (!path) return null;
    return `${API_BASE}/${path}`;
  };

  const handleDownload = async (file) => {
    try {
      window.open(buildFileUrl(file.file_path), '_blank');
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || "";
    
    const shareUrls = {
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyCitation = () => {
    const citation = `${article?.author_name || "Unknown Author"}. (${formatDate(article?.published_at)}). ${article?.title}. Oromo Research Journal. ${article?.doi ? `DOI: ${article.doi}` : ''}`;
    navigator.clipboard.writeText(citation);
    alert("Citation copied to clipboard!");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading article...</p>
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Navbar />
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>📄</span>
          <h2>Article Not Found</h2>
          <p style={styles.errorMessage}>{error || "The article you're looking for doesn't exist."}</p>
          <Link to="/journal" style={styles.backButton}>
            ← Back to Journal
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>Home</Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <Link to="/journal" style={styles.breadcrumbLink}>Journal</Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          {article.category_name && (
            <>
              <Link to={`/journal/category/${article.category_name?.toLowerCase()}`} style={styles.breadcrumbLink}>
                {article.category_name}
              </Link>
              <span style={styles.breadcrumbSeparator}>/</span>
            </>
          )}
          <span style={styles.breadcrumbCurrent}>Article</span>
        </div>

        {/* Article Header */}
        <div style={styles.articleHeader}>
          <h1 style={styles.articleTitle}>{article.title}</h1>
          
          <div style={styles.authorCard}>
            <div style={styles.authorAvatar}>
              {article.author_name?.charAt(0) || 'A'}
            </div>
            <div style={styles.authorDetails}>
              <h3 style={styles.authorName}>{article.author_name || "Unknown Author"}</h3>
              <p style={styles.authorAffiliation}>{article.author_affiliation || "No affiliation specified"}</p>
              {article.orcid_id && (
                <a 
                  href={`https://orcid.org/${article.orcid_id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.orcidLink}
                >
                  <img 
                    src="https://orcid.org/assets/vectors/orcid.logo.icon.svg" 
                    alt="ORCID" 
                    style={styles.orcidIcon}
                  />
                  {article.orcid_id}
                </a>
              )}
            </div>
          </div>

          <div style={styles.articleMeta}>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>📅</span>
              Published: {formatDate(article.published_at)}
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>👁️</span>
              {article.view_count || 0} views
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>📊</span>
              {article.citations?.length || 0} citations
            </div>
            {article.doi && (
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>🔗</span>
                DOI: {article.doi}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Main Article Content */}
          <div style={styles.mainContent}>
            {/* Abstract */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Abstract</h2>
              <p style={styles.abstract}>{article.abstract || "No abstract available."}</p>
            </section>

            {/* Keywords */}
            {article.keywords && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Keywords</h2>
                <div style={styles.keywords}>
                  {article.keywords.split(',').map((keyword, i) => (
                    <Link 
                      key={i} 
                      to={`/journal/search?q=${keyword.trim()}`}
                      style={styles.keyword}
                    >
                      {keyword.trim()}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Files/Downloads */}
            {article.files && article.files.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Downloads</h2>
                <div style={styles.files}>
                  {article.files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleDownload(file)}
                      style={styles.fileCard}
                    >
                      <span style={styles.fileIcon}>📥</span>
                      <div style={styles.fileInfo}>
                        <h4 style={styles.fileName}>{file.file_name || "Document"}</h4>
                        <p style={styles.fileMeta}>
                          {file.file_type || "PDF"} • 
                          {file.file_size ? ` ${(file.file_size / 1024).toFixed(0)} KB` : ' Size unknown'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Citations */}
            {article.citations && article.citations.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Citations</h2>
                <div style={styles.citations}>
                  {article.citations.map((citation, i) => (
                    <div key={i} style={styles.citation}>
                      <span style={styles.citationNumber}>{i + 1}.</span>
                      <span>{citation.citing_article}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* References */}
            {article.references && article.references.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>References</h2>
                <div style={styles.references}>
                  {article.references.map((ref, i) => (
                    <div key={i} style={styles.reference}>
                      <span style={styles.referenceNumber}>{i + 1}.</span>
                      <div>
                        <p style={styles.referenceTitle}>{ref.reference_title}</p>
                        <p style={styles.referenceAuthors}>{ref.reference_authors}</p>
                        {ref.reference_doi && (
                          <a 
                            href={`https://doi.org/${ref.reference_doi}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.referenceDoi}
                          >
                            DOI: {ref.reference_doi}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Share Widget */}
            <div style={styles.widget}>
              <h3 style={styles.widgetTitle}>Share this Article</h3>
              <div style={styles.shareButtons}>
                <button 
                  onClick={() => handleShare('email')}
                  style={{...styles.shareButton, backgroundColor: '#EA4335'}}
                >
                  📧 Email
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  style={{...styles.shareButton, backgroundColor: '#1DA1F2'}}
                >
                  🐦 Twitter
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  style={{...styles.shareButton, backgroundColor: '#4267B2'}}
                >
                  📘 Facebook
                </button>
                <button 
                  onClick={() => handleShare('linkedin')}
                  style={{...styles.shareButton, backgroundColor: '#0077B5'}}
                >
                  💼 LinkedIn
                </button>
              </div>
            </div>

            {/* Citation Widget */}
            <div style={styles.widget}>
              <h3 style={styles.widgetTitle}>Cite this Article</h3>
              <div style={styles.citeBox}>
                <p style={styles.citationText}>
                  {article.author_name || "Unknown Author"}. ({formatDate(article.published_at)}). {article.title}. 
                  Oromo Research Journal. {article.doi ? `DOI: ${article.doi}` : ''}
                </p>
                <button 
                  onClick={copyCitation}
                  style={styles.copyButton}
                >
                  📋 Copy Citation
                </button>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div style={styles.widget}>
                <h3 style={styles.widgetTitle}>Related Articles</h3>
                <div style={styles.relatedList}>
                  {relatedArticles.map((rel) => (
                    <Link 
                      key={rel.id} 
                      to={`/journal/manuscript/${rel.id}`}
                      style={styles.relatedItem}
                    >
                      <h4 style={styles.relatedTitle}>{rel.title}</h4>
                      <p style={styles.relatedAuthor}>{rel.author_name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Widget */}
            <div style={styles.widget}>
              <h3 style={styles.widgetTitle}>Article Metrics</h3>
              <div style={styles.metrics}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Views</span>
                  <span style={styles.metricValue}>{article.view_count || 0}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Downloads</span>
                  <span style={styles.metricValue}>{article.download_count || 0}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Citations</span>
                  <span style={styles.metricValue}>{article.citations?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Styles (keep all the styles from previous response)
const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f8fafc",
  },
  
  // Breadcrumb
  breadcrumb: {
    marginBottom: "30px",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    color: "#C9A227",
    textDecoration: "none",
    transition: "color 0.3s ease",
    cursor: "pointer",
    ":hover": {
      color: "#0A2F1F",
    },
  },
  breadcrumbSeparator: {
    color: "#94a3b8",
  },
  breadcrumbCurrent: {
    color: "#475569",
  },

  // Article Header
  articleHeader: {
    marginBottom: "40px",
  },
  articleTitle: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: "700",
    margin: "0 0 30px",
    lineHeight: 1.3,
    color: "#0A2F1F",
  },
  authorCard: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "25px",
    padding: "20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  authorAvatar: {
    width: "70px",
    height: "70px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0A2F1F, #C9A227)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "600",
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: "1.3rem",
    margin: "0 0 5px",
    color: "#0A2F1F",
  },
  authorAffiliation: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: "0 0 8px",
  },
  orcidLink: {
    fontSize: "0.9rem",
    color: "#27AE60",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  orcidIcon: {
    width: "16px",
    height: "16px",
  },

  // Article Meta
  articleMeta: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    padding: "15px 0",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    color: "#475569",
  },
  metaIcon: {
    fontSize: "1.1rem",
  },

  // Content Grid
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "40px",
    marginTop: "40px",
  },
  mainContent: {
    background: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  // Sections
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 20px",
    color: "#0A2F1F",
    position: "relative",
    paddingBottom: "10px",
    borderBottom: "2px solid #C9A227",
  },
  abstract: {
    fontSize: "1.1rem",
    lineHeight: 1.8,
    color: "#334155",
  },

  // Keywords
  keywords: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  keyword: {
    padding: "8px 16px",
    background: "#f1f5f9",
    borderRadius: "30px",
    fontSize: "0.9rem",
    color: "#0A2F1F",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },

  // Files
  files: {
    display: "grid",
    gap: "15px",
  },
  fileCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.3s ease",
  },
  fileIcon: {
    fontSize: "1.5rem",
  },
  fileInfo: {
    textAlign: "left",
  },
  fileName: {
    margin: "0 0 5px",
    fontSize: "1rem",
    color: "#0A2F1F",
  },
  fileMeta: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#64748b",
  },

  // References & Citations
  citations: {
    display: "grid",
    gap: "10px",
  },
  citation: {
    display: "flex",
    gap: "10px",
    fontSize: "0.95rem",
    color: "#334155",
    padding: "10px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  citationNumber: {
    color: "#C9A227",
    fontWeight: "600",
  },
  references: {
    display: "grid",
    gap: "15px",
  },
  reference: {
    display: "flex",
    gap: "15px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "12px",
  },
  referenceNumber: {
    color: "#C9A227",
    fontWeight: "600",
  },
  referenceTitle: {
    margin: "0 0 5px",
    fontWeight: "500",
    color: "#0A2F1F",
  },
  referenceAuthors: {
    margin: "0 0 5px",
    fontSize: "0.9rem",
    color: "#64748b",
  },
  referenceDoi: {
    fontSize: "0.85rem",
    color: "#27AE60",
    textDecoration: "none",
  },

  // Sidebar Widgets
  widget: {
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },
  widgetTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    margin: "0 0 20px",
    color: "#0A2F1F",
  },
  shareButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  shareButton: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
  citeBox: {
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "12px",
  },
  citationText: {
    fontSize: "0.9rem",
    lineHeight: "1.6",
    color: "#475569",
    marginBottom: "15px",
    fontStyle: "italic",
  },
  copyButton: {
    padding: "10px",
    background: "#0A2F1F",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "background 0.3s ease",
  },

  // Related Articles
  relatedList: {
    display: "grid",
    gap: "15px",
  },
  relatedItem: {
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
  relatedTitle: {
    margin: "0 0 5px",
    fontSize: "1rem",
    color: "#0A2F1F",
    fontWeight: "500",
  },
  relatedAuthor: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#64748b",
  },

  // Metrics
  metrics: {
    display: "grid",
    gap: "15px",
  },
  metricItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  metricLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
  },
  metricValue: {
    color: "#0A2F1F",
    fontWeight: "600",
    fontSize: "1.1rem",
  },

  // Loading & Error States
  loadingContainer: {
    textAlign: "center",
    padding: "100px 20px",
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
    textAlign: "center",
    padding: "100px 20px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  errorIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "20px",
  },
  errorMessage: {
    color: "#64748b",
    marginBottom: "30px",
  },
  backButton: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#0A2F1F",
    color: "white",
    textDecoration: "none",
    borderRadius: "30px",
    fontWeight: "500",
    transition: "background 0.3s ease",
  },

  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};