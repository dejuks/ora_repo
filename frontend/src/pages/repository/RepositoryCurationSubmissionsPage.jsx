import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function RepositoryCurationSubmissionsPage() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");

  const mockSubmissions = [
    {
      id: "REP-CUR-001",
      title: "Open Access Preservation Strategies in East Africa",
      author: "Temam Aman",
      type: "Journal Article",
      curator: "Mekdes Alemu",
      department: "Library and Information Science",
      submitted_at: "2026-04-01",
      assigned_at: "2026-04-02",
      stage: "Metadata Review",
      priority: "High",
      status: "Under Curation",
    },
    {
      id: "REP-CUR-002",
      title: "AI-Based Diagnosis Support in Rural Clinics",
      author: "Hanna Bekele",
      type: "Thesis",
      curator: "Samuel Girma",
      department: "Computer Science",
      submitted_at: "2026-03-30",
      assigned_at: "2026-04-01",
      stage: "File Validation",
      priority: "Medium",
      status: "Under Curation",
    },
    {
      id: "REP-CUR-003",
      title: "Digital Repository Policy Framework for Universities",
      author: "Abel Tadesse",
      type: "Conference Paper",
      curator: "Mekdes Alemu",
      department: "Information Systems",
      submitted_at: "2026-03-28",
      assigned_at: "2026-03-29",
      stage: "License Check",
      priority: "Low",
      status: "Under Curation",
    },
    {
      id: "REP-CUR-004",
      title: "Amharic OCR Dataset Documentation",
      author: "Rahel Kebede",
      type: "Dataset",
      curator: "Naol Tesfaye",
      department: "Data Science",
      submitted_at: "2026-04-03",
      assigned_at: "2026-04-04",
      stage: "Metadata Review",
      priority: "High",
      status: "Under Curation",
    },
  ];

  const filtered = useMemo(() => {
    return mockSubmissions.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        item.curator.toLowerCase().includes(search.toLowerCase()) ||
        item.department.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesStage = stage === "all" || item.stage === stage;

      return matchesSearch && matchesStage;
    });
  }, [search, stage]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "badge badge-danger";
      case "Medium":
        return "badge badge-warning";
      case "Low":
        return "badge badge-secondary";
      default:
        return "badge badge-light";
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case "Metadata Review":
        return "badge badge-info";
      case "File Validation":
        return "badge badge-primary";
      case "License Check":
        return "badge badge-dark";
      default:
        return "badge badge-secondary";
    }
  };

  return ( 
    <>
    <MainLayout >
    <div>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1>Repository Curation Queue</h1>
              <p className="text-muted mb-0">
                Submissions currently being curated by repository staff
              </p>
            </div>
            <div className="mt-2 mt-md-0">
              <button className="btn btn-outline-secondary btn-sm mr-2">
                Export CSV
              </button>
              <button className="btn btn-outline-success btn-sm mr-2">
                Export Excel
              </button>
              <button className="btn btn-outline-danger btn-sm">
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-primary">
                  <i className="fas fa-folder-open" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Total In Curation</span>
                  <span className="info-box-number">{mockSubmissions.length}</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-info">
                  <i className="fas fa-tags" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Metadata Review</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.stage === "Metadata Review").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-warning">
                  <i className="fas fa-file-alt" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">File Validation</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.stage === "File Validation").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-dark">
                  <i className="fas fa-balance-scale" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">License Check</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.stage === "License Check").length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-primary card-outline">
            <div className="card-header">
              <div className="row w-100">
                <div className="col-md-8 mb-2 mb-md-0">
                  <h3 className="card-title mt-2">Submissions Under Curation</h3>
                </div>
                <div className="col-md-2 mb-2 mb-md-0">
                  <select
                    className="form-control"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                  >
                    <option value="all">All Stages</option>
                    <option value="Metadata Review">Metadata Review</option>
                    <option value="File Validation">File Validation</option>
                    <option value="License Check">License Check</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Type</th>
                    <th>Curator</th>
                    <th>Department</th>
                    <th>Stage</th>
                    <th>Priority</th>
                    <th>Assigned</th>
                    <th>Status</th>
                    <th width="260">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.title}</td>
                      <td>{item.author}</td>
                      <td>
                        <span className="badge badge-success">{item.type}</span>
                      </td>
                      <td>{item.curator}</td>
                      <td>{item.department}</td>
                      <td>
                        <span className={getStageBadge(item.stage)}>
                          {item.stage}
                        </span>
                      </td>
                      <td>
                        <span className={getPriorityBadge(item.priority)}>
                          {item.priority}
                        </span>
                      </td>
                      <td>{item.assigned_at}</td>
                      <td>
                        <span className="badge badge-warning">{item.status}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-primary">
                            <i className="fas fa-eye mr-1" />
                            View
                          </button>
                          <button className="btn btn-info">
                            <i className="fas fa-edit mr-1" />
                            Curate
                          </button>
                          <button className="btn btn-success">
                            <i className="fas fa-check mr-1" />
                            Ready
                          </button>
                          <button className="btn btn-danger">
                            <i className="fas fa-undo mr-1" />
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-4">
                        No curation submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer clearfix">
              <div className="float-right">
                <button className="btn btn-default btn-sm mr-2">Previous</button>
                <button className="btn btn-default btn-sm">Next</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </MainLayout>
    </>
  );
}