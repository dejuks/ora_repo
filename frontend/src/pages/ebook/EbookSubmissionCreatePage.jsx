import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "./mock/ebookMockApi.js";

const currentYear = new Date().getFullYear();

const blankForm = {
  title: "",
  subtitle: "",
  abstract: "",
  keywords: "",
  language: "English",
  category: "",
  publication_year: currentYear,
  target_audience: "",
};

const allowedExtensions = ["pdf", "doc", "docx", "epub", "zip", "txt"];
const maxFileSize = 10 * 1024 * 1024;

function keywordList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EbookSubmissionCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(blankForm);
  const [manuscriptFile, setManuscriptFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState({});

  const draftValidations = useMemo(() => {
    const errors = {};
    const keywords = keywordList(form.keywords);
    const fileExt = manuscriptFile?.name?.split(".")?.pop()?.toLowerCase();

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    } else if (form.title.trim().length < 8) {
      errors.title = "Title should be at least 8 characters.";
    }

    if (!form.abstract.trim()) {
      errors.abstract = "Abstract is required.";
    } else if (form.abstract.trim().length < 80) {
      errors.abstract = "Abstract should be at least 80 characters for draft.";
    }

    if (!keywords.length) {
      errors.keywords = "Add at least 3 keywords separated by commas.";
    } else if (keywords.length < 3) {
      errors.keywords = "Please provide at least 3 keywords for draft.";
    }

    if (!form.language.trim()) {
      errors.language = "Language is required.";
    }

    if (!manuscriptFile) {
      errors.file = "Please upload the manuscript file.";
    } else if (manuscriptFile.size > maxFileSize) {
      errors.file = `File size should not exceed ${maxFileSize / 1024 / 1024}MB.`;
    } else if (fileExt && !allowedExtensions.includes(fileExt)) {
      errors.file = `Allowed file types: ${allowedExtensions.join(", ")}.`;
    }

    return errors;
  }, [form, manuscriptFile]);

  const submissionValidations = useMemo(() => {
    const errors = {};
    const keywords = keywordList(form.keywords);
    const fileExt = manuscriptFile?.name?.split(".")?.pop()?.toLowerCase();

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    } else if (form.title.trim().length < 10) {
      errors.title = "Title should be at least 10 characters for final submission.";
    }

    if (!form.abstract.trim()) {
      errors.abstract = "Abstract is required.";
    } else if (form.abstract.trim().length < 150) {
      errors.abstract = "Abstract should be at least 150 characters for final submission.";
    } else if (form.abstract.trim().length > 500) {
      errors.abstract = "Abstract should not exceed 500 characters.";
    }

    if (!keywords.length) {
      errors.keywords = "Keywords are required.";
    } else if (keywords.length < 4) {
      errors.keywords = "Please provide at least 4 keywords for final submission.";
    } else if (keywords.length > 10) {
      errors.keywords = "Please provide no more than 10 keywords.";
    }

    if (!form.language.trim()) {
      errors.language = "Language is required.";
    }

    if (!form.category) {
      errors.category = "Please select a category for final submission.";
    }

    if (!form.publication_year) {
      errors.publication_year = "Publication year is required.";
    } else if (
      Number(form.publication_year) < 1900 ||
      Number(form.publication_year) > currentYear + 5
    ) {
      errors.publication_year = `Publication year must be between 1900 and ${currentYear + 5}.`;
    }

    if (!manuscriptFile) {
      errors.file = "Please upload the manuscript file.";
    } else if (manuscriptFile.size > maxFileSize) {
      errors.file = `File size should not exceed ${maxFileSize / 1024 / 1024}MB.`;
    } else if (fileExt && !allowedExtensions.includes(fileExt)) {
      errors.file = `Allowed file types: ${allowedExtensions.join(", ")}.`;
    }

    return errors;
  }, [form, manuscriptFile]);

  const canSaveDraft = Object.keys(draftValidations).length === 0;
  const canSubmit = Object.keys(submissionValidations).length === 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setManuscriptFile(file);
    setTouched((prev) => ({ ...prev, file: true }));
    setServerError("");
  };

  const createSubmission = async (shouldSubmit = false) => {
    setSaving(!shouldSubmit);
    setSubmitting(shouldSubmit);
    setServerError("");

    try {
      if (!manuscriptFile) {
        throw new Error("Please select a manuscript file.");
      }

      const created = await ebookApi.createSubmission({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        abstract: form.abstract.trim(),
        keywords: keywordList(form.keywords),
        language: form.language.trim(),
        category: form.category,
        publication_year: Number(form.publication_year),
        target_audience: form.target_audience.trim(),
        file: manuscriptFile,
        file_role: "manuscript",
      });

      const submissionId =
        created?.submission_id || created?.data?.submission_id || created?.id;

      if (!submissionId) {
        throw new Error("Submission was created, but no submission ID was returned.");
      }

      if (shouldSubmit) {
        await ebookApi.submitSubmission(submissionId);
        navigate(`/ebook/submissions/${submissionId}`, {
          state: { success: "Submission created and submitted successfully." },
        });
        return;
      }

      navigate(`/ebook/submissions/${submissionId}`, {
        state: { success: "Draft saved successfully." },
      });
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create submission. Please try again."
      );
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="New ORA eBook Submission">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">New Submission</h1>
            <p className="text-muted mb-0">
              Create a draft or submit your manuscript for editorial screening.
            </p>
          </div>
          <Link to="/ebook/submissions" className="btn btn-outline-secondary">
            Back to My Submissions
          </Link>
        </div>

        {serverError ? (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        ) : null}

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className={`form-control ${touched.title && submissionValidations.title ? "is-invalid" : ""}`}
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
                {touched.title && submissionValidations.title ? (
                  <div className="invalid-feedback">{submissionValidations.title}</div>
                ) : null}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Publication Year *</label>
                <input
                  type="number"
                  className={`form-control ${touched.publication_year && submissionValidations.publication_year ? "is-invalid" : ""}`}
                  value={form.publication_year}
                  onChange={(e) => setField("publication_year", e.target.value)}
                />
                {touched.publication_year && submissionValidations.publication_year ? (
                  <div className="invalid-feedback">{submissionValidations.publication_year}</div>
                ) : null}
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Subtitle</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.subtitle}
                  onChange={(e) => setField("subtitle", e.target.value)}
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Abstract *</label>
                <textarea
                  rows="6"
                  className={`form-control ${touched.abstract && submissionValidations.abstract ? "is-invalid" : ""}`}
                  value={form.abstract}
                  onChange={(e) => setField("abstract", e.target.value)}
                />
                {touched.abstract && submissionValidations.abstract ? (
                  <div className="invalid-feedback">{submissionValidations.abstract}</div>
                ) : null}
                <small className="text-muted">
                  {form.abstract.trim().length} characters
                </small>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Keywords *</label>
                <input
                  type="text"
                  className={`form-control ${touched.keywords && submissionValidations.keywords ? "is-invalid" : ""}`}
                  value={form.keywords}
                  onChange={(e) => setField("keywords", e.target.value)}
                  placeholder="AI, digital library, metadata, publishing"
                />
                {touched.keywords && submissionValidations.keywords ? (
                  <div className="invalid-feedback">{submissionValidations.keywords}</div>
                ) : null}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Language *</label>
                <input
                  type="text"
                  className={`form-control ${touched.language && submissionValidations.language ? "is-invalid" : ""}`}
                  value={form.language}
                  onChange={(e) => setField("language", e.target.value)}
                />
                {touched.language && submissionValidations.language ? (
                  <div className="invalid-feedback">{submissionValidations.language}</div>
                ) : null}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Category *</label>
                <select
                  className={`form-select ${touched.category && submissionValidations.category ? "is-invalid" : ""}`}
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Health">Health</option>
                  <option value="Business">Business</option>
                </select>
                {touched.category && submissionValidations.category ? (
                  <div className="invalid-feedback">{submissionValidations.category}</div>
                ) : null}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Target Audience</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.target_audience}
                  onChange={(e) => setField("target_audience", e.target.value)}
                />
              </div>

              <div className="col-md-12 mb-4">
                <label className="form-label">Manuscript File *</label>
                <input
                  type="file"
                  className={`form-control ${touched.file && submissionValidations.file ? "is-invalid" : ""}`}
                  accept=".pdf,.doc,.docx,.epub,.zip,.txt"
                  onChange={handleFileChange}
                />
                {touched.file && submissionValidations.file ? (
                  <div className="invalid-feedback">{submissionValidations.file}</div>
                ) : null}
                {manuscriptFile ? (
                  <small className="text-success d-block mt-2">
                    Selected: {manuscriptFile.name}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => createSubmission(false)}
                disabled={saving || submitting || !canSaveDraft}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => createSubmission(true)}
                disabled={saving || submitting || !canSubmit}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}