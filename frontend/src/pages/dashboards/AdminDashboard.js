import React from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function AdminDashboard() {
  // Static modules
  const modules = [
    { id: "1", name: "Library", description: "Manage books and resources", icon: "fas fa-book", color: "bg-info" },
    { id: "2", name: "Journal", description: "Manage journals and publications", icon: "fas fa-newspaper", color: "bg-success" },
    { id: "3", name: "Ebook", description: "Manage electronic books", icon: "fas fa-tablet-alt", color: "bg-warning" },
    { id: "4", name: "Repository", description: "Manage research repositories", icon: "fas fa-database", color: "bg-danger" },
    { id: "5", name: "Researcher Network", description: "Manage researcher connections", icon: "fas fa-users", color: "bg-primary" },
    { id: "6", name: "Oromo Wikipedia", description: "Manage Oromo Wikipedia contributions", icon: "fas fa-wikipedia-w", color: "bg-purple" },
  ];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Admin Dashboard</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {modules.map((module) => (
              <div key={module.id} className="col-lg-4 col-6">
                {/* small box */}
                <div className={`small-box ${module.color}`}>
                  <div className="inner">
                    <h4>{module.name}</h4>
                    <p>{module.description}</p>
                  </div>
                  <div className="icon">
                    <i className={module.icon}></i>
                  </div>
                  <a
                    href="#"
                    className="small-box-footer"
                    onClick={() => alert(`${module.name} clicked!`)}
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
