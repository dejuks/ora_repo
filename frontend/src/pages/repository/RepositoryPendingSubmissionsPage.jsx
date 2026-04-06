import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function RepositoryPendingSubmissionsPage() {
  const [search, setSearch] = useState("");

  const mockSubmissions = [
    {
      id: "REP-001",
      title: "Climate Change Impact on Ethiopian Agriculture",
      author: "Temam Aman",
      type: "Research Article",
      submitted_at: "2026-04-01",
      status: "Pending Review",
    },
    {
      id: "REP-002",
      title: "Machine Learning Applications in Healthcare",
      author: "Sara Bekele",
      type: "Thesis",
      submitted_at: "2026-03-29",
      status: "Pending Review",
    },
    {
      id: "REP-003",
      title: "Digital Libraries in Africa",
      author: "Abel Tadesse",
      type: "Conference Paper",
      submitted_at: "2026-03-27",
      status: "Pending Review",
    },
  ];

  const filtered = mockSubmissions.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
    <MainLayout activeMenu="repository" >
    
    <div>
      {/* Page Header */}
      <section className="content-header">
        <div className="container-fluid">
          <h1>Pending Repository Submissions</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="content">
        <div className="card card-primary card-outline">

          {/* Card Header */}
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">
              Submissions Awaiting Review
            </h3>

            <input
              type="text"
              placeholder="Search submissions..."
              className="form-control w-25"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Card Body */}
          <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Type</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th width="220">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>

                    <td>{item.title}</td>

                    <td>{item.author}</td>

                    <td>
                      <span className="badge badge-info">
                        {item.type}
                      </span>
                    </td>

                    <td>{item.submitted_at}</td>

                    <td>
                      <span className="badge badge-warning">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button className="btn btn-sm btn-primary mr-2">
                        View
                      </button>

                      <button className="btn btn-sm btn-success mr-2">
                        Assign Curator
                      </button>

                      <button className="btn btn-sm btn-danger">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No pending submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card Footer */}
          <div className="card-footer clearfix">
            <button className="btn btn-outline-secondary btn-sm mr-2">
              Export CSV
            </button>

            <button className="btn btn-outline-secondary btn-sm mr-2">
              Export Excel
            </button>

            <button className="btn btn-outline-secondary btn-sm">
              Export PDF
            </button>
          </div>

        </div>
      </section>
      
    </div>
    </MainLayout>
    </>

  );
}