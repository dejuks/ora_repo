import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function AdminDashboard() {
  // Static module mock data with metrics
  const modules = [
    {
      id: "1",
      name: "Library",
      description: "Manage books, journals, and digital resources",
      icon: "fas fa-book",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      stats: { items: "2,456", trend: "+12%" },
      lightColor: "#667eea",
    },
    {
      id: "2",
      name: "Journal",
      description: "Manage academic journals and publications",
      icon: "fas fa-newspaper",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      stats: { items: "847", trend: "+5%" },
      lightColor: "#f093fb",
    },
    {
      id: "3",
      name: "E-Book",
      description: "Manage electronic books and documents",
      icon: "fas fa-tablet-alt",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      stats: { items: "1,234", trend: "+23%" },
      lightColor: "#4facfe",
    },
    {
      id: "4",
      name: "Repository",
      description: "Research papers, theses, and datasets",
      icon: "fas fa-database",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      stats: { items: "3,789", trend: "+8%" },
      lightColor: "#43e97b",
    },
    {
      id: "5",
      name: "Researcher Network",
      description: "Researchers, collaborations, and profiles",
      icon: "fas fa-users",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      stats: { items: "156", trend: "+15%" },
      lightColor: "#fa709a",
    },
    {
      id: "6",
      name: "Oromo Wikipedia",
      description: "Oromo language knowledge management",
      icon: "fab fa-wikipedia-w",
      gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      stats: { items: "892", trend: "+32%" },
      lightColor: "#a18cd1",
    },
  ];

  // Recent activities data
  const recentActivities = [
    { user: "John Doe", action: "Added new book", module: "Library", time: "2 min ago" },
    { user: "Jane Smith", action: "Updated journal", module: "Journal", time: "15 min ago" },
    { user: "Mike Johnson", action: "Approved repository item", module: "Repository", time: "1 hour ago" },
  ];

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-sm-6">
              <h1 className="display-5 fw-bold" style={{ color: '#2c3e50' }}>
                <i className="fas fa-chart-pie me-3" style={{ color: '#3498db' }}></i>
                Analytics Dashboard
              </h1>
            </div>
            <div className="col-sm-6 text-end">
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-calendar-alt me-1"></i>
                  Last 30 days
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-download me-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="content" style={{ backgroundColor: '#f8f9fc' }}>
        <div className="container-fluid">
          {/* KPI CARDS */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Users</p>
                      <h2 className="mb-0 fw-bold">256</h2>
                      <small className="text-success">
                        <i className="fas fa-arrow-up me-1"></i>+8.2%
                      </small>
                    </div>
                    <div className="rounded-circle p-3" style={{ backgroundColor: '#e8f4fd' }}>
                      <i className="fas fa-users fa-2x" style={{ color: '#3498db' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Active Sessions</p>
                      <h2 className="mb-0 fw-bold">124</h2>
                      <small className="text-success">
                        <i className="fas fa-arrow-up me-1"></i>+12.5%
                      </small>
                    </div>
                    <div className="rounded-circle p-3" style={{ backgroundColor: '#e5f9e7' }}>
                      <i className="fas fa-chart-line fa-2x" style={{ color: '#27ae60' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Storage Used</p>
                      <h2 className="mb-0 fw-bold">1.2TB</h2>
                      <small className="text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>78% full
                      </small>
                    </div>
                    <div className="rounded-circle p-3" style={{ backgroundColor: '#fff3e0' }}>
                      <i className="fas fa-database fa-2x" style={{ color: '#f39c12' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">API Calls</p>
                      <h2 className="mb-0 fw-bold">45.2K</h2>
                      <small className="text-success">
                        <i className="fas fa-arrow-up me-1"></i>+23.1%
                      </small>
                    </div>
                    <div className="rounded-circle p-3" style={{ backgroundColor: '#fee9e6' }}>
                      <i className="fas fa-cloud fa-2x" style={{ color: '#e74c3c' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MODULE CARDS - POWER BI STYLE */}
          <div className="row g-4">
            {modules.map((module) => (
              <div key={module.id} className="col-xl-4 col-lg-6">
                <div className="card border-0 h-100" style={{ 
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                }}
                onClick={() => alert(`${module.name} module clicked`)}
                >
                  <div className="card-body p-4">
                    {/* Header with gradient line */}
                    <div style={{ 
                      height: '4px', 
                      background: module.gradient,
                      width: '60px',
                      borderRadius: '2px',
                      marginBottom: '20px'
                    }}></div>
                    
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h4 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>{module.name}</h4>
                        <p className="text-muted small mb-0">{module.description}</p>
                      </div>
                      <div className="rounded-circle p-3" style={{ 
                        background: `${module.lightColor}15`,
                      }}>
                        <i className={`${module.icon} fa-xl`} style={{ color: module.lightColor }}></i>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <span className="text-muted small">Total items</span>
                        <h5 className="mb-0 fw-bold">{module.stats.items}</h5>
                      </div>
                      <div className="text-end">
                        <span className="text-muted small">Trend</span>
                        <h5 className="mb-0" style={{ 
                          color: module.stats.trend.startsWith('+') ? '#27ae60' : '#e74c3c'
                        }}>
                          {module.stats.trend}
                        </h5>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="progress mt-3" style={{ height: '6px', borderRadius: '3px' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${Math.random() * 50 + 50}%`, 
                          background: module.gradient,
                          borderRadius: '3px'
                        }}
                      ></div>
                    </div>

                    {/* Footer */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <span className="small text-muted">
                        <i className="fas fa-clock me-1"></i>Updated 2 min ago
                      </span>
                      <span className="small fw-bold" style={{ color: module.lightColor }}>
                        Manage <i className="fas fa-arrow-right ms-1"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SYSTEM OVERVIEW AND RECENT ACTIVITY */}
          <div className="row mt-5">
            {/* System Overview Chart */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="card-header bg-transparent border-0 pt-4 px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                      <i className="fas fa-chart-bar me-2" style={{ color: '#3498db' }}></i>
                      System Overview
                    </h5>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-outline-light" type="button" data-bs-toggle="dropdown">
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3 col-6 mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f8f9fc' }}>
                        <h3 className="fw-bold text-primary mb-0">256</h3>
                        <p className="text-muted mb-0">Users</p>
                        <small className="text-success">+12%</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f8f9fc' }}>
                        <h3 className="fw-bold text-success mb-0">12</h3>
                        <p className="text-muted mb-0">Roles</p>
                        <small className="text-muted">0%</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f8f9fc' }}>
                        <h3 className="fw-bold text-warning mb-0">6</h3>
                        <p className="text-muted mb-0">Modules</p>
                        <small className="text-success">+2</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f8f9fc' }}>
                        <h3 className="fw-bold text-danger mb-0">1.4K</h3>
                        <p className="text-muted mb-0">Audit Logs</p>
                        <small className="text-danger">+156</small>
                      </div>
                    </div>
                  </div>

                  {/* Mini chart placeholder */}
                  <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#f8f9fc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-bold">System Health</span>
                      <span className="small text-success">98%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '98%' }}></div>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                      <span className="small text-muted">CPU: 45%</span>
                      <span className="small text-muted">Memory: 62%</span>
                      <span className="small text-muted">Disk: 78%</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 pb-4 px-4">
                  <small className="text-muted">
                    <i className="fas fa-sync-alt me-1"></i>
                    Last system update: Today at 02:15 AM
                  </small>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="card-header bg-transparent border-0 pt-4 px-4">
                  <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                    <i className="fas fa-history me-2" style={{ color: '#3498db' }}></i>
                    Recent Activity
                  </h5>
                </div>
                <div className="card-body">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="d-flex align-items-start mb-4">
                      <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f4fd' }}>
                        <i className="fas fa-user-circle" style={{ color: '#3498db' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1">
                          <span className="fw-bold">{activity.user}</span>
                          <span className="text-muted"> {activity.action}</span>
                        </p>
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          {activity.time}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card-footer bg-transparent border-0 pb-4 px-4">
                  <button className="btn btn-link p-0" style={{ color: '#3498db' }}>
                    View all activity <i className="fas fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .content {
          min-height: calc(100vh - 100px);
          padding: 20px 0;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </MainLayout>
  );
}