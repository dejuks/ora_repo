import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";

const currentYear = new Date().getFullYear();
const blankForm = {
  title: "",
  abstract: "",
  keywords: "",
  language: "English",
};

const allowedExtensions = ["pdf", "doc", "docx", "epub", "zip", "txt"];

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
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState({});

  const validations = useMemo(() => {
    const errors = {};
    const keywords = keywordList(form.keywords);
    const fileExt = manuscriptFile?.name?.split(".")?.pop()?.toLowerCase();

    if (!form.title.trim()) errors.title = "Title is required.";
    else if (form.title.trim().length < 8) errors.title = "Title should be at least 8 characters.";

    if (!form.abstract.trim()) errors.abstract = "Abstract is required.";
    else if (form.abstract.trim().length < 80) errors.abstract = "Abstract should be at least 80 characters.";

    if (!keywords.length) errors.keywords = "Add at least 3 keywords separated by commas.";
    else if (keywords.length < 3) errors.keywords = "Please provide at least 3 keywords.";

    if (!form.language.trim()) errors.language = "Language is required.";

    if (!manuscriptFile) errors.file = "Please upload the manuscript file.";
    else if (fileExt && !allowedExtensions.includes(fileExt)) {
      errors.file = `Allowed file types: ${allowedExtensions.join(", ")}.`;
    }

    return errors;
  }, [form, manuscriptFile]);

  const submissionChecklist = [
    { label: "Title added", done: !!form.title.trim() },
    { label: "Abstract completed", done: form.abstract.trim().length >= 80 },
    { label: "At least 3 keywords", done: keywordList(form.keywords).length >= 3 },
    { label: "Language selected", done: !!form.language.trim() },
    { label: "Manuscript file attached", done: !!manuscriptFile },
  ];

  const isValid = Object.keys(validations).length === 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, abstract: true, keywords: true, language: true, file: true });
    setServerError("");

    if (!isValid) return;

    setSaving(true);
    try {
      const created = await ebookApi.createSubmission({
        ...form,
        keywords: keywordList(form.keywords).join(", "),
        file: manuscriptFile,
        file_role: "manuscript",
      });

      navigate(`/ebook/submissions/${created.submission_id}`);
    } catch (err) {
      setServerError(err?.response?.data?.message || err?.message || "Failed to create submission.");
    } finally {
      setSaving(false);
    }
  };

  const feedback = (key) => touched[key] && validations[key] ? <div className="invalid-feedback d-block">{validations[key]}</div> : null;

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Create eBook Submission</h1>
          <p className="text-muted mb-0">Create the submission as a draft first. After reviewing the draft, open its detail page and submit it for editorial screening.</p>
        </div>
        <Link className="btn btn-outline-secondary" to="/ebook/my-submissions">Back to my submissions</Link>
      </section>

      {serverError ? <div className="alert alert-danger">{serverError}</div> : null}

      <div className="row">
        <div className="col-lg-8">
          <div className="card card-primary card-outline">
            <form onSubmit={handleSubmit} noValidate>
              <div className="card-header">
                <h3 className="card-title mb-0">Submission form</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Title <span className="text-danger">*</span></label>
                  <input className={`form-control ${touched.title && validations.title ? "is-invalid" : ""}`} value={form.title} onChange={(e)=>setField("title", e.target.value)} onBlur={()=>setTouched((prev)=>({...prev,title:true}))} placeholder="Enter the book title" />
                  {feedback("title")}
                </div>

                <div className="form-group">
                  <label>Abstract <span className="text-danger">*</span></label>
                  <textarea rows="6" className={`form-control ${touched.abstract && validations.abstract ? "is-invalid" : ""}`} value={form.abstract} onChange={(e)=>setField("abstract", e.target.value)} onBlur={()=>setTouched((prev)=>({...prev,abstract:true}))} placeholder="Provide a clear summary of the manuscript." />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">Recommended: 120–350 words.</small>
                    <small className={form.abstract.trim().length < 80 ? "text-warning" : "text-success"}>{form.abstract.trim().length} characters</small>
                  </div>
                  {feedback("abstract")}
                </div>

                <div className="form-group">
                  <label>Keywords <span className="text-danger">*</span></label>
                  <input className={`form-control ${touched.keywords && validations.keywords ? "is-invalid" : ""}`} value={form.keywords} onChange={(e)=>setField("keywords", e.target.value)} onBlur={()=>setTouched((prev)=>({...prev,keywords:true}))} placeholder="Example: digital publishing, repository, ORA" />
                  <small className="text-muted">Separate keywords with commas.</small>
                  {feedback("keywords")}
                </div>

                <div className="form-group">
                  <label>Language <span className="text-danger">*</span></label>
                  <input className={`form-control ${touched.language && validations.language ? "is-invalid" : ""}`} value={form.language} onChange={(e)=>setField("language", e.target.value)} onBlur={()=>setTouched((prev)=>({...prev,language:true}))} placeholder="English" />
                  {feedback("language")}
                </div>

                <div className="form-group">
                  <label>Manuscript File <span className="text-danger">*</span></label>
                  <input type="file" className={`form-control ${touched.file && validations.file ? "is-invalid" : ""}`} accept=".pdf,.doc,.docx,.epub,.zip,.txt" onChange={(e)=>{ setManuscriptFile(e.target.files?.[0] || null); setTouched((prev)=>({...prev,file:true})); }} />
                  <small className="text-muted">Supported formats: PDF, DOC, DOCX, EPUB, ZIP, TXT. Maximum size depends on backend upload limits.</small>
                  {manuscriptFile ? <div className="mt-2 text-success">Selected file: <strong>{manuscriptFile.name}</strong></div> : null}
                  {feedback("file")}
                </div>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 12 }}>
                <div className="text-muted">This step saves a draft. You will submit it for screening from the draft detail page.</div>
                <button className="btn btn-primary" disabled={saving || !isValid}>
                  {saving ? "Saving draft..." : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-outline card-success">
            <div className="card-header"><h3 className="card-title mb-0">Readiness checklist</h3></div>
            <div className="card-body">
              <ul className="list-unstyled mb-3">
                {submissionChecklist.map((item) => (
                  <li key={item.label} className="mb-2 d-flex justify-content-between align-items-center">
                    <span>{item.label}</span>
                    <span className={`badge badge-${item.done ? "success" : "secondary"}`}>{item.done ? "Ready" : "Pending"}</span>
                  </li>
                ))}
              </ul>
              <div className="alert alert-light border mb-0">
                <strong>Before you submit</strong>
                <ul className="mb-0 mt-2 pl-3">
                  <li>Use the final manuscript version.</li>
                  <li>Keep keywords specific and searchable.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card card-outline card-info">
            <div className="card-header"><h3 className="card-title mb-0">Next workflow steps</h3></div>
            <div className="card-body">
              <ol className="pl-3 mb-0">
                <li>Editorial screening</li>
                <li>Peer review assignment</li>
                <li>Decision and revisions</li>
                <li>Finance clearance</li>
                <li>Production and publication</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}