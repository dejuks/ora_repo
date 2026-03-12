import React, { useEffect, useMemo, useState } from "react";

export default function EbookForm({
  initial = {},
  onSubmit,
  onChange,
  onCancel,
  loading = false,
  isEdit = false,
}) {
  const [title, setTitle] = useState(initial.title || "");
  const [abstract, setAbstract] = useState(initial.abstract || "");
  const [keywords, setKeywords] = useState(
    Array.isArray(initial.keywords)
      ? initial.keywords.join(", ")
      : initial.keywords || ""
  );

  const [file, setFile] = useState(null);

  // NEW STATUS STATE
  const [status, setStatus] = useState(initial.status || "DRAFT");

  // Build payload once from current state
  const payload = useMemo(
    () => ({
      title,
      abstract,
      keywords,
      file,
      status,
    }),
    [title, abstract, keywords, file, status]
  );

  // ✅ Notify parent for live preview/checklist
  useEffect(() => {
    if (typeof onChange === "function") onChange(payload);
  }, [payload, onChange]);

  /* ================= SUBMIT ================= */
  const submit = (e, actionStatus) => {
    e.preventDefault();
    if (loading) return;

    const finalStatus = actionStatus || status;

    // ✅ Keep internal status in sync
    setStatus(finalStatus);

    // ✅ Pass data upward
    if (typeof onSubmit === "function") {
      onSubmit({
        title,
        abstract,
        keywords,
        file,
        status: finalStatus,
      });
    }
  };

  return (
    <form className="card p-4 shadow-sm">
      {/* TITLE */}
      <div className="mb-3">
        <label className="form-label">Title *</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          placeholder="Enter manuscript title"
        />
      </div>

      {/* ABSTRACT */}
      <div className="mb-3">
        <label className="form-label">Abstract</label>
        <textarea
          className="form-control"
          rows={5}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          disabled={loading}
          placeholder="Write a short abstract..."
        />
      </div>

      {/* KEYWORDS */}
      <div className="mb-3">
        <label className="form-label">Keywords</label>
        <input
          className="form-control"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="AI, Education, Research"
          disabled={loading}
        />
        <small className="text-muted">Separate keywords with commas</small>
      </div>

      {/* FILE */}
      {!isEdit && (
        <div className="mb-3">
          <label className="form-label">Manuscript File</label>
          <input
            className="form-control"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
          <small className="text-muted">PDF or DOCX recommended</small>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="d-flex gap-2 align-items-center">
        {/* SAVE DRAFT */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={(e) => submit(e, "DRAFT")}
          disabled={loading}
        >
          {loading ? "Saving..." : "💾 Save Draft"}
        </button>

        {/* FINAL SUBMIT */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => submit(e, "SUBMITTED")}
          disabled={loading}
        >
          {loading ? "Submitting..." : "🚀 Submit Manuscript"}
        </button>

        {/* CANCEL */}
        {typeof onCancel === "function" && (
          <button
            type="button"
            className="btn btn-default ml-auto"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}