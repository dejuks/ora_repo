import { useEffect, useMemo, useState } from "react";
import Navbar from "../../../landing/components/Navbar";
import { listFinancePending, financeDecision } from "../../../api/ebooks";

export default function FinancePending() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [acting, setActing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ action: "clear", amount: "", currency: "ETB", reference: "", note: "" });

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await listFinancePending();
      setRows(res?.data || []);
    } catch (e) {
      setErr(e?.message || "Failed to load finance queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const badge = (s) => {
    const x = String(s || "").toUpperCase();
    const map = {
      ACCEPTED: "bg-info",
      FINANCE_PENDING: "bg-warning text-dark",
      FINANCE_CLEARED: "bg-success",
    };
    return map[x] || "bg-secondary";
  };

  const open = (row, action) => {
    setSelected(row);
    setForm({ action, amount: row?.amount || "", currency: row?.currency || "ETB", reference: row?.reference || "", note: "" });
    window?.document?.getElementById("financeModalBtn")?.click();
  };

  const submit = async () => {
    if (!selected) return;
    setActing(true);
    try {
      const payload = {
        action: form.action,
        amount: form.amount === "" ? null : Number(form.amount),
        currency: form.currency || null,
        reference: form.reference || null,
        note: form.note || null,
      };
      await financeDecision(selected.ebook_id, payload);
      await load();
      window?.document?.getElementById("financeModalClose")?.click();
    } catch (e) {
      alert(e?.message || "Failed");
    } finally {
      setActing(false);
    }
  };

  const counts = useMemo(() => {
    const c = { PENDING: 0, DECLINED: 0 };
    rows.forEach((r) => {
      const fs = String(r.finance_status || "PENDING").toUpperCase();
      if (fs === "DECLINED") c.DECLINED += 1;
      else c.PENDING += 1;
    });
    return c;
  }, [rows]);

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="mb-1">Finance Clearance</h3>
            <div className="text-muted">Accepted manuscripts waiting for BPC payment / waiver verification.</div>
          </div>
          <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-2" /> Refresh
          </button>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="text-muted">Pending</div>
                <div className="fs-3 fw-bold">{counts.PENDING}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="text-muted">Declined</div>
                <div className="fs-3 fw-bold">{counts.DECLINED}</div>
              </div>
            </div>
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex align-items-center justify-content-between">
            <div className="fw-semibold">Queue</div>
            <small className="text-muted">Only ACCEPTED manuscripts appear here</small>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Finance</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No items
                    </td>
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
                        <span className={`badge ${badge(r.status)}`}>{r.status}</span>
                      </td>
                      <td>
                        <span className={`badge ${String(r.finance_status || "PENDING").toUpperCase() === "DECLINED" ? "bg-danger" : "bg-warning text-dark"}`}>
                          {r.finance_status || "PENDING"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-success" onClick={() => open(r, "clear")}>Clear</button>
                          <button className="btn btn-sm btn-outline-success" onClick={() => open(r, "waive")}>Waive</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => open(r, "decline")}>Decline</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* hidden trigger */}
        <button id="financeModalBtn" className="d-none" data-bs-toggle="modal" data-bs-target="#financeModal">open</button>

        <div className="modal fade" id="financeModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Finance Decision</h5>
                <button id="financeModalClose" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
              </div>
              <div className="modal-body">
                <div className="mb-2"><b>Title:</b> {selected?.title}</div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Action</label>
                    <select className="form-select" value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}>
                      <option value="clear">Clear (payment verified)</option>
                      <option value="waive">Waive (fee waiver approved)</option>
                      <option value="decline">Decline</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Amount</label>
                    <input className="form-control" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="e.g. 1500" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Currency</label>
                    <input className="form-control" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} placeholder="ETB" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Reference</label>
                    <input className="form-control" value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} placeholder="Receipt / invoice no." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Note</label>
                    <input className="form-control" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional note" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submit} disabled={acting}>
                  {acting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
