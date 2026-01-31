// components/dashboard/RepositoryAuthorDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
const RepositoryAuthorDashboard = () => {
  // Mock data for Researcher/Author
  const mockData = {
    userInfo: {
      name: "Dr. Alemayehu Bekele",
      institution: "Addis Ababa University",
      orcid: "0000-0002-1825-0097",
      email: "alemayehu.bekele@aau.edu.et",
      profileComplete: 85,
      lastLogin: "2024-03-15 14:30",
    },
    depositStats: {
      total: 12,
      published: 8,
      underReview: 2,
      drafts: 2,
      rejected: 1,
      embargoed: 1,
    },
    recentActivity: [
      {
        id: 1,
        title: "Climate Change Impacts on Oromo Agriculture",
        type: "Dataset",
        date: "2024-03-14",
        status: "Published",
        views: 156,
        downloads: 42,
        statusColor: "success",
      },
      {
        id: 2,
        title: "Oromo Language Syntax Analysis",
        type: "Research Paper",
        date: "2024-03-10",
        status: "Under Review",
        views: 0,
        downloads: 0,
        statusColor: "warning",
      },
      {
        id: 3,
        title: "Historical Documents Digitization Project",
        type: "Thesis",
        date: "2024-03-05",
        status: "Draft",
        views: 0,
        downloads: 0,
        statusColor: "secondary",
      },
      {
        id: 4,
        title: "Traditional Medicine Practices",
        type: "Conference Paper",
        date: "2024-02-28",
        status: "Returned for Corrections",
        views: 0,
        downloads: 0,
        statusColor: "danger",
      },
    ],
    citations: {
      total: 48,
      hIndex: 7,
      recent: [
        { id: 1, title: "Oromo Cultural Studies", citations: 12 },
        { id: 2, title: "Agricultural Patterns", citations: 8 },
        { id: 3, title: "Linguistic Analysis", citations: 6 },
      ],
    },
    quickStats: {
      totalViews: 1245,
      totalDownloads: 387,
      avgRating: 4.2,
      collaborationRequests: 3,
    },
    upcomingTasks: [
      { id: 1, task: "Revise manuscript based on reviewer comments", due: "2024-03-20", priority: "high" },
      { id: 2, task: "Add metadata for dataset submission", due: "2024-03-22", priority: "medium" },
      { id: 3, task: "Respond to collaboration request", due: "2024-03-25", priority: "low" },
    ],
    notifications: [
      { id: 1, message: "Your dataset has been cited by Dr. Fatuma Hassan", time: "2 hours ago", type: "success" },
      { id: 2, message: "Reviewer comments available for 'Oromo Language Syntax'", time: "1 day ago", type: "warning" },
      { id: 3, message: "New collaboration request from University of Helsinki", time: "2 days ago", type: "info" },
      { id: 4, message: "Your thesis has reached 100+ views", time: "3 days ago", type: "success" },
    ],
  };

  // Helper function for status badges
  const getStatusBadge = (status, color) => (
    <span className={`badge bg-${color}`}>{status}</span>
  );

  // Helper function for priority badges
  const getPriorityBadge = (priority) => {
    const colors = { high: "danger", medium: "warning", low: "info" };
    return <span className={`badge bg-${colors[priority]}`}>{priority.toUpperCase()}</span>;
  };

  return ( 
     <MainLayout>
    <div className="content">
      {/* Content Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>My Repository Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/repository/author/dashboard">Home</Link></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="content">
        <div className="container">
          {/* Small boxes (Stats) */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{mockData.depositStats.total}</h3>
                  <p>Total Deposits</p>
                </div>
                <div className="icon">
                  <i className="fas fa-folder-open"></i>
                </div>
                <Link to="/repository/author/deposits/published" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{mockData.depositStats.published}</h3>
                  <p>Published Items</p>
                </div>
                <div className="icon">
                  <i className="fas fa-globe"></i>
                </div>
                <Link to="/repository/author/deposits/published" className="small-box-footer">
                  View All <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{mockData.depositStats.underReview}</h3>
                  <p>Under Review</p>
                </div>
                <div className="icon">
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <Link to="/repository/author/deposits/review" className="small-box-footer">
                  Check Status <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>{mockData.citations.total}</h3>
                  <p>Total Citations</p>
                </div>
                <div className="icon">
                  <i className="fas fa-quote-right"></i>
                </div>
                <Link to="/repository/author/analytics/impact" className="small-box-footer">
                  View Details <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Left column - Recent Activity */}
            <div className="col-md-8">
              {/* Recent Deposits Card */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-history mr-1"></i>
                    Recent Activity
                  </h3>
                  <div className="card-tools">
                    <Link to="/repository/author/deposits/all" className="btn btn-tool">
                      <i className="fas fa-list"></i> View All
                    </Link>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Views</th>
                          <th>Downloads</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockData.recentActivity.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.title}</strong>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{item.type}</span>
                            </td>
                            <td>{item.date}</td>
                            <td>{getStatusBadge(item.status, item.statusColor)}</td>
                            <td>
                              <span className="badge bg-info">{item.views}</span>
                            </td>
                            <td>
                              <span className="badge bg-success">{item.downloads}</span>
                            </td>
                            <td>
                              <div className="btn-group">
                                <button className="btn btn-sm btn-outline-info">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-warning">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger">
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-bolt mr-1"></i>
                    Quick Actions
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        to="/repository/author/submit/new" 
                        className="btn btn-primary btn-block mb-3"
                      >
                        <i className="fas fa-upload mr-2"></i>
                        New Deposit
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        to="/repository/author/deposits/drafts" 
                        className="btn btn-success btn-block mb-3"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Continue Draft
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        to="/repository/author/analytics/views" 
                        className="btn btn-info btn-block mb-3"
                      >
                        <i className="fas fa-chart-line mr-2"></i>
                        View Analytics
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        to="/repository/author/profile" 
                        className="btn btn-warning btn-block mb-3"
                      >
                        <i className="fas fa-user-edit mr-2"></i>
                        Update Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - User Info & Notifications */}
            <div className="col-md-4">
              {/* User Profile Card */}
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-user mr-1"></i>
                    Researcher Profile
                  </h3>
                </div>
                <div className="card-body">
                  <div className="text-center mb-3">
                    <img
                      className="profile-user-img img-fluid img-circle"
                      src="https://via.placeholder.com/150x150/007bff/ffffff?text=AB"
                      alt="User profile"
                    />
                    <h3 className="profile-username text-center">{mockData.userInfo.name}</h3>
                    <p className="text-muted text-center">{mockData.userInfo.institution}</p>
                  </div>

                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>ORCID</b>
                      <a href="#" className="float-right">
                        {mockData.userInfo.orcid}
                      </a>
                    </li>
                    <li className="list-group-item">
                      <b>Email</b>
                      <a href="#" className="float-right">
                        {mockData.userInfo.email}
                      </a>
                    </li>
                    <li className="list-group-item">
                      <b>Profile Completeness</b>
                      <div className="float-right">
                        <span className="badge bg-info">{mockData.userInfo.profileComplete}%</span>
                      </div>
                      <div className="progress progress-xs mt-2">
                        <div
                          className="progress-bar bg-info"
                          style={{ width: `${mockData.userInfo.profileComplete}%` }}
                        ></div>
                      </div>
                    </li>
                    <li className="list-group-item">
                      <b>Last Login</b>
                      <span className="float-right text-muted">
                        {mockData.userInfo.lastLogin}
                      </span>
                    </li>
                  </ul>

                  <Link to="/repository/author/profile" className="btn btn-primary btn-block">
                    <i className="fas fa-user-edit mr-1"></i> Edit Profile
                  </Link>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="card card-warning">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-bell mr-1"></i>
                    Notifications
                  </h3>
                  <div className="card-tools">
                    <span className="badge bg-danger">{mockData.notifications.length}</span>
                  </div>
                </div>
                <div className="card-body p-0">
                  <ul className="nav nav-pills flex-column">
                    {mockData.notifications.map((notif) => (
                      <li key={notif.id} className="nav-item">
                        <a href="#" className="nav-link">
                          <div className="d-flex justify-content-between">
                            <span className="text-truncate" style={{ maxWidth: '200px' }}>
                              {notif.message}
                            </span>
                            <small className="text-muted">{notif.time}</small>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-footer text-center">
                  <a href="#" className="uppercase">
                    View All Notifications
                  </a>
                </div>
              </div>

              {/* Upcoming Tasks Card */}
              <div className="card card-danger">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-tasks mr-1"></i>
                    Upcoming Tasks
                  </h3>
                </div>
                <div className="card-body p-0">
                  <ul className="todo-list" data-widget="todo-list">
                    {mockData.upcomingTasks.map((task) => (
                      <li key={task.id}>
                        <div className="d-flex justify-content-between">
                          <span className="text">{task.task}</span>
                          <small className="badge badge-danger">
                            <i className="far fa-clock"></i> {task.due}
                          </small>
                        </div>
                        <div className="tools">
                          {getPriorityBadge(task.priority)}
                          <i className="fas fa-edit"></i>
                          <i className="fas fa-trash"></i>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-footer clearfix">
                  <button className="btn btn-sm btn-primary float-right">
                    <i className="fas fa-plus"></i> Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Additional Stats */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-pie mr-1"></i>
                    Deposit Status Distribution
                  </h3>
                </div>
                <div className="card-body">
                  <div className="progress-group">
                    Published
                    <span className="float-right">
                      <b>{mockData.depositStats.published}</b>/{mockData.depositStats.total}
                    </span>
                    <div className="progress progress-sm">
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${(mockData.depositStats.published / mockData.depositStats.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-group">
                    Under Review
                    <span className="float-right">
                      <b>{mockData.depositStats.underReview}</b>/{mockData.depositStats.total}
                    </span>
                    <div className="progress progress-sm">
                      <div
                        className="progress-bar bg-warning"
                        style={{
                          width: `${(mockData.depositStats.underReview / mockData.depositStats.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-group">
                    Drafts
                    <span className="float-right">
                      <b>{mockData.depositStats.drafts}</b>/{mockData.depositStats.total}
                    </span>
                    <div className="progress progress-sm">
                      <div
                        className="progress-bar bg-secondary"
                        style={{
                          width: `${(mockData.depositStats.drafts / mockData.depositStats.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-1"></i>
                    Impact Metrics
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6 text-center">
                      <div className="info-box bg-gradient-info">
                        <span className="info-box-icon">
                          <i className="far fa-eye"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Total Views</span>
                          <span className="info-box-number">{mockData.quickStats.totalViews}</span>
                          <div className="progress">
                            <div className="progress-bar" style={{ width: "70%" }}></div>
                          </div>
                          <span className="progress-description">
                            70% increase in 30 days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 text-center">
                      <div className="info-box bg-gradient-success">
                        <span className="info-box-icon">
                          <i className="fas fa-download"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Total Downloads</span>
                          <span className="info-box-number">{mockData.quickStats.totalDownloads}</span>
                          <div className="progress">
                            <div className="progress-bar" style={{ width: "85%" }}></div>
                          </div>
                          <span className="progress-description">
                            85% increase in 30 days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h5>Most Cited Works</h5>
                    <ul className="list-unstyled">
                      {mockData.citations.recent.map((work) => (
                        <li key={work.id} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <span className="text-truncate" style={{ maxWidth: "70%" }}>
                              {work.title}
                            </span>
                            <span className="badge bg-primary">{work.citations} citations</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </MainLayout>
  );
};

export default RepositoryAuthorDashboard;