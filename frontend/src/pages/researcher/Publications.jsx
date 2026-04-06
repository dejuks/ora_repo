import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyPublications,
  getAllPublications,
  createPublication,
  deletePublication,
  likePublication,
  getPublicationComments,
  commentOnPublication,
} from "../../api/researcher.api";
import Navbar from "../../landing/components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = process.env.REACT_APP_API_URL;

export default function PublicationsPage() {
  const navigate = useNavigate();
  const [myPublications, setMyPublications] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [publicationComments, setPublicationComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [profile, setProfile] = useState(null);
  
  // New publication form state
  const [newPublication, setNewPublication] = useState({
    title: "",
    authors: "",
    journal: "",
    year: new Date().getFullYear(),
    doi: "",
    abstract: "",
    file: null,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setProfile(JSON.parse(userStr));
    }
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    try {
      const [myPubs, allPubs] = await Promise.all([
        getMyPublications(),
        getAllPublications()
      ]);
      setMyPublications(myPubs || []);
      setAllPublications(allPubs || []);
    } catch (error) {
      console.error("Error loading publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePublication = async (e) => {
    e.preventDefault();
    
    if (!newPublication.title.trim() || !newPublication.authors.trim()) {
      alert("Title and authors are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newPublication.title.trim());
      formData.append('authors', newPublication.authors);
      formData.append('journal', newPublication.journal || '');
      formData.append('year', newPublication.year.toString());
      formData.append('doi', newPublication.doi || '');
      formData.append('abstract', newPublication.abstract || '');
      
      if (newPublication.file) {
        formData.append('file', newPublication.file);
      }

      await createPublication(formData);
      await loadPublications();
      setShowCreateModal(false);
      setNewPublication({
        title: "",
        authors: "",
        journal: "",
        year: new Date().getFullYear(),
        doi: "",
        abstract: "",
        file: null,
      });
      alert("Publication created successfully!");
    } catch (error) {
      console.error("Error creating publication:", error);
      alert(error.response?.data?.message || "Failed to create publication");
    }
  };

  const handleDeletePublication = async (publicationId) => {
    if (!window.confirm("Are you sure you want to delete this publication?")) return;
    try {
      await deletePublication(publicationId);
      await loadPublications();
      alert("Publication deleted successfully!");
    } catch (error) {
      console.error("Error deleting publication:", error);
      alert("Failed to delete publication");
    }
  };

  const handleLikePublication = async (publicationId) => {
    try {
      await likePublication(publicationId);
      await loadPublications();
    } catch (error) {
      console.error("Error liking publication:", error);
    }
  };

  const handleViewPublication = async (publication) => {
    setSelectedPublication(publication);
    try {
      const comments = await getPublicationComments(publication.uuid);
      setPublicationComments(comments || []);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error loading comments:", error);
      setPublicationComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPublication) return;
    try {
      await commentOnPublication(selectedPublication.uuid, newComment);
      const comments = await getPublicationComments(selectedPublication.uuid);
      setPublicationComments(comments);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  const publicationsToShow = activeTab === "my" ? myPublications : allPublications;

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: "#f3f2ef", minHeight: "100vh" }}>
        <div className="container py-4">
          {/* Header with Back Button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-link text-decoration-none"
              onClick={() => navigate("/researcher/profile")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Profile
            </button>
            <h4 className="fw-bold mb-0">Publications</h4>
            <button
              className="btn btn-primary rounded-pill"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New
            </button>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4 bg-white rounded p-1 shadow-sm">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "all" ? "active fw-bold" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Publications
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "my" ? "active fw-bold" : ""}`}
                onClick={() => setActiveTab("my")}
              >
                My Publications ({myPublications.length})
              </button>
            </li>
          </ul>

          {/* Publications List */}
          <div className="row">
            <div className="col-12">
              {publicationsToShow.length > 0 ? (
                publicationsToShow.map((pub) => {
                  const authors = Array.isArray(pub.authors)
                    ? pub.authors
                    : pub.authors
                      ? pub.authors.replace(/[{}"]/g, "").split(",").map((a) => a.trim())
                      : [];

                  return (
                    <div key={pub.uuid} className="card mb-3 shadow-sm border-0">
                      <div className="card-body">
                        <div className="d-flex">
                          <img
                            src={
                              pub.user_photo
                                ? `${API_URL}${pub.user_photo}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.user_name)}&background=0a66c2&color=fff&size=50`
                            }
                            alt={pub.user_name}
                            className="rounded-circle me-3"
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          />
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="fw-bold mb-1">{pub.user_name}</h6>
                                <small className="text-muted">{pub.user_affiliation}</small>
                              </div>
                              <small className="text-muted">
                                {new Date(pub.created_at).toLocaleDateString()}
                              </small>
                            </div>
                            
                            <h5 
                              className="fw-bold mt-3 mb-2"
                              style={{ cursor: "pointer", color: "#0a66c2" }}
                              onClick={() => handleViewPublication(pub)}
                            >
                              {pub.title}
                            </h5>
                            
                            <p className="text-muted small mb-2">{authors.join(", ")}</p>
                            
                            <div className="d-flex flex-wrap gap-3 mb-3">
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-journal me-1"></i> {pub.journal}
                              </span>
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-calendar me-1"></i> {pub.year}
                              </span>
                              {pub.doi && (
                                <a
                                  href={`https://doi.org/${pub.doi}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="badge bg-light text-primary text-decoration-none"
                                >
                                  <i className="bi bi-link-45deg me-1"></i> DOI
                                </a>
                              )}
                            </div>

                            <p className="text-muted small mb-3">
                              {pub.abstract?.substring(0, 200)}
                              {pub.abstract?.length > 200 ? "..." : ""}
                            </p>

                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex gap-3">
                                <button
                                  className="btn btn-sm btn-link text-decoration-none p-0"
                                  onClick={() => handleLikePublication(pub.uuid)}
                                >
                                  <i className={`bi ${pub.is_liked ? "bi-hand-thumbs-up-fill text-primary" : "bi-hand-thumbs-up"} me-1`}></i>
                                  {pub.like_count || 0}
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-decoration-none p-0"
                                  onClick={() => handleViewPublication(pub)}
                                >
                                  <i className="bi bi-chat me-1"></i>
                                  {pub.comment_count || 0} comments
                                </button>
                              </div>
                              
                              {pub.user_uuid === profile?.uuid && (
                                <button
                                  className="btn btn-sm btn-outline-danger rounded-pill"
                                  onClick={() => handleDeletePublication(pub.uuid)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5 bg-white rounded shadow-sm">
                  <i className="bi bi-file-text display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No publications found</h5>
                  {activeTab === "my" && (
                    <button
                      className="btn btn-primary rounded-pill mt-3"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Your First Publication
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Publication Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add New Publication</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreatePublication}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPublication.title}
                      onChange={(e) => setNewPublication({...newPublication, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Authors *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPublication.authors}
                      onChange={(e) => setNewPublication({...newPublication, authors: e.target.value})}
                      placeholder="Separate authors with commas"
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Journal</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPublication.journal}
                        onChange={(e) => setNewPublication({...newPublication, journal: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newPublication.year}
                        onChange={(e) => setNewPublication({...newPublication, year: parseInt(e.target.value)})}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">DOI</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPublication.doi}
                      onChange={(e) => setNewPublication({...newPublication, doi: e.target.value})}
                      placeholder="10.xxxx/xxxxx"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Abstract</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newPublication.abstract}
                      onChange={(e) => setNewPublication({...newPublication, abstract: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">PDF File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      onChange={(e) => setNewPublication({...newPublication, file: e.target.files[0]})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Publication
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Publication Modal */}
      {showViewModal && selectedPublication && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Publication Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-4">
                  <img
                    src={
                      selectedPublication.user_photo
                        ? `${API_URL}${selectedPublication.user_photo}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPublication.user_name)}&background=0a66c2&color=fff&size=50`
                    }
                    alt={selectedPublication.user_name}
                    className="rounded-circle me-3"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1">{selectedPublication.user_name}</h6>
                    <small className="text-muted">{selectedPublication.user_affiliation}</small>
                  </div>
                </div>

                <h4 className="fw-bold mb-3">{selectedPublication.title}</h4>
                
                <p className="text-muted mb-3">
                  {Array.isArray(selectedPublication.authors)
                    ? selectedPublication.authors.join(", ")
                    : selectedPublication.authors?.replace(/[{}"]/g, "").split(",").map(a => a.trim()).join(", ")}
                </p>

                <div className="d-flex flex-wrap gap-3 mb-4">
                  <span className="badge bg-light text-dark p-2">
                    <i className="bi bi-journal me-2"></i>
                    {selectedPublication.journal}
                  </span>
                  <span className="badge bg-light text-dark p-2">
                    <i className="bi bi-calendar me-2"></i>
                    {selectedPublication.year}
                  </span>
                  {selectedPublication.doi && (
                    <a
                      href={`https://doi.org/${selectedPublication.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="badge bg-light text-primary text-decoration-none p-2"
                    >
                      <i className="bi bi-link-45deg me-2"></i>
                      DOI: {selectedPublication.doi}
                    </a>
                  )}
                </div>

                <h6 className="fw-bold mb-2">Abstract</h6>
                <p className="text-muted mb-4">{selectedPublication.abstract}</p>

                <h6 className="fw-bold mb-3">Comments ({publicationComments.length})</h6>
                
                <div className="mb-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {publicationComments.length > 0 ? (
                    publicationComments.map((comment) => (
                      <div key={comment.uuid} className="d-flex mb-3">
                        <img
                          src={
                            comment.user_photo
                              ? `${API_URL}${comment.user_photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name)}&background=0a66c2&color=fff&size=35`
                          }
                          alt={comment.user_name}
                          className="rounded-circle me-2"
                          style={{ width: "35px", height: "35px", objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="bg-light rounded p-2">
                            <strong className="small">{comment.user_name}</strong>
                            <p className="mb-0 mt-1 small">{comment.content}</p>
                          </div>
                          <small className="text-muted">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center">No comments yet</p>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAddComment}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}