import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api.js";
import StatusBadge from "./components/StatusBadge.jsx";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready to Start" },
  { key: "in_production", label: "In Production" },
  { key: "proof_sent", label: "Proof Sent" },
  { key: "proof_approved", label: "Proof Approved" },
  { key: "published", label: "Published" },
];

const defaultProductionForm = {
  pdf_ready: false,
  epub_ready: false,
  proof_sent_to_author: false,
  author_proof_approved: false,
  isbn: "",
  doi: "",
  repository_path: "",
  quality_note: "",
};

const defaultPublishForm = {
  slug: "",
  access_level: "open_access",
  embargo_until: "",
  license_name: "All rights reserved",
  landing_page_title: "",
  cover_image_path: "",
  is_public: true,
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function queueLabel(item) {
  switch (item?.queue_bucket) {
    case "ready":
      return "Ready to start";
    case "in_production":
      return "In production";
    case "proof_sent":
      return "Proof sent";
    case "proof_approved":
      return "Proof approved";
    case "published":
      return "Published";
    default:
      return item?.queue_bucket || "—";
  }
}

export default function EbookProductionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState({ summary: {}, production: [] });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingRole, setUploadingRole] = useState("");
  const [productionForm, setProductionForm] = useState(defaultProductionForm);
  const [publishForm, setPublishForm] = useState(defaultPublishForm);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getProductionDashboard();
      setData(result || { summary: {}, production: [] });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load production dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const items = data.production || [];
    return {
      all: items.length,
      ready: items.filter((item) => item.queue_bucket === "ready").length,
      in_production: items.filter((item) => item.queue_bucket === "in_production").length,
      proof_sent: items.filter((item) => item.queue_bucket === "proof_sent").length,
      proof_approved: items.filter((item) => item.queue_bucket === "proof_approved").length,
      published: items.filter((item) => item.queue_bucket === "published").length,
    };
  }, [data.production]);

  const filteredRows = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    return (data.production || []).filter((item) => {
      if (filter !== "all" && item.queue_bucket !== filter) return false;
      if (!q) return true;
      return [
        item.title,
        item.subtitle,
        item.author_name,
        item.author_email,
        item.submission_status,
        item.queue_bucket,
        item.isbn,
        item.doi,
        item.slug,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [data.production, filter, search]);

  const openDetail = async (item) => {
    setSelected(item);
    setDetail(null);
    setDetailLoading(true);
    setNotice("");
    try {
      const result = await ebookApi.getWorkflow(item.submission_id);
      setDetail(result);
      const production = result?.submission || {};
      setProductionForm({
        pdf_ready: Boolean(production.pdf_ready),
        epub_ready: Boolean(production.epub_ready),
        proof_sent_to_author: Boolean(production.proof_sent_to_author),
        author_proof_approved: Boolean(production.author_proof_approved),
        isbn: production.isbn || "",
        doi: production.doi || "",
        repository_path: production.repository_path || "",
        quality_note: "",
      });
      setPublishForm({
        slug: production.slug || item.slug || "",
        access_level: production.access_level || item.access_level || "open_access",
        embargo_until: production.embargo_until ? String(production.embargo_until).slice(0, 10) : "",
        license_name: production.license_name || item.license_name || "All rights reserved",
        landing_page_title: production.landing_page_title || item.title || "",
        cover_image_path: production.cover_image_path || item.cover_image_path || "",
        is_public: typeof production.is_public === "boolean" ? production.is_public : (typeof item.is_public === "boolean" ? item.is_public : true),
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load submission detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!selected?.submission_id) return;
    await openDetail(selected);
    await load();
  };

  const handleProductionSave = async () => {
    if (!selected?.submission_id) return;
    setBusy(true);
    setError("");
    try {
      await ebookApi.upsertProduction(selected.submission_id, productionForm);
      setNotice("Production record updated.");
      await refreshDetail();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save production record.");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!selected?.submission_id) return;
    setBusy(true);
    setError("");
    try {
      await ebookApi.publishSubmission(selected.submission_id, publishForm);
      setNotice("Publication released successfully.");
      await refreshDetail();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish ebook.");
    } finally {
      setBusy(false);
    }
  };

  const handleFileUpload = async (event, role) => {
    const file = event.target.files?.[0];
    if (!file || !selected?.submission_id) return;
    setUploadingRole(role);
    setError("");
    try {
      await ebookApi.uploadFile(selected.submission_id, file, role);
      setNotice(`${role.toUpperCase()} file uploaded.`);
      if (role === "pdf") setProductionForm((prev) => ({ ...prev, pdf_ready: true }));
      if (role === "epub") setProductionForm((prev) => ({ ...prev, epub_ready: true }));
      await refreshDetail();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to upload ${role} file.`);
    } finally {
      setUploadingRole("");
      event.target.value = "";
    }
  };

  const files = detail?.files || [];
  const reviews = detail?.reviews || [];
  const history = detail?.history || [];

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 12 }}>
          <div>
            <h1 className="mb-1">Digital Content Manager Workspace</h1>
            <p className="text-muted mb-0">Manage final files, proofing, identifiers, repository path, and publication release.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="row mb-4">
        <div className="col-md-2 col-sm-6"><div className="small-box bg-info"><div className="inner"><h3>{data.summary?.total_items || 0}</h3><p>Total queue</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-secondary"><div className="inner"><h3>{data.summary?.ready_count || 0}</h3><p>Ready to start</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-primary"><div className="inner"><h3>{data.summary?.in_production_count || 0}</h3><p>In production</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-warning"><div className="inner"><h3>{data.summary?.proof_sent_count || 0}</h3><p>Proof sent</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-success"><div className="inner"><h3>{data.summary?.proof_approved_count || 0}</h3><p>Proof approved</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-dark"><div className="inner"><h3>{data.summary?.published_count || 0}</h3><p>Published</p></div></div></div>
      </div>

      <div className="card card-outline card-success mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 12 }}>
            <div className="btn-group flex-wrap">
              {FILTERS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`btn ${filter === tab.key ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label} ({counts[tab.key] || 0})
                </button>
              ))}
            </div>
            <div style={{ minWidth: 280, maxWidth: 360, width: "100%" }}>
              <input
                className="form-control"
                placeholder="Search title, author, status, ISBN, DOI, slug"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-success">
        <div className="card-header"><h3 className="card-title mb-0">Production queue</h3></div>
        <div className="card-body table-responsive p-0">
          {loading ? <div className="p-3">Loading...</div> : (
            <table className="table table-hover mb-0 text-nowrap">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Submission Status</th>
                  <th>Queue</th>
                  <th>Formats</th>
                  <th>Identifiers</th>
                  <th>Publication</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {!filteredRows.length ? <tr><td colSpan="8" className="text-center text-muted py-4">No submissions found for this production filter.</td></tr> : filteredRows.map((item) => (
                  <tr key={item.submission_id}>
                    <td>
                      <div className="font-weight-bold">{item.title}</div>
                      <small className="text-muted">Updated {formatDate(item.submission_updated_at)}</small>
                    </td>
                    <td>{item.author_name || "—"}</td>
                    <td><StatusBadge status={item.submission_status} /></td>
                    <td><span className="badge badge-light border">{queueLabel(item)}</span></td>
                    <td>
                      {item.pdf_ready ? <span className="badge badge-success mr-1">PDF</span> : null}
                      {item.epub_ready ? <span className="badge badge-success mr-1">EPUB</span> : null}
                      {!item.pdf_ready && !item.epub_ready ? <span className="text-muted">Pending</span> : null}
                    </td>
                    <td>
                      <div>{item.isbn || "No ISBN"}</div>
                      <small className="text-muted">{item.doi || "No DOI"}</small>
                    </td>
                    <td>
                      {item.slug ? <><div>{item.slug}</div><small className="text-muted">{item.access_level || "—"}</small></> : <span className="text-muted">Not published</span>}
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-toggle="dropdown" type="button">
                          Actions
                        </button>
                        <div className="dropdown-menu dropdown-menu-right">
                          <button className="dropdown-item" type="button" onClick={() => openDetail(item)} data-toggle="modal" data-target="#productionActionModal">Open workspace</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="modal fade" id="productionActionModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Production Workspace {selected?.title ? `— ${selected.title}` : ""}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {detailLoading ? <div>Loading...</div> : !detail ? <div className="text-muted">Select a production item to manage.</div> : (
                <div className="row">
                  <div className="col-lg-5">
                    <div className="card card-outline card-primary mb-3">
                      <div className="card-header"><h3 className="card-title mb-0">Submission summary</h3></div>
                      <div className="card-body">
                        <div className="mb-2"><strong>Title:</strong> {detail.submission?.title}</div>
                        <div className="mb-2"><strong>Author:</strong> {detail.submission?.author_name || "—"}</div>
                        <div className="mb-2"><strong>Status:</strong> <StatusBadge status={detail.submission?.status} /></div>
                        <div className="mb-2"><strong>Queue:</strong> {queueLabel(selected)}</div>
                        <div className="mb-2"><strong>Keywords:</strong> {(detail.submission?.keywords || []).join(", ") || "—"}</div>
                        <div className="mb-0"><strong>Abstract:</strong><div className="text-muted">{detail.submission?.abstract || "No abstract provided."}</div></div>
                      </div>
                    </div>

                    <div className="card card-outline card-secondary mb-3">
                      <div className="card-header"><h3 className="card-title mb-0">File checklist</h3></div>
                      <div className="card-body p-0 table-responsive">
                        <table className="table table-sm mb-0">
                          <thead><tr><th>Role</th><th>File</th><th>Uploaded</th></tr></thead>
                          <tbody>
                            {!files.length ? <tr><td colSpan="3" className="text-center text-muted py-3">No files uploaded yet.</td></tr> : files.map((file) => (
                              <tr key={file.file_id}>
                                <td>{file.file_role}</td>
                                <td>{file.original_name}</td>
                                <td>{formatDate(file.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="card card-outline card-info mb-0">
                      <div className="card-header"><h3 className="card-title mb-0">Reviewer feedback snapshot</h3></div>
                      <div className="card-body p-0 table-responsive">
                        <table className="table table-sm mb-0">
                          <thead><tr><th>Reviewer</th><th>Recommendation</th><th>Author comment</th></tr></thead>
                          <tbody>
                            {!reviews.length ? <tr><td colSpan="3" className="text-center text-muted py-3">No submitted reviews.</td></tr> : reviews.map((review) => (
                              <tr key={review.review_id}>
                                <td>{review.reviewer_name || "—"}</td>
                                <td>{review.recommendation || "—"}</td>
                                <td>{review.comments_for_author || review.comments || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-7">
                    <div className="card card-outline card-success mb-3">
                      <div className="card-header"><h3 className="card-title mb-0">Production checklist</h3></div>
                      <div className="card-body">
                        <div className="form-row">
                          <div className="form-group col-md-6">
                            <div className="form-check mt-2">
                              <input className="form-check-input" type="checkbox" id="pdfReady" checked={productionForm.pdf_ready} onChange={(e) => setProductionForm((prev) => ({ ...prev, pdf_ready: e.target.checked }))} />
                              <label className="form-check-label" htmlFor="pdfReady">PDF ready</label>
                            </div>
                          </div>
                          <div className="form-group col-md-6">
                            <div className="form-check mt-2">
                              <input className="form-check-input" type="checkbox" id="epubReady" checked={productionForm.epub_ready} onChange={(e) => setProductionForm((prev) => ({ ...prev, epub_ready: e.target.checked }))} />
                              <label className="form-check-label" htmlFor="epubReady">EPUB ready</label>
                            </div>
                          </div>
                          <div className="form-group col-md-6">
                            <div className="form-check mt-2">
                              <input className="form-check-input" type="checkbox" id="proofSent" checked={productionForm.proof_sent_to_author} onChange={(e) => setProductionForm((prev) => ({ ...prev, proof_sent_to_author: e.target.checked }))} />
                              <label className="form-check-label" htmlFor="proofSent">Proof sent to author</label>
                            </div>
                          </div>
                          <div className="form-group col-md-6">
                            <div className="form-check mt-2">
                              <input className="form-check-input" type="checkbox" id="proofApproved" checked={productionForm.author_proof_approved} onChange={(e) => setProductionForm((prev) => ({ ...prev, author_proof_approved: e.target.checked }))} />
                              <label className="form-check-label" htmlFor="proofApproved">Author proof approved</label>
                            </div>
                          </div>
                          <div className="form-group col-md-6">
                            <label>ISBN</label>
                            <input className="form-control" value={productionForm.isbn} onChange={(e) => setProductionForm((prev) => ({ ...prev, isbn: e.target.value }))} placeholder="ISBN" />
                          </div>
                          <div className="form-group col-md-6">
                            <label>DOI</label>
                            <input className="form-control" value={productionForm.doi} onChange={(e) => setProductionForm((prev) => ({ ...prev, doi: e.target.value }))} placeholder="DOI" />
                          </div>
                          <div className="form-group col-md-12">
                            <label>Repository path</label>
                            <input className="form-control" value={productionForm.repository_path} onChange={(e) => setProductionForm((prev) => ({ ...prev, repository_path: e.target.value }))} placeholder="/repository/ebooks/slug or storage path" />
                          </div>
                          <div className="form-group col-md-12 mb-0">
                            <label>Production note</label>
                            <textarea className="form-control" rows="3" value={productionForm.quality_note} onChange={(e) => setProductionForm((prev) => ({ ...prev, quality_note: e.target.value }))} placeholder="Quality checks, formatting notes, cover update notes, proof details" />
                          </div>
                        </div>
                        <div className="mt-3 d-flex justify-content-end">
                          <button className="btn btn-success" type="button" disabled={busy} onClick={handleProductionSave}>{busy ? "Saving..." : "Save production"}</button>
                        </div>
                      </div>
                    </div>

                    <div className="card card-outline card-warning mb-3">
                      <div className="card-header"><h3 className="card-title mb-0">Upload production files</h3></div>
                      <div className="card-body">
                        <div className="form-row">
                          {["cover", "pdf", "epub", "proof"].map((role) => (
                            <div className="form-group col-md-6" key={role}>
                              <label className="text-capitalize">{role} file</label>
                              <input type="file" className="form-control" onChange={(e) => handleFileUpload(e, role)} disabled={uploadingRole === role} />
                              <small className="text-muted">{uploadingRole === role ? `Uploading ${role}...` : `Upload latest ${role} asset`}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="card card-outline card-dark mb-0">
                      <div className="card-header"><h3 className="card-title mb-0">Publication release</h3></div>
                      <div className="card-body">
                        <div className="form-row">
                          <div className="form-group col-md-6">
                            <label>Slug</label>
                            <input className="form-control" value={publishForm.slug} onChange={(e) => setPublishForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="ebook-slug" />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Access level</label>
                            <select className="form-control" value={publishForm.access_level} onChange={(e) => setPublishForm((prev) => ({ ...prev, access_level: e.target.value }))}>
                              <option value="open_access">Open access</option>
                              <option value="institution_only">Institution only</option>
                              <option value="embargoed">Embargoed</option>
                              <option value="restricted">Restricted</option>
                            </select>
                          </div>
                          <div className="form-group col-md-6">
                            <label>Embargo until</label>
                            <input type="date" className="form-control" value={publishForm.embargo_until} onChange={(e) => setPublishForm((prev) => ({ ...prev, embargo_until: e.target.value }))} />
                          </div>
                          <div className="form-group col-md-6">
                            <label>License name</label>
                            <input className="form-control" value={publishForm.license_name} onChange={(e) => setPublishForm((prev) => ({ ...prev, license_name: e.target.value }))} />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Landing page title</label>
                            <input className="form-control" value={publishForm.landing_page_title} onChange={(e) => setPublishForm((prev) => ({ ...prev, landing_page_title: e.target.value }))} />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Cover image path</label>
                            <input className="form-control" value={publishForm.cover_image_path} onChange={(e) => setPublishForm((prev) => ({ ...prev, cover_image_path: e.target.value }))} placeholder="uploads/ebook/.../cover.jpg" />
                          </div>
                          <div className="form-group col-md-12 mb-0">
                            <div className="form-check mt-2">
                              <input className="form-check-input" type="checkbox" id="isPublic" checked={publishForm.is_public} onChange={(e) => setPublishForm((prev) => ({ ...prev, is_public: e.target.checked }))} />
                              <label className="form-check-label" htmlFor="isPublic">Make publication public</label>
                            </div>
                          </div>
                        </div>
                        <div className="alert alert-light border mt-3 mb-3">
                          Publish only after final files, identifiers, and proof approval are complete.
                        </div>
                        <div className="d-flex justify-content-end">
                          <button className="btn btn-dark" type="button" disabled={busy} onClick={handlePublish}>{busy ? "Publishing..." : "Publish ebook"}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <div className="text-muted small">History entries: {history.length}</div>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
