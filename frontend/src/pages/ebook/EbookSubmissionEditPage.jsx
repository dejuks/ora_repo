import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";

export default function EbookSubmissionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
  });
  const [existingFiles, setExistingFiles] = useState([]);
  const [replacementFile, setReplacementFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ebookApi.getSubmission(id);
        setForm({
          title: data?.title || "",
          subtitle: data?.subtitle || "",
          abstract: data?.abstract || "",
          keywords: Array.isArray(data?.keywords) ? data.keywords.join(", ") : (data?.keywords || ""),
          category: data?.category || "",
          language: data?.language || "",
          publication_year: data?.publication_year || "",
          target_audience: data?.target_audience || "",
          requires_bpc: !!data?.requires_bpc,
          bpc_amount: data?.bpc_amount || 0,
        });
        setExistingFiles(data?.files || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load submission.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await ebookApi.updateSubmission(id, {
        ...form,
        publication_year: form.publication_year ? Number(form.publication_year) : null,
        bpc_amount: form.bpc_amount ? Number(form.bpc_amount) : 0,
        keywords: form.keywords,
      });

      if (replacementFile) {
        await ebookApi.uploadFile(id, replacementFile, "revision");
      }

      navigate(`/ebook/submissions/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update submission.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Update eBook Submission</h1>
          <p className="text-muted mb-0">Update page is separate and supports uploading a new revision file.</p>
        </div>
        <Link className="btn btn-outline-secondary" to="/ebook/submissions">Back to list</Link>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card card-primary card-outline">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {loading ? <div>Loading…</div> : (
              <>
                <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required /></div>
                <div className="form-group"><label>Subtitle</label><input className="form-control" value={form.subtitle} onChange={(e)=>setForm({...form,subtitle:e.target.value})} /></div>
                <div className="form-group"><label>Abstract</label><textarea className="form-control" rows="5" value={form.abstract} onChange={(e)=>setForm({...form,abstract:e.target.value})} /></div>
                <div className="form-row">
                  <div className="form-group col-md-6"><label>Keywords</label><input className="form-control" value={form.keywords} onChange={(e)=>setForm({...form,keywords:e.target.value})} /></div>
                  <div className="form-group col-md-6"><label>Category</label><input className="form-control" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-4"><label>Language</label><input className="form-control" value={form.language} onChange={(e)=>setForm({...form,language:e.target.value})} /></div>
                  <div className="form-group col-md-4"><label>Publication Year</label><input type="number" className="form-control" value={form.publication_year} onChange={(e)=>setForm({...form,publication_year:e.target.value})} /></div>
                  <div className="form-group col-md-4"><label>Target Audience</label><input className="form-control" value={form.target_audience} onChange={(e)=>setForm({...form,target_audience:e.target.value})} /></div>
                </div>
                <div className="form-row align-items-center">
                  <div className="form-group col-md-4"><div className="form-check mt-4"><input id="requires_bpc_edit" type="checkbox" className="form-check-input" checked={form.requires_bpc} onChange={(e)=>setForm({...form,requires_bpc:e.target.checked})} /><label htmlFor="requires_bpc_edit" className="form-check-label">Requires BPC</label></div></div>
                  <div className="form-group col-md-8"><label>BPC Amount</label><input type="number" className="form-control" value={form.bpc_amount} onChange={(e)=>setForm({...form,bpc_amount:e.target.value})} /></div>
                </div>
                <div className="form-group">
                  <label>Current Files</label>
                  <ul className="mb-2 pl-3">
                    {existingFiles.length ? existingFiles.map((file) => (
                      <li key={file.file_id}>{file.original_name} <span className="text-muted">({file.file_role})</span></li>
                    )) : <li className="text-muted">No files uploaded yet.</li>}
                  </ul>
                </div>
                <div className="form-group">
                  <label>Upload New Revision File</label>
                  <input type="file" className="form-control" onChange={(e)=>setReplacementFile(e.target.files?.[0] || null)} />
                </div>
              </>
            )}
          </div>
          <div className="card-footer">
            <button className="btn btn-primary" disabled={saving || loading}>{saving ? "Updating…" : "Update Submission"}</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
