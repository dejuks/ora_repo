import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";

export default function OromoWikipedia() {
  const [activeTab, setActiveTab] = useState('submissions');
  const [loading, setLoading] = useState({
    stats: true,
    articles: true,
    activity: true,
    media: true
  });
  
  // State for data from API
  const [wikiStats, setWikiStats] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [userContributions, setUserContributions] = useState({ articles: [], edits: [] });
  const [mediaStats, setMediaStats] = useState(null);
  const [languageStats, setLanguageStats] = useState([]);
  const [userMedia, setUserMedia] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch wiki statistics
      setLoading(prev => ({ ...prev, stats: true }));
      try {
        const statsRes = await axios.get('http://localhost:5000/api/wiki/articles/stats');
        if (statsRes.data.success) {
          setWikiStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching wiki stats:", err);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }

      // Fetch recent articles
      setLoading(prev => ({ ...prev, articles: true }));
      try {
        const recentRes = await axios.get('http://localhost:5000/api/wiki/articles/recent?limit=6');
        if (recentRes.data.success) {
          setRecentArticles(recentRes.data.data);
        }

        const popularRes = await axios.get('http://localhost:5000/api/wiki/articles/popular?limit=6');
        if (popularRes.data.success) {
          setPopularArticles(popularRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(prev => ({ ...prev, articles: false }));
      }

      // Fetch language statistics
      try {
        const langRes = await axios.get('http://localhost:5000/api/wiki/articles/languages/stats');
        if (langRes.data.success) {
          setLanguageStats(langRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching language stats:", err);
      }

      // Fetch media statistics
      try {
        const mediaStatsRes = await axios.get('http://localhost:5000/api/wiki/media/stats');
        if (mediaStatsRes.data.success) {
          setMediaStats(mediaStatsRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching media stats:", err);
      }

      // Fetch authenticated user data
      await fetchUserData();

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch user stats
      setLoading(prev => ({ ...prev, stats: true }));
      const statsRes = await axios.get('http://localhost:5000/api/wiki/articles/user/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.success) {
        setUserStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }

    try {
      // Fetch user activity
      setLoading(prev => ({ ...prev, activity: true }));
      const activityRes = await axios.get('http://localhost:5000/api/wiki/articles/admin/activity?limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activityRes.data.success) {
        setUserActivity(activityRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching user activity:", err);
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }

    try {
      // Fetch user contributions
      const contributionsRes = await axios.get('http://localhost:5000/api/wiki/articles/user/contributions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (contributionsRes.data.success) {
        setUserContributions(contributionsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching user contributions:", err);
    }

    try {
      // Fetch user media
      const mediaRes = await axios.get('http://localhost:5000/api/wiki/media/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mediaRes.data.success) {
        setUserMedia(mediaRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching user media:", err);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'published': { class: 'badge bg-success', label: 'Published' },
      'draft': { class: 'badge bg-secondary', label: 'Draft' },
      'under_review': { class: 'badge bg-warning', label: 'Under Review' },
      'archived': { class: 'badge bg-danger', label: 'Archived' }
    };
    const statusInfo = statusMap[status] || { class: 'badge bg-info', label: status };
    return <span className={statusInfo.class}>{statusInfo.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Prepare stats for display
  const displayStats = [
    {
      id: 1,
      title: "Total Articles",
      count: wikiStats?.totalArticles?.toLocaleString() || "0",
      icon: "fas fa-book",
      color: "bg-info",
      progress: wikiStats ? Math.min(100, Math.round((wikiStats.published_articles / wikiStats.totalArticles) * 100)) : 0,
      trend: wikiStats ? `+${wikiStats.articleByMonth || 0} this month` : "0 this month"
    },
    {
      id: 2,
      title: "Active Editors",
      count: wikiStats?.totalEdits?.toLocaleString() || "0",
      icon: "fas fa-users",
      color: "bg-success",
      progress: wikiStats ? Math.min(100, Math.round((wikiStats.active_editors_last_30_days || 0) / (wikiStats.totalEdits || 1) * 100)) : 0,
      trend: `${wikiStats?.active_editors_last_30_days || 0} last 30 days`
    },
    {
      id: 3,
      title: "New Articles",
      count: wikiStats?.articleByMonth?.toLocaleString() || "0",
      icon: "fas fa-plus-circle",
      color: "bg-warning",
      progress: wikiStats ? Math.min(100, Math.round((wikiStats.articleByMonth / (wikiStats.total_articles || 1)) * 100)) : 0,
      trend: `${wikiStats?.articlesThisWeek || 0} this week`
    },
    
    {
      id: 4,
      title: "Media Files",
      count: mediaStats?.total_media?.toLocaleString() || "0",
      icon: "fas fa-images",
      color: "bg-primary",
      progress: mediaStats ? Math.min(100, Math.round((mediaStats.wikimediaUplaoded || 0) / (mediaStats.wikimediaUplaoded || 1) * 100)) : 0,
      trend: `${mediaStats?.wikimediaUploadedfilesize || 0} MB total`
    },
    
  ];

  return (
    <MainLayout>
      {/* Content Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="text-dark">
                Oromo Wikipedia Dashboard
                <small className="text-muted ml-2">Article Submission Overview</small>
              </h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right bg-transparent">
                <li className="breadcrumb-item"><a href="/wiki/dashboard">Home</a></li>
                <li className="breadcrumb-item"><a href="#">Wikipedia</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
              <button type="button" className="close" onClick={() => setError(null)}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          )}

          {/* Info Boxes - Dynamic Data */}
          <div className="row">
            {displayStats.map((item) => (
              <div key={item.id} className="col-lg-3 col-md-4 col-sm-6 col-12">
                <div className="info-box bg-white shadow-sm border-0 rounded-lg mb-3">
                  <span className={`info-box-icon ${item.color} rounded-lg elevation-1`}>
                    <i className={item.icon}></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text text-muted">{item.title}</span>
                    <span className="info-box-number text-dark font-weight-bold">
                      {loading.stats ? <i className="fas fa-spinner fa-spin"></i> : item.count}
                    </span>
                    <div className="progress mt-2" style={{ height: '4px' }}>
                      <div className={`progress-bar ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <span className="progress-description text-xs text-muted">
                      {item.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
        

          {/* Tabs for Content */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card card-outline card-secondary shadow">
                <div className="card-header bg-white p-2">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <a 
                        className={`nav-link ${activeTab === 'submissions' ? 'active' : ''}`} 
                        href="#submissions"
                        onClick={(e) => { e.preventDefault(); setActiveTab('submissions'); }}
                      >
                        <i className="fas fa-file-alt mr-2"></i> Recent Submissions
                      </a>
                    </li>
                    <li className="nav-item">
                      <a 
                        className={`nav-link ${activeTab === 'popular' ? 'active' : ''}`} 
                        href="#popular"
                        onClick={(e) => { e.preventDefault(); setActiveTab('popular'); }}
                      >
                        <i className="fas fa-fire mr-2"></i> Popular Articles
                      </a>
                    </li>
                   
                    <li className="nav-item">
                      <a 
                        className={`nav-link ${activeTab === 'media' ? 'active' : ''}`} 
                        href="#media"
                        onClick={(e) => { e.preventDefault(); setActiveTab('media'); }}
                      >
                        <i className="fas fa-images mr-2"></i> Your Media
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  {activeTab === 'submissions' && (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="bg-light">
                          <tr>
                            <th>Article Title</th>
                            <th>Author</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading.articles ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4">
                                <i className="fas fa-spinner fa-spin mr-2"></i>Loading articles...
                              </td>
                            </tr>
                          ) : recentArticles.length > 0 ? (
                            recentArticles.map((article) => (
                              <tr key={article.id}>
                                <td className="font-weight-bold">
                                  <a href={`/wiki/article/${article.slug}`}>{article.title}</a>
                                </td>
                                <td>{article.author_name || 'Unknown'}</td>
                                <td>{getStatusBadge(article.status)}</td>
                                <td>{article.view_count?.toLocaleString() || 0}</td>
                                <td>{formatDate(article.created_at)}</td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary mr-1" title="View">
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  {article.status === 'under_review' && (
                                    <button className="btn btn-sm btn-outline-success" title="Review">
                                      <i className="fas fa-check"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center py-4 text-muted">
                                No recent articles found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'popular' && (
                    <div className="row">
                      {loading.articles ? (
                        <div className="col-12 text-center py-4">
                          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                        </div>
                      ) : popularArticles.length > 0 ? (
                        popularArticles.map((article) => (
                          <div className="col-md-6 col-lg-4 mb-3" key={article.id}>
                            <div className="card h-100">
                              <div className="card-body">
                                <h5 className="card-title">
                                  <a href={`/wiki/article/${article.slug}`} className="text-dark">
                                    {article.title}
                                  </a>
                                </h5>
                                <p className="card-text text-muted small mt-2">
                                  {article.excerpt || 'No description available'}
                                </p>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <span className="badge badge-info">
                                    <i className="fas fa-eye mr-1"></i> {article.view_count?.toLocaleString() || 0} views
                                  </span>
                                  <small className="text-muted">
                                    {formatRelativeTime(article.created_at)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-12 text-center py-4 text-muted">
                          No popular articles found
                        </div>
                      )}
                    </div>
                  )}


                  {activeTab === 'media' && (
                    <div>
                      <div className="row mb-3">
                        <div className="col-12">
                          <button className="btn btn-primary float-right">
                            <i className="fas fa-upload mr-2"></i>Upload Media
                          </button>
                        </div>
                      </div>
                      <div className="row">
                        {userMedia.length > 0 ? (
                          userMedia.map((media) => (
                            <div className="col-md-4 col-sm-6 mb-3" key={media.id}>
                              <div className="card">
                                {media.file_type?.startsWith('image/') ? (
                                  <img src={media.file_path} className="card-img-top" alt={media.title} style={{ height: '150px', objectFit: 'cover' }} />
                                ) : (
                                  <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                                    <i className="fas fa-file fa-3x text-muted"></i>
                                  </div>
                                )}
                                <div className="card-body p-2">
                                  <h6 className="card-title mb-1">{media.title}</h6>
                                  <p className="card-text small text-muted mb-0">
                                    {media.file_size ? `${(media.file_size / 1024).toFixed(1)} KB` : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-12 text-center py-4 text-muted">
                            No media uploaded yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="row mt-4">
            <div className="col-lg-6">
              <div className="card bg-gradient-light">
                <div className="card-header border-0 bg-white">
                  <h3 className="card-title">
                    <i className="fas fa-language mr-2 text-primary"></i>
                    About Oromo Wikipedia
                  </h3>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Oromo Wikipedia is a collaborative knowledge platform dedicated to preserving, 
                    expanding, and sharing content in the Afaan Oromo language.
                  </p>
                  <div className="row mt-3">
                    <div className="col-6">
                      <ul className="list-unstyled">
                        <li><i className="fas fa-check-circle text-success mr-2"></i> {wikiStats?.total_articles || 0} articles</li>
                        <li><i className="fas fa-check-circle text-success mr-2"></i> {wikiStats?.total_editors || 0} editors</li>
                        <li><i className="fas fa-check-circle text-success mr-2"></i> {wikiStats?.total_edits?.toLocaleString() || 0} edits</li>
                      </ul>
                    </div>
                    <div className="col-6">
                      <ul className="list-unstyled">
                        <li><i className="fas fa-check-circle text-success mr-2"></i> {wikiStats?.total_views?.toLocaleString() || 0} views</li>
                        <li><i className="fas fa-check-circle text-success mr-2"></i> {mediaStats?.total_media || 0} media files</li>
                        <li><i className="fas fa-check-circle text-success mr-2"></i> Active community</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card bg-white">
                <div className="card-header border-0">
                  <h3 className="card-title">
                    <i className="fas fa-tasks mr-2 text-warning"></i>
                    Quick Stats
                  </h3>
                </div>
                <div className="card-body">
                  <div className="progress-group mb-3">
                    <span className="progress-text">Published Articles</span>
                    <span className="float-right">
                      <b>{wikiStats?.published_articles || 0}</b>/{wikiStats?.total_articles || 0}
                    </span>
                    <div className="progress progress-sm">
                      <div className="progress-bar bg-success" style={{ width: `${wikiStats ? (wikiStats.published_articles / wikiStats.total_articles * 100) : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="progress-group mb-3">
                    <span className="progress-text">Under Review</span>
                    <span className="float-right"><b>{wikiStats?.under_review_articles || 0}</b></span>
                    <div className="progress progress-sm">
                      <div className="progress-bar bg-warning" style={{ width: `${wikiStats ? (wikiStats.under_review_articles / wikiStats.total_articles * 100) : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="progress-group mb-3">
                    <span className="progress-text">Drafts</span>
                    <span className="float-right"><b>{wikiStats?.draft_articles || 0}</b></span>
                    <div className="progress progress-sm">
                      <div className="progress-bar bg-info" style={{ width: `${wikiStats ? (wikiStats.draft_articles / wikiStats.total_articles * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 text-center">
                  <button className="btn btn-primary btn-sm px-4">
                    <i className="fas fa-plus-circle mr-2"></i>Submit New Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bg-purple {
          background-color: #6f42c1 !important;
        }
        .info-box {
          min-height: 100px;
          transition: transform 0.2s;
        }
        .info-box:hover {
          transform: translateY(-3px);
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
        }
        .info-box-icon {
          border-radius: 0.5rem !important;
          transition: all 0.3s;
        }
        .info-box:hover .info-box-icon {
          transform: scale(1.1);
        }
        .card {
          border-radius: 0.5rem;
          transition: box-shadow 0.3s;
        }
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1) !important;
        }
        .nav-pills .nav-link.active {
          background: linear-gradient(135deg, #007bff, #00bcd4);
        }
        .table th {
          border-top: none;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
        }
        .badge {
          font-weight: 500;
          padding: 0.35rem 0.65rem;
        }
        .timeline {
          position: relative;
          padding: 20px 0;
        }
        .time-label {
          position: relative;
          margin: 20px 0;
        }
      `}</style>
    </MainLayout>
  );
}