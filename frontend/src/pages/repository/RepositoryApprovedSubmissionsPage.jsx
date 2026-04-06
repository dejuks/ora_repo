import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function RepositoryApprovedSubmissionsPage() {
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState("all");

  const mockSubmissions = [
    {
      id: "REP-APP-001",
      title: "Scholarly Communication Trends in East African Universities",
      author: "Temam Aman",
      type: "Journal Article",
      curator: "Mekdes Alemu",
      approver: "Repository Admin",
      department: "Library and Information Science",
      approved_at: "2026-04-05",
      published_at: "2026-04-06",
      license: "CC BY 4.0",
      doi: "10.2026/ora.repo.001",
      downloads: 124,
      views: 540,
      status: "Approved",
      featured: true,
    },
    {
      id: "REP-APP-002",
      title: "AI Adoption Framework for Higher Education Institutions",
      author: "Hanna Bekele",
      type: "Thesis",
      curator: "Samuel Girma",
      approver: "Repository Manager",
      department: "Computer Science",
      approved_at: "2026-04-03",
      published_at: "2026-04-04",
      license: "CC BY-NC",
      doi: "10.2026/ora.repo.002",
      downloads: 89,
      views: 321,
      status: "Approved",
      featured: false,
    },
    {
      id: "REP-APP-003",
      title: "Open Data Preservation Policy for Institutional Archives",
      author: "Abel Tadesse",
      type: "Policy Paper",
      curator: "Naol Tesfaye",
      approver: "Repository Admin",
      department: "Public Policy",
      approved_at: "2026-04-02",
      published_at: "2026-04-03",
      license: "Institutional License",
      doi: "10.2026/ora.repo.003",
      downloads: 63,
      views: 210,
      status: "Approved",
      featured: false,
    },
    {
      id: "REP-APP-004",
      title: "Annotated OCR Dataset for Low-Resource Language Archives",
      author: "Rahel Kebede",
      type: "Dataset",
      curator: "Mekdes Alemu",
      approver: "Repository Admin",
      department: "Data Science",
      approved_at: "2026-04-04",
      published_at: "2026-04-05",
      license: "CC0",
      doi: "10.2026/ora.repo.004",
      downloads: 177,
      views: 680,
      status: "Approved",
      featured: true,
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
        item.approver.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.license.toLowerCase().includes(q) ||
        item.doi.toLowerCase().includes(q);

      const matchesType = resourceType === "all" || item.type === resourceType;

      return matchesSearch && matchesType;
    });
  }, [search, resourceType]);

  const getTypeBadge = (value) => {
    switch (value) {
      case "Journal Article":
        return "badge badge-info";
      case "Thesis":
        return "badge badge-primary";
      case "Policy Paper":
        return "badge badge-dark";
      case "Dataset":
        return "badge badge-success";
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
              <h1>Approved Repository Submissions</h1>
              <p className="text-muted mb-0">
                Repository items that passed approval and are now published or ready for access
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
                  <span className="info-box-text">Approved Items</span>
                  <span className="info-box-number">{mockSubmissions.length}</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-info">
                  <i className="fas fa-star" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Featured</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.featured).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-primary">
                  <i className="fas fa-download" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Total Downloads</span>
                  <span className="info-box-number">
                    {mockSubmissions.reduce((sum, item) => sum + item.downloads, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-warning">
                  <i className="fas fa-eye" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Total Views</span>
                  <span className="info-box-number">
                    {mockSubmissions.reduce((sum, item) => sum + item.views, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-success card-outline">
            <div className="card-header">
              <div className="row w-100">
                <div className="col-md-6 mb-2 mb-md-0">
                  <h3 className="card-title mt-2">Published Approval Records</h3>
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
                    placeholder="Search approved items..."
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
                    <th>Approver</th>
                    <th>Department</th>
                    <th>License</th>
                    <th>DOI</th>
                    <th>Approved</th>
                    <th>Published</th>
                    <th>Downloads</th>
                    <th>Views</th>
                    <th>Featured</th>
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
                      <td>{item.approver}</td>
                      <td>{item.department}</td>
                      <td>{item.license}</td>
                      <td>{item.doi}</td>
                      <td>{item.approved_at}</td>
                      <td>{item.published_at}</td>
                      <td>{item.downloads}</td>
                      <td>{item.views}</td>
                      <td>
                        {item.featured ? (
                          <span className="badge badge-warning">Featured</span>
                        ) : (
                          <span className="badge badge-secondary">Normal</span>
                        )}
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
                          <button className="btn btn-info">
                            <i className="fas fa-globe mr-1" />
                            Open
                          </button>
                          <button className="btn btn-warning">
                            <i className="fas fa-star mr-1" />
                            Feature
                          </button>
                          <button className="btn btn-secondary">
                            <i className="fas fa-file-export mr-1" />
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="16" className="text-center text-muted py-4">
                        No approved submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer clearfix">
              <div className="float-left text-muted">
                Showing {filtered.length} of {mockSubmissions.length} approved items
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