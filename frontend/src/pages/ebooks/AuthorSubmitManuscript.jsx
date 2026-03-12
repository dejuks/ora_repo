// src/ebook/pages/AuthorSubmitManuscript.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EbookForm from "../ebooks/EbookForm.jsx";
import { createEbook } from "../../api/ebooks.js";
import MainLayout from "../../components/layout/MainLayout.jsx";

export default function AuthorSubmitManuscript() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ We keep a lightweight "preview" state from form (EbookForm will call onChange)
  const [draft, setDraft] = useState({
    title: "",
    abstract: "",
    keywords: "",
    file: null,
  });

  const summary = useMemo(() => {
    const keywordsArr = (draft.keywords || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    return {
      titleOk: !!draft.title?.trim(),
      abstractOk: (draft.abstract || "").trim().length >= 20, // journal-like minimum
      keywordsCount: keywordsArr.length,
      hasFile: !!draft.file,
      keywordsArr,
    };
  }, [draft]);

  const submit = async ({ title, abstract, keywords, file, status }) => {
    // status = "DRAFT" or "SUBMITTED"
    setErr("");
    setOk("");

    if (!title?.trim()) {
      setErr("Title is required.");
      return;
    }

    // For SUBMITTED enforce file
    if (status === "SUBMITTED" && !file) {
      setErr("Manuscript file is required to submit.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("abstract", abstract?.trim() || "");
      fd.append("keywords", keywords || "");
      fd.append("status", status);
      if (file) fd.append("file", file);

      const res = await createEbook(fd);

      if (!res?.success) {
        setErr(res?.message || "Failed to save submission.");
        return;
      }

      setOk(status === "DRAFT" ? "Draft saved successfully." : "Submitted successfully.");
      nav("/ebook/my-submissions");
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel? Unsaved changes will be lost.")) {
      nav("/ebook/my-submissions");
    }
  };

  return (
    <MainLayout>
      <div className="content-header">
        {/* Content Header */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <button className="btn btn-default mr-2" onClick={() => nav(-1)}>
                  <i className="fas fa-arrow-left mr-1" />
                  Back
                </button>
                <h1 className="d-inline">Submit Manuscript</h1>
                <div className="text-muted mt-1">
                  Save as Draft anytime, then submit when ready.
                </div>
              </div>

              <div className="text-right">
                <span className="badge badge-info p-2">
                  <i className="fas fa-user-edit mr-1" /> Author Portal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="content">
          <div className="container-fluid">
            {/* Alerts */}
            {err && (
              <div className="alert alert-danger alert-dismissible">
                <button type="button" className="close" onClick={() => setErr("")}>
                  ×
                </button>
                <i className="fas fa-exclamation-triangle mr-2" />
                {err}
              </div>
            )}

            {ok && (
              <div className="alert alert-success alert-dismissible">
                <button type="button" className="close" onClick={() => setOk("")}>
                  ×
                </button>
                <i className="fas fa-check-circle mr-2" />
                {ok}
              </div>
            )}

            {/* Steps Row */}
            <div className="row">
              <div className="col-md-4">
                <div className="info-box">
                  <span className="info-box-icon bg-secondary">
                    <i className="fas fa-pencil-alt" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Step 1</span>
                    <span className="info-box-number">Draft details</span>
                    <span className="text-muted small">Title, abstract, keywords</span>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="info-box">
                  <span className="info-box-icon bg-info">
                    <i className="fas fa-upload" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Step 2</span>
                    <span className="info-box-number">Upload manuscript</span>
                    <span className="text-muted small">PDF/DOC/DOCX, max 50MB</span>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="info-box">
                  <span className="info-box-icon bg-success">
                    <i className="fas fa-paper-plane" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Step 3</span>
                    <span className="info-box-number">Submit</span>
                    <span className="text-muted small">Send for editor screening</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Left: Form */}
              <div className="col-lg-8">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-file-alt mr-2" />
                      Manuscript Metadata
                    </h3>
                  </div>

                  <div className="card-body">
                    <div className="callout callout-info">
                      <h5 className="mb-1">
                        <i className="fas fa-info-circle mr-1" />
                        Submission Guidelines
                      </h5>
                      <div className="small">
                        Save a draft first if you are still preparing your final manuscript.
                        Fields with <span className="text-danger">*</span> are required for submission.
                      </div>
                    </div>

                    {/* ✅ EbookForm stays the same, but add onChange so we can show right-side summary */}
                    <EbookForm
                      onSubmit={submit}
                      onCancel={handleCancel}
                      loading={loading}
                      onChange={(payload) =>
                        setDraft((prev) => ({
                          ...prev,
                          title: payload?.title ?? prev.title,
                          abstract: payload?.abstract ?? prev.abstract,
                          keywords: payload?.keywords ?? prev.keywords,
                          file: payload?.file ?? prev.file,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Right: Summary + Checklist */}
              <div className="col-lg-4">
                <div className="card card-outline card-secondary">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-clipboard-check mr-2" />
                      Pre-submit checklist
                    </h3>
                  </div>

                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <i className={`fas mr-2 ${summary.titleOk ? "fa-check-circle text-success" : "fa-times-circle text-danger"}`} />
                        Title provided
                      </li>
                      <li className="mb-2">
                        <i className={`fas mr-2 ${summary.abstractOk ? "fa-check-circle text-success" : "fa-exclamation-circle text-warning"}`} />
                        Abstract (recommended 20+ chars)
                      </li>
                      <li className="mb-2">
                        <i className={`fas mr-2 ${summary.keywordsCount >= 3 ? "fa-check-circle text-success" : "fa-exclamation-circle text-warning"}`} />
                        Keywords (recommended 3+). Current: <b>{summary.keywordsCount}</b>
                      </li>
                      <li className="mb-0">
                        <i className={`fas mr-2 ${summary.hasFile ? "fa-check-circle text-success" : "fa-times-circle text-danger"}`} />
                        Manuscript file attached (required for submit)
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card card-outline card-info">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-eye mr-2" />
                      Live summary
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <div className="text-muted small">Title</div>
                      <div className="font-weight-bold">
                        {draft.title?.trim() ? draft.title : <span className="text-muted">—</span>}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="text-muted small">Keywords</div>
                      {summary.keywordsArr.length ? (
                        <div>
                          {summary.keywordsArr.slice(0, 8).map((k) => (
                            <span key={k} className="badge badge-light mr-1 mb-1">
                              {k}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted">—</div>
                      )}
                    </div>

                    <div>
                      <div className="text-muted small">File</div>
                      <div>
                        {draft.file ? (
                          <span className="badge badge-success">
                            <i className="fas fa-paperclip mr-1" />
                            {draft.file?.name || "Attached"}
                          </span>
                        ) : (
                          <span className="badge badge-secondary">No file</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="callout callout-warning">
                  <h6 className="mb-1">
                    <i className="fas fa-lock mr-1" /> Confidential
                  </h6>
                  <div className="small mb-0">
                    Your manuscript is only visible to authorized editors and assigned reviewers.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-muted small mt-2">
              Supported formats: PDF, DOC, DOCX • Max size: 50MB
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}