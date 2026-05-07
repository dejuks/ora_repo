import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function Library() {
  // Static mock data for library dashboard
  const stats = [
    { id: 1, title: "Total Books", count: 1500, icon: "fas fa-book", color: "bg-info" },
    { id: 2, title: "E-books", count: 450, icon: "fas fa-tablet-alt", color: "bg-success" },
    { id: 3, title: "Members", count: 300, icon: "fas fa-users", color: "bg-warning" },
    { id: 4, title: "Borrowed Books", count: 120, icon: "fas fa-book-reader", color: "bg-danger" },
    { id: 5, title: "Overdue", count: 25, icon: "fas fa-exclamation-circle", color: "bg-primary" },
    { id: 6, title: "New Arrivals", count: 40, icon: "fas fa-plus", color: "bg-purple" },
  ];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Library Dashboard</h1>
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
