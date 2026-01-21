import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function ResearcherNetworkDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Mock data for Researcher Network
  const stats = [
    { id: 1, title: "Total Researchers", count: 200, icon: "fas fa-user-graduate", color: "bg-info" },
    { id: 2, title: "Active Projects", count: 45, icon: "fas fa-flask", color: "bg-success" },
    { id: 3, title: "Ongoing Collaborations", count: 12, icon: "fas fa-handshake", color: "bg-warning" },
    { id: 4, title: "Funding Sources", count: 8, icon: "fas fa-hand-holding-usd", color: "bg-danger" },
    { id: 5, title: "Reports Generated", count: 25, icon: "fas fa-chart-bar", color: "bg-primary" },
    { id: 6, title: "Pending Approvals", count: 5, icon: "fas fa-clock", color: "bg-purple" },
  ];

  return (
    <MainLayout>
      {/* Page Header */}
      <section className="content-header">
        <div className="container-fluid">
          <h1>Researcher Network Dashboard</h1>
          <p className="text-muted">
            Welcome <b>{user.full_name}</b> (Researcher Network Module)
          </p>
        </div>
      </section>

      {/* Dashboard Cards */}
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
