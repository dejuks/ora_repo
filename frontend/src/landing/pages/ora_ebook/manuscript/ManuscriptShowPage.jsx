import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";
import { useParams, Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

const API = process.env.REACT_APP_API_URL;

const ManuscriptShowPage = () => {
  const { id } = useParams();
  const [manuscript, setManuscript] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";

    const loadData = async () => {
      try {
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
      }
    };

    loadData();
  }, [id]);

  if (!manuscript) return <div>Loading...</div>;

  return (
    <MainLayout>
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{manuscript.title}</h4>
            <Link to="/ebook/manuscripts" className="btn btn-light btn-sm">
              Back
            </Link>
          </div>

          <div className="card-body">
            <div className="mb-3">
              <strong>Abstract:</strong>
              <p>{manuscript.abstract}</p>
            </div>
            <div className="mb-3">
              <strong>ISBN:</strong> {manuscript.isbn}
            </div>
            <div className="mb-3">
              <strong>Language:</strong> {manuscript.language}
            </div>
            <div className="mb-3">
              <strong>Publication Year:</strong> {manuscript.publication_year}
            </div>

            {manuscript.file_path && (
              <div className="mb-3 d-flex gap-2">
                <a
                  href={`${API}/${manuscript.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-sm"
                >
                  Download PDF
                </a>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => setShowModal(true)}
                >
                  Preview PDF
                </Button>
              </div>
            )}

            {/* Modal Preview */}
            <Modal
              show={showModal}
              onHide={() => setShowModal(false)}
              size="xl"
              centered
              scrollable
            >
              <Modal.Header closeButton>
                <Modal.Title>{manuscript.title} - Preview</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ height: "80vh" }}>
                <iframe
                  src={`${API}/${manuscript.file_path}`}
                  title="PDF Preview"
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="success"
                  href={`${API}/${manuscript.file_path}`}
                  target="_blank"
                >
                  Download PDF
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManuscriptShowPage;