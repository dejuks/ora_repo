import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import {
  getItem,
  approveItem,
  rejectItem,
  requestRevision
} from "../../api/repository.api";

function RepositoryShow() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const FILE_BASE_URL = "http://localhost:5000";

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${FILE_BASE_URL}/${path.replace(/^\/+/, "")}`;
  };

  const fetchItem = async () => {
    try {
      const res = await getItem(uuid);
      setItem(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch repository item", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [uuid]);

  /* ================= CURATOR ACTIONS ================= */
  const handleApprove = async () => {
    if (item.status === "approved") return;
    const result = await Swal.fire({
      title: "Approve this item?",
      text: "This will publish the repository item",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Approve",
    });

    if (result.isConfirmed) {
      await approveItem(uuid);
      Swal.fire("Approved!", "Item has been published.", "success");
      fetchItem();
    }
  };

  const handleReject = async () => {
    if (item.status === "rejected") return;
    const { value: reason } = await Swal.fire({
      title: "Reject Item",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
    });

    if (reason) {
      await rejectItem(uuid, reason);
      Swal.fire("Rejected!", "Item has been rejected.", "success");
      fetchItem();
    }
  };

  const handleRevision = async () => {
    if (item.status === "revision_requested") return;
    const { value: comment } = await Swal.fire({
      title: "Request Revision",
      input: "textarea",
      inputLabel: "Message to Author",
      inputPlaceholder: "Describe required changes...",
      showCancelButton: true,
    });

    if (comment) {
      await requestRevision(uuid, comment);
      Swal.fire("Sent!", "Revision request sent to author.", "success");
      fetchItem();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center mt-5">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
        </div>
      </MainLayout>
    );
  }

  if (!item) {
    return (
      <MainLayout>
        <div className="alert alert-danger">Repository item not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Repository Item Details</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/repository">Repository</Link>
                </li>
                <li className="breadcrumb-item active">Show</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* LEFT COLUMN — METADATA */}
            <div className="col-md-4">
              <div className="card card-outline card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-info-circle"></i> Metadata
                  </h3>
                </div>

                <div className="card-body p-0">
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <th>Title</th>
                        <td>{item.title}</td>
                      </tr>
                      <tr>
                        <th>Type</th>
                        <td>{item.item_type}</td>
                      </tr>
                      <tr>
                        <th>Language</th>
                        <td>{item.language}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>
                          <span
                            className={`badge ${
                              item.status === "published" || item.status === "approved"
                                ? "badge-success"
                                : item.status === "rejected"
                                ? "badge-danger"
                                : item.status === "revision_requested"
                                ? "badge-warning"
                                : "badge-secondary"
                            }`}
                          >
                            {item.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Access</th>
                        <td>{item.access_level}</td>
                      </tr>
                      <tr>
                        <th>DOI</th>
                        <td>{item.doi || "-"}</td>
                      </tr>
                      <tr>
                        <th>Handle</th>
                        <td>{item.handle || "-"}</td>
                      </tr>
                      <tr>
                        <th>Created At</th>
                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CURATOR ACTION BUTTONS */}
                <div className="card-footer text-center">
                  {item.status === "approved" ? (
                    <button className="btn btn-success btn-sm mr-2" disabled>
                      <i className="fas fa-check"></i> Already Approved
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm mr-2"
                      onClick={handleApprove}
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                  )}

                  {item.status === "revision_requested" ? (
                    <button className="btn btn-warning btn-sm mr-2" disabled>
                      <i className="fas fa-undo"></i> Revision Requested
                    </button>
                  ) : (
                    <button
                      className="btn btn-warning btn-sm mr-2"
                      onClick={handleRevision}
                    >
                      <i className="fas fa-undo"></i> Request Revision
                    </button>
                  )}

                  {item.status === "rejected" ? (
                    <button className="btn btn-danger btn-sm mr-2" disabled>
                      <i className="fas fa-times"></i> Rejected
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm mr-2"
                      onClick={handleReject}
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                  )}

                  <Link
                    to="/repository/curator/queue/new"
                    className="btn btn-secondary btn-sm"
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — DOCUMENT PREVIEW */}
            <div className="col-md-8">
              <div className="card card-outline card-danger">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-file-pdf"></i> Document
                  </h3>
                </div>

                <div className="card-body p-0">
                  {item.file_path ? (
                    <iframe
                      src={getFileUrl(item.file_path)}
                      title="PDF Viewer"
                      style={{ width: "100%", height: "600px", border: "none" }}
                    />
                  ) : (
                    <div className="text-center text-muted p-5">
                      <i className="fas fa-file-alt fa-3x mb-3"></i>
                      <p>No document uploaded</p>
                    </div>
                  )}
                </div>

                {item.file_path && (
                  <div className="card-footer text-center">
                    <a
                      href={getFileUrl(item.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="fas fa-download"></i> Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default RepositoryShow;
