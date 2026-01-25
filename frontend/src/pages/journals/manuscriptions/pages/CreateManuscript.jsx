import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { createManuscript } from "../../../../api/manuscript.api";
import { getJournals } from "../../../../api/journalApi.js";
import { getSections } from "../../../../api/journalSectionApi";
import { getStatuses } from "../../../../api/manuscriptStatus.api";
import { getAuthUser } from "../../../../utils/auth.js";

export default function ManuscriptCreate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [sections, setSections] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const loggedUser = getAuthUser();

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
    corresponding_author_id: loggedUser?.uuid || "",
  });

  // --- Load initial data ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);

        // Fetch journals - handle different response structures
        console.log("Fetching journals...");
        const jres = await getJournals();
        console.log("Journals API response:", jres);

        // Handle different response structures
        if (Array.isArray(jres)) {
          // If response is directly an array
          setJournals(jres);
        } else if (jres.data && Array.isArray(jres.data)) {
          // If response has data property
          setJournals(jres.data);
        } else if (jres.journals && Array.isArray(jres.journals)) {
          // If response has journals property
          setJournals(jres.journals);
        } else {
          console.warn("Unexpected journals response structure:", jres);
          setJournals([]);
        }

        console.log("Journals set:", journals);

        // Fetch statuses
        const stres = await getStatuses();
        console.log("Statuses API response:", stres);

        if (Array.isArray(stres)) {
          setStatuses(stres);
        } else if (stres.data && Array.isArray(stres.data)) {
          setStatuses(stres.data);
        } else if (stres.statuses && Array.isArray(stres.statuses)) {
          setStatuses(stres.statuses);
        } else {
          console.warn("Unexpected statuses response structure:", stres);
          setStatuses([]);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        Swal.fire("Error", `Failed to load initial data: ${err.message}`, "error");
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Debug journals
  useEffect(() => {
    console.log("Journals state updated:", journals);
  }, [journals]);

  // --- Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Load sections when journal changes
    if (name === "journal_id") {
      const loadSections = async () => {
        try {
          if (value) {
            const res = await getSections(value);
            console.log("Sections API response:", res);

            // Handle different section response structures
            let sectionsData = [];
            if (Array.isArray(res)) {
              sectionsData = res;
            } else if (res.data && Array.isArray(res.data)) {
              sectionsData = res.data;
            } else if (res.sections && Array.isArray(res.sections)) {
              sectionsData = res.sections;
            }

            setSections(sectionsData);
          } else {
            setSections([]);
          }
          // Reset section when journal changes
          setForm((prev) => ({ ...prev, section_id: "" }));
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to load sections", "error");
        }
      };
      loadSections();
    }
  };

  // --- Handle submit
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const formData = new FormData();

    // append normal fields
    Object.keys(form).forEach((key) => {
      if (key !== "manuscript_file") {
        formData.append(key, form[key] ?? "");
      }
    });

    // append file ONCE
    if (form.manuscript_file) {
      formData.append("manuscript_file", form.manuscript_file);
    }

    // logged-in user (NOT from token payload)
    formData.append("created_by", loggedUser?.uuid);

    // authors
    formData.append("author_ids", JSON.stringify(selectedAuthors));

    const response = await createManuscript(formData);

    Swal.fire("Success", "Manuscript created", "success");
    navigate(`/journal/manuscripts/show/${response.data.id}`);
  } catch (err) {
    console.error(err);
    Swal.fire("Error", err.message || "Failed to create manuscript", "error");
  } finally {
    setLoading(false);
  }
};



  if (initialLoading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p className="mt-2">Loading form...</p>
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
              <h1>Create New Manuscript</h1>
              <p>
                Logged in as: <strong>{loggedUser?.name}</strong> (ID: {loggedUser?.uuid})
              </p>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/admin">Dashboard</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/admin/manuscripts">Manuscripts</a>
                </li>
                <li className="breadcrumb-item active">Create</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary">
            <div className="card-header">
              <h3 className="card-title">Manuscript Details</h3>
            </div>

            <form className="form-horizontal" onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="card-body">
                    {/* Basic Information */}
                    <div className="row">
                    <div className="col-md-12">
                        <h5 className="mb-3 border-bottom pb-2">Basic Information</h5>
                    </div>
                    </div>

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
                        {journals && journals.length > 0 ? (
                            journals.map((j) => (
                            <option key={j.id} value={j.id}>
                                {j.title || j.name || `Journal ${j.id}`}
                            </option>
                            ))
                        ) : (
                            <option value="" disabled>
                            No journals available
                            </option>
                        )}
                        </select>
                        <small className="form-text text-muted">
                        {journals.length === 0 ? "No journals found. Please create a journal first." : "Select the journal for this submission"}
                        </small>
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
                        {sections && sections.length > 0 ? (
                            sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name || s.title || `Section ${s.id}`}
                            </option>
                            ))
                        ) : (
                            <option value="" disabled>
                            {form.journal_id ? "No sections available for this journal" : "Select a journal first"}
                            </option>
                        )}
                        </select>
                        <small className="form-text text-muted">
                        {form.journal_id && sections.length === 0 
                            ? "This journal has no sections or sections failed to load" 
                            : "Select the journal section (if applicable)"}
                        </small>
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
                        placeholder="Enter manuscript title"
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
                        rows="5"
                        value={form.abstract}
                        onChange={handleChange}
                        placeholder="Enter abstract (optional)"
                        ></textarea>
                        <small className="form-text text-muted">
                        Maximum 300 words recommended
                        </small>
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
                        placeholder="e.g., machine learning, data analysis, AI"
                        />
                        <small className="form-text text-muted">
                        Separate keywords with commas
                        </small>
                    </div>
                    </div>

                    {/* Manuscript Details */}
                    <div className="row mt-4">
                    <div className="col-md-12">
                        <h5 className="mb-3 border-bottom pb-2">Manuscript Details</h5>
                    </div>
                    </div>

                    <div className="form-row">
                    {/* Language */}
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

                    {/* Article Type */}
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

                    <div className="form-row">
                    {/* Status */}
                    <div className="form-group col-md-6">
                        <label>Status *</label>
                        <select
                        className="form-control"
                        name="status_id"
                        value={form.status_id}
                        onChange={handleChange}
                        required
                        >
                        <option value="">Select Status</option>
                        {statuses && statuses.length > 0 ? (
                            statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label || s.name || s.status || `Status ${s.id}`}
                            </option>
                            ))
                        ) : (
                            <option value="" disabled>
                            No statuses available
                            </option>
                        )}
                        </select>
                    </div>

                    {/* Current Version */}
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

                    {/* File Upload Section (Optional) */}
                    <div className="row mt-4">
                    <div className="col-md-12">
                        <h5 className="mb-3 border-bottom pb-2">Manuscript File (Optional)</h5>
                    </div>
                    </div>

                    <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Upload Manuscript</label>
                    <div className="col-sm-10">
                        <div className="custom-file">
                        <input
  type="file"
  className="custom-file-input"
  accept=".doc,.docx,.pdf,.txt"
  onChange={(e) => {
    setForm((prev) => ({
      ...prev,
      manuscript_file: e.target.files[0],
    }));
  }}
/>
                        <label className="custom-file-label" htmlFor="manuscriptFile">
                            {form.manuscript_file ? form.manuscript_file.name : "Choose file"}
                        </label>
                        </div>
                        <small className="form-text text-muted">
                        Accepted formats: .doc, .docx, .pdf, .txt (Max: 10MB)
                        </small>
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
                        value={form.additional_notes || ""}
                        onChange={handleChange}
                        placeholder="Any additional notes or instructions for editors..."
                        ></textarea>
                    </div>
                    </div>

                </div>
              </div>

              {/* Footer */}
              <div className="card-footer text-right">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => navigate("/admin/manuscripts")}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || journals.length === 0 || statuses.length === 0}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Creating...
                    </>
                  ) : (
                    "Create Manuscript"
                  )}
                </button>
                {journals.length === 0 && (
                  <div className="alert alert-warning mt-2">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    No journals available. Please create a journal first before creating a manuscript.
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-warning ml-3"
                      onClick={() => navigate("/admin/journals/create")}
                    >
                      Create Journal
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
