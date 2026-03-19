// src/pages/journal/journals/JournalEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";
import { getJournalById, updateJournal } from "../../../../api/journalApi.js";
import Swal from "sweetalert2";

export default function JournalEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState({
    title: "",
    issn: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);

  // Fetch journal by ID
  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await getJournalById(id);
        setJournal({
          title: res.data.title || "",
          issn: res.data.issn || "",
          description: res.data.description || ""
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load journal", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJournal((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJournal(id, journal);
      Swal.fire("Success", "Journal updated successfully", "success");
      navigate("/journal/list");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to update journal", "error");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <p className="text-muted">Loading journal details...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid">
        <h3 className="mb-4">
          <i className="fas fa-edit mr-2"></i> Edit Journal
        </h3>

        <div className="card card-primary">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={journal.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ISSN</label>
                <input
                  type="text"
                  name="issn"
                  className="form-control"
                  value={journal.issn}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={journal.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-group mt-3">
                <button type="submit" className="btn btn-primary mr-2">
                  <i className="fas fa-save mr-1"></i> Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/journal/list")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
