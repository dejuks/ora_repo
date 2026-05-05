import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const SubmitRevisionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manuscript, setManuscript] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadManuscript(token);
  }, [id]);

  const loadManuscript = async (token) => {
    try {
      const res = await axios.get(
        `${API}/ebook/manuscripts/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setManuscript(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load manuscript");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setSubmitting(true);

      await axios.post(
        `${API}/ebook/manuscripts/${id}/submit-revision`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Revision submitted successfully!");

      navigate("/ebook/manuscripts/revisions");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <MainLayout>
      <div className="container mt-4">
        {/* HEADER */}
        <div className="mb-3">
          <h3>Submit Revision</h3>
          <Link to="/ebook/manuscripts/revisions" className="btn btn-sm btn-secondary">
            ← Back
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <div>Loading manuscript...</div>
          </div>
        ) : !manuscript ? (
          <div className="alert alert-danger">Manuscript not found</div>
        ) : (
          <>
            {/* MANUSCRIPT INFO */}
            <div className="card mb-4">
              <div className="card-body">
                <h5>{manuscript.title}</h5>
                <p className="text-muted">{manuscript.abstract}</p>

                <div className="row">
                  <div className="col-md-4">
                    <b>ISBN:</b> {manuscript.isbn || "-"}
                  </div>
                  <div className="col-md-4">
                    <b>Year:</b> {manuscript.publication_year}
                  </div>
                  <div className="col-md-4">
                    <b>Status:</b>{" "}
                    <span>
                      {manuscript.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* UPLOAD FORM */}
            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="card-body">
                  <h5>Upload Revised Manuscript</h5>

                  <input
                    type="file"
                    className="form-control mb-3"
                    onChange={(e) => setFile(e.target.files[0])}
                  />

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Revision"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SubmitRevisionPage;