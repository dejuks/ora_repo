import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";
import { useParams, Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { PDFDocument } from "pdf-lib";

const API = process.env.REACT_APP_API_URL;

const ManuscriptShowPage = () => {
  const { id } = useParams();

  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pdfPages, setPdfPages] = useState(null);
  const [pdfInfoLoading, setPdfInfoLoading] = useState(false);
  const [pdfInfoError, setPdfInfoError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API}/ebook/manuscripts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setManuscript(res.data);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const loadPdfInfo = async () => {
      if (!manuscript?.file_path) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setPdfInfoLoading(true);
        setPdfInfoError("");

        const normalizedPath = manuscript.file_path.replace(/\\/g, "/");
        const fileUrl = `${API}/${normalizedPath}`;

        const response = await axios.get(fileUrl, {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        const pdfDoc = await PDFDocument.load(response.data);
        setPdfPages(pdfDoc.getPageCount());
      } catch (error) {
        console.error("Failed to read PDF page count:", error);
        setPdfInfoError("Could not read PDF page count.");
      } finally {
        setPdfInfoLoading(false);
      }
    };

    loadPdfInfo();
  }, [manuscript]);

  const normalizedPath = manuscript?.file_path?.replace(/\\/g, "/") || "";
  const downloadUrl = normalizedPath ? `${API}/${normalizedPath}` : "#";

  const pdfFileName = useMemo(() => {
    if (!normalizedPath) return "No file uploaded";
    const parts = normalizedPath.split("/");
    return parts[parts.length - 1] || "document.pdf";
  }, [normalizedPath]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mt-4 text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading manuscript...</div>
        </div>
      </MainLayout>
    );
  }

  if (!manuscript) {
    return (
      <MainLayout>
        <div className="container mt-4">
          <Alert variant="danger">Manuscript not found.</Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div
            className="card-header text-white d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, #0d6efd, #084298)",
              padding: "1rem 1.5rem",
            }}
          >
            <div>
              <h4 className="mb-0 fw-bold">{manuscript.title}</h4>
              <small className="text-light">Manuscript document details</small>
            </div>

            <Link
              to="/ebook/manuscripts"
              className="btn btn-light btn-sm rounded-pill px-3"
            >
              Back
            </Link>
          </div>

          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-8">
                <div className="card border-0 bg-light rounded-4 h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Manuscript Information</h5>

                    <div className="mb-3">
                      <strong>Abstract:</strong>
                      <p className="text-muted mt-2 mb-0">
                        {manuscript.abstract || "N/A"}
                      </p>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border">
                          <small className="text-muted d-block">ISBN</small>
                          <strong>{manuscript.isbn || "N/A"}</strong>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border">
                          <small className="text-muted d-block">Language</small>
                          <strong>{manuscript.language || "N/A"}</strong>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border">
                          <small className="text-muted d-block">Publication Year</small>
                          <strong>{manuscript.publication_year || "N/A"}</strong>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border">
                          <small className="text-muted d-block">PDF Status</small>
                          <strong className={manuscript.file_path ? "text-success" : "text-secondary"}>
                            {manuscript.file_path ? "Available" : "Not uploaded"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Uploaded Document</h5>

                    {manuscript.file_path ? (
                      <>
                        <div className="p-3 bg-light rounded-3 border mb-3">
                          <small className="text-muted d-block">PDF Title / File Name</small>
                          <strong className="text-break">{pdfFileName}</strong>
                        </div>

                        <div className="p-3 bg-light rounded-3 border mb-3">
                          <small className="text-muted d-block">Document Pages</small>
                          {pdfInfoLoading ? (
                            <div className="d-flex align-items-center gap-2">
                              <Spinner animation="border" size="sm" />
                              <span>Reading page count...</span>
                            </div>
                          ) : pdfInfoError ? (
                            <span className="text-danger">{pdfInfoError}</span>
                          ) : (
                            <strong>{pdfPages ?? "N/A"} pages</strong>
                          )}
                        </div>

                        <div className="d-grid">
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success rounded-pill"
                          >
                            Download PDF
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted mb-0">No PDF attached.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {manuscript.file_path && (
              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Document Summary</h5>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <small className="text-muted d-block">Manuscript Title</small>
                        <strong>{manuscript.title || "N/A"}</strong>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <small className="text-muted d-block">Uploaded PDF Name</small>
                        <strong className="text-break">{pdfFileName}</strong>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <small className="text-muted d-block">Total Pages</small>
                        <strong>
                          {pdfInfoLoading
                            ? "Reading..."
                            : pdfInfoError
                            ? "Unavailable"
                            : `${pdfPages ?? "N/A"} pages`}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManuscriptShowPage;