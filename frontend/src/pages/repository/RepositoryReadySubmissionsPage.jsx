import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function RepositoryReadySubmissionsPage() {
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState("all");

  const mockSubmissions = [
    {
      id: "REP-READY-001",
      title: "Institutional Repository Metadata Interoperability",
      author: "Temam Aman",
      type: "Journal Article",
      curator: "Mekdes Alemu",
      department: "Library and Information Science",
      submitted_at: "2026-04-01",
      validated_at: "2026-04-04",
      license: "CC BY 4.0",
      file_status: "Validated",
      metadata_status: "Complete",
      status: "Ready for Approval",
      priority: "High",
    },
    {
      id: "REP-READY-002",
      title: "AI Readiness Assessment for Public Universities",
      author: "Hanna Bekele",
      type: "Thesis",
      curator: "Samuel Girma",
      department: "Computer Science",
      submitted_at: "2026-03-28",
      validated_at: "2026-04-03",
      license: "CC BY-NC",
      file_status: "Validated",
      metadata_status: "Complete",
      status: "Ready for Approval",
      priority: "Medium",
    },
    {
      id: "REP-READY-003",
      title: "Open Knowledge Policy Draft for Academic Archives",
      author: "Abel Tadesse",
      type: "Policy Paper",
      curator: "Naol Tesfaye",
      department: "Public Policy",
      submitted_at: "2026-03-30",
      validated_at: "2026-04-05",
      license: "Institutional License",
      file_status: "Validated",
      metadata_status: "Complete",
      status: "Ready for Approval",
      priority: "Low",
    },
    {
      id: "REP-READY-004",
      title: "Annotated Amharic OCR Training Dataset",
      author: "Rahel Kebede",
      type: "Dataset",
      curator: "Mekdes Alemu",
      department: "Data Science",
      submitted_at: "2026-04-02",
      validated_at: "2026-04-05",
      license: "CC0",
      file_status: "Validated",
      metadata_status: "Complete",
      status: "Ready for Approval",
      priority: "High",
    },
  ];

  const filtered = useMemo(() => {
    return mockSubmissions.filter((item) => {
      const q = search.toLowerCase();

      const matchesSearch =
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.curator.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.license.toLowerCase().includes(q);

      const matchesType = resourceType === "all" || item.type === resourceType;

      return matchesSearch && matchesType;
    });
  }, [search, resourceType]);

  const getPriorityBadge = (value) => {
    switch (value) {
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

  const getTypeBadge = (value) => {
    switch (value) {
      case "Journal Article":
        return "badge badge-info";
      case "Thesis":
        return "badge badge-primary";
      case "Dataset":
        return "badge badge-success";
      case "Policy Paper":
        return "badge badge-dark";
      default:
        return "badge badge-secondary";
    }
  };

  return (
    <>
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1>Ready for Approval</h1>
              <p className="text-muted mb-0">
                Repository submissions completed by curation and waiting for final approval
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
                <span className="info-box-icon bg-success">
                  <i className="fas fa-check-circle" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Ready Items</span>
                  <span className="info-box-number">{mockSubmissions.length}</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-info">
                  <i className="fas fa-file-alt" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Articles</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.type === "Journal Article").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-primary">
                  <i className="fas fa-graduation-cap" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Theses</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.type === "Thesis").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-warning">
                  <i className="fas fa-exclamation-triangle" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">High Priority</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.priority === "High").length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-success card-outline">
            <div className="card-header">
              <div className="row w-100">
                <div className="col-md-6 mb-2 mb-md-0">
                  <h3 className="card-title mt-2">Approval Queue</h3>
                </div>

                <div className="col-md-3 mb-2 mb-md-0">
                  <select
                    className="form-control"
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                  >
                    <option value="all">All Resource Types</option>
                    <option value="Journal Article">Journal Article</option>
                    <option value="Thesis">Thesis</option>
                    <option value="Policy Paper">Policy Paper</option>
                    <option value="Dataset">Dataset</option>
                  </select>
                </div>

                <div className="col-md-3">
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
                    <th>License</th>
                    <th>File Status</th>
                    <th>Metadata</th>
                    <th>Validated</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th width="290">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.title}</td>
                      <td>{item.author}</td>
                      <td>
                        <span className={getTypeBadge(item.type)}>{item.type}</span>
                      </td>
                      <td>{item.curator}</td>
                      <td>{item.department}</td>
                      <td>{item.license}</td>
                      <td>
                        <span className="badge badge-success">{item.file_status}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">{item.metadata_status}</span>
                      </td>
                      <td>{item.validated_at}</td>
                      <td>
                        <span className={getPriorityBadge(item.priority)}>
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">{item.status}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-primary">
                            <i className="fas fa-eye mr-1" />
                            View
                          </button>
                          <button className="btn btn-success">
                            <i className="fas fa-check mr-1" />
                            Approve
                          </button>
                          <button className="btn btn-warning">
                            <i className="fas fa-undo mr-1" />
                            Return
                          </button>
                          <button className="btn btn-danger">
                            <i className="fas fa-times mr-1" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="13" className="text-center text-muted py-4">
                        No submissions ready for approval were found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer clearfix">
              <div className="float-left text-muted">
                Showing {filtered.length} of {mockSubmissions.length} ready items
              </div>
              <div className="float-right">
                <button className="btn btn-default btn-sm mr-2">Previous</button>
                <button className="btn btn-default btn-sm">Next</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
    </>
  );
}