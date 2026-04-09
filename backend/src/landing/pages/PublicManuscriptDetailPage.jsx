import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  fetchPublicManuscriptById,
  downloadFile
} from "../../api/manuscript.api";

const API_BASE =
  process.env.REACT_APP_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export default function PublicManuscriptDetailPage() {
  const { id } = useParams();
  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("abstract");

  useEffect(() => {
    const loadManuscript = async () => {
      try {
        setLoading(true);
        const data = await fetchPublicManuscriptById(id);
        setManuscript(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load manuscript");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadManuscript();
    }
  }, [id]);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading manuscript...</p>
        </div>
      </>
    );
  }

  if (error || !manuscript) {
    return (
      <>
        <Navbar />
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2>Manuscript Not Found</h2>
          <p>{error || "The manuscript you're looking for doesn't exist or has been removed."}</p>
          <Link to="/manuscripts" style={styles.backButton}>
            ← Back to Manuscripts
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
          <Link to="/manuscripts" style={styles.breadcrumbLink}>
            Manuscripts
          </Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>{manuscript.title}</span>
        </div>

        {/* Main Content */}
        <div style={styles.contentWrapper}>
          {/* Left Column - Main Content */}
          <div style={styles.mainColumn}>
            {/* Header Section */}
            <div style={styles.headerSection}>
              <div style={styles.statusWrapper}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(manuscript.status)
                }}>
                  {manuscript.status || 'Published'}
                </span>
                <span style={styles.stageBadge}>
                  {manuscript.stage_name || 'Research Paper'}
                </span>
              </div>
              
              <h1 style={styles.title}>{manuscript.title}</h1>
              
              <div style={styles.authorSection}>
                <div style={styles.authorAvatar}>
                  {manuscript.author_name?.charAt(0) || 'A'}
                </div>
                <div style={styles.authorInfo}>
                  <span style={styles.authorName}>{manuscript.author_name || 'Anonymous'}</span>
                  {manuscript.author_email && (
                    <span style={styles.authorEmail}>{manuscript.author_email}</span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div style={styles.metadataGrid}>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataIcon}>📅</span>
                  <div>
                    <div style={styles.metadataLabel}>Published</div>
                    <div style={styles.metadataValue}>{formatDate(manuscript.published_at || manuscript.created_at)}</div>
                  </div>
                </div>
                
                <div style={styles.metadataItem}>
                  <span style={styles.metadataIcon}>🔄</span>
                  <div>
                    <div style={styles.metadataLabel}>Last Updated</div>
                    <div style={styles.metadataValue}>{formatDate(manuscript.updated_at || manuscript.created_at)}</div>
                  </div>
                </div>

                <div style={styles.metadataItem}>
                  <span style={styles.metadataIcon}>📄</span>
                  <div>
                    <div style={styles.metadataLabel}>Files</div>
                    <div style={styles.metadataValue}>{manuscript.files?.length || 0} Attachments</div>
                  </div>
                </div>

                <div style={styles.metadataItem}>
                  <span style={styles.metadataIcon}>🔢</span>
                  <div>
                    <div style={styles.metadataLabel}>Version</div>
                    <div style={styles.metadataValue}>{manuscript.version || '1.0'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div style={styles.tabsContainer}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'abstract' && styles.activeTab)
                }}
                onClick={() => setActiveTab('abstract')}
              >
                Abstract
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'content' && styles.activeTab)
                }}
                onClick={() => setActiveTab('content')}
              >
                Full Content
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'details' && styles.activeTab)
                }}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'citations' && styles.activeTab)
                }}
                onClick={() => setActiveTab('citations')}
              >
                Citations
              </button>
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
              {activeTab === 'abstract' && (
                <div style={styles.abstractSection}>
                  <h2 style={styles.sectionTitle}>Abstract</h2>
                  <p style={styles.abstractText}>
                    {manuscript.abstract || 'No abstract available for this manuscript.'}
                  </p>
                  
                  {/* Keywords */}
                  {manuscript.keywords && manuscript.keywords.length > 0 && (
                    <div style={styles.keywordsSection}>
                      <h3 style={styles.subsectionTitle}>Keywords</h3>
                      <div style={styles.keywordsList}>
                        {manuscript.keywords.map((keyword, index) => (
                          <span key={index} style={styles.keywordTag}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'content' && (
                <div style={styles.contentSection}>
                  <h2 style={styles.sectionTitle}>Full Manuscript</h2>
                  {manuscript.content ? (
                    <div style={styles.fullContent}>
                      {manuscript.content.split('\n').map((paragraph, index) => (
                        <p key={index} style={styles.contentParagraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.noContent}>
                      <p>Full content is not available for this manuscript.</p>
                      {manuscript.files && manuscript.files.length > 0 && (
                        <p>Please download the PDF file below to view the complete manuscript.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div style={styles.detailsSection}>
                  <h2 style={styles.sectionTitle}>Manuscript Details</h2>
                  
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Manuscript ID:</span>
                      <span style={styles.detailValue}>{manuscript.id}</span>
                    </div>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Stage:</span>
                      <span style={styles.detailValue}>{manuscript.stage_name || 'Not specified'}</span>
                    </div>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Status:</span>
                      <span style={styles.detailValue}>{manuscript.status || 'Published'}</span>
                    </div>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Author:</span>
                      <span style={styles.detailValue}>{manuscript.author_name || 'Anonymous'}</span>
                    </div>
                    
                    {manuscript.co_authors && manuscript.co_authors.length > 0 && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Co-authors:</span>
                        <span style={styles.detailValue}>{manuscript.co_authors.join(', ')}</span>
                      </div>
                    )}
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Created:</span>
                      <span style={styles.detailValue}>{formatDate(manuscript.created_at)}</span>
                    </div>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Last Updated:</span>
                      <span style={styles.detailValue}>{formatDate(manuscript.updated_at)}</span>
                    </div>
                    
                    {manuscript.doi && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>DOI:</span>
                        <span style={styles.detailValue}>{manuscript.doi}</span>
                      </div>
                    )}
                    
                    {manuscript.language && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Language:</span>
                        <span style={styles.detailValue}>{manuscript.language}</span>
                      </div>
                    )}
                    
                    {manuscript.pages && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Pages:</span>
                        <span style={styles.detailValue}>{manuscript.pages}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'citations' && (
                <div style={styles.citationsSection}>
                  <h2 style={styles.sectionTitle}>How to Cite</h2>
                  
                  <div style={styles.citationCard}>
                    <h3 style={styles.citationTitle}>APA Style</h3>
                    <p style={styles.citationText}>
                      {manuscript.author_name || 'Author'}. ({new Date(manuscript.published_at || manuscript.created_at).getFullYear()}). 
                      {manuscript.title}. {manuscript.stage_name || 'Manuscript'}. 
                      {manuscript.doi ? ` https://doi.org/${manuscript.doi}` : ''}
                    </p>
                    <button 
                      style={styles.copyButton}
                      onClick={() => {
                        const text = `${manuscript.author_name || 'Author'}. (${new Date(manuscript.published_at || manuscript.created_at).getFullYear()}). ${manuscript.title}. ${manuscript.stage_name || 'Manuscript'}.${manuscript.doi ? ` https://doi.org/${manuscript.doi}` : ''}`;
                        navigator.clipboard.writeText(text);
                        alert('Citation copied to clipboard!');
                      }}
                    >
                      Copy Citation
                    </button>
                  </div>

                  <div style={styles.citationCard}>
                    <h3 style={styles.citationTitle}>MLA Style</h3>
                    <p style={styles.citationText}>
                      {manuscript.author_name || 'Author'}. "{manuscript.title}." 
                      {manuscript.stage_name || 'Manuscript'}, {new Date(manuscript.published_at || manuscript.created_at).getFullYear()}.
                    </p>
                    <button 
                      style={styles.copyButton}
                      onClick={() => {
                        const text = `${manuscript.author_name || 'Author'}. "${manuscript.title}." ${manuscript.stage_name || 'Manuscript'}, ${new Date(manuscript.published_at || manuscript.created_at).getFullYear()}.`;
                        navigator.clipboard.writeText(text);
                        alert('Citation copied to clipboard!');
                      }}
                    >
                      Copy Citation
                    </button>
                  </div>

                  <div style={styles.citationCard}>
                    <h3 style={styles.citationTitle}>Chicago Style</h3>
                    <p style={styles.citationText}>
                      {manuscript.author_name || 'Author'}. "{manuscript.title}." 
                      {manuscript.stage_name || 'Manuscript'}. {new Date(manuscript.published_at || manuscript.created_at).getFullYear()}.
                    </p>
                    <button 
                      style={styles.copyButton}
                      onClick={() => {
                        const text = `${manuscript.author_name || 'Author'}. "${manuscript.title}." ${manuscript.stage_name || 'Manuscript'}. ${new Date(manuscript.published_at || manuscript.created_at).getFullYear()}.`;
                        navigator.clipboard.writeText(text);
                        alert('Citation copied to clipboard!');
                      }}
                    >
                      Copy Citation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={styles.sidebar}>
            {/* Download Card */}
            {manuscript.files && manuscript.files.length > 0 && (
              <div style={styles.sidebarCard}>
                <h3 style={styles.sidebarCardTitle}>Download Files</h3>
                <div style={styles.filesList}>
                  {manuscript.files.map((file, index) => (
                    <a
                      key={file.id}
                      href={downloadFile(file.id)}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.fileItem}
                    >
                      <span style={styles.fileIcon}>📄</span>
                      <div style={styles.fileInfo}>
                        <span style={styles.fileName}>
                          {file.name || `Document ${index + 1}`}
                        </span>
                        {file.size && (
                          <span style={styles.fileSize}>
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        )}
                      </div>
                      <span style={styles.downloadIcon}>↓</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Manuscripts */}
            {manuscript.related_manuscripts && manuscript.related_manuscripts.length > 0 && (
              <div style={styles.sidebarCard}>
                <h3 style={styles.sidebarCardTitle}>Related Manuscripts</h3>
                <div style={styles.relatedList}>
                  {manuscript.related_manuscripts.map((related) => (
                    <Link
                      key={related.id}
                      to={`/manuscript/${related.id}`}
                      style={styles.relatedItem}
                    >
                      <span style={styles.relatedItemTitle}>{related.title}</span>
                      <span style={styles.relatedItemAuthor}>by {related.author_name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share Card */}
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarCardTitle}>Share</h3>
              <div style={styles.shareButtons}>
                <button style={styles.shareButton}>
                  <span>📧</span> Email
                </button>
                <button style={styles.shareButton}>
                  <span>🐦</span> Twitter
                </button>
                <button style={styles.shareButton}>
                  <span>💼</span> LinkedIn
                </button>
                <button style={styles.shareButton}>
                  <span>🔗</span> Copy Link
                </button>
              </div>
            </div>

            {/* Actions Card */}
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarCardTitle}>Actions</h3>
              <div style={styles.actionButtons}>
                <button 
                  style={styles.actionButton}
                  onClick={() => window.print()}
                >
                  <span>🖨️</span> Print
                </button>
                <button 
                  style={styles.actionButton}
                  onClick={() => {
                    // Add to bookmarks functionality
                    alert('Added to bookmarks!');
                  }}
                >
                  <span>🔖</span> Bookmark
                </button>
                <button 
                  style={styles.actionButton}
                  onClick={() => {
                    // Report issue functionality
                    alert('Report submitted. Thank you!');
                  }}
                >
                  <span>⚠️</span> Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  // Breadcrumb
  breadcrumb: {
    marginBottom: "2rem",
    fontSize: "0.95rem",
  },
  breadcrumbLink: {
    color: "#C9A227",
    textDecoration: "none",
  },
  breadcrumbSeparator: {
    margin: "0 0.5rem",
    color: "#94a3b8",
  },
  breadcrumbCurrent: {
    color: "#64748b",
  },

  // Content Wrapper
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "2rem",
  },

  // Main Column
  mainColumn: {
    background: "white",
    borderRadius: "24px",
    padding: "2.5rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },

  // Header Section
  headerSection: {
    marginBottom: "2rem",
  },
  statusWrapper: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  statusBadge: {
    padding: "0.35rem 1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  stageBadge: {
    padding: "0.35rem 1rem",
    background: "#f1f5f9",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "#475569",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#0A2F1F",
    margin: "0 0 1.5rem",
    lineHeight: "1.3",
    letterSpacing: "-0.02em",
  },
  authorSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "#f8fafc",
    borderRadius: "16px",
  },
  authorAvatar: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #0A2F1F, #1B4A2C)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    display: "block",
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#0A2F1F",
    marginBottom: "0.25rem",
  },
  authorEmail: {
    fontSize: "0.95rem",
    color: "#64748b",
  },

  // Metadata Grid
  metadataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    padding: "1.5rem",
    background: "#f8fafc",
    borderRadius: "16px",
    marginBottom: "2rem",
  },
  metadataItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  metadataIcon: {
    fontSize: "1.5rem",
  },
  metadataLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginBottom: "0.25rem",
  },
  metadataValue: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#0f172a",
  },

  // Tabs
  tabsContainer: {
    display: "flex",
    gap: "0.5rem",
    borderBottom: "2px solid #e2e8f0",
    marginBottom: "2rem",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    background: "transparent",
    border: "none",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.2s ease",
  },
  activeTab: {
    color: "#C9A227",
    fontWeight: "600",
    borderBottom: "3px solid #C9A227",
    marginBottom: "-2px",
  },

  // Tab Content
  tabContent: {
    minHeight: "400px",
  },

  // Abstract Section
  abstractSection: {
    padding: "1rem 0",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 1.5rem",
  },
  abstractText: {
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#334155",
    marginBottom: "2rem",
  },
  subsectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 1rem",
  },
  keywordsSection: {
    marginTop: "2rem",
  },
  keywordsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  keywordTag: {
    padding: "0.5rem 1rem",
    background: "#f1f5f9",
    borderRadius: "30px",
    fontSize: "0.9rem",
    color: "#475569",
  },

  // Full Content Section
  contentSection: {
    padding: "1rem 0",
  },
  fullContent: {
    fontSize: "1rem",
    lineHeight: "1.8",
    color: "#334155",
  },
  contentParagraph: {
    marginBottom: "1.5rem",
  },
  noContent: {
    padding: "3rem",
    textAlign: "center",
    background: "#f8fafc",
    borderRadius: "16px",
    color: "#64748b",
  },

  // Details Section
  detailsSection: {
    padding: "1rem 0",
  },
  detailsGrid: {
    display: "grid",
    gap: "1rem",
  },
  detailRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    padding: "0.75rem",
    borderBottom: "1px solid #e2e8f0",
  },
  detailLabel: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#64748b",
  },
  detailValue: {
    fontSize: "0.95rem",
    color: "#0f172a",
  },

  // Citations Section
  citationsSection: {
    padding: "1rem 0",
  },
  citationCard: {
    padding: "1.5rem",
    background: "#f8fafc",
    borderRadius: "16px",
    marginBottom: "1rem",
  },
  citationTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 0.5rem",
  },
  citationText: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#475569",
    marginBottom: "1rem",
    fontStyle: "italic",
  },
  copyButton: {
    padding: "0.5rem 1rem",
    background: "transparent",
    border: "1px solid #C9A227",
    borderRadius: "8px",
    color: "#C9A227",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Sidebar
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  sidebarCard: {
    background: "white",
    borderRadius: "24px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  sidebarCardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#0A2F1F",
    margin: "0 0 1.5rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid #e2e8f0",
  },

  // Files List
  filesList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "#f8fafc",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  fileIcon: {
    fontSize: "1.25rem",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: "0.25rem",
  },
  fileSize: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  downloadIcon: {
    fontSize: "1.25rem",
    color: "#C9A227",
  },

  // Related List
  relatedList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  relatedItem: {
    padding: "0.75rem",
    background: "#f8fafc",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  relatedItemTitle: {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: "0.25rem",
  },
  relatedItemAuthor: {
    fontSize: "0.85rem",
    color: "#64748b",
  },

  // Share Buttons
  shareButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
  },
  shareButton: {
    padding: "0.75rem",
    background: "#f8fafc",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#475569",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },

  // Action Buttons
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  actionButton: {
    padding: "0.75rem",
    background: "#f8fafc",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#475569",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    transition: "all 0.2s ease",
  },

  // Loading & Error States
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #C9A227",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingText: {
    fontSize: "1rem",
    color: "#64748b",
  },
  errorContainer: {
    textAlign: "center",
    padding: "4rem 2rem",
    maxWidth: "600px",
    margin: "4rem auto",
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  errorIcon: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "1rem",
  },
  backButton: {
    display: "inline-block",
    marginTop: "2rem",
    padding: "0.75rem 2rem",
    background: "#0A2F1F",
    color: "white",
    textDecoration: "none",
    borderRadius: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
};

// Add global styles
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .file-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  .share-button:hover, .action-button:hover {
    background: #C9A227;
    color: white;
  }

  .copy-button:hover {
    background: #C9A227;
    color: white;
  }

  .related-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  .back-button:hover {
    background: #1B4A2C;
    transform: translateY(-2px);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}