// src/ebook/pages/submissions/SubmissionRevisions.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { ebookDetail, submitRevision } from "../../../api/ebooks.js";

export default function SubmissionRevisions() {
  const { id } = useParams();
  const nav = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  const status = row?.ebook?.status;

  const lastRevisionRequest = useMemo(() => {
    const h = row?.history || [];
    return h.find((x) => String(x.action || "").toUpperCase() === "REQUEST_REVISION") || null;
  }, [row]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await ebookDetail(id);
      if (!res?.success) throw new Error(res?.message || "Failed to load submission");
      setRow(res.data);
    } catch (e) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!file) {
      setErr("Revised manuscript file is required.");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("notes", notes || "");
      fd.append("file", file);

      const res = await submitRevision(id, fd);
      if (!res?.success) throw new Error(res?.message || "Failed to submit revision");

      setOk("Revision submitted successfully.");
      setNotes("");
      setFile(null);
      await load();
      // optionally go back
      // nav("/ebook/my-submissions");
    } catch (e2) {
      setErr(e2?.message || "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <button className="btn btn-default mr-2" onClick={() => nav(-1)}>
              <i className="fas fa-arrow-left mr-1" /> Back
            </button>
            <h1 className="d-inline">Submit Revision</h1>
            <div className="text-muted mt-1">Upload a revised manuscript when editors request changes.</div>
          </div>
          <span className="badge badge-info p-2">
            <i className="fas fa-edit mr-1" /> Submission #{id}
          </span>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {err && (
            <div className="alert alert-danger alert-dismissible">
              <button type="button" className="close" onClick={() => setErr("")}>×</button>
              <i className="fas fa-exclamation-triangle mr-2" />
              {err}
            </div>
          )}
          {ok && (
            <div className="alert alert-success alert-dismissible">
              <button type="button" className="close" onClick={() => setOk("")}>×</button>
              <i className="fas fa-check-circle mr-2" />
              {ok}
            </div>
          )}

          {loading ? (
            <div className="card">
              <div className="card-body">Loading...</div>
            </div>
          ) : !row ? (
            <div className="card">
              <div className="card-body text-muted">No data</div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-upload mr-2" /> Revision Upload
                    </h3>
                  </div>
                  <form className="card-body" onSubmit={onSubmit}>
                    <div className="callout callout-info">
                      <div className="small">
                        Current status:{" "}
                        <span className="badge badge-secondary ml-1">{status || "—"}</span>
                      </div>
                      {lastRevisionRequest?.note && (
                        <div className="small mt-2">
                          <b>Editor note:</b> {lastRevisionRequest.note}
                        </div>
                      )}
                    </div>

                    {status !== "REVISION_REQUESTED" && (
                      <div className="alert alert-warning">
                        <i className="fas fa-info-circle mr-2" />
                        This submission is not in <b>REVISION_REQUESTED</b> status. You can still upload a file,
                        but typically revisions are expected only after a request.
                      </div>
                    )}

                    <div className="form-group">
                      <label>Revision Notes (optional)</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Summarize what you changed..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Revised Manuscript File *</label>
                      <input
                        className="form-control"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <small className="text-muted">PDF/DOC/DOCX recommended</small>
                    </div>

                    <div className="d-flex">
                      <button className="btn btn-primary" type="submit" disabled={busy}>
                        <i className="fas fa-paper-plane mr-1" />
                        {busy ? "Submitting..." : "Submit Revision"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-default ml-2"
                        onClick={() => nav(`/ebook/submissions/${id}/reviewer-comments`)}
                      >
                        <i className="fas fa-comments mr-1" /> View Reviewer Comments
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-outline card-secondary">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-list mr-2" /> Submission Summary
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <div className="text-muted small">Title</div>
                      <div className="font-weight-bold">{row?.ebook?.title || "—"}</div>
                    </div>
                    <div className="mb-2">
                      <div className="text-muted small">Status</div>
                      <span className="badge badge-secondary">{row?.ebook?.status || "—"}</span>
                    </div>
                    <div className="mb-2">
                      <div className="text-muted small">Latest Version</div>
                      <div>{(row?.versions?.[0]?.version_no ?? "—")}</div>
                    </div>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => nav(`/ebook/submissions/${id}/license`)}
                    >
                      <i className="fas fa-file-signature mr-1" /> License / Agreement
                    </button>
                  </div>
                </div>

                <div className="callout callout-warning">
                  <h6 className="mb-1">
                    <i className="fas fa-shield-alt mr-1" /> Tip
                  </h6>
                  <div className="small">
                    Upload a single “clean” revised file. Any supporting files can be uploaded using the Files section.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}