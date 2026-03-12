// src/ebook/pages/submissions/SubmissionLicense.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { ebookDetail, uploadFileToCurrentVersion } from "../../../api/ebooks.js";

export default function SubmissionLicense() {
  const { id } = useParams();
  const nav = useNavigate();

  const [row, setRow] = useState(null);
  const [licenseType, setLicenseType] = useState("STANDARD");
  const [file, setFile] = useState(null);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!file) {
      setErr("Signed license file is required.");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      // You don't have a DB field for license type, so we store it as fileType text.
      // Example: LICENSE_STANDARD / LICENSE_OPEN / LICENSE_CUSTOM
      fd.append("fileType", `LICENSE_${licenseType}`);
      fd.append("file", file);

      const res = await uploadFileToCurrentVersion(id, fd);
      if (!res?.success) throw new Error(res?.message || "Upload failed");

      setOk("License uploaded successfully.");
      setFile(null);
      await load();
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
            <h1 className="d-inline">License Agreement</h1>
            <div className="text-muted mt-1">Upload the signed publishing license.</div>
          </div>
          <span className="badge badge-info p-2">
            <i className="fas fa-file-signature mr-1" /> Submission #{id}
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
            <div className="card"><div className="card-body">Loading...</div></div>
          ) : !row ? (
            <div className="card"><div className="card-body text-muted">No data</div></div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-upload mr-2" /> Upload Signed License
                    </h3>
                  </div>

                  <form className="card-body" onSubmit={submit}>
                    <div className="form-group">
                      <label>License Type</label>
                      <select
                        className="form-control"
                        value={licenseType}
                        onChange={(e) => setLicenseType(e.target.value)}
                      >
                        <option value="STANDARD">Standard (default)</option>
                        <option value="OPEN">Open Access</option>
                        <option value="CUSTOM">Custom / Institutional</option>
                      </select>
                      <small className="text-muted">
                        Saved as fileType: <b>LICENSE_{licenseType}</b>
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Signed License File *</label>
                      <input
                        className="form-control"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <small className="text-muted">PDF recommended</small>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={busy}>
                      <i className="fas fa-cloud-upload-alt mr-1" />
                      {busy ? "Uploading..." : "Upload License"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-outline card-secondary">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-info-circle mr-2" /> Submission
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

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => nav(`/ebook/submissions/${id}/final-proof`)}
                    >
                      <i className="fas fa-file-pdf mr-1" /> Final Proof
                    </button>
                  </div>
                </div>

                <div className="callout callout-warning">
                  <div className="small">
                    If you want license type stored in DB (not only fileType), we should create a table like
                    <b> ebook_licenses</b>.
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