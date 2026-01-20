import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function OromoWikipedia() {
  // Static mock data for Oromo Wikipedia
  const stats = [
    { id: 1, title: "Total Articles", count: 1200, icon: "fas fa-book", color: "bg-info" },
    { id: 2, title: "Active Editors", count: 85, icon: "fas fa-users", color: "bg-success" },
    { id: 3, title: "New Articles", count: 40, icon: "fas fa-plus", color: "bg-warning" },
    { id: 4, title: "Edits Today", count: 320, icon: "fas fa-edit", color: "bg-danger" },
    { id: 5, title: "Featured Articles", count: 12, icon: "fas fa-star", color: "bg-primary" },
    { id: 6, title: "Pending Review", count: 8, icon: "fas fa-clock", color: "bg-purple" },
  ];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Oromo Wikipedia Dashboard</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {stats.map((item) => (
              <div key={item.id} className="col-lg-4 col-6">
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
                    onClick={() => alert(`${item.title} clicked!`)}
                  >
                    More info <i className="fas fa-arrow-circle-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
