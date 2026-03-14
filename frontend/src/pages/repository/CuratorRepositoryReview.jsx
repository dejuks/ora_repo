import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import axios from "axios";
import {
  getItem,
  approveItem,
  rejectItem,
  requestRevision
} from "../../api/repository.api";

const API =  process.env.REACT_APP_API_URL + "/repository-items";

function CuratorRepositoryReview() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Curator Tools States
  const [suggestedTitle, setSuggestedTitle] = useState("");
  const [suggestedAbstract, setSuggestedAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [vocabResults, setVocabResults] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);

  const FILE_BASE_URL =  process.env.REACT_APP_API_URL;

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${FILE_BASE_URL}/${path.replace(/^\/+/, "")}`;
  };

  const fetchItem = async () => {
    try {
      const res = await getItem(uuid);
      setItem(res.data);
      // Pre-fill curator metadata if exists
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

  /* ================= CURATOR ACTIONS ================= */
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

  /* ================= CURATOR TOOLS ================= */
  const submitMetadata = async () => {
    try {
      await axios.patch(
        `${API}/${uuid}/suggest-metadata`,
        { suggested_title: suggestedTitle, suggested_abstract: suggestedAbstract, keywords },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Repository Item Details</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/repository">Repository</Link></li>
                <li className="breadcrumb-item active">Show</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

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
                      <tr><th>Title</th><td>{item.title}</td></tr>
                      <tr><th>Type</th><td>{item.item_type}</td></tr>
                      <tr><th>Language</th><td>{item.language}</td></tr>
                      <tr><th>Status</th>
                        <td>
                          <span className={`badge ${
                            item.status === "published" ? "badge-success" :
                            item.status === "rejected" ? "badge-danger" :
                            item.status === "revision" ? "badge-warning" : "badge-secondary"
                          }`}>{item.status}</span>
                        </td>
                      </tr>
                      <tr><th>Access</th><td>{item.access_level}</td></tr>
                      <tr><th>DOI</th><td>{item.doi || "-"}</td></tr>
                      <tr><th>Handle</th><td>{item.handle || "-"}</td></tr>
                      <tr><th>Created At</th><td>{new Date(item.created_at).toLocaleDateString()}</td></tr>
                      <tr><th>Curator Feedback</th>
                        <td>
                          {item.rejection_reason && <div><strong>Rejected:</strong> {item.rejection_reason}</div>}
                          {item.curator_comment && <div><strong>Revision:</strong> {item.curator_comment}</div>}
                          {!item.rejection_reason && !item.curator_comment && <span className="text-muted">No feedback</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CURATOR ACTIONS */}
                <div className="card-footer text-center">
                  <button className="btn btn-success btn-sm mr-2" onClick={handleApprove} disabled={item.status==="published"}>
                    <i className="fas fa-check"></i> {item.status==="published" ? "Already Approved" : "Approve"}
                  </button>

                  <button className="btn btn-warning btn-sm mr-2" onClick={handleRevision} disabled={item.status==="revision"}>
                    <i className="fas fa-undo"></i> Request Revision
                  </button>

                  <button className="btn btn-danger btn-sm mr-2" onClick={handleReject} disabled={item.status==="rejected"}>
                    <i className="fas fa-times"></i> Reject
                  </button>

                  <Link to="/repository/curator/queue/new" className="btn btn-secondary btn-sm">
                    <i className="fas fa-arrow-left"></i> Back
                  </Link>
                </div>
              </div>

              {/* CURATOR TOOLS — METADATA */}
              <div className="card card-outline card-info mt-3">
                <div className="card-header"><h3>Metadata Enhancement</h3></div>
                <div className="card-body">
                  <input type="text" className="form-control mb-2" placeholder="Suggested Title"
                         value={suggestedTitle} onChange={(e)=>setSuggestedTitle(e.target.value)} />
                  <textarea className="form-control mb-2" placeholder="Suggested Abstract"
                            value={suggestedAbstract} onChange={(e)=>setSuggestedAbstract(e.target.value)} />
                  <input type="text" className="form-control mb-2" placeholder="Keywords"
                         value={keywords} onChange={(e)=>setKeywords(e.target.value)} />
                  <button className="btn btn-primary" onClick={submitMetadata}>Submit Suggestions</button>
                </div>
              </div>

              {/* VOCAB ANALYSIS */}
              <div className="card card-outline card-secondary mt-3">
                <div className="card-header"><h3>Vocabulary Analysis</h3></div>
                <div className="card-body">
                  <button className="btn btn-secondary mb-2" onClick={runVocabularyAnalysis}>Run Analysis</button>
                  {vocabResults && (
                    <ul>
                      {Object.entries(vocabResults).map(([word, count]) => (
                        <li key={word}>{word}: {count}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* COPYRIGHT CHECK */}
              <div className="card card-outline card-warning mt-3">
                <div className="card-header"><h3>Copyright Check</h3></div>
                <div className="card-body">
                  <button className="btn btn-warning mb-2" onClick={runCopyrightCheck}>Run Check</button>
                  {similarityScore !== null && <p>Similarity Score: {similarityScore}</p>}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — DOCUMENT PREVIEW */}
            <div className="col-md-8">
              <div className="card card-outline card-danger">
                <div className="card-header"><h3><i className="fas fa-file-pdf"></i> Document</h3></div>
                <div className="card-body p-0">
                  {item.file_path ? (
                    <iframe src={getFileUrl(item.file_path)} title="PDF Viewer"
                            style={{ width: "100%", height: "600px", border: "none" }} />
                  ) : (
                    <div className="text-center text-muted p-5">
                      <i className="fas fa-file-alt fa-3x mb-3"></i>
                      <p>No document uploaded</p>
                    </div>
                  )}
                </div>
                {item.file_path && (
                  <div className="card-footer text-center">
                    <a href={getFileUrl(item.file_path)} target="_blank" rel="noopener noreferrer"
                       className="btn btn-outline-primary btn-sm">
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

export default CuratorRepositoryReview;
