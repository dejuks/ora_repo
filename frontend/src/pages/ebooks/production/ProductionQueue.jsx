import { useEffect, useState } from "react";
import Navbar from "../../../landing/components/Navbar";
import { listProductionQueue, uploadFinalOutputs, publishEbook } from "../../../api/ebooks";

export default function ProductionQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState({ pdf: null, epub: null, cover: null });
  const [meta, setMeta] = useState({ isbn: "", doi: "", access_type: "OPEN", embargo_until: "" });
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await listProductionQueue();
      setRows(res?.data || []);
    } catch (e) {
      setErr(e?.message || "Failed to load production queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = (row) => {
    setSelected(row);
    setFiles({ pdf: null, epub: null, cover: null });
    setMeta({ isbn: "", doi: "", access_type: "OPEN", embargo_until: "" });
    window?.document?.getElementById("prodModalBtn")?.click();
  };

  const upload = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await uploadFinalOutputs(selected.ebook_id, files);
      await load();
      alert("Uploaded final files. Now you can publish.");
    } catch (e) {
      alert(e?.message || "Upload failed");
    } finally {
      setActing(false);
    }
  };

  const publish = async () => {
    if (!selected) return;
    setActing(true);
    try {
      const payload = {
        isbn: meta.isbn || null,
        doi: meta.doi || null,
        access_type: meta.access_type,
        embargo_until: meta.access_type === "EMBARGO" && meta.embargo_until ? meta.embargo_until : null,
      };
      await publishEbook(selected.ebook_id, payload);
      await load();
      window?.document?.getElementById("prodModalClose")?.click();
    } catch (e) {
      alert(e?.message || "Publish failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="mb-1">Digital Production</h3>
            <div className="text-muted">Upload final PDF/EPUB, add ISBN/DOI, and publish to the ORA library.</div>
          </div>
          <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-2" /> Refresh
          </button>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex align-items-center justify-content-between">
            <div className="fw-semibold">Queue</div>
            <small className="text-muted">FINANCE_CLEARED → IN_PRODUCTION → PUBLISHED</small>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">No items</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.ebook_id}>
                      <td>
                        <div className="fw-semibold">{r.title}</div>
                        <small className="text-muted">ID: {r.ebook_id}</small>
                      </td>
                      <td>
                        <div>{r.author_name}</div>
                        <small className="text-muted">{r.author_email}</small>
                      </td>
                      <td>
                        <span className={`badge ${r.status === "FINANCE_CLEARED" ? "bg-success" : r.status === "IN_PRODUCTION" ? "bg-warning text-dark" : "bg-secondary"}`}>{r.status}</span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-primary" onClick={() => open(r)}>Open</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* hidden trigger */}
        <button id="prodModalBtn" className="d-none" data-bs-toggle="modal" data-bs-target="#prodModal">open</button>

        <div className="modal fade" id="prodModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Production & Publication</h5>
                <button id="prodModalClose" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
              </div>
              <div className="modal-body">
                <div className="mb-2"><b>Title:</b> {selected?.title}</div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Final PDF</label>
                    <input type="file" className="form-control" accept="application/pdf" onChange={(e) => setFiles((p) => ({ ...p, pdf: e.target.files?.[0] || null }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Final EPUB</label>
                    <input type="file" className="form-control" accept=".epub" onChange={(e) => setFiles((p) => ({ ...p, epub: e.target.files?.[0] || null }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cover (optional)</label>
                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setFiles((p) => ({ ...p, cover: e.target.files?.[0] || null }))} />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-outline-primary" onClick={upload} disabled={acting}>
                    {acting ? "Working..." : "Upload Final Files"}
                  </button>
                  <small className="text-muted align-self-center">Upload first, then publish.</small>
                </div>

                <hr />

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">ISBN</label>
                    <input className="form-control" value={meta.isbn} onChange={(e) => setMeta((p) => ({ ...p, isbn: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">DOI</label>
                    <input className="form-control" value={meta.doi} onChange={(e) => setMeta((p) => ({ ...p, doi: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Access Type</label>
                    <select className="form-select" value={meta.access_type} onChange={(e) => setMeta((p) => ({ ...p, access_type: e.target.value }))}>
                      <option value="OPEN">Open Access</option>
                      <option value="RESTRICTED">Restricted</option>
                      <option value="EMBARGO">Embargo</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Embargo Until</label>
                    <input type="date" className="form-control" value={meta.embargo_until} onChange={(e) => setMeta((p) => ({ ...p, embargo_until: e.target.value }))} disabled={meta.access_type !== "EMBARGO"} />
                    {meta.access_type === "EMBARGO" && <small className="text-muted">Before this date downloads are blocked.</small>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" className="btn btn-success" onClick={publish} disabled={acting}>
                  {acting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
