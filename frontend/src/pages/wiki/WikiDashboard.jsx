// WikiDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../landing/components/Navbar.jsx";
import { 
  FaEdit, 
  FaFileAlt, 
  FaUpload, 
  FaStar, 
  FaHistory,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
  FaTrophy,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaThumbsUp,
  FaComment,
  FaShare
} from "react-icons/fa";

const WikiDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [recentActivity, setRecentActivity] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/wiki/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user activity
      const activityRes = await fetch('http://localhost:5000/api/wiki/user/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const activityData = await activityRes.json();
      setRecentActivity(activityData.data || mockActivity);

      // Fetch contributions
      const contributionsRes = await fetch('http://localhost:5000/api/wiki/user/contributions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const contributionsData = await contributionsRes.json();
      setContributions(contributionsData.data || mockContributions);

      // Fetch notifications
      const notificationsRes = await fetch('http://localhost:5000/api/wiki/user/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const notificationsData = await notificationsRes.json();
      setNotifications(notificationsData.data || mockNotifications);

      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/wiki/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statsData = await statsRes.json();
      setStats(statsData.data || mockStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for demo
      setRecentActivity(mockActivity);
      setContributions(mockContributions);
      setNotifications(mockNotifications);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/wiki/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.welcomeSection}>
              <h1 style={styles.welcomeTitle}>
                Welcome back, {user?.full_name || user?.username}! 👋
              </h1>
              <p style={styles.welcomeSubtitle}>
                Here's what's happening with your contributions today.
              </p>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.notificationBtn}>
                <FaBell />
                {notifications.length > 0 && (
                  <span style={styles.notificationBadge}>{notifications.length}</span>
                )}
              </button>
              <button style={styles.settingsBtn}>
                <FaCog />
              </button>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <FaFileAlt style={styles.statIcon} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statValue}>{stats.totalArticles || 0}</span>
              <span style={styles.statLabel}>Articles Created</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <FaEdit style={styles.statIcon} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statValue}>{stats.totalEdits || 0}</span>
              <span style={styles.statLabel}>Total Edits</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <FaUpload style={styles.statIcon} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statValue}>{stats.totalUploads || 0}</span>
              <span style={styles.statLabel}>Media Uploads</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <FaStar style={styles.statIcon} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statValue}>{stats.reputationPoints || 0}</span>
              <span style={styles.statLabel}>Reputation Points</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Profile Card */}
            <div style={styles.profileCard}>
              <div style={styles.profileHeader}>
                {user?.profile?.avatar_url ? (
                  <img 
                    src={user.profile.avatar_url} 
                    alt="Profile" 
                    style={styles.profileAvatar}
                  />
                ) : (
                  <FaUserCircle style={styles.profileAvatarIcon} />
                )}
                <div style={styles.profileInfo}>
                  <h3 style={styles.profileName}>{user?.full_name || user?.username}</h3>
                  <p style={styles.profileUsername}>@{user?.username}</p>
                </div>
              </div>
              <div style={styles.profileStats}>
                <div style={styles.profileStat}>
                  <span style={styles.profileStatValue}>{stats.todayEdits || 0}</span>
                  <span style={styles.profileStatLabel}>Edits Today</span>
                </div>
                <div style={styles.profileStat}>
                  <span style={styles.profileStatValue}>{stats.articlesThisMonth || 0}</span>
                  <span style={styles.profileStatLabel}>This Month</span>
                </div>
                <div style={styles.profileStat}>
                  <span style={styles.profileStatValue}>{stats.rank || 'New'}</span>
                  <span style={styles.profileStatLabel}>Rank</span>
                </div>
              </div>
              <div style={styles.profileBadges}>
                {user?.profile?.is_verified && (
                  <span style={styles.verifiedBadge}>
                    <FaCheckCircle /> Verified Contributor
                  </span>
                )}
                {stats.reputationPoints > 100 && (
                  <span style={styles.contributorBadge}>
                    <FaTrophy /> Top Contributor
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.quickActionsCard}>
              <h3 style={styles.cardTitle}>Quick Actions</h3>
              <div style={styles.actionButtons}>
                <button style={styles.actionButton}>
                  <FaFileAlt /> <Link to={`/wiki/new-articles`}>New Article</Link> 
                </button>
                <button style={styles.actionButton}>
                  <FaUpload /><Link to={`/wiki/media/upload`}>Upload Media</Link> 
                </button>
                <button style={styles.actionButton}>
                  <FaHistory /> Recent Changes
                </button>
                <button style={styles.actionButton}>
                  <FaChartLine /> My Analytics
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div style={styles.notificationsCard}>
              <h3 style={styles.cardTitle}>Notifications</h3>
              {notifications.length > 0 ? (
                <div style={styles.notificationList}>
                  {notifications.map((notif, index) => (
                    <div key={index} style={styles.notificationItem}>
                      <div style={styles.notificationIcon}>
                        {notif.type === 'mention' && <FaComment />}
                        {notif.type === 'edit' && <FaEdit />}
                        {notif.type === 'achievement' && <FaTrophy />}
                      </div>
                      <div style={styles.notificationContent}>
                        <p style={styles.notificationText}>{notif.message}</p>
                        <span style={styles.notificationTime}>{formatDate(notif.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>No new notifications</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Tabs */}
            <div style={styles.tabsContainer}>
              <button 
                style={{...styles.tab, ...(activeTab === 'overview' && styles.activeTab)}}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                style={{...styles.tab, ...(activeTab === 'activity' && styles.activeTab)}}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
              <button 
                style={{...styles.tab, ...(activeTab === 'contributions' && styles.activeTab)}}
                onClick={() => setActiveTab('contributions')}
              >
                Contributions
              </button>
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
              {activeTab === 'overview' && (
                <div style={styles.overviewTab}>
                  {/* Activity Feed */}
                  <div style={styles.activityCard}>
                    <h3 style={styles.cardTitle}>Recent Activity</h3>
                    {recentActivity.length > 0 ? (
                      <div style={styles.activityList}>
                        {recentActivity.map((activity, index) => (
                          <div key={index} style={styles.activityItem}>
                            <div style={styles.activityIcon}>
                              {activity.type === 'create' && <FaFileAlt style={{color: '#4CAF50'}} />}
                              {activity.type === 'edit' && <FaEdit style={{color: '#2196F3'}} />}
                              {activity.type === 'upload' && <FaUpload style={{color: '#FF9800'}} />}
                            </div>
                            <div style={styles.activityContent}>
                              <p style={styles.activityText}>
                                <strong>{activity.action}</strong> {activity.details}
                              </p>
                              <span style={styles.activityTime}>
                                <FaClock /> {formatDate(activity.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.noData}>No recent activity</p>
                    )}
                  </div>

                  {/* Today's Stats */}
                  <div style={styles.todayStatsCard}>
                    <h3 style={styles.cardTitle}>Today's Stats</h3>
                    <div style={styles.todayStatsGrid}>
                      <div style={styles.todayStat}>
                        <span style={styles.todayStatLabel}>Edits Made</span>
                        <span style={styles.todayStatValue}>{stats.todayEdits || 0}</span>
                      </div>
                      <div style={styles.todayStat}>
                        <span style={styles.todayStatLabel}>Articles Created</span>
                        <span style={styles.todayStatValue}>{stats.todayArticles || 0}</span>
                      </div>
                      <div style={styles.todayStat}>
                        <span style={styles.todayStatLabel}>Media Uploaded</span>
                        <span style={styles.todayStatValue}>{stats.todayUploads || 0}</span>
                      </div>
                      <div style={styles.todayStat}>
                        <span style={styles.todayStatLabel}>Views Today</span>
                        <span style={styles.todayStatValue}>{stats.todayViews || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div style={styles.activityTab}>
                  <div style={styles.timelineCard}>
                    <h3 style={styles.cardTitle}>Activity Timeline</h3>
                    <div style={styles.timeline}>
                      {recentActivity.map((activity, index) => (
                        <div key={index} style={styles.timelineItem}>
                          <div style={styles.timelineDot} />
                          <div style={styles.timelineContent}>
                            <div style={styles.timelineHeader}>
                              <span style={styles.timelineType}>{activity.type}</span>
                              <span style={styles.timelineDate}>
                                {new Date(activity.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p style={styles.timelineText}>{activity.details}</p>
                            {activity.article && (
                              <a href={`/wiki/article/${activity.article.slug}`} style={styles.timelineLink}>
                                View Article →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contributions' && (
                <div style={styles.contributionsTab}>
                  <div style={styles.contributionsCard}>
                    <h3 style={styles.cardTitle}>My Articles</h3>
                    {contributions.articles?.length > 0 ? (
                      <div style={styles.articlesList}>
                        {contributions.articles.map((article, index) => (
                          <div key={index} style={styles.articleItem}>
                            <div style={styles.articleInfo}>
                              <h4 style={styles.articleTitle}>{article.title}</h4>
                              <div style={styles.articleMeta}>
                                <span style={styles.articleStatus}>
                                  {article.status}
                                </span>
                                <span style={styles.articleDate}>
                                  {formatDate(article.created_at)}
                                </span>
                              </div>
                            </div>
                            <div style={styles.articleStats}>
                              <span title="Views"><FaEye /> {article.views || 0}</span>
                              <span title="Edits"><FaEdit /> {article.edit_count || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.noData}>No articles created yet</p>
                    )}

                    <h3 style={{...styles.cardTitle, marginTop: '30px'}}>Recent Edits</h3>
                    {contributions.edits?.length > 0 ? (
                      <div style={styles.editsList}>
                        {contributions.edits.map((edit, index) => (
                          <div key={index} style={styles.editItem}>
                            <div style={styles.editInfo}>
                              <p style={styles.editText}>
                                <strong>{edit.article_title}</strong> - {edit.summary || 'No summary'}
                              </p>
                              <span style={styles.editTime}>
                                <FaClock /> {formatDate(edit.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.noData}>No edits yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Mock data for demonstration
const mockActivity = [
  {
    type: 'create',
    action: 'Created new article',
    details: '"Oromo Language History"',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'edit',
    action: 'Edited article',
    details: '"Gadaa System" - added references',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'upload',
    action: 'Uploaded media',
    details: 'Image of traditional Oromo ceremony',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'edit',
    action: 'Edited article',
    details: '"Irreecha Festival" - fixed typos',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockContributions = {
  articles: [
    {
      title: 'Oromo Language History',
      status: 'published',
      views: 1245,
      edit_count: 8,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Gadaa System',
      status: 'published',
      views: 3456,
      edit_count: 15,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  edits: [
    {
      article_title: 'Irreecha Festival',
      summary: 'Added historical context',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      article_title: 'Oromo Music',
      summary: 'Added references',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

const mockNotifications = [
  {
    type: 'mention',
    message: '@Abdi mentioned you in Gadaa System discussion',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'edit',
    message: 'Your article "Oromo Language" was edited',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'achievement',
    message: 'Congratulations! You reached 100 edits',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockStats = {
  totalArticles: 5,
  totalEdits: 47,
  totalUploads: 12,
  reputationPoints: 245,
  todayEdits: 3,
  todayArticles: 1,
  todayUploads: 0,
  todayViews: 156,
  articlesThisMonth: 2,
  rank: 'Bronze'
};

/* STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f9fa",
    fontFamily: "'Inter', 'Poppins', sans-serif",
    paddingBottom: "40px",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #eaeef2",
    borderTop: "4px solid #C9A227",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  header: {
    background: "linear-gradient(135deg, #0F3D2E 0%, #1A5439 100%)",
    color: "white",
    padding: "30px 40px",
    marginBottom: "30px",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: "2rem",
    margin: 0,
    marginBottom: "10px",
  },
  welcomeSubtitle: {
    fontSize: "1rem",
    opacity: 0.9,
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "15px",
  },
  notificationBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    color: "white",
    fontSize: "1.2rem",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,255,255,0.2)",
    },
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#C9A227",
    color: "#0F3D2E",
    fontSize: "0.7rem",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  settingsBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    color: "white",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,255,255,0.2)",
    },
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    color: "white",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,68,68,0.3)",
    },
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto 30px",
    padding: "0 20px",
  },
  statCard: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    },
  },
  statIconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    background: "rgba(201,162,39,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    fontSize: "1.8rem",
    color: "#C9A227",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#0F3D2E",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#666",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "25px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  profileCard: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  profileAvatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profileAvatarIcon: {
    fontSize: "4rem",
    color: "#C9A227",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: "1.2rem",
    margin: 0,
    marginBottom: "5px",
    color: "#0F3D2E",
  },
  profileUsername: {
    fontSize: "0.9rem",
    color: "#666",
    margin: 0,
  },
  profileStats: {
    display: "flex",
    justifyContent: "space-around",
    padding: "15px 0",
    borderTop: "1px solid #eaeef2",
    borderBottom: "1px solid #eaeef2",
    marginBottom: "15px",
  },
  profileStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  profileStatValue: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#0F3D2E",
  },
  profileStatLabel: {
    fontSize: "0.8rem",
    color: "#666",
  },
  profileBadges: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  verifiedBadge: {
    background: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  contributorBadge: {
    background: "rgba(255, 193, 7, 0.1)",
    color: "#FF9800",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  quickActionsCard: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "1.1rem",
    color: "#0F3D2E",
    margin: 0,
    marginBottom: "15px",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  actionButton: {
    padding: "12px",
    background: "#f8f9fa",
    border: "1px solid #eaeef2",
    borderRadius: "10px",
    color: "#0F3D2E",
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#C9A227",
      color: "#0F3D2E",
      borderColor: "#C9A227",
    },
  },
  notificationsCard: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  notificationItem: {
    display: "flex",
    gap: "12px",
    padding: "10px",
    borderRadius: "10px",
    background: "#f8f9fa",
    transition: "background 0.3s ease",
    ":hover": {
      background: "#eaeef2",
    },
  },
  notificationIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#C9A227",
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    margin: 0,
    marginBottom: "5px",
    fontSize: "0.9rem",
    color: "#333",
  },
  notificationTime: {
    fontSize: "0.75rem",
    color: "#999",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  tabsContainer: {
    display: "flex",
    gap: "10px",
    background: "white",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  tab: {
    flex: 1,
    padding: "12px",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeTab: {
    background: "#C9A227",
    color: "#0F3D2E",
  },
  tabContent: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  overviewTab: {
    display: "grid",
    gap: "25px",
  },
  activityCard: {
    width: "100%",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  activityItem: {
    display: "flex",
    gap: "15px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "10px",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateX(5px)",
    },
  },
  activityIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    margin: 0,
    marginBottom: "5px",
    fontSize: "0.95rem",
    color: "#333",
  },
  activityTime: {
    fontSize: "0.8rem",
    color: "#999",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  todayStatsCard: {
    width: "100%",
  },
  todayStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },
  todayStat: {
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  todayStatLabel: {
    fontSize: "0.85rem",
    color: "#666",
  },
  todayStatValue: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#0F3D2E",
  },
  timelineCard: {
    width: "100%",
  },
  timeline: {
    position: "relative",
    paddingLeft: "20px",
  },
  timelineItem: {
    position: "relative",
    paddingBottom: "25px",
    paddingLeft: "20px",
    borderLeft: "2px solid #eaeef2",
    marginLeft: "10px",
  },
  timelineDot: {
    position: "absolute",
    left: "-6px",
    top: "0",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#C9A227",
    border: "2px solid white",
  },
  timelineContent: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "10px",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  timelineType: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#C9A227",
    textTransform: "uppercase",
  },
  timelineDate: {
    fontSize: "0.8rem",
    color: "#999",
  },
  timelineText: {
    margin: 0,
    marginBottom: "8px",
    fontSize: "0.95rem",
    color: "#333",
  },
  timelineLink: {
    fontSize: "0.85rem",
    color: "#0F3D2E",
    textDecoration: "none",
    fontWeight: "500",
    ":hover": {
      textDecoration: "underline",
    },
  },
  contributionsCard: {
    width: "100%",
  },
  articlesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  articleItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "10px",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateX(5px)",
    },
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: "1rem",
    margin: 0,
    marginBottom: "5px",
    color: "#0F3D2E",
  },
  articleMeta: {
    display: "flex",
    gap: "10px",
  },
  articleStatus: {
    fontSize: "0.8rem",
    color: "#4CAF50",
    background: "rgba(76, 175, 80, 0.1)",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  articleDate: {
    fontSize: "0.8rem",
    color: "#999",
  },
  articleStats: {
    display: "flex",
    gap: "15px",
    color: "#666",
    fontSize: "0.85rem",
  },
  editsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  editItem: {
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  editInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editText: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#333",
  },
  editTime: {
    fontSize: "0.8rem",
    color: "#999",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  noData: {
    textAlign: "center",
    color: "#999",
    padding: "30px",
    background: "#f8f9fa",
    borderRadius: "10px",
    margin: 0,
  },
};

// Add global animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default WikiDashboard;