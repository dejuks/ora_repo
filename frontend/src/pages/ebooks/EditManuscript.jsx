// src/ebook/pages/EditManuscript.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EbookForm from "../ebooks/EbookForm.jsx";
import { ebookDetail, updateEbook } from "../../api/ebooks.js";
import MainLayout from "../../components/layout/MainLayout.jsx";

export default function EditManuscript() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const res = await ebookDetail(id);
      if (!res.success) return setErr(res.message || "Failed");
      setInitial(res.data.ebook);
    })();
  }, [id]);

  const onSubmit = async ({ title, abstract, keywords, status }) => {
    setErr("");
    // Include status in the update
    const res = await updateEbook(id, { title, abstract, keywords, status });
    if (!res.success) return setErr(res.message || "Update failed");
    nav(`/ebook/${id}`);
  };

  if (err) {
    return (
      <MainLayout>
        <div className="container py-4">
          <div className="alert alert-danger">{err}</div>
        </div>
      </MainLayout>
    );
  }

  if (!initial) {
    return (
      <MainLayout>
        <div className="container py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={() => nav(-1)}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back
            </button>
            <h3 className="d-inline-block mb-0">Edit Manuscript</h3>
          </div>
          <span className="badge bg-secondary fs-6 p-2">
            {initial.status}
          </span>
        </div>

        {err && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {err}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErr("")}
            ></button>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-body">
            <EbookForm 
              initial={initial} 
              onSubmit={onSubmit} 
              isEdit={true} 
            />
          </div>
        </div>

        {/* Info message about status */}
        <div className="alert alert-info mt-3">
          <i className="bi bi-info-circle me-2"></i>
          <small>
            <strong>Note:</strong> Saving as Draft will keep the manuscript in "{initial.status}" status. 
            Submitting will change the status to "SUBMITTED" if allowed.
          </small>
        </div>
      </div>
    </MainLayout>
  );
}