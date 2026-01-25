import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";
import Swal from "sweetalert2";

import {
  getManuscripts,
  updateManuscript,
} from "../../../../api/manuscript.api";
import { getJournals } from "../../../../api/journalApi";
import { getSections } from "../../../../api/journalSectionApi";
import { getStatuses } from "../../../../api/manuscriptStatus.api";

export default function ManuscriptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [manuscript, setManuscript] = useState(null);
  const [journals, setJournals] = useState([]);
  const [sections, setSections] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [form, setForm] = useState({
    journal_id: "",
    section_id: "",
    title: "",
    abstract: "",
    keywords: "",
    language: "",
    article_type: "",
    status_id: "",
    current_version: 1,
  });

  // --- Load manuscript & lookup data
  const loadData = async () => {
    try {
      setLoading(true);

      // Load journals first
      const jres = await getJournals();
      setJournals(jres.data || []);

      // Load statuses
      const stres = await getStatuses();
      setStatuses(stres.data || []);

      // Manuscript
      const mres = await getManuscripts();
      const found = mres.data.find((m) => m.id === id);
      if (!found) {
        Swal.fire("Error", "Manuscript not found", "error");
        navigate("/admin/manuscripts");
        return;
      }
      setManuscript(found);

      // Set form with manuscript data
      setForm({
        journal_id: found.journal_id || "",
        section_id: found.section_id || "",
        title: found.title || "",
        abstract: found.abstract || "",
        keywords: found.keywords || "",
        language: found.language || "",
        article_type: found.article_type || "",
        status_id: found.status_id || "",
        current_version: found.current_version || 1,
      });

      // Load sections for the manuscript's journal if it exists
      if (found.journal_id) {
        const sres = await getSections(found.journal_id);
        setSections(sres.data || []);
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // --- Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Load sections when journal changes
    if (name === "journal_id") {
      const loadSections = async () => {
        try {
          const res = await getSections(value);
          setSections(res.data || []);
          // Reset section_id only if we're changing to a different journal
          setForm((prev) => ({ 
            ...prev, 
            section_id: value === manuscript?.journal_id ? manuscript.section_id : "" 
          }));
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to load sections", "error");
        }
      };
      if (value) {
        loadSections();
      } else {
        setSections([]);
        setForm((prev) => ({ ...prev, section_id: "" }));
      }
    }
  };

  // --- Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateManuscript(id, form);
      Swal.fire("Success", "Manuscript updated successfully", "success");
      navigate(`/admin/manuscripts/show/${id}`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Update failed", "error");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p className="mt-2">Loading manuscript...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Edit Manuscript</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary">
            <div className="card-header">
              <h3 className="card-title">Edit Manuscript: {manuscript.title}</h3>
            </div>

            <form className="form-horizontal" onSubmit={handleSubmit}>
              <div className="card-body">

                {/* Journal */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Journal</label>
                  <div className="col-sm-10">
                    <select
                      className="form-control"
                      name="journal_id"
                      value={form.journal_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Journal</option>
                      {journals.map((j) => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Section</label>
                  <div className="col-sm-10">
                    <select
                      className="form-control"
                      name="section_id"
                      value={form.section_id}
                      onChange={handleChange}
                      disabled={!form.journal_id}
                    >
                      <option value="">Select Section</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Title</label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Abstract */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Abstract</label>
                  <div className="col-sm-10">
                    <textarea
                      className="form-control"
                      name="abstract"
                      rows="4"
                      value={form.abstract}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {/* Keywords */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Keywords</label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      name="keywords"
                      value={form.keywords}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Language */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Language</label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Article Type */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Article Type</label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      name="article_type"
                      value={form.article_type}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Status</label>
                  <div className="col-sm-10">
                    <select
                      className="form-control"
                      name="status_id"
                      value={form.status_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Current Version */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Current Version</label>
                  <div className="col-sm-10">
                    <input
                      type="number"
                      className="form-control"
                      name="current_version"
                      value={form.current_version}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="card-footer text-right">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}