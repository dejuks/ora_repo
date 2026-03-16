// pages/EbookManagementPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EbookForm from "./EbookForm";
import Navbar from "../../landing/components/Navbar";

export default function EbookManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchEbook();
    }
  }, [id]);

  const fetchEbook = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/ebooks/${id}`);
      const data = await res.json();
      if (data.success) {
        setEbook(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load ebook");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = id ? `http://localhost:5000/api/ebooks/${id}` : "http://localhost:5000/api/ebooks";
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        navigate("/ebooks", { 
          state: { 
            message: id ? "Ebook updated successfully!" : "Ebook created successfully!" 
          } 
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error saving ebook");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
 <>
      <Navbar />
    <div className="container-fluid py-4">
      {/* Header */}
     

      {/* Form Card */}
      <div className="row">
        <div className="col-md-10 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">
                <i className="fas fa-info-circle mr-2 text-primary"></i>
                Ebook Information
              </h5>
            </div>
            <div className="card-body p-4">
              <EbookForm 
                initialData={ebook || {}} 
                onSubmit={handleSubmit} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="row mt-4">
        <div className="col-md-10 mx-auto">
          <div className="card bg-light border-0">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle fa-2x text-primary mr-3"></i>
                    <div>
                      <h6 className="mb-1">Status Guide</h6>
                      <small className="text-muted">
                        Draft → Under Review → Accepted → Published
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-tags fa-2x text-success mr-3"></i>
                    <div>
                      <h6 className="mb-1">Keywords</h6>
                      <small className="text-muted">
                        Add relevant tags for search
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-dollar-sign fa-2x text-warning mr-3"></i>
                    <div>
                      <h6 className="mb-1">Finance Clearance</h6>
                      <small className="text-muted">
                        Enable when royalties are approved
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}