import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { getManuscripts } from "../../../../api/odl_manuscript.api";
import { 
  FiFileText, 
  FiCheckCircle, 
  FiClock, 
  FiEdit3,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiUsers,
  FiDownload,
  FiFilter,
  FiMoreVertical
} from "react-icons/fi";

export default function JournalAuthorDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    pending: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState({
    citations: 0,
    downloads: 0,
    views: 0,
    acceptanceRate: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const normalizeStatus = (status) => {
    if (!status) return "unknown";
    return status.toLowerCase().trim();
  };

  const loadDashboard = async () => {
    const res = await getManuscripts();
    const raw = res?.data?.rows || res?.data || [];
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const myUUID = String(currentUser?.uuid || "");

    const myData = raw.filter(m => String(m?.created_by) === myUUID);

    const counts = myData.reduce(
      (a, m) => {
        const s = normalizeStatus(m?.status_label);
        a.total++;
        if (s.includes("publish")) a.published++;
        else if (s.includes("draft")) a.drafts++;
        else a.pending++;
        return a;
      },
      { total: 0, published: 0, drafts: 0, pending: 0 }
    );

    setStats(counts);
    setChartData([
      { name: "Published", value: counts.published, color: "#10b981", icon: "📚" },
      { name: "Drafts", value: counts.drafts, color: "#f59e0b", icon: "📝" },
      { name: "Pending", value: counts.pending, color: "#3b82f6", icon: "⏳" },
    ]);

    // Mock recent activity - replace with actual data
    setRecentActivity([
      { id: 1, action: "Submitted manuscript", title: "Advances in Neural Networks", date: "2 hours ago", status: "success" },
      { id: 2, action: "Received review comments", title: "Quantum Computing Review", date: "1 day ago", status: "warning" },
      { id: 3, action: "Manuscript published", title: "AI in Healthcare", date: "3 days ago", status: "success" },
      { id: 4, action: "Revision required", title: "Blockchain Technology", date: "5 days ago", status: "danger" },
    ]);

    // Mock impact metrics
    setImpactMetrics({
      citations: 156,
      downloads: 2340,
      views: 5678,
      acceptanceRate: 68,
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <FiCheckCircle className="text-success" />;
      case 'warning': return <FiClock className="text-warning" />;
      case 'danger': return <FiEdit3 className="text-danger" />;
      default: return <FiFileText />;
    }
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">
              <FiFileText className="title-icon" />
              Author Dashboard
            </h1>
            <p className="dashboard-subtitle">Welcome back, {JSON.parse(localStorage.getItem("user"))?.name || 'Author'}</p>
          </div>
          <div className="header-right">
            <button className="btn-export">
              <FiDownload /> Export Report
            </button>
            <button className="btn-filter">
              <FiFilter /> Filter
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard 
            title="Total Manuscripts" 
            value={stats.total}
            icon={<FiFileText />}
            color="primary"
            trend="+12%"
          />
          <StatCard 
            title="Published" 
            value={stats.published}
            icon={<FiCheckCircle />}
            color="success"
            trend="+5%"
          />
          <StatCard 
            title="Drafts" 
            value={stats.drafts}
            icon={<FiEdit3 />}
            color="warning"
            trend="-2%"
          />
          <StatCard 
            title="Pending Review" 
            value={stats.pending}
            icon={<FiClock />}
            color="info"
            trend="+8%"
          />
        </div>

        {/* Impact Metrics */}
        <div className="metrics-grid">
          <MetricCard 
            title="Total Views"
            value={impactMetrics.views.toLocaleString()}
            icon={<FiTrendingUp />}
            change="+23%"
            color="purple"
          />
          <MetricCard 
            title="Downloads"
            value={impactMetrics.downloads.toLocaleString()}
            icon={<FiDownload />}
            change="+15%"
            color="blue"
          />
          <MetricCard 
            title="Citations"
            value={impactMetrics.citations}
            icon={<FiAward />}
            change="+34%"
            color="green"
          />
          <MetricCard 
            title="Acceptance Rate"
            value={`${impactMetrics.acceptanceRate}%`}
            icon={<FiBarChart2 />}
            change="+2%"
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <ChartCard 
            title="Manuscript Distribution" 
            icon={<FiPieChart />}
            action={<FiMoreVertical />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: 'none'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard 
            title="Manuscript Timeline" 
            icon={<FiCalendar />}
            action={<FiMoreVertical />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { month: 'Jan', value: 4 },
                { month: 'Feb', value: 7 },
                { month: 'Mar', value: 5 },
                { month: 'Apr', value: 9 },
                { month: 'May', value: 6 },
                { month: 'Jun', value: 8 },
              ]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeef2" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: 'none'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard 
            title="Status Breakdown" 
            icon={<FiBarChart2 />}
            action={<FiMoreVertical />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeef2" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: 'none'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Activity & Performance */}
        <div className="activity-grid">
          <div className="activity-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <button className="btn-view-all">View All</button>
            </div>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon status-${activity.status}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-meta">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-date">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="performance-card">
            <div className="card-header">
              <h3>Performance Metrics</h3>
              <FiTrendingUp className="header-icon" />
            </div>
            <div className="metrics-list">
              <div className="metric-item">
                <span className="metric-label">Acceptance Rate</span>
                <div className="metric-progress">
                  <div className="progress-bar" style={{ width: '68%' }}></div>
                </div>
                <span className="metric-value">68%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Review Speed</span>
                <div className="metric-progress">
                  <div className="progress-bar" style={{ width: '45%' }}></div>
                </div>
                <span className="metric-value">12 days</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Impact Factor</span>
                <div className="metric-progress">
                  <div className="progress-bar" style={{ width: '82%' }}></div>
                </div>
                <span className="metric-value">4.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 24px 32px;
          background: linear-gradient(135deg, #fafbff 0%, #f4eefa 100%)
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          background: white;
          padding: 24px 32px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          color: #667eea;
        }

        .dashboard-subtitle {
          margin: 8px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        .header-right {
          display: flex;
          gap: 12px;
        }

        .btn-export, .btn-filter {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-export {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-filter {
          background: #f8f9fa;
          color: #1a1a2e;
          border: 1px solid #e0e0e0;
        }

        .btn-export:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-filter:hover {
          background: #e9ecef;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .activity-card, .performance-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .btn-view-all {
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          cursor: pointer;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .activity-item:hover {
          background: #f8f9fa;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .status-success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .status-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 500;
          color: #1a1a2e;
          margin-bottom: 4px;
        }

        .activity-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }

        .activity-action {
          color: #666;
        }

        .activity-date {
          color: #999;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .metric-label {
          width: 120px;
          font-size: 14px;
          color: #666;
        }

        .metric-progress {
          flex: 1;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .metric-value {
          min-width: 50px;
          font-weight: 500;
          color: #1a1a2e;
        }

        @media (max-width: 1200px) {
          .stats-grid,
          .metrics-grid,
          .charts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }
          
          .stats-grid,
          .metrics-grid,
          .charts-grid,
          .activity-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </MainLayout>
  );
}

/* ===============================
   UI COMPONENTS
=============================== */

function ChartCard({ title, icon, action, children }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">
          {icon}
          <h6>{title}</h6>
        </div>
        <button className="chart-action">{action}</button>
      </div>
      <div className="chart-body">
        {children}
      </div>

      <style jsx>{`
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-4px);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
        }

        .chart-title h6 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .chart-action {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .chart-body {
          height: 300px;
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        <div className="stat-trend">{trend}</div>
      </div>

      <style jsx>{`
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${color === 'primary' ? 'linear-gradient(90deg, #667eea, #764ba2)' :
                       color === 'success' ? 'linear-gradient(90deg, #10b981, #059669)' :
                       color === 'warning' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                       'linear-gradient(90deg, #3b82f6, #2563eb)'};
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: ${color === 'primary' ? 'rgba(102, 126, 234, 0.1)' :
                       color === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                       color === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                       'rgba(59, 130, 246, 0.1)'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: ${color === 'primary' ? '#667eea' :
                  color === 'success' ? '#10b981' :
                  color === 'warning' ? '#f59e0b' :
                  '#3b82f6'};
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .stat-title {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }

        .stat-trend {
          font-size: 12px;
          color: ${trend?.startsWith('+') ? '#10b981' : '#ef4444'};
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

function MetricCard({ title, value, icon, change, color }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <span className={`metric-change ${change?.startsWith('+') ? 'positive' : 'negative'}`}>
          {change}
        </span>
      </div>
      <div className="metric-body">
        <span className="metric-value">{value}</span>
        <div className={`metric-icon metric-${color}`}>{icon}</div>
      </div>

      <style jsx>{`
        .metric-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .metric-title {
          font-size: 14px;
          color: #666;
        }

        .metric-change {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .positive {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .negative {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .metric-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .metric-purple {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .metric-blue {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .metric-green {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .metric-orange {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
}