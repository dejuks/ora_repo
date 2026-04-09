import React from "react";
import MainLayout from "../../../components/layout/MainLayout";

const CuratorDashboard = () => {
  // MOCK DASHBOARD DATA
  const dashboardStats = {
    total: 128,
    pending: 34,
    approved: 76,
    rejected: 18,
  };

  const recentItems = [
    {
      id: 1,
      title: "Climate Change Impact on Agriculture",
      author: "Abebe Tesfaye",
      status: "Pending",
      submitted_at: "2026-01-20",
    },
    {
      id: 2,
      title: "AI in Healthcare Systems",
      author: "Sara Mohammed",
      status: "Approved",
      submitted_at: "2026-01-18",
    },
    {
      id: 3,
      title: "Digital Library Management",
      author: "Dejene Kasa",
      status: "Rejected",
      submitted_at: "2026-01-15",
    },
  ];

  const statusBadge = (status) => {
    if (status === "Approved") return "badge-success";
    if (status === "Rejected") return "badge-danger";
    return "badge-warning";
  };

  return ( 
    <MainLayout>
    
      {/* HEADER */}
      <section className="content-header">
        <div className="container-fluid">
          <h1>Repository Curator Dashboard</h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="content">
        <div className="container-fluid">

          {/* STAT BOXES */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{dashboardStats.total}</h3>
                  <p>Total Submissions</p>
                </div>
                <div className="icon">
                  <i className="fas fa-database"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{dashboardStats.pending}</h3>
                  <p>Pending Review</p>
                </div>
                <div className="icon">
                  <i className="fas fa-clock"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{dashboardStats.approved}</h3>
                  <p>Approved</p>
                </div>
                <div className="icon">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>{dashboardStats.rejected}</h3>
                  <p>Rejected</p>
                </div>
                <div className="icon">
                  <i className="fas fa-times-circle"></i>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT SUBMISSIONS */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Submissions</h3>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.author}</td>
                      <td>
                        <span className={`badge ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.submitted_at}</td>
                      <td>
                        <a
                          href={`/repository/curator/review/${item.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="fas fa-eye"></i>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
  
};

export default CuratorDashboard;
