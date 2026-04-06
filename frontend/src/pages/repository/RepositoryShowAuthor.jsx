import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import axios from "axios";
import {
  getItem,
  approveItem,
  rejectItem,
  requestRevision,
} from "../../api/repository.api";

const API = "http://localhost:5000/api/repository-items";
const FILE_BASE_URL = "http://localhost:5000";

function RepositoryShowAuthor() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [suggestedTitle, setSuggestedTitle] = useState("");
  const [suggestedAbstract, setSuggestedAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [vocabResults, setVocabResults] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${FILE_BASE_URL}/${path.replace(/^\/+/, "")}`;
  };

  const fetchItem = async () => {
    try {
      const res = await getItem(uuid);
      setItem(res.data);
      setSuggestedTitle(res.data.suggested_title || "");
      setSuggestedAbstract(res.data.suggested_abstract || "");
      setKeywords(res.data.keywords || "");
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return "badge badge-success";
      case "rejected":
        return "badge badge-danger";
      case "revision":
        return "badge badge-warning";
      default:
        return "badge badge-secondary";
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const handleApprove = async () => {
    if (item.status === "published") return;

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
    if (item.status === "revision") return;

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

  const submitMetadata = async () => {
    try {
      await axios.post(
        `${API}/${uuid}/suggest-metadata`,
        {
          suggested_title: suggestedTitle,
          suggested_abstract: suggestedAbstract,
          keywords,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      Swal.fire("Success", "Metadata suggestions submitted", "success");
      fetchItem();
    } catch (error) {
      Swal.fire("Error", "Failed to submit metadata", "error");
    }
  };

  const runVocabularyAnalysis = async () => {
    try {
      const res = await axios.get(`${API}/${uuid}/analyze-vocab`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVocabResults(res.data);
    } catch (error) {
      Swal.fire("Error", "Failed to run vocabulary analysis", "error");
    }
  };

  const runCopyrightCheck = async () => {
    try {
      const res = await axios.get(`${API}/${uuid}/copyright-check`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSimilarityScore(res.data.similarity_score);
    } catch (error) {
      Swal.fire("Error", "Failed copyright check", "error");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <section className="content pt-3">
          <div className="container-fluid">
            <div className="card">
              <div className="card-body text-center">
                <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                <p className="mb-0">Loading repository item...</p>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!item) {
    return (
      <MainLayout>
        <section className="content pt-3">
          <div className="container-fluid">
            <div className="alert alert-danger">Repository item not found</div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* LEFT SIDE */}
            <div className="col-md-12">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title">Item Information</h3>
                </div>

                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped mb-0">
                      <tbody>
                        <tr>
                          <th style={{ width: "35%" }}>Title</th>
                          <td>{item.title || "-"}</td>
                        </tr>
                        <tr>
                          <th>Type</th>
                          <td>{item.item_type || "-"}</td>
                        </tr>
                        <tr>
                          <th>Language</th>
                          <td>{item.language || "-"}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <span className={getStatusBadge(item.status)}>
                              {item.status || "pending"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Access Level</th>
                          <td>{item.access_level || "-"}</td>
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
                          <td>{formatDate(item.created_at)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card-footer clearfix">
                  <Link
                    to="/repository/author/submit/list"
                    className="btn btn-secondary btn-sm float-left"
                  >
                    <i className="fas fa-arrow-left mr-1"></i>
                    Back
                  </Link>

                  {item.file_path && (
                    <a
                      href={getFileUrl(item.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm float-right"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </a>
                  )}
                </div>
              </div>

              <div className="card card-secondary">
                <div className="card-header">
                  <h3 className="card-title">Curator Feedback</h3>
                </div>
                <div className="card-body">
                  {item.rejection_reason && (
                    <div className="form-group">
                      <label className="text-danger">Rejection Reason</label>
                      <div className="p-2 border rounded bg-light">
                        {item.rejection_reason}
                      </div>
                    </div>
                  )}

                  {item.curator_comment && (
                    <div className="form-group">
                      <label className="text-warning">Revision Comment</label>
                      <div className="p-2 border rounded bg-light">
                        {item.curator_comment}
                      </div>
                    </div>
                  )}

                  {!item.rejection_reason && !item.curator_comment && (
                    <p className="text-muted mb-0">No feedback available.</p>
                  )}
                </div>
              </div>

              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Curator Tools</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Suggested Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={suggestedTitle}
                      onChange={(e) => setSuggestedTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Suggested Abstract</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={suggestedAbstract}
                      onChange={(e) => setSuggestedAbstract(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Keywords</label>
                    <input
                      type="text"
                      className="form-control"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-0">
                    <button
                      type="button"
                      className="btn btn-info btn-sm mr-2 mb-2"
                      onClick={submitMetadata}
                    >
                      Save Metadata
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-info btn-sm mr-2 mb-2"
                      onClick={runVocabularyAnalysis}
                    >
                      Analyze Vocabulary
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm mb-2"
                      onClick={runCopyrightCheck}
                    >
                      Copyright Check
                    </button>
                  </div>

                  {vocabResults && (
                    <div className="form-group mt-3 mb-0">
                      <label>Vocabulary Analysis</label>
                      <pre
                        className="p-2 border rounded bg-light mb-0"
                        style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}
                      >
                        {JSON.stringify(vocabResults, null, 2)}
                      </pre>
                    </div>
                  )}

                  {similarityScore !== null && (
                    <div className="form-group mt-3 mb-0">
                      <label>Similarity Score</label>
                      <div className="p-2 border rounded bg-light">
                        {similarityScore}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-md-8">
              <div className="card card-danger card-outline">
                <div className="card-header clearfix">
                  <h3 className="card-title">Document Preview</h3>
                  {item.file_path && (
                    <a
                      href={getFileUrl(item.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm float-right"
                    >
                      <i className="fas fa-external-link-alt mr-1"></i>
                      Open
                    </a>
                  )}
                </div>

                <div className="card-body p-0">
                  {item.file_path ? (
                    <iframe
                      src={getFileUrl(item.file_path)}
                      title="PDF Viewer"
                      className="w-100"
                      style={{
                        height: "700px",
                        border: "0",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted p-5">
                      <i className="fas fa-file-alt fa-3x mb-3"></i>
                      <p className="mb-0">No document uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Review Actions</h3>
                </div>
                <div className="card-body">
                  <button
                    type="button"
                    className="btn btn-success btn-sm mr-2 mb-2"
                    onClick={handleApprove}
                    disabled={item.status === "published"}
                  >
                    <i className="fas fa-check mr-1"></i>
                    {item.status === "published" ? "Already Approved" : "Approve"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-warning btn-sm mr-2 mb-2"
                    onClick={handleRevision}
                    disabled={item.status === "revision"}
                  >
                    <i className="fas fa-undo mr-1"></i>
                    {item.status === "revision"
                      ? "Revision Requested"
                      : "Request Revision"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm mb-2"
                    onClick={handleReject}
                    disabled={item.status === "rejected"}
                  >
                    <i className="fas fa-times mr-1"></i>
                    {item.status === "rejected" ? "Already Rejected" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default RepositoryShowAuthor;