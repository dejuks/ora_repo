import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";

const blankForm = {
  title: "",
  subtitle: "",
  abstract: "",
  keywords: "",
  category: "",
  language: "",
  publication_year: "",
  target_audience: "",
  requires_bpc: false,
  bpc_amount: 0,
};

export default function EbookSubmissionCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(blankForm);
  const [manuscriptFile, setManuscriptFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await ebookApi.createSubmission({
        ...form,
        publication_year: form.publication_year ? Number(form.publication_year) : null,
        bpc_amount: form.bpc_amount ? Number(form.bpc_amount) : 0,
        keywords: form.keywords,
        file: manuscriptFile,
        file_role: 'manuscript',
      });

      navigate(`/ebook/submissions/${created.submission_id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create submission.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Create eBook Submission</h1>
          <p className="text-muted mb-0">Create page is separate from list and saves metadata together with the manuscript file in one request.</p>
        </div>
        <Link className="btn btn-outline-secondary" to="/ebook/submissions">Back to list</Link>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card card-primary card-outline">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required /></div>
            <div className="form-group"><label>Subtitle</label><input className="form-control" value={form.subtitle} onChange={(e)=>setForm({...form,subtitle:e.target.value})} /></div>
            <div className="form-group"><label>Abstract</label><textarea className="form-control" rows="5" value={form.abstract} onChange={(e)=>setForm({...form,abstract:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group col-md-6"><label>Keywords</label><input className="form-control" value={form.keywords} onChange={(e)=>setForm({...form,keywords:e.target.value})} placeholder="AI, education, Oromo" /></div>
              <div className="form-group col-md-6"><label>Category</label><input className="form-control" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-4"><label>Language</label><input className="form-control" value={form.language} onChange={(e)=>setForm({...form,language:e.target.value})} /></div>
              <div className="form-group col-md-4"><label>Publication Year</label><input type="number" className="form-control" value={form.publication_year} onChange={(e)=>setForm({...form,publication_year:e.target.value})} /></div>
              <div className="form-group col-md-4"><label>Target Audience</label><input className="form-control" value={form.target_audience} onChange={(e)=>setForm({...form,target_audience:e.target.value})} /></div>
            </div>
            <div className="form-row align-items-center">
              <div className="form-group col-md-4"><div className="form-check mt-4"><input id="requires_bpc" type="checkbox" className="form-check-input" checked={form.requires_bpc} onChange={(e)=>setForm({...form,requires_bpc:e.target.checked})} /><label htmlFor="requires_bpc" className="form-check-label">Requires BPC</label></div></div>
              <div className="form-group col-md-8"><label>BPC Amount</label><input type="number" className="form-control" value={form.bpc_amount} onChange={(e)=>setForm({...form,bpc_amount:e.target.value})} /></div>
            </div>
            <div className="form-group">
              <label>Manuscript File</label>
              <input type="file" className="form-control" onChange={(e)=>setManuscriptFile(e.target.files?.[0] || null)} />
              <small className="text-muted">Upload the manuscript during creation so the submission contains file data from the start.</small>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Create Submission"}</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
