import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function RepositoryDashboard() {
  /* ===============================
     MOCK DATA FOR REPOSITORY
  ================================ */
  const stats = [
    {
      id: 1,
      title: "Total Repositories",
      count: 320,
      icon: "fas fa-folder",
      color: "bg-info",
    },
    {
      id: 2,
      title: "Active Repositories",
      count: 210,
      icon: "fas fa-folder-open",
      color: "bg-success",
    },
    {
      id: 3,
      title: "New Repositories",
      count: 25,
      icon: "fas fa-plus",
      color: "bg-warning",
    },
    {
      id: 4,
      title: "Commits Today",
      count: 480,
      icon: "fas fa-code-branch",
      color: "bg-danger",
    },
    {
      id: 5,
      title: "Contributors",
      count: 65,
      icon: "fas fa-users",
      color: "bg-primary",
    },
    {
      id: 6,
      title: "Pending Pull Requests",
      count: 12,
      icon: "fas fa-file-import",
      color: "bg-purple",
    },
  ];

  return (
    <MainLayout>
      {/* ===============================
          PAGE HEADER
      ================================ */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Repository Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/repository/dashboard">Home</a>
                </li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===============================
          DASHBOARD CONTENT
      ================================ */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {stats.map((item) => (
              <div key={item.id} className="col-lg-4 col-md-6 col-12">
                <div className={`small-box ${item.color}`}>
                  <div className="inner">
                    <h3>{item.count}</h3>
                    <p>{item.title}</p>
                  </div>
                  <div className="icon">
                    <i className={item.icon}></i>
                  </div>
                  <a
                    href="#"
                    className="small-box-footer"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`${item.title} clicked!`);
                    }}
                  >
                    More info <i className="fas fa-arrow-circle-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ===============================
              REPOSITORY DETAILS CARD
          ================================ */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card card-outline card-secondary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-database mr-2"></i>
                    Repository Management Overview
                  </h3>
                </div>
                <div className="card-body">
                  <p>
                    This dashboard provides an overview of repositories managed
                    within the system. You can track repository activity, commits,
                    contributors, and pending pull requests.
                  </p>
                  <ul>
                    <li>View and manage all repositories</li>
                    <li>Monitor commits and contributors</li>
                    <li>Approve or reject pull requests</li>
                    <li>Create new repositories and manage access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
