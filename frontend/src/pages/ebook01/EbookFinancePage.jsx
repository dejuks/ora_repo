import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const queueLabels = {
  all: "All",
  pending: "Pending Payment",
  waiver_requested: "Waiver Requested",
  payment_uploaded: "Payment Uploaded",
  rejected: "Rejected",
  cleared: "Finance Cleared",
};

const paymentStatusLabels = {
  pending: "pending payment",
  waiver_requested: "waiver requested",
  paid: "payment uploaded",
  partially_paid: "partial payment",
  cleared: "payment verified",
  waived: "waiver approved",
  declined: "payment rejected",
};

const money = (value, currency = "ETB") => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} ${currency}`;
};

function FinanceModal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="close" onClick={onClose}><span>&times;</span></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">{footer || <button className="btn btn-secondary" onClick={onClose}>Close</button>}</div>
        </div>
      </div>
    </div>
  );
}

export default function EbookFinancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dashboard, setDashboard] = useState({ summary: {}, finances: [] });
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({ invoice_number: "", amount_due: "", currency_code: "ETB", review_note: "" });
  const [waiverForm, setWaiverForm] = useState({ waiver_percentage: "100", waiver_reason: "", review_note: "" });
  const [verifyForm, setVerifyForm] = useState({ amount_paid: "", receipt_number: "", payment_reference: "", review_note: "" });
  const [modal, setModal] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getFinanceDashboard();
      setDashboard(result || { summary: {}, finances: [] });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load finance dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const rows = dashboard.finances || [];
    return {
      all: rows.length,
      pending: rows.filter((row) => row.queue_bucket === "pending").length,
      waiver_requested: rows.filter((row) => row.queue_bucket === "waiver_requested").length,
      payment_uploaded: rows.filter((row) => row.queue_bucket === "payment_uploaded").length,
      rejected: rows.filter((row) => row.queue_bucket === "rejected").length,
      cleared: rows.filter((row) => row.queue_bucket === "cleared").length,
    };
  }, [dashboard]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (dashboard.finances || []).filter((row) => {
      const matchesTab = activeTab === "all" ? true : row.queue_bucket === activeTab;
      const hay = [row.title, row.author_name, row.invoice_number, row.payment_status, row.status].join(" ").toLowerCase();
      const matchesSearch = !q || hay.includes(q);
      return matchesTab && matchesSearch;
    });
  }, [dashboard, activeTab, search]);

  const closeModal = () => {
    setModal("");
    setSelected(null);
    setDetail(null);
    setTransactions([]);
    setOpenMenuId("");
  };

  const openDetails = async (row) => {
    setSelected(row);
    setModal("details");
    setDetail(null);
    setTransactions([]);
    try {
      const [invoice, history] = await Promise.all([
        ebookApi.getInvoice(row.submission_id),
        ebookApi.getFinanceTransactions(row.submission_id),
      ]);
      setDetail(invoice || row);
      setTransactions(history?.rows || []);
    } catch (err) {
      setDetail(row);
      setTransactions([]);
      setError(err?.response?.data?.message || "Failed to load finance detail.");
    }
  };

  const openInvoice = (row) => {
    setSelected(row);
    setInvoiceForm({
      invoice_number: row.invoice_number || `INV-${String(row.submission_id || "").replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      amount_due: row.amount_due ?? row.bpc_amount ?? 0,
      currency_code: row.currency_code || "ETB",
      review_note: row.review_note || "",
    });
    setModal("invoice");
  };

  const openWaiver = (row) => {
    setSelected(row);
    setWaiverForm({
      waiver_percentage: row.waiver_percentage || "100",
      waiver_reason: row.waiver_reason || "",
      review_note: row.review_note || "",
    });
    setModal("waiver");
  };

  const openVerify = (row) => {
    setSelected(row);
    setVerifyForm({
      amount_paid: row.amount_paid ?? row.amount_due ?? row.bpc_amount ?? 0,
      receipt_number: row.receipt_number || `REC-${String(row.submission_id || "").replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      payment_reference: row.payment_reference || "",
      review_note: row.review_note || "",
    });
    setModal("verify");
  };

  const doAction = async (fn, successMessage) => {
    if (!selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(successMessage);
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Finance action failed.");
    } finally {
      setSaving(false);
    }
  };

  const paymentLabel = (row) => paymentStatusLabels[String(row.payment_status || "pending").toLowerCase()] || String(row.payment_status || "pending").replaceAll("_", " ");

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">Finance Officer Workspace</h1>
            <p className="text-muted mb-0">Validate BPC, manage waivers, verify payment proof, generate invoice and receipt, then clear for production.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="row mb-4">
        <div className="col-md-2 col-sm-6"><div className="small-box bg-info"><div className="inner"><h3>{counts.all}</h3><p>All</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-warning"><div className="inner"><h3>{counts.pending}</h3><p>Pending</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-secondary"><div className="inner"><h3>{counts.waiver_requested}</h3><p>Waiver</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-primary"><div className="inner"><h3>{counts.payment_uploaded}</h3><p>Uploaded</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-danger"><div className="inner"><h3>{counts.rejected}</h3><p>Rejected</p></div></div></div>
        <div className="col-md-2 col-sm-6"><div className="small-box bg-success"><div className="inner"><h3>{counts.cleared}</h3><p>Cleared</p></div></div></div>
      </div>

      <div className="card card-outline card-danger">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 12 }}>
            <div className="nav nav-pills">
              {Object.entries(queueLabels).map(([key, label]) => (
                <button key={key} type="button" className={`btn btn-sm mr-2 mb-2 ${activeTab === key ? "btn-danger" : "btn-outline-secondary"}`} onClick={() => setActiveTab(key)}>
                  {label} ({counts[key] || 0})
                </button>
              ))}
            </div>
            <div style={{ minWidth: 280 }}>
              <input className="form-control" placeholder="Search title, author, invoice, or status" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="card-body table-responsive p-0">
          {loading ? <div className="p-3">Loading...</div> : (
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Submission</th>
                  <th>Author</th>
                  <th>BPC</th>
                  <th>Waiver</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {!filteredRows.length ? <tr><td colSpan="7" className="text-center text-muted py-4">No finance records found.</td></tr> : filteredRows.map((row) => (
                  <tr key={row.submission_id}>
                    <td>
                      <div className="font-weight-bold">{row.title}</div>
                      <div className="text-muted small">{row.invoice_number || "No invoice yet"}</div>
                    </td>
                    <td>{row.author_name || "—"}</td>
                    <td>{money(row.amount_due ?? row.bpc_amount, row.currency_code)}</td>
                    <td>
                      {row.waiver_requested ? <span>{row.waiver_percentage ? `${row.waiver_percentage}%` : "Requested"}</span> : <span>No</span>}
                    </td>
                    <td>
                      <div>{money(row.amount_paid, row.currency_code)}</div>
                      <div className="text-muted small">proof files: {row.payment_proof_count || 0}</div>
                    </td>
                    <td>
                      <div><StatusBadge value={row.queue_bucket === "payment_uploaded" ? "paid" : row.payment_status || row.queue_bucket} /></div>
                      <div className="text-muted small text-capitalize">{paymentLabel(row)}</div>
                    </td>
                    <td className="text-right" style={{ position: "relative" }}>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpenMenuId(openMenuId === row.submission_id ? "" : row.submission_id)}>
                        <i className="fas fa-ellipsis-v" />
                      </button>
                      {openMenuId === row.submission_id ? (
                        <div className="dropdown-menu dropdown-menu-right show" style={{ position: "absolute", right: 0, left: "auto" }}>
                          <button className="dropdown-item" onClick={() => openDetails(row)}>View detail</button>
                          <button className="dropdown-item" onClick={() => openInvoice(row)}>Issue / Update invoice</button>
                          <button className="dropdown-item" onClick={() => openWaiver(row)}>Review waiver</button>
                          <button className="dropdown-item" onClick={() => openVerify(row)}>Verify payment</button>
                          <button className="dropdown-item text-danger" onClick={() => { setSelected(row); setModal("reject"); }}>Reject payment</button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <FinanceModal
        open={modal === "details"}
        title="Finance detail"
        onClose={closeModal}
      >
        <div className="row">
          <div className="col-md-6">
            <p><strong>Title:</strong> {detail?.title || selected?.title || "—"}</p>
            <p><strong>Author:</strong> {detail?.author_name || selected?.author_name || "—"}</p>
            <p><strong>Submission status:</strong> <StatusBadge value={detail?.status || selected?.status} /></p>
            <p><strong>Invoice:</strong> {detail?.invoice_number || selected?.invoice_number || "—"}</p>
            <p><strong>Receipt:</strong> {detail?.receipt_number || selected?.receipt_number || "—"}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Amount due:</strong> {money(detail?.amount_due ?? selected?.amount_due ?? selected?.bpc_amount, detail?.currency_code || selected?.currency_code)}</p>
            <p><strong>Amount paid:</strong> {money(detail?.amount_paid ?? selected?.amount_paid, detail?.currency_code || selected?.currency_code)}</p>
            <p><strong>Payment status:</strong> <StatusBadge value={detail?.payment_status || selected?.payment_status || "pending"} /></p>
            <p><strong>Waiver reason:</strong> {detail?.waiver_reason || selected?.waiver_reason || "—"}</p>
            <p><strong>Payment reference:</strong> {detail?.payment_reference || selected?.payment_reference || "—"}</p>
          </div>
        </div>
        <hr />
        <h6>Finance history</h6>
        <div className="table-responsive">
          <table className="table table-sm table-bordered">
            <thead><tr><th>Action</th><th>Note</th><th>Date</th></tr></thead>
            <tbody>
              {!transactions.length ? <tr><td colSpan="3" className="text-center text-muted">No finance history yet.</td></tr> : transactions.map((item) => (
                <tr key={item.history_id || `${item.action}-${item.created_at}`}>
                  <td>{item.action}</td>
                  <td>{item.note || "—"}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FinanceModal>

      <FinanceModal
        open={modal === "invoice"}
        title="Issue / update invoice"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            <button className="btn btn-danger" disabled={saving} onClick={() => doAction(() => ebookApi.issueInvoice(selected.submission_id, invoiceForm), "Invoice saved successfully.")}>{saving ? "Saving..." : "Save invoice"}</button>
          </>
        }
      >
        <div className="row">
          <div className="col-md-6 form-group">
            <label>Invoice number</label>
            <input className="form-control" value={invoiceForm.invoice_number} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} />
          </div>
          <div className="col-md-3 form-group">
            <label>Amount due</label>
            <input type="number" className="form-control" value={invoiceForm.amount_due} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount_due: e.target.value })} />
          </div>
          <div className="col-md-3 form-group">
            <label>Currency</label>
            <input className="form-control" value={invoiceForm.currency_code} onChange={(e) => setInvoiceForm({ ...invoiceForm, currency_code: e.target.value })} />
          </div>
          <div className="col-12 form-group mb-0">
            <label>Note</label>
            <textarea className="form-control" rows="3" value={invoiceForm.review_note} onChange={(e) => setInvoiceForm({ ...invoiceForm, review_note: e.target.value })} />
          </div>
        </div>
      </FinanceModal>

      <FinanceModal
        open={modal === "waiver"}
        title="Review waiver request"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            <button className="btn btn-outline-danger" disabled={saving} onClick={() => doAction(() => ebookApi.declineWaiver(selected.submission_id, waiverForm), "Waiver rejected successfully.")}>{saving ? "Saving..." : "Reject waiver"}</button>
            <button className="btn btn-danger" disabled={saving} onClick={() => doAction(() => ebookApi.approveWaiver(selected.submission_id, waiverForm), "Waiver approved and finance cleared.")}>{saving ? "Saving..." : "Approve waiver"}</button>
          </>
        }
      >
        <div className="row">
          <div className="col-md-4 form-group">
            <label>Waiver percentage</label>
            <input type="number" className="form-control" value={waiverForm.waiver_percentage} onChange={(e) => setWaiverForm({ ...waiverForm, waiver_percentage: e.target.value })} />
          </div>
          <div className="col-md-8 form-group">
            <label>Waiver reason</label>
            <input className="form-control" value={waiverForm.waiver_reason} onChange={(e) => setWaiverForm({ ...waiverForm, waiver_reason: e.target.value })} />
          </div>
          <div className="col-12 form-group mb-0">
            <label>Finance note</label>
            <textarea className="form-control" rows="3" value={waiverForm.review_note} onChange={(e) => setWaiverForm({ ...waiverForm, review_note: e.target.value })} />
          </div>
        </div>
      </FinanceModal>

      <FinanceModal
        open={modal === "verify"}
        title="Verify payment and clear finance"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            <button className="btn btn-danger" disabled={saving} onClick={() => doAction(() => ebookApi.verifyPayment(selected.submission_id, verifyForm), "Payment verified and submission moved to finance cleared.")}>{saving ? "Saving..." : "Verify payment"}</button>
          </>
        }
      >
        <div className="row">
          <div className="col-md-4 form-group">
            <label>Amount paid</label>
            <input type="number" className="form-control" value={verifyForm.amount_paid} onChange={(e) => setVerifyForm({ ...verifyForm, amount_paid: e.target.value })} />
          </div>
          <div className="col-md-4 form-group">
            <label>Receipt number</label>
            <input className="form-control" value={verifyForm.receipt_number} onChange={(e) => setVerifyForm({ ...verifyForm, receipt_number: e.target.value })} />
          </div>
          <div className="col-md-4 form-group">
            <label>Payment reference</label>
            <input className="form-control" value={verifyForm.payment_reference} onChange={(e) => setVerifyForm({ ...verifyForm, payment_reference: e.target.value })} />
          </div>
          <div className="col-12 form-group mb-0">
            <label>Finance note</label>
            <textarea className="form-control" rows="3" value={verifyForm.review_note} onChange={(e) => setVerifyForm({ ...verifyForm, review_note: e.target.value })} />
          </div>
        </div>
      </FinanceModal>

      <FinanceModal
        open={modal === "reject"}
        title="Reject payment proof"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            <button className="btn btn-danger" disabled={saving} onClick={() => doAction(() => ebookApi.rejectPayment(selected.submission_id, { review_note: "Payment proof rejected" }), "Payment proof rejected.")}>{saving ? "Saving..." : "Reject payment"}</button>
          </>
        }
      >
        <p className="mb-0">This will mark the payment proof as rejected so the author can upload a corrected proof and the submission stays in finance pending.</p>
      </FinanceModal>
    </MainLayout>
  );
}
