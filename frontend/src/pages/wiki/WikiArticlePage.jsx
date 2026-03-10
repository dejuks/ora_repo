// WikiArticlePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../landing/components/Navbar';
import { 
  FaEdit, 
  FaHistory, 
  FaStar, 
  FaEye, 
  FaCalendar, 
  FaUser, 
  FaTag, 
  FaShare, 
  FaBookmark,
  FaThumbsUp,
  FaComment,
  FaWikipediaW
} from 'react-icons/fa';

const WikiArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('read');
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      // Fetch article by slug
      const res = await fetch(`http://localhost:5000/api/wiki/articles/slug/${slug}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Article not found');
        }
        throw new Error('Failed to fetch article');
      }

      const data = await res.json();
      setArticle(data.data);

      // Fetch related articles (same categories)
      if (data.data.categories && data.data.categories.length > 0) {
        fetchRelatedArticles(data.data.categories[0]?.id);
      }

    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (categoryId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/articles?category=${categoryId}&limit=5`);
      const data = await res.json();
      setRelatedArticles(data.data?.articles || []);
    } catch (err) {
      console.error('Error fetching related articles:', err);
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
          <div style={styles.errorCard}>
            <h1 style={styles.errorTitle}>Article Not Found</h1>
            <p style={styles.errorMessage}>
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/wiki" style={styles.homeButton}>
              Return to Wiki Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Article Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>{article.title}</h1>
            
            {/* Article Metadata */}
            <div style={styles.metaContainer}>
              <div style={styles.metaItem}>
                <FaUser style={styles.metaIcon} />
                <span>
                  By <Link to={`/wiki/user/${article.author_username}`} style={styles.metaLink}>
                    {article.author_name || article.author_username}
                  </Link>
                </span>
              </div>
              <div style={styles.metaItem}>
                <FaCalendar style={styles.metaIcon} />
                <span>Created {formatDate(article.created_at)}</span>
              </div>
              <div style={styles.metaItem}>
                <FaEye style={styles.metaIcon} />
                <span>{article.view_count || 0} views</span>
              </div>
              <div style={styles.metaItem}>
                <FaHistory style={styles.metaIcon} />
                <span>{article.total_revisions || 1} revisions</span>
              </div>
              {article.is_featured && (
                <div style={styles.featuredBadge}>
                  <FaStar style={styles.featuredIcon} />
                  <span>Featured Article</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionBar}>
              <button 
                onClick={() => setActiveTab('read')}
                style={{
                  ...styles.actionButton,
                  background: activeTab === 'read' ? '#C9A227' : 'transparent',
                  color: activeTab === 'read' ? '#0F3D2E' : '#666'
                }}
              >
                Read
              </button>
              <button 
                onClick={() => setActiveTab('edit')}
                style={{
                  ...styles.actionButton,
                  background: activeTab === 'edit' ? '#C9A227' : 'transparent',
                  color: activeTab === 'edit' ? '#0F3D2E' : '#666'
                }}
              >
                <FaEdit /> Edit
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                style={{
                  ...styles.actionButton,
                  background: activeTab === 'history' ? '#C9A227' : 'transparent',
                  color: activeTab === 'history' ? '#0F3D2E' : '#666'
                }}
              >
                <FaHistory /> View History
              </button>
              <button style={styles.iconButton}>
                <FaBookmark />
              </button>
              <button style={styles.iconButton}>
                <FaShare />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.contentWrapper}>
          <div style={styles.mainContent}>
            {/* Article Content */}
            {activeTab === 'read' && (
              <div style={styles.articleContent}>
                {/* Categories */}
                {article.categories && article.categories.length > 0 && (
                  <div style={styles.categoriesBar}>
                    <FaTag style={styles.categoryIcon} />
                    {article.categories.map((cat, index) => (
                      <React.Fragment key={cat.id}>
                        <Link to={`/wiki/category/${cat.id}`} style={styles.categoryLink}>
                          {cat.name}
                        </Link>
                        {index < article.categories.length - 1 && <span>, </span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Main Article Text */}
                <div style={styles.content}>
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p style={styles.emptyContent}>This article has no content yet.</p>
                  )}
                </div>

                {/* Article Footer */}
                <div style={styles.articleFooter}>
                  <div style={styles.footerSection}>
                    <h3 style={styles.footerTitle}>Article Information</h3>
                    <p style={styles.footerText}>
                      This page was last edited on {formatDate(article.updated_at || article.created_at)}.
                    </p>
                  </div>

                  {/* Interaction Buttons */}
                  <div style={styles.interactionBar}>
                    <button style={styles.interactionButton}>
                      <FaThumbsUp /> Helpful
                    </button>
                    <button style={styles.interactionButton}>
                      <FaComment /> Discuss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Tab */}
            {activeTab === 'edit' && (
              <div style={styles.editContainer}>
                <h2 style={styles.editTitle}>Edit Article</h2>
                <p style={styles.editSubtitle}>
                  You are editing "{article.title}". Please provide a summary of your changes.
                </p>
                <Link to={`/wiki/article/${slug}/edit`} style={styles.editLink}>
                  <FaEdit /> Continue to Edit Page
                </Link>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div style={styles.historyContainer}>
                <h2 style={styles.historyTitle}>Revision History</h2>
                <p style={styles.historySubtitle}>
                  View all changes made to this article over time.
                </p>
                <Link to={`/wiki/article/${slug}/history`} style={styles.historyLink}>
                  <FaHistory /> View Full History
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Author Info */}
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>About the Author</h3>
              <div style={styles.authorInfo}>
                {article.author_avatar ? (
                  <img src={article.author_avatar} alt={article.author_name} style={styles.authorAvatar} />
                ) : (
                  <div style={styles.authorAvatarPlaceholder}>
                    <FaUser />
                  </div>
                )}
                <div style={styles.authorDetails}>
                  <Link to={`/wiki/user/${article.author_username}`} style={styles.authorName}>
                    {article.author_name || article.author_username}
                  </Link>
                  <p style={styles.authorMeta}>
                    Reputation: {article.author_reputation || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Article Stats */}
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Article Statistics</h3>
              <div style={styles.statList}>
                <div style={styles.statRow}>
                  <span>Views:</span>
                  <strong>{article.view_count || 0}</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Revisions:</span>
                  <strong>{article.total_revisions || 1}</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Categories:</span>
                  <strong>{article.categories?.length || 0}</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Created:</span>
                  <strong>{formatDate(article.created_at)}</strong>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div style={styles.sidebarCard}>
                <h3 style={styles.sidebarTitle}>Related Articles</h3>
                <div style={styles.relatedList}>
                  {relatedArticles
                    .filter(rel => rel.id !== article.id)
                    .slice(0, 5)
                    .map(rel => (
                      <Link key={rel.id} to={`/wiki/article/${rel.slug}`} style={styles.relatedItem}>
                        {rel.title}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    fontFamily: "'Inter', 'Poppins', sans-serif",
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #eaeef2',
    borderTop: '4px solid #C9A227',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
  },
  errorCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '400px',
  },
  errorTitle: {
    fontSize: '2rem',
    color: '#c62828',
    marginBottom: '15px',
  },
  errorMessage: {
    color: '#666',
    marginBottom: '25px',
    lineHeight: 1.6,
  },
  homeButton: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #C9A227 0%, #B38F1F 100%)',
    color: '#0F3D2E',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(201,162,39,0.3)',
    },
  },
  header: {
    background: 'linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)',
    color: 'white',
    padding: '40px 0',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    lineHeight: 1.3,
  },
  metaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
    fontSize: '0.95rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.9,
  },
  metaIcon: {
    fontSize: '1rem',
  },
  metaLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  featuredBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(201,162,39,0.2)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  featuredIcon: {
    color: '#C9A227',
  },
  actionBar: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  actionButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
  iconButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    ':hover': {
      background: 'rgba(255,255,255,0.2)',
    },
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '30px',
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
  },
  mainContent: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  articleContent: {
    padding: '30px',
  },
  categoriesBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '10px 0',
    marginBottom: '20px',
    borderBottom: '1px solid #eaeef2',
  },
  categoryIcon: {
    color: '#C9A227',
  },
  categoryLink: {
    color: '#0F3D2E',
    textDecoration: 'none',
    fontSize: '0.9rem',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  content: {
    fontSize: '1.1rem',
    lineHeight: 1.8,
    color: '#333',
    marginBottom: '30px',
  },
  emptyContent: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '40px',
  },
  articleFooter: {
    borderTop: '1px solid #eaeef2',
    padding: '20px 0',
  },
  footerSection: {
    marginBottom: '20px',
  },
  footerTitle: {
    fontSize: '1rem',
    color: '#0F3D2E',
    marginBottom: '10px',
  },
  footerText: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  interactionBar: {
    display: 'flex',
    gap: '15px',
  },
  interactionButton: {
    padding: '8px 16px',
    background: '#f8f9fa',
    border: '1px solid #eaeef2',
    borderRadius: '6px',
    color: '#666',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    ':hover': {
      background: '#eaeef2',
    },
  },
  editContainer: {
    padding: '60px',
    textAlign: 'center',
  },
  editTitle: {
    fontSize: '1.8rem',
    color: '#0F3D2E',
    marginBottom: '15px',
  },
  editSubtitle: {
    color: '#666',
    marginBottom: '30px',
  },
  editLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #C9A227 0%, #B38F1F 100%)',
    color: '#0F3D2E',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(201,162,39,0.3)',
    },
  },
  historyContainer: {
    padding: '60px',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: '1.8rem',
    color: '#0F3D2E',
    marginBottom: '15px',
  },
  historySubtitle: {
    color: '#666',
    marginBottom: '30px',
  },
  historyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 30px',
    background: '#f8f9fa',
    color: '#0F3D2E',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    border: '2px solid #eaeef2',
    transition: 'all 0.3s',
    ':hover': {
      background: '#eaeef2',
    },
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  sidebarTitle: {
    fontSize: '1.1rem',
    color: '#0F3D2E',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eaeef2',
  },
  authorInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  authorAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  authorAvatarPlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '1.5rem',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    display: 'block',
    fontWeight: '600',
    color: '#0F3D2E',
    textDecoration: 'none',
    marginBottom: '5px',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  authorMeta: {
    color: '#666',
    fontSize: '0.85rem',
  },
  statList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#666',
    fontSize: '0.95rem',
  },
  relatedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  relatedItem: {
    color: '#0F3D2E',
    textDecoration: 'none',
    fontSize: '0.95rem',
    padding: '5px 0',
    ':hover': {
      color: '#C9A227',
      textDecoration: 'underline',
    },
  },
};

// Add global animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default WikiArticlePage;