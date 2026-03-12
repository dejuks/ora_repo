import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../api/publication.api";

export default function JournalArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await publicationAPI.getArticleById(id);
      if (data?.success) {
        setArticle(data.article);
      }
    } catch (err) {
      console.error("Error loading article:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <div style={styles.notFound}>
          <h2>Article Not Found</h2>
          <Link to="/journal">Back to Journal</Link>
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
          <Link to="/journal" style={styles.breadcrumbLink}>Journal</Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <Link to={`/journal/category/${article.category_name?.toLowerCase()}`} style={styles.breadcrumbLink}>
            {article.category_name}
          </Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>Article</span>
        </div>

        {/* Article Header */}
        <div style={styles.articleHeader}>
          <h1 style={styles.articleTitle}>{article.title}</h1>
          
          <div style={styles.authorInfo}>
            <div style={styles.authorAvatar}>
              {article.author_name?.charAt(0)}
            </div>
            <div>
              <h3 style={styles.authorName}>{article.author_name}</h3>
              <p style={styles.authorAffiliation}>{article.author_affiliation}</p>
              {article.orcid_id && (
                <a 
                  href={`https://orcid.org/${article.orcid_id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.orcidLink}
                >
                  ORCID: {article.orcid_id}
                </a>
              )}
            </div>
          </div>

          <div style={styles.articleMeta}>
            <span>📅 Published: {formatDate(article.published_at)}</span>
            <span>👁️ {article.view_count} views</span>
            <span>📊 {article.citations?.length || 0} citations</span>
            {article.doi && <span>🔗 DOI: {article.doi}</span>}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Abstract */}
          <section style={styles.abstractSection}>
            <h2 style={styles.sectionTitle}>Abstract</h2>
            <p style={styles.abstract}>{article.abstract}</p>
          </section>

          {/* Keywords */}
          {article.keywords && (
            <section style={styles.keywordsSection}>
              <h2 style={styles.sectionTitle}>Keywords</h2>
              <div style={styles.keywords}>
                {article.keywords.split(',').map((keyword, i) => (
                  <span key={i} style={styles.keyword}>
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Files/Downloads */}
          {article.files && article.files.length > 0 && (
            <section style={styles.filesSection}>
              <h2 style={styles.sectionTitle}>Downloads</h2>
              <div style={styles.files}>
                {article.files.map((file) => (
                  <a
                    key={file.id}
                    href={`http://localhost:5000/${file.file_path}`}
                    download
                    style={styles.fileCard}
                  >
                    <span style={styles.fileIcon}>📥</span>
                    <div>
                      <h4 style={styles.fileName}>{file.file_name}</h4>
                      <p style={styles.fileMeta}>
                        {file.file_type} • {(file.file_size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Citations */}
          {article.citations && article.citations.length > 0 && (
            <section style={styles.citationsSection}>
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
            <section style={styles.referencesSection}>
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

        {/* Share & Cite */}
        <div style={styles.shareSection}>
          <h3 style={styles.shareTitle}>Share this Article</h3>
          <div style={styles.shareButtons}>
            <button style={styles.shareButton}>📧 Email</button>
            <button style={styles.shareButton}>🐦 Twitter</button>
            <button style={styles.shareButton}>📘 Facebook</button>
            <button style={styles.shareButton}>💼 LinkedIn</button>
          </div>
          <div style={styles.citeBox}>
            <h4>Cite this article:</h4>
            <p style={styles.citation}>
              {article.author_name}. ({formatDate(article.published_at)}). {article.title}. 
              Oromo Research Journal. {article.doi ? `DOI: ${article.doi}` : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Poppins', sans-serif",
  },
  breadcrumb: {
    marginBottom: "30px",
    fontSize: "0.95rem",
  },
  breadcrumbLink: {
    color: "#C9A227",
    textDecoration: "none",
  },
  breadcrumbSeparator: {
    margin: "0 10px",
    color: "#718096",
  },
  breadcrumbCurrent: {
    color: "#4a5568",
  },
  articleHeader: {
    marginBottom: "40px",
  },
  articleTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 30px",
    lineHeight: 1.3,
    color: "#1a2639",
  },
  authorInfo: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "20px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
  },
  authorAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #C9A227, #0F3D2E)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  authorName: {
    fontSize: "1.2rem",
    margin: "0 0 5px",
    color: "#1a2639",
  },
  authorAffiliation: {
    fontSize: "0.95rem",
    color: "#718096",
    margin: "0 0 5px",
  },
  orcidLink: {
    fontSize: "0.85rem",
    color: "#27AE60",
    textDecoration: "none",
  },
  articleMeta: {
    display: "flex",
    gap: "20px",
    fontSize: "0.95rem",
    color: "#718096",
    flexWrap: "wrap",
  },
  mainContent: {
    marginBottom: "40px",
  },
  abstractSection: {
    marginBottom: "30px",
  },
  abstract: {
    fontSize: "1.1rem",
    lineHeight: 1.8,
    color: "#4a5568",
  },
  keywordsSection: {
    marginBottom: "30px",
  },
  keywords: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  keyword: {
    padding: "5px 15px",
    background: "#f0f2f5",
    borderRadius: "20px",
    fontSize: "0.9rem",
    color: "#4a5568",
  },
  filesSection: {
    marginBottom: "30px",
  },
  files: {
    display: "grid",
    gap: "15px",
  },
  fileCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    textDecoration: "none",
    color: "inherit",
    transition: "background 0.3s ease",
    border: "1px solid #eaeef2",
  },
  fileIcon: {
    fontSize: "1.5rem",
  },
  fileName: {
    margin: "0 0 5px",
    fontSize: "1rem",
    color: "#1a2639",
  },
  fileMeta: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#718096",
  },
  citationsSection: {
    marginBottom: "30px",
  },
  citations: {
    display: "grid",
    gap: "10px",
  },
  citation: {
    display: "flex",
    gap: "10px",
    fontSize: "0.95rem",
    color: "#4a5568",
  },
  citationNumber: {
    color: "#C9A227",
    fontWeight: "600",
  },
  referencesSection: {
    marginBottom: "30px",
  },
  references: {
    display: "grid",
    gap: "15px",
  },
  reference: {
    display: "flex",
    gap: "15px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  referenceNumber: {
    color: "#C9A227",
    fontWeight: "600",
  },
  referenceTitle: {
    margin: "0 0 5px",
    fontWeight: "500",
    color: "#1a2639",
  },
  referenceAuthors: {
    margin: "0 0 5px",
    fontSize: "0.9rem",
    color: "#718096",
  },
  referenceDoi: {
    fontSize: "0.85rem",
    color: "#27AE60",
    textDecoration: "none",
  },
  shareSection: {
    padding: "30px",
    background: "#f8f9fa",
    borderRadius: "10px",
    marginTop: "40px",
  },
  shareTitle: {
    margin: "0 0 20px",
    fontSize: "1.2rem",
    color: "#1a2639",
  },
  shareButtons: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  shareButton: {
    padding: "10px 20px",
    background: "white",
    border: "1px solid #eaeef2",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  citeBox: {
    padding: "20px",
    background: "white",
    borderRadius: "5px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "100px 20px",
  },
  notFound: {
    textAlign: "center",
    padding: "100px 20px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 20px",
    color: "#1a2639",
  },
};