import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api.js";

const currentYear = new Date().getFullYear();
const allowedExtensions = ["pdf", "doc", "docx", "epub", "zip", "txt"];
const maxFileSize = 10 * 1024 * 1024;

function keywordList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFileExt(name = "") {
  const parts = String(name).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getFileName(file) {
  return (
    file?.original_name ||
    file?.name ||
    file?.stored_name ||
    file?.filename ||
    "Unnamed file"
  );
}

function getFileRole(file) {
  return file?.file_role || file?.role || "file";
}

export default function EbookSubmissionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    abstract: "",
    keywords: "",
    category: "",
    language: "English",
    publication_year: currentYear,
    target_audience: "",
    requires_bpc: false,
    bpc_amount: 0,
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [replacementFile, setReplacementFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const result = await ebookApi.getWorkflow(id);
        const submission = result?.submission || result || {};

        setForm({
          title: submission?.title || "",
          subtitle: submission?.subtitle || "",
          abstract: submission?.abstract || "",
          keywords: Array.isArray(submission?.keywords)
            ? submission.keywords.join(", ")
            : submission?.keywords || "",
          category: submission?.category || "",
          language: submission?.language || "English",
          publication_year: submission?.publication_year || currentYear,
          target_audience: submission?.target_audience || "",
          requires_bpc: !!submission?.requires_bpc,
          bpc_amount: submission?.bpc_amount || 0,
        });

        setExistingFiles(Array.isArray(result?.files) ? result.files : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load submission."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  const hasExistingManuscript = useMemo(() => {
    return existingFiles.some((file) =>
      ["manuscript", "revision"].includes(
        String(getFileRole(file)).toLowerCase()
      )
    );
  }, [existingFiles]);

  const draftValidations = useMemo(() => {
    const errors = {};
    const keywords = keywordList(form.keywords);
    const fileExt = replacementFile?.name ? getFileExt(replacementFile.name) : "";

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
      errors.keywords = "Add at least 3 keywords.";
    } else if (keywords.length < 3) {
      errors.keywords = "Please provide at least 3 keywords for draft.";
    }

    if (!form.language.trim()) {
      errors.language = "Language is required.";
    }

    if (!hasExistingManuscript && !replacementFile) {
      errors.file = "Please upload a manuscript file.";
    } else if (replacementFile && replacementFile.size > maxFileSize) {
      errors.file = `File size should not exceed ${maxFileSize / 1024 / 1024}MB.`;
    } else if (replacementFile && fileExt && !allowedExtensions.includes(fileExt)) {
      errors.file = `Allowed file types: ${allowedExtensions.join(", ")}.`;
    }

    return errors;
  }, [form, replacementFile, hasExistingManuscript]);

  const submitValidations = useMemo(() => {
    const errors = {};
    const keywords = keywordList(form.keywords);
    const fileExt = replacementFile?.name ? getFileExt(replacementFile.name) : "";

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

    if (!form.category.trim()) {
      errors.category = "Category is required.";
    }

    if (!form.publication_year) {
      errors.publication_year = "Publication year is required.";
    } else if (
      Number(form.publication_year) < 1900 ||
      Number(form.publication_year) > currentYear + 5
    ) {
      errors.publication_year = `Publication year must be between 1900 and ${currentYear + 5}.`;
    }

    if (!hasExistingManuscript && !replacementFile) {
      errors.file = "Please upload a manuscript file.";
    } else if (replacementFile && replacementFile.size > maxFileSize) {
      errors.file = `File size should not exceed ${maxFileSize / 1024 / 1024}MB.`;
    } else if (replacementFile && fileExt && !allowedExtensions.includes(fileExt)) {
      errors.file = `Allowed file types: ${allowedExtensions.join(", ")}.`;
    }

    return errors;
  }, [form, replacementFile, hasExistingManuscript]);

  const canSaveDraft = Object.keys(draftValidations).length === 0;
  const canSubmit = Object.keys(submitValidations).length === 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setReplacementFile(file);
  };

  const updateOnly = async () => {
    await ebookApi.updateSubmission(id, {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      abstract: form.abstract.trim(),
      keywords: keywordList(form.keywords),
      category: form.category.trim(),
      language: form.language.trim(),
      publication_year: form.publication_year
        ? Number(form.publication_year)
        : null,
      target_audience: form.target_audience.trim(),
      requires_bpc: !!form.requires_bpc,
      bpc_amount: form.bpc_amount ? Number(form.bpc_amount) : 0,
    });

    if (replacementFile) {
      await ebookApi.uploadFile(id, replacementFile, "revision");
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setSavingDraft(true);
    setError("");
    setNotice("");

    try {
      await updateOnly();
      navigate(`/ebook/submissions/${id}`, {
        state: { success: "Draft updated successfully." },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to save draft."
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await updateOnly();
      await ebookApi.submitSubmission(id);

      navigate(`/ebook/submissions/${id}`, {
        state: { success: "Submission updated and submitted successfully." },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to submit submission."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="Edit eBook Submission">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div>
            <h1 className="h3 mb-1">Edit eBook Submission</h1>
            <p className="text-muted mb-0">
              Update your draft, keep it as draft, or submit it.
            </p>
          </div>
          <Link to={`/ebook/submissions/${id}`} className="btn btn-outline-secondary">
            Back to Detail
          </Link>
        </div>

        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="alert alert-success" role="alert">
            {notice}
          </div>
        ) : null}

        <div className="card">
          <form>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">Loading submission...</div>
              ) : (
                <>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.title}
                        onChange={(e) => setField("title", e.target.value)}
                      />
                      {draftValidations.title ? (
                        <small className="text-danger">{draftValidations.title}</small>
                      ) : null}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Publication Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.publication_year}
                        onChange={(e) => setField("publication_year", e.target.value)}
                      />
                      {submitValidations.publication_year ? (
                        <small className="text-danger">
                          {submitValidations.publication_year}
                        </small>
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
                        className="form-control"
                        value={form.abstract}
                        onChange={(e) => setField("abstract", e.target.value)}
                      />
                      <small className="text-muted d-block mt-1">
                        {form.abstract.trim().length} characters
                      </small>
                      {draftValidations.abstract ? (
                        <small className="text-danger">{draftValidations.abstract}</small>
                      ) : null}
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Keywords *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.keywords}
                        onChange={(e) => setField("keywords", e.target.value)}
                        placeholder="AI, digital library, metadata, publishing"
                      />
                      {draftValidations.keywords ? (
                        <small className="text-danger">{draftValidations.keywords}</small>
                      ) : null}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Language *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.language}
                        onChange={(e) => setField("language", e.target.value)}
                      />
                      {draftValidations.language ? (
                        <small className="text-danger">{draftValidations.language}</small>
                      ) : null}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Category *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.category}
                        onChange={(e) => setField("category", e.target.value)}
                      />
                      {submitValidations.category ? (
                        <small className="text-danger">{submitValidations.category}</small>
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

                    <div className="col-md-4 mb-3">
                      <div className="form-check mt-4">
                        <input
                          id="requires_bpc_edit"
                          type="checkbox"
                          className="form-check-input"
                          checked={form.requires_bpc}
                          onChange={(e) => setField("requires_bpc", e.target.checked)}
                        />
                        <label htmlFor="requires_bpc_edit" className="form-check-label">
                          Requires BPC
                        </label>
                      </div>
                    </div>

                    <div className="col-md-8 mb-3">
                      <label className="form-label">BPC Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.bpc_amount}
                        onChange={(e) => setField("bpc_amount", e.target.value)}
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Current Files</label>
                      {existingFiles.length ? (
                        <ul className="mb-0 pl-3">
                          {existingFiles.map((file) => (
                            <li key={file.file_id || file.id}>
                              {getFileName(file)}
                              <span className="text-muted">
                                {" "}
                                ({getFileRole(file)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted">No files uploaded yet.</div>
                      )}
                    </div>

                    <div className="col-md-12 mb-4">
                      <label className="form-label">Upload New Revision File</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx,.epub,.zip,.txt"
                        onChange={handleFileChange}
                      />
                      {replacementFile ? (
                        <small className="text-success d-block mt-2">
                          Selected: {replacementFile.name}
                        </small>
                      ) : null}
                      {draftValidations.file ? (
                        <small className="text-danger d-block">
                          {draftValidations.file}
                        </small>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="card-footer d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary mr-2"
                onClick={handleSaveDraft}
                disabled={loading || savingDraft || submitting || !canSaveDraft}
              >
                {savingDraft ? "Saving Draft..." : "Save Draft"}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || savingDraft || submitting || !canSubmit}
              >
                {submitting ? "Submitting..." : "Update & Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}