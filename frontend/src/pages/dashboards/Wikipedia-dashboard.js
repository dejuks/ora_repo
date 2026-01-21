import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function OromoWikipedia() {
  /* ===============================
     MOCK DATA (OROMO WIKIPEDIA)
  ================================ */
  const stats = [
    {
      id: 1,
      title: "Total Articles",
      count: 1450,
      icon: "fas fa-book",
      color: "bg-info",
    },
    {
      id: 2,
      title: "Active Editors",
      count: 96,
      icon: "fas fa-users",
      color: "bg-success",
    },
    {
      id: 3,
      title: "New Articles This Month",
      count: 58,
      icon: "fas fa-plus",
      color: "bg-warning",
    },
    {
      id: 4,
      title: "Edits Today",
      count: 412,
      icon: "fas fa-edit",
      color: "bg-danger",
    },
    {
      id: 5,
      title: "Featured Articles",
      count: 18,
      icon: "fas fa-star",
      color: "bg-primary",
    },
    {
      id: 6,
      title: "Pending Reviews",
      count: 11,
      icon: "fas fa-clock",
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
              <h1>Oromo Wikipedia Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/wiki/dashboard">Home</a>
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
                      alert(`${item.title}`);
                    }}
                  >
                    More info <i className="fas fa-arrow-circle-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ===============================
              INTRODUCTION CARD
          ================================ */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card card-outline card-secondary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-language mr-2"></i>
                    About Oromo Wikipedia
                  </h3>
                </div>
                <div className="card-body">
                  <p>
                    Oromo Wikipedia is a collaborative knowledge platform
                    dedicated to preserving, expanding, and sharing content
                    in the Afaan Oromo language.
                  </p>
                  <ul>
                    <li>Create and manage encyclopedic articles</li>
                    <li>Review and approve community edits</li>
                    <li>Support contributors and editors</li>
                    <li>Promote high-quality featured articles</li>
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
