import React, { useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import libraryApi from "../../../api/library.api";

export default function DigitalNewPage() {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    publication_year: "",
    access_level: "registered_users",
    status: "draft",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const created = await libraryApi.create("digital-submissions", form);
      if (file && created?.submission_id) {
        await libraryApi.uploadSubmissionFile(created.submission_id, file);
      }
      setMessage("Digital submission created successfully.");
      setForm({ title: "", abstract: "", publication_year: "", access_level: "registered_users", status: "draft" });
      setFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create digital submission");
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Upload Digital Resource</h1><p className="text-muted mb-0">Create a digital submission and attach the resource file.</p></div></section>
      <section className="content"><div className="container-fluid"><div className="row"><div className="col-lg-8"><div className="card card-primary"><div className="card-body">
        {message ? <div className="alert alert-success">{message}</div> : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required /></div>
          <div className="form-group"><label>Abstract</label><textarea className="form-control" rows="4" value={form.abstract} onChange={(e)=>setForm({...form,abstract:e.target.value})} /></div>
          <div className="form-row"><div className="form-group col-md-6"><label>Publication Year</label><input type="number" className="form-control" value={form.publication_year} onChange={(e)=>setForm({...form,publication_year:e.target.value})} /></div><div className="form-group col-md-6"><label>Access Level</label><select className="form-control" value={form.access_level} onChange={(e)=>setForm({...form,access_level:e.target.value})}><option value="registered_users">Registered Users</option><option value="public">Public</option><option value="students_only">Students Only</option><option value="staff_only">Staff Only</option><option value="restricted">Restricted</option></select></div></div>
          <div className="form-group"><label>File</label><input type="file" className="form-control" onChange={(e)=>setFile(e.target.files?.[0] || null)} /></div>
          <button className="btn btn-primary" type="submit">Create Submission</button>
        </form>
      </div></div></div></div></div></section>
    </MainLayout>
  );
}
