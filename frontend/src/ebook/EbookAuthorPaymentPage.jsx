import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookAuthorPaymentPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: "", payment_reference: "", currency_code: "ETB", note: "" });
  const [waiverForm, setWaiverForm] = useState({ waiver_reason: "", waiver_percentage: "" });
  const [paymentFile, setPaymentFile] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getWorkflow(id);
      setData(result);
      const sub = result?.submission || {};
      setPaymentForm((prev) => ({
        ...prev,
        amount_paid: sub.amount_paid || sub.bpc_amount || "",
        payment_reference: sub.payment_reference || "",
        currency_code: sub.currency_code || "ETB",
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!paymentFile) {
      setError("Please attach your payment proof file.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await ebookApi.submitPaymentProof(id, { ...paymentForm, file: paymentFile });
      setNotice("Payment proof submitted successfully.");
      setPaymentFile(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit payment proof.");
    } finally {
      setSaving(false);
    }
  };

  const submitWaiver = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await ebookApi.requestWaiver(id, waiverForm);
      setNotice("Waiver request submitted successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit waiver request.");
    } finally {
      setSaving(false);
    }
  };

  const sub = data?.submission || {};

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Author Payment & BPC</h1>
          <p className="text-muted mb-0">Upload payment proof or request a fee waiver for your submission.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary mr-2" to="/ebook/my-payments">My submissions</Link>
          <Link className="btn btn-outline-secondary" to={`/ebook/submissions/${id}`}>Open submission</Link>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? <div className="card"><div className="card-body">Loading payment details…</div></div> : (
        <div className="row">
          <div className="col-lg-5 mb-4">
            <div className="card card-primary card-outline h-100">
              <div className="card-header"><h3 className="card-title mb-0">Submission finance status</h3></div>
              <div className="card-body">
                <h5>{sub.title}</h5>
                <p className="mb-2"><strong>Current workflow:</strong> <StatusBadge value={sub.status} /></p>
                <p className="mb-2"><strong>Requires BPC:</strong> {sub.requires_bpc ? "Yes" : "No"}</p>
                <p className="mb-2"><strong>Amount due:</strong> {sub.bpc_amount || sub.amount_due || 0} ETB</p>
                <p className="mb-2"><strong>Amount paid:</strong> {sub.amount_paid || 0} ETB</p>
                <p className="mb-2"><strong>Payment status:</strong> <StatusBadge value={sub.payment_status || "pending"} /></p>
                <p className="mb-0"><strong>Invoice / receipt:</strong> {sub.invoice_number || "—"} / {sub.receipt_number || "—"}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card card-success card-outline mb-4">
              <div className="card-header"><h3 className="card-title mb-0">Submit payment proof</h3></div>
              <form onSubmit={submitPayment}>
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Amount paid</label>
                      <input type="number" className="form-control" value={paymentForm.amount_paid} onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })} />
                    </div>
                    <div className="form-group col-md-6">
                      <label>Currency</label>
                      <input className="form-control" value={paymentForm.currency_code} onChange={(e) => setPaymentForm({ ...paymentForm, currency_code: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Payment reference</label>
                    <input className="form-control" value={paymentForm.payment_reference} onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Note</label>
                    <textarea className="form-control" rows="3" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} />
                  </div>
                  <div className="form-group mb-0">
                    <label>Payment proof file</label>
                    <input type="file" className="form-control" onChange={(e) => setPaymentFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="card-footer">
                  <button className="btn btn-success" disabled={saving}>{saving ? "Submitting…" : "Submit payment proof"}</button>
                </div>
              </form>
            </div>

            <div className="card card-warning card-outline">
              <div className="card-header"><h3 className="card-title mb-0">Request BPC waiver</h3></div>
              <form onSubmit={submitWaiver}>
                <div className="card-body">
                  <div className="form-group">
                    <label>Waiver percentage</label>
                    <input type="number" className="form-control" value={waiverForm.waiver_percentage} onChange={(e) => setWaiverForm({ ...waiverForm, waiver_percentage: e.target.value })} />
                  </div>
                  <div className="form-group mb-0">
                    <label>Reason for waiver</label>
                    <textarea className="form-control" rows="4" value={waiverForm.waiver_reason} onChange={(e) => setWaiverForm({ ...waiverForm, waiver_reason: e.target.value })} required />
                  </div>
                </div>
                <div className="card-footer">
                  <button className="btn btn-warning" disabled={saving}>{saving ? "Submitting…" : "Request waiver"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
