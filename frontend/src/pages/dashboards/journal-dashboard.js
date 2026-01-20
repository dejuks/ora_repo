import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function Journal() {
  // Static mock data
  const stats = [
    { id: 1, title: "Total Journals", count: 120, icon: "fas fa-newspaper", color: "bg-info" },
    { id: 2, title: "Published", count: 85, icon: "fas fa-check-circle", color: "bg-success" },
    { id: 3, title: "Drafts", count: 20, icon: "fas fa-edit", color: "bg-warning" },
    { id: 4, title: "Authors", count: 45, icon: "fas fa-users", color: "bg-danger" },
    { id: 5, title: "Citations", count: 300, icon: "fas fa-book-reader", color: "bg-primary" },
    { id: 6, title: "Pending Review", count: 15, icon: "fas fa-clock", color: "bg-purple" },
  ];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Journal Dashboard</h1>
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
