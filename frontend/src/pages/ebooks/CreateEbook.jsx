// pages/ebooks/CreateEbook.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EbookForm from "./EbookForm";

export default function CreateEbook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const url = "http://localhost:5000/api/ebooks";
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData, // FormData already contains all data
      });

      const data = await res.json();

      if (data.success) {
        // Show success message
        navigate("/ebooks", { 
          state: { 
            message: "Ebook created successfully!",
            type: "success"
          } 
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error creating ebook:", err);
      alert("Failed to create ebook. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-primary text-white shadow-lg border-0">
            <div className="card-body py-4">
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <i className="fas fa-plus-circle fa-3x opacity-75"></i>
                </div>
                <div>
                  <h2 className="mb-1">Create New Ebook</h2>
                  <p className="mb-0 opacity-75">
                    Add a new ebook to the Oromo digital library
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-center flex-grow-1">
                  <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                    1
                  </div>
                  <h6 className="mb-0">Basic Information</h6>
                  <small className="text-muted">Title, abstract, keywords</small>
                </div>
                <div className="text-center flex-grow-1">
                  <div className="rounded-circle bg-light text-dark d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                    2
                  </div>
                  <h6 className="mb-0">Files Upload</h6>
                  <small className="text-muted">Manuscript & cover</small>
                </div>
                <div className="text-center flex-grow-1">
                  <div className="rounded-circle bg-light text-dark d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                    3
                  </div>
                  <h6 className="mb-0">Review & Submit</h6>
                  <small className="text-muted">Confirm details</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                onSubmit={handleSubmit} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="row mt-4">
        <div className="col-md-10 mx-auto">
          <div className="card bg-light border-0">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="fas fa-lightbulb text-warning mr-2"></i>
                Tips for creating a great ebook:
              </h6>
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="fas fa-check-circle text-success mt-1 mr-2"></i>
                    <div>
                      <strong>Clear Title</strong>
                      <p className="small text-muted mb-0">Make it descriptive and searchable</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="fas fa-check-circle text-success mt-1 mr-2"></i>
                    <div>
                      <strong>Detailed Abstract</strong>
                      <p className="small text-muted mb-0">Summarize the content effectively</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="fas fa-check-circle text-success mt-1 mr-2"></i>
                    <div>
                      <strong>Relevant Keywords</strong>
                      <p className="small text-muted mb-0">Add 5-10 keywords for discoverability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Creating ebook...</p>
        </div>
      )}
    </div>
  );
}