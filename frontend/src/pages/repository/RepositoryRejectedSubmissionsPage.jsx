import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function RepositoryRejectedSubmissionsPage() {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");

  const mockSubmissions = [
    {
      id: "REP-REJ-001",
      title: "Duplicate Archival Submission for Climate Dataset",
      author: "Temam Aman",
      type: "Dataset",
      curator: "Mekdes Alemu",
      rejected_by: "Repository Admin",
      department: "Data Science",
      submitted_at: "2026-03-28",
      rejected_at: "2026-04-02",
      reason: "Duplicate Submission",
      note: "A similar dataset already exists in the repository with the same source files and metadata.",
      status: "Rejected",
      can_resubmit: true,
    },
    {
      id: "REP-REJ-002",
      title: "Incomplete Thesis on AI Readiness",
      author: "Hanna Bekele",
      type: "Thesis",
      curator: "Samuel Girma",
      rejected_by: "Repository Manager",
      department: "Computer Science",
      submitted_at: "2026-03-26",
      rejected_at: "2026-04-01",
      reason: "Incomplete Metadata",
      note: "Required abstract, keywords, and advisor information were missing from the submission.",
      status: "Rejected",
      can_resubmit: true,
    },
    {
      id: "REP-REJ-003",
      title: "Policy Draft with Unclear Copyright Ownership",
      author: "Abel Tadesse",
      type: "Policy Paper",
      curator: "Naol Tesfaye",
      rejected_by: "Repository Admin",
      department: "Public Policy",
      submitted_at: "2026-03-25",
      rejected_at: "2026-03-31",
      reason: "Copyright Issue",
      note: "The depositor did not provide sufficient rights confirmation for repository publication.",
      status: "Rejected",
      can_resubmit: false,
    },
    {
      id: "REP-REJ-004",
      title: "Scanned OCR Collection with Corrupted Files",
      author: "Rahel Kebede",
      type: "Collection",
      curator: "Mekdes Alemu",
      rejected_by: "Repository Admin",
      department: "Library Science",
      submitted_at: "2026-03-30",
      rejected_at: "2026-04-04",
      reason: "Invalid Files",
      note: "Uploaded ZIP package could not be opened and several mandatory files failed validation.",
      status: "Rejected",
      can_resubmit: true,
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
        item.rejected_by.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q);

      const matchesReason =
        reasonFilter === "all" || item.reason === reasonFilter;

      return matchesSearch && matchesReason;
    });
  }, [search, reasonFilter]);

  const getTypeBadge = (value) => {
    switch (value) {
      case "Dataset":
        return "badge badge-success";
      case "Thesis":
        return "badge badge-primary";
      case "Policy Paper":
        return "badge badge-dark";
      case "Collection":
        return "badge badge-info";
      default:
        return "badge badge-secondary";
    }
  };

  const getReasonBadge = (value) => {
    switch (value) {
      case "Duplicate Submission":
        return "badge badge-warning";
      case "Incomplete Metadata":
        return "badge badge-info";
      case "Copyright Issue":
        return "badge badge-danger";
      case "Invalid Files":
        return "badge badge-secondary";
      default:
        return "badge badge-dark";
    }
  };

  return (
    <>
        <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1>Rejected Repository Submissions</h1>
              <p className="text-muted mb-0">
                Repository submissions that did not pass validation or approval
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
                <span className="info-box-icon bg-danger">
                  <i className="fas fa-times-circle" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Rejected Items</span>
                  <span className="info-box-number">{mockSubmissions.length}</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-warning">
                  <i className="fas fa-copy" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Duplicates</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.reason === "Duplicate Submission").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-info">
                  <i className="fas fa-info-circle" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Metadata Issues</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.reason === "Incomplete Metadata").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <div className="info-box shadow-sm">
                <span className="info-box-icon bg-secondary">
                  <i className="fas fa-redo" />
                </span>
                <div className="info-box-content">
                  <span className="info-box-text">Can Resubmit</span>
                  <span className="info-box-number">
                    {mockSubmissions.filter((x) => x.can_resubmit).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-danger card-outline">
            <div className="card-header">
              <div className="row w-100">
                <div className="col-md-6 mb-2 mb-md-0">
                  <h3 className="card-title mt-2">Rejected Submission Records</h3>
                </div>

                <div className="col-md-3 mb-2 mb-md-0">
                  <select
                    className="form-control"
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                  >
                    <option value="all">All Reasons</option>
                    <option value="Duplicate Submission">Duplicate Submission</option>
                    <option value="Incomplete Metadata">Incomplete Metadata</option>
                    <option value="Copyright Issue">Copyright Issue</option>
                    <option value="Invalid Files">Invalid Files</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search rejected items..."
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
                    <th>Rejected By</th>
                    <th>Department</th>
                    <th>Submitted</th>
                    <th>Rejected</th>
                    <th>Reason</th>
                    <th>Resubmit</th>
                    <th>Status</th>
                    <th>Note</th>
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
                        <span className={getTypeBadge(item.type)}>{item.type}</span>
                      </td>
                      <td>{item.curator}</td>
                      <td>{item.rejected_by}</td>
                      <td>{item.department}</td>
                      <td>{item.submitted_at}</td>
                      <td>{item.rejected_at}</td>
                      <td>
                        <span className={getReasonBadge(item.reason)}>
                          {item.reason}
                        </span>
                      </td>
                      <td>
                        {item.can_resubmit ? (
                          <span className="badge badge-success">Yes</span>
                        ) : (
                          <span className="badge badge-dark">No</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-danger">{item.status}</span>
                      </td>
                      <td style={{ maxWidth: "320px", whiteSpace: "normal" }}>
                        {item.note}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-primary">
                            <i className="fas fa-eye mr-1" />
                            View
                          </button>
                          <button className="btn btn-warning">
                            <i className="fas fa-file-alt mr-1" />
                            Details
                          </button>
                          <button className="btn btn-info">
                            <i className="fas fa-envelope mr-1" />
                            Notify
                          </button>
                          <button className="btn btn-secondary">
                            <i className="fas fa-history mr-1" />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="14" className="text-center text-muted py-4">
                        No rejected submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer clearfix">
              <div className="float-left text-muted">
                Showing {filtered.length} of {mockSubmissions.length} rejected items
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