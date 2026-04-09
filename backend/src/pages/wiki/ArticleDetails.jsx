import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  getArticleBySlug, 
  getArticleRevisions,
  reportVandalism,
  getArticleHistory
} from "../../api/vandalism.wikiArticle.api";
import MainLayout from "../../components/layout/MainLayout";
import ReactMarkdown from 'react-markdown';
import { 
  FaEdit, 
  FaHistory, 
  FaFlag, 
  FaLock, 
  FaUnlock,
  FaArrowLeft,
  FaClock,
  FaUser,
  FaEye,
  FaTags,
  FaExclamationTriangle
} from "react-icons/fa";

export default function ArticleDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view"); // view, revisions, history
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });

  const isAdmin = currentUser?.role === 'Wikipedia Administrator' || currentUser?.role === 'sysop';
  const canEdit = currentUser && (article?.status === 'draft' || article?.status === 'under_review' || isAdmin);

  // Fetch article
  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await getArticleBySlug(slug);
      setArticle(res.data.data);
      
      // Fetch revisions if on revisions tab
      if (activeTab === "revisions") {
        fetchRevisions(res.data.data.id);
      }
      
      // Fetch history if on history tab
      if (activeTab === "history") {
        fetchHistory(res.data.data.id);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load article'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch revisions
  const fetchRevisions = async (articleId) => {
    try {
      const res = await getArticleRevisions(articleId);
      setRevisions(res.data.data);
    } catch (err) {
      console.error("Error fetching revisions:", err);
    }
  };

  // Fetch history
  const fetchHistory = async (articleId) => {
    try {
      const res = await getArticleHistory(articleId);
      setHistory(res.data.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // Report vandalism
  const handleReportVandalism = async () => {
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'You need to be logged in to report vandalism'
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Report Vandalism',
      html: `
        <div class="mb-3">
          <label class="form-label">Reason for report</label>
          <select id="reason" class="form-select">
            <option value="vandalism">Vandalism</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="copyright">Copyright violation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Details</label>
          <textarea id="details" class="form-control" rows="4" placeholder="Provide specific details about the vandalism..."></textarea>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          reason: document.getElementById('reason').value,
          details: document.getElementById('details').value
        };
      },
      showCancelButton: true,
      confirmButtonText: 'Submit Report',
      confirmButtonColor: '#dc3545'
    });

    if (formValues) {
      try {
        await reportVandalism(article.id, formValues);
        Swal.fire({
          icon: 'success',
          title: 'Report Submitted',
          text: 'Thank you for helping keep Wikipedia clean! An administrator will review your report.'
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to submit report'
        });
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="container py-5 text-center">
          <FaExclamationTriangle className="text-warning mb-3" size={48} />
          <h2>Article Not Found</h2>
          <p className="text-muted">The article you're looking for doesn't exist.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/wiki/articles')}
          >
            <FaArrowLeft className="me-2" /> Back to Articles
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        {/* Navigation Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/wiki/articles')}
          >
            <FaArrowLeft className="me-2" /> Back to Articles
          </button>
          
          <div className="btn-group">
            <button 
              className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('view')}
            >
              <FaEye className="me-2" /> View
            </button>
            <button 
              className={`btn ${activeTab === 'revisions' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setActiveTab('revisions');
                fetchRevisions(article.id);
              }}
            >
              <FaHistory className="me-2" /> Revisions
            </button>
            <button 
              className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setActiveTab('history');
                fetchHistory(article.id);
              }}
            >
              <FaClock className="me-2" /> History
            </button>
          </div>

          <div className="btn-group">
            {canEdit && (
              <Link 
                to={`/wiki/articles/edit/${article.id}`}
                className="btn btn-warning"
              >
                <FaEdit className="me-2" /> Edit
              </Link>
            )}
            <button 
              className="btn btn-danger"
              onClick={handleReportVandalism}
            >
              <FaFlag className="me-2" /> Report
            </button>
          </div>
        </div>

        {/* Article Status Banner */}
        {article.status !== 'published' && (
          <div className={`alert ${article.status === 'draft' ? 'alert-warning' : 'alert-info'} mb-4`}>
            <strong>Status: {article.status.replace('_', ' ').toUpperCase()}</strong>
            {article.status === 'under_review' && ' - This article is pending review by an administrator'}
            {article.status === 'draft' && ' - This is a draft and not publicly visible'}
          </div>
        )}

        {/* Protection Banner */}
        {article.protection_level && (
          <div className="alert alert-danger mb-4">
            <FaLock className="me-2" />
            <strong>This article is {article.protection_level === 'full' ? 'fully protected' : 'semi-protected'}</strong>
            {article.protection_reason && <p className="mb-0 mt-2 small">{article.protection_reason}</p>}
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="card">
          <div className="card-body">
            {activeTab === 'view' && (
              <>
                {/* Article Header */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h1 className="mb-2">{article.title}</h1>
                    <div className="text-muted small">
                      <FaUser className="me-1" /> By {article.author_name || 'Unknown'} • 
                      <FaClock className="ms-2 me-1" /> Last updated {new Date(article.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="badge bg-primary me-2">Views: {article.view_count || 0}</span>
                    {article.is_featured && (
                      <span className="badge bg-warning">Featured</span>
                    )}
                  </div>
                </div>

                {/* Categories */}
                {article.categories?.length > 0 && (
                  <div className="mb-4">
                    <FaTags className="me-2 text-muted" />
                    {article.categories.map(cat => (
                      <span key={cat.id} className="badge bg-secondary me-1">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Article Content */}
                <div className="article-content">
                  <ReactMarkdown>
                    {article.content || '*No content available*'}
                  </ReactMarkdown>
                </div>
              </>
            )}

            {activeTab === 'revisions' && (
              <div>
                <h3 className="mb-4">Article Revisions</h3>
                <div className="list-group">
                  {revisions.map((rev, index) => (
                    <div key={rev.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Version {rev.version}</strong>
                          {rev.is_current && (
                            <span className="badge bg-success ms-2">Current</span>
                          )}
                          <div className="small text-muted">
                            {new Date(rev.created_at).toLocaleString()} by {rev.editor_name || 'Unknown'}
                          </div>
                          {rev.summary && (
                            <div className="mt-1 small">
                              <em>"{rev.summary}"</em>
                            </div>
                          )}
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {/* View revision */}}
                          >
                            <FaEye /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="mb-4">Article History</h3>
                <div className="timeline">
                  {history.map((event, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{event.action}</strong>
                            <span className="badge bg-info ms-2">{event.contribution_type}</span>
                            <div className="small text-muted">
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted">By {event.user_name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .article-content {
          line-height: 1.6;
          font-size: 1.1rem;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
        }
        .article-content pre {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .article-content blockquote {
          border-left: 4px solid #dee2e6;
          padding-left: 1rem;
          color: #6c757d;
        }
      `}</style>
    </MainLayout>
  );
}