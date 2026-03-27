import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { 
  FaFolder, FaFolderOpen, FaPlus, FaUsers, 
  FaFileImport, FaChartLine, FaUserGraduate, 
  FaGlobe, FaDownload, FaEye, FaStar, 
  FaClock, FaCalendarAlt, FaFileUpload, 
  FaFileAlt, FaCheckCircle, FaTimesCircle, 
  FaSync, FaPenFancy, FaBookOpen, FaHeart
} from "react-icons/fa";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';

export default function RepositoryDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  // ===============================
  // MOCK DATA FOR MANUSCRIPT STATUS
  // ===============================
  const manuscriptStats = [
    {
      id: 1,
      title: "Total Uploaded Manuscripts",
      count: 1243,
      icon: <FaFileUpload className="text-2xl" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      trend: "+15%",
      description: "All manuscripts submitted to the repository"
    },
    {
      id: 2,
      title: "Under Review",
      count: 342,
      icon: <FaSync className="text-2xl" />,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      trend: "+8%",
      description: "Manuscripts currently under review"
    },
    {
      id: 3,
      title: "Revised Manuscripts",
      count: 156,
      icon: <FaPenFancy className="text-2xl" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      trend: "+12%",
      description: "Manuscripts requiring revisions"
    },
    {
      id: 4,
      title: "Approved Manuscripts",
      count: 892,
      icon: <FaCheckCircle className="text-2xl" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      trend: "+23%",
      description: "Successfully approved manuscripts"
    },
    {
      id: 5,
      title: "Rejected Manuscripts",
      count: 78,
      icon: <FaTimesCircle className="text-2xl" />,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      trend: "-5%",
      description: "Manuscripts that were rejected"
    },
    {
      id: 6,
      title: "Pending Decision",
      count: 45,
      icon: <FaClock className="text-2xl" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      trend: "+3%",
      description: "Awaiting final decision"
    },
  ];

  // ===============================
  // REPOSITORY STATS MOCK DATA
  // ===============================
  const repositoryStats = [
    {
      id: 1,
      title: "Total Repositories",
      count: 1243,
      icon: <FaFolder className="text-2xl" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      trend: "+12%"
    },
    {
      id: 2,
      title: "Active Repositories",
      count: 892,
      icon: <FaFolderOpen className="text-2xl" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      trend: "+8%"
    },
    {
      id: 3,
      title: "Total Authors",
      count: 342,
      icon: <FaUserGraduate className="text-2xl" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      trend: "+15%"
    },
    {
      id: 4,
      title: "Total Downloads",
      count: 45600,
      icon: <FaDownload className="text-2xl" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      trend: "+23%"
    },
    {
      id: 5,
      title: "Total Views",
      count: 234500,
      icon: <FaEye className="text-2xl" />,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      trend: "+18%"
    },
    {
      id: 6,
      title: "Contributors",
      count: 156,
      icon: <FaUsers className="text-2xl" />,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      trend: "+5%"
    },
  ];

  // ===============================
  // RECENT ACTIVITIES MOCK DATA
  // ===============================
  const recentActivities = [
    { id: 1, action: "New manuscript uploaded", user: "Dr. Tsegaye Gebre", time: "2 hours ago", type: "upload", manuscript: "Oromo Wisdom: Traditional Stories" },
    { id: 2, action: "Manuscript approved", user: "Prof. Asmarom Legesse", time: "5 hours ago", type: "approved", manuscript: "Gadaa System Analysis" },
    { id: 3, action: "Revision requested", user: "Almaz Tilahun", time: "1 day ago", type: "revision", manuscript: "Learning Afaan Oromo: Book 1" },
    { id: 4, action: "Manuscript rejected", user: "Dr. Worku Fufa", time: "2 days ago", type: "rejected", manuscript: "Traditional Medicine Study" },
    { id: 5, action: "New manuscript submitted", user: "Tesfaye Lemma", time: "3 days ago", type: "upload", manuscript: "Oromo Music History" },
    { id: 6, action: "Repository created", user: "Dr. Tsegaye Gebre", time: "4 days ago", type: "create", manuscript: "Oromo Literature Archive" },
    { id: 7, action: "Manuscript approved", user: "Prof. Asmarom Legesse", time: "5 days ago", type: "approved", manuscript: "The History of Oromo People" },
    { id: 8, action: "Revision submitted", user: "Almaz Tilahun", time: "6 days ago", type: "revision", manuscript: "Children's Stories: Oromo Tales" },
  ];

  // ===============================
  // TOP CONTRIBUTORS MOCK DATA
  // ===============================
  const topContributors = [
    { id: 1, name: "Dr. Tsegaye Gebre", contributions: 45, avatar: "TG", role: "Senior Researcher", approved: 38, pending: 7, citations: 234 },
    { id: 2, name: "Prof. Asmarom Legesse", contributions: 38, avatar: "AL", role: "Professor", approved: 35, pending: 3, citations: 189 },
    { id: 3, name: "Almaz Tilahun", contributions: 32, avatar: "AT", role: "Research Associate", approved: 28, pending: 4, citations: 156 },
    { id: 4, name: "Dr. Worku Fufa", contributions: 28, avatar: "WF", role: "Postdoctoral Fellow", approved: 25, pending: 3, citations: 98 },
    { id: 5, name: "Tesfaye Lemma", contributions: 24, avatar: "TL", role: "Independent Researcher", approved: 20, pending: 4, citations: 87 },
  ];

  // ===============================
  // REPOSITORY GROWTH MOCK DATA
  // ===============================
  const repositoryGrowth = [
    { month: "Jan", repositories: 65, submissions: 45, approved: 38, rejected: 7 },
    { month: "Feb", repositories: 78, submissions: 52, approved: 42, rejected: 10 },
    { month: "Mar", repositories: 92, submissions: 68, approved: 58, rejected: 10 },
    { month: "Apr", repositories: 105, submissions: 85, approved: 72, rejected: 13 },
    { month: "May", repositories: 118, submissions: 94, approved: 82, rejected: 12 },
    { month: "Jun", repositories: 134, submissions: 112, approved: 98, rejected: 14 },
  ];

  // ===============================
  // MANUSCRIPT TRENDS MOCK DATA
  // ===============================
  const manuscriptTrends = [
    { month: "Jan", submitted: 45, reviewed: 38, approved: 32, rejected: 6, underReview: 7 },
    { month: "Feb", submitted: 52, reviewed: 44, approved: 38, rejected: 6, underReview: 8 },
    { month: "Mar", submitted: 68, reviewed: 58, approved: 50, rejected: 8, underReview: 10 },
    { month: "Apr", submitted: 85, reviewed: 74, approved: 65, rejected: 9, underReview: 11 },
    { month: "May", submitted: 94, reviewed: 82, approved: 72, rejected: 10, underReview: 12 },
    { month: "Jun", submitted: 112, reviewed: 98, approved: 86, rejected: 12, underReview: 14 },
  ];

  // ===============================
  // LANGUAGE DISTRIBUTION MOCK DATA
  // ===============================
  const languageDistribution = [
    { name: "Afaan Oromo", value: 45, count: 559 },
    { name: "English", value: 35, count: 435 },
    { name: "Amharic", value: 15, count: 186 },
    { name: "Other", value: 5, count: 63 },
  ];

  // ===============================
  // CATEGORY DISTRIBUTION MOCK DATA
  // ===============================
  const categoryDistribution = [
    { name: "Literature", value: 28, count: 348 },
    { name: "History", value: 22, count: 273 },
    { name: "Science", value: 18, count: 224 },
    { name: "Education", value: 15, count: 186 },
    { name: "Culture", value: 12, count: 149 },
    { name: "Other", value: 5, count: 63 },
  ];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Styles
  const styles = {
    container: {
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '32px 0'
    },
    wrapper: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    header: {
      marginBottom: '2rem'
    },
    headerFlex: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem'
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    headerSubtitle: {
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    periodSelect: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      outline: 'none',
      cursor: 'pointer'
    },
    newRepoBtn: {
      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s',
      overflow: 'hidden',
      cursor: 'pointer'
    },
    statCardContent: {
      padding: '1.25rem'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    },
    statIcon: {
      fontSize: '1.5rem'
    },
    trendBadge: {
      fontSize: '0.75rem',
      fontWeight: '600',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px'
    },
    statNumber: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    statTitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      fontWeight: '500'
    },
    statDescription: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      marginTop: '0.5rem'
    },
    statBar: {
      height: '0.25rem'
    },
    chartCard: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    chartTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    legendGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    legendDot: {
      width: '0.75rem',
      height: '0.75rem',
      borderRadius: '9999px'
    },
    legendText: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    contributorCard: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    },
    contributorHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    viewAllLink: {
      fontSize: '0.875rem',
      color: '#3B82F6',
      textDecoration: 'none'
    },
    contributorList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    contributorItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      transition: 'background-color 0.3s'
    },
    contributorInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    contributorAvatar: {
      width: '3rem',
      height: '3rem',
      borderRadius: '9999px',
      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '1.125rem'
    },
    contributorName: {
      fontWeight: '600',
      color: '#111827'
    },
    contributorRole: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    contributorCitations: {
      fontSize: '0.75rem',
      color: '#3B82F6',
      marginTop: '0.25rem'
    },
    contributorStats: {
      display: 'flex',
      gap: '1rem',
      textAlign: 'right'
    },
    statBlock: {
      textAlign: 'center'
    },
    statBlockValue: {
      fontWeight: '600',
      fontSize: '1.125rem'
    },
    statBlockLabel: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    activityList: {
      maxHeight: '400px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      transition: 'background-color 0.3s',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid'
    },
    activityIcon: {
      flexShrink: 0,
      marginTop: '0.25rem'
    },
    activityContent: {
      flex: 1
    },
    activityText: {
      fontSize: '0.875rem',
      color: '#1f2937'
    },
    activityManuscript: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    activityTime: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    quickStatsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginTop: '2rem'
    },
    quickStatCard: {
      borderRadius: '0.75rem',
      padding: '1rem',
      color: 'white'
    },
    quickStatContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    quickStatLabel: {
      fontSize: '0.875rem',
      opacity: 0.9
    },
    quickStatValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    quickStatIcon: {
      fontSize: '1.875rem',
      opacity: 0.8
    },
    actionCard: {
      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      color: 'white',
      marginTop: '2rem'
    },
    actionFlex: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem'
    },
    actionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    actionText: {
      color: '#bfdbfe'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    actionBtnPrimary: {
      backgroundColor: 'white',
      color: '#3B82F6',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    actionBtnSecondary: {
      backgroundColor: 'transparent',
      border: '2px solid white',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'upload': return '#3B82F6';
      case 'approved': return '#10B981';
      case 'revision': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'create': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'upload': return '#3B82F6';
      case 'approved': return '#10B981';
      case 'revision': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'create': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.wrapper}>
          {/* Page Header */}
          <div style={styles.header}>
            <div style={styles.headerFlex}>
              <div>
                <h1 style={styles.headerTitle}>Repository Dashboard</h1>
                <p style={styles.headerSubtitle}>
                  Monitor manuscript submissions, reviews, and repository activities
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select 
                  style={styles.periodSelect}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="30days">Last 30 Days</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
                <Link to="/repository/new" style={styles.newRepoBtn}>
                  <FaPlus /> New Repository
                </Link>
              </div>
            </div>
          </div>

          {/* Manuscript Status Cards */}
          <div>
            <h2 style={styles.sectionTitle}>
              <FaFileAlt style={{ color: '#3B82F6' }} />
              Manuscript Status Overview
            </h2>
            <div style={styles.statsGrid}>
              {manuscriptStats.map((stat) => (
                <div
                  key={stat.id}
                  style={{ ...styles.statCard, backgroundColor: stat.bgColor }}
                  className="stat-card"
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={styles.statCardContent}>
                    <div style={styles.statHeader}>
                      <div style={{ ...styles.statIcon, color: stat.textColor.replace('text-', '#') }}>
                        {stat.icon}
                      </div>
                      <span style={{
                        ...styles.trendBadge,
                        backgroundColor: stat.trend.includes('+') ? '#d1fae5' : '#fee2e2',
                        color: stat.trend.includes('+') ? '#059669' : '#dc2626'
                      }}>
                        {stat.trend}
                      </span>
                    </div>
                    <h3 style={styles.statNumber}>{formatNumber(stat.count)}</h3>
                    <p style={styles.statTitle}>{stat.title}</p>
                    <p style={styles.statDescription}>{stat.description}</p>
                  </div>
                  <div style={{ ...styles.statBar, background: `linear-gradient(90deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[2]})` }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Repository Stats Cards */}
          <div>
            <h2 style={styles.sectionTitle}>
              <FaBookOpen style={{ color: '#10B981' }} />
              Repository Overview
            </h2>
            <div style={styles.statsGrid}>
              {repositoryStats.map((stat) => (
                <div
                  key={stat.id}
                  style={{ ...styles.statCard, backgroundColor: stat.bgColor }}
                >
                  <div style={styles.statCardContent}>
                    <div style={styles.statHeader}>
                      <div style={{ ...styles.statIcon, color: stat.textColor.replace('text-', '#') }}>
                        {stat.icon}
                      </div>
                      <span style={{ ...styles.trendBadge, backgroundColor: '#d1fae5', color: '#059669' }}>
                        {stat.trend}
                      </span>
                    </div>
                    <h3 style={styles.statNumber}>{formatNumber(stat.count)}</h3>
                    <p style={styles.statTitle}>{stat.title}</p>
                  </div>
                  <div style={{ ...styles.statBar, background: `linear-gradient(90deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[2]})` }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Manuscript Trends Chart */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>
                  <FaChartLine style={{ color: '#3B82F6' }} />
                  Manuscript Trends
                </h3>
                <div style={styles.legendGroup}>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, backgroundColor: '#3B82F6' }}></div>
                    <span style={styles.legendText}>Submitted</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, backgroundColor: '#10B981' }}></div>
                    <span style={styles.legendText}>Approved</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, backgroundColor: '#EF4444' }}></div>
                    <span style={styles.legendText}>Rejected</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={manuscriptTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Repository Growth Chart */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>
                  <FaChartLine style={{ color: '#8B5CF6' }} />
                  Repository Growth & Submissions
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repositoryGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="repositories" fill="#3B82F6" name="Repositories" />
                  <Bar dataKey="submissions" fill="#10B981" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Language Distribution */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>
                  <FaGlobe style={{ color: '#8B5CF6' }} />
                  Language Distribution
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {languageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>
                  <FaStar style={{ color: '#F59E0B' }} />
                  Category Distribution
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Contributors and Recent Activities */}
          

          {/* Quick Stats Footer */}
          <div style={styles.quickStatsGrid}>
            <div style={{ ...styles.quickStatCard, background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
              <div style={styles.quickStatContent}>
                <div>
                  <p style={styles.quickStatLabel}>Acceptance Rate</p>
                  <p style={styles.quickStatValue}>71.8%</p>
                </div>
                <FaHeart style={styles.quickStatIcon} />
              </div>
            </div>
            <div style={{ ...styles.quickStatCard, background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <div style={styles.quickStatContent}>
                <div>
                  <p style={styles.quickStatLabel}>Average Review Time</p>
                  <p style={styles.quickStatValue}>14 days</p>
                </div>
                <FaClock style={styles.quickStatIcon} />
              </div>
            </div>
            <div style={{ ...styles.quickStatCard, background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
              <div style={styles.quickStatContent}>
                <div>
                  <p style={styles.quickStatLabel}>Active Reviewers</p>
                  <p style={styles.quickStatValue}>48</p>
                </div>
                <FaUsers style={styles.quickStatIcon} />
              </div>
            </div>
            <div style={{ ...styles.quickStatCard, background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <div style={styles.quickStatContent}>
                <div>
                  <p style={styles.quickStatLabel}>Total Citations</p>
                  <p style={styles.quickStatValue}>12.4K</p>
                </div>
                <FaStar style={styles.quickStatIcon} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.actionCard}>
            <div style={styles.actionFlex}>
              <div>
                <h3 style={styles.actionTitle}>Ready to submit your research?</h3>
                <p style={styles.actionText}>Submit your manuscript or create a new repository</p>
              </div>
              <div style={styles.actionButtons}>
                <Link to="/repository/submit" style={styles.actionBtnPrimary}>
                  <FaFileUpload /> Submit Manuscript
                </Link>
                <Link to="/repository/new" style={styles.actionBtnSecondary}>
                  <FaPlus /> New Repository
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .contributor-item {
          transition: background-color 0.3s ease;
        }
        .contributor-item:hover {
          background-color: #f9fafb;
        }
        .activity-item {
          transition: background-color 0.3s ease;
        }
        .activity-item:hover {
          background-color: #f9fafb;
        }
        @media (min-width: 768px) {
          .header-flex {
            flex-direction: row;
            align-items: center;
          }
          .action-flex {
            flex-direction: row;
            align-items: center;
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
}