import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function AdminDashboard() {
  // Static module mock data
  const modules = [
    {
      id: "1",
      name: "Library",
      description: "Manage books, journals, and digital resources",
      icon: "fas fa-book",
      color: "bg-info",
    },
    {
      id: "2",
      name: "Journal",
      description: "Manage academic journals and publications",
      icon: "fas fa-newspaper",
      color: "bg-success",
    },
    {
      id: "3",
      name: "E-Book",
      description: "Manage electronic books and documents",
      icon: "fas fa-tablet-alt",
      color: "bg-warning",
    },
    {
      id: "4",
      name: "Repository",
      description: "Research papers, theses, and datasets",
      icon: "fas fa-database",
      color: "bg-danger",
    },
    {
      id: "5",
      name: "Researcher Network",
      description: "Researchers, collaborations, and profiles",
      icon: "fas fa-users",
      color: "bg-primary",
    },
    {
      id: "6",
      name: "Oromo Wikipedia",
      description: "Oromo language knowledge management",
      icon: "fab fa-wikipedia-w",
      color: "bg-purple",
    },
  ];

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>System Admin Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="content">
        <div className="container-fluid">
          {/* MODULE CARDS */}
          <div className="row">
            {modules.map((module) => (
              <div key={module.id} className="col-lg-4 col-md-6 col-sm-12">
                <div className={`small-box ${module.color}`}>
                  <div className="inner">
                    <h4 className="fw-bold">{module.name}</h4>
                    <p>{module.description}</p>
                  </div>

                  <div className="icon">
                    <i className={module.icon}></i>
                  </div>

                  <a
                    href="#"
                    className="small-box-footer"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`${module.name} module clicked`);
                    }}
                  >
                    Manage {module.name}{" "}
                    <i className="fas fa-arrow-circle-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* SYSTEM OVERVIEW */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card card-outline card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-line mr-2"></i>
                    System Overview
                  </h3>
                </div>

                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <h3>256</h3>
                      <p className="text-muted">Total Users</p>
                    </div>
                    <div className="col-md-3">
                      <h3>12</h3>
                      <p className="text-muted">Roles</p>
                    </div>
                    <div className="col-md-3">
                      <h3>6</h3>
                      <p className="text-muted">Active Modules</p>
                    </div>
                    <div className="col-md-3">
                      <h3>1,420</h3>
                      <p className="text-muted">Audit Logs</p>
                    </div>
                  </div>
                </div>

                <div className="card-footer text-muted">
                  Last system update: Today at 02:15 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
