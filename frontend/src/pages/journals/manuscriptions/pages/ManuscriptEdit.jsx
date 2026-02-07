import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";

import {
  getManuscripts,
  updateManuscript,
} from "../../../../api/manuscript.api";
import { getJournals } from "../../../../api/journalApi";
import { getSections } from "../../../../api/journalSectionApi";
import { getStatuses } from "../../../../api/manuscriptStatus.api";
import { getAuthUser } from "../../../../utils/auth.js";

export default function ManuscriptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedUser = getAuthUser();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [journals, setJournals] = useState([]);
  const [sections, setSections] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [form, setForm] = useState({
    journal_id: "",
    section_id: "",
    title: "",
    abstract: "",
    keywords: "",
    language: "en",
    article_type: "research",
    status_id: "",
    current_version: 1,
    submission_date: new Date().toISOString().split("T")[0],
    additional_notes: "",
    manuscript_file: null,
  });

  // --- Load all data
  const loadData = async () => {
    try {
      setInitialLoading(true);

      const jres = await getJournals();
      setJournals(jres.data || jres || []);

      const sres = await getStatuses();
      setStatuses(sres.data || sres || []);

      const mres = await getManuscripts();
      const manuscript = mres.data.find((m) => m.id === id);

      if (!manuscript) {
        Swal.fire("Error", "Manuscript not found", "error");
        navigate("/journal/manuscripts");
        return;
      }

      let sectionData = [];
      if (manuscript.journal_id) {
        const secRes = await getSections(manuscript.journal_id);
        sectionData = secRes.data || secRes || [];
        setSections(sectionData);
      }

      setForm({
        journal_id: manuscript.journal_id || "",
        section_id: manuscript.section_id || (sectionData[0]?.id || ""),
        title: manuscript.title || "",
        abstract: manuscript.abstract || "",
        keywords: manuscript.keywords || "",
        language: manuscript.language || "en",
        article_type: manuscript.article_type || "research",
        status_id: manuscript.status_id || "",
        current_version: manuscript.current_version || 1,
        submission_date:
          manuscript.submission_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        additional_notes: manuscript.additional_notes || "",
        manuscript_file: null,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load data", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "journal_id") {
      const loadSections = async () => {
        try {
          if (value) {
            const res = await getSections(value);
            setSections(res.data || res || []);
            setForm((prev) => ({ ...prev, section_id: "" }));
          } else {
            setSections([]);
            setForm((prev) => ({ ...prev, section_id: "" }));
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to load sections", "error");
        }
      };
      loadSections();
    }
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      manuscript_file: e.target.files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key !== "manuscript_file") formData.append(key, form[key] ?? "");
      });
      if (form.manuscript_file) {
        formData.append("manuscript_file", form.manuscript_file);
      }

      await updateManuscript(id, formData);

      Swal.fire("Success", "Manuscript updated successfully", "success");
      navigate(`/journal/manuscripts/show/${id}`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to update manuscript", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
          <h1>Edit Manuscript</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary">
            <div className="card-header">
              <h3 className="card-title">Edit Manuscript: {form.title}</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card-body">

                {/* Journal */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Journal *</label>
                  <div className="col-sm-10">
                    <select
                      className="form-control"
                      name="journal_id"
                      value={form.journal_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Journal</option>
                      {journals.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
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
                      disabled={!form.journal_id || sections.length === 0}
                    >
                      <option value="">Select Section</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Title *</label>
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

                {/* Language & Article Type */}
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Language</label>
                    <select
                      className="form-control"
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>

                  <div className="form-group col-md-6">
                    <label>Article Type</label>
                    <select
                      className="form-control"
                      name="article_type"
                      value={form.article_type}
                      onChange={handleChange}
                    >
                      <option value="research">Research Article</option>
                      <option value="review">Review Article</option>
                      <option value="short">Short Communication</option>
                      <option value="case">Case Study</option>
                      <option value="letter">Letter to Editor</option>
                      <option value="editorial">Editorial</option>
                    </select>
                  </div>
                </div>

                {/* Status & Version */}
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status_id"
                      value={form.status_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Current Version</label>
                    <input
                      type="number"
                      className="form-control"
                      name="current_version"
                      value={form.current_version}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                {/* Submission Date */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Submission Date</label>
                  <div className="col-sm-10">
                    <input
                      type="date"
                      className="form-control"
                      name="submission_date"
                      value={form.submission_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Upload Manuscript</label>
                  <div className="col-sm-10">
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        accept=".doc,.docx,.pdf,.txt"
                        onChange={handleFileChange}
                      />
                      <label className="custom-file-label">
                        {form.manuscript_file ? form.manuscript_file.name : "Choose file"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Additional Notes</label>
                  <div className="col-sm-10">
                    <textarea
                      className="form-control"
                      name="additional_notes"
                      rows="3"
                      value={form.additional_notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

              </div>

              <div className="card-footer text-right">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => navigate("/journal/manuscripts")}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
