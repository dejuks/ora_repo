import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookFinancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ summary: {}, finances: [] });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getFinanceDashboard();
      setData(result || { summary: {}, finances: [] });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load finance clearance queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">Finance Clearance</h1>
            <p className="text-muted mb-0">Validate BPC, waivers, receipts, and move accepted manuscripts to financial clearance.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row mb-4">
        <div className="col-md-3"><div className="small-box bg-info"><div className="inner"><h3>{data.summary?.total_records || 0}</h3><p>Total records</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-warning"><div className="inner"><h3>{data.summary?.pending_count || 0}</h3><p>Pending</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-secondary"><div className="inner"><h3>{data.summary?.waiver_requested_count || 0}</h3><p>Waiver requested</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-success"><div className="inner"><h3>{data.summary?.cleared_count || 0}</h3><p>Cleared</p></div></div></div>
      </div>

      <div className="card card-outline card-danger">
        <div className="card-header"><h3 className="card-title mb-0">Clearance records</h3></div>
        <div className="card-body table-responsive p-0">
          {loading ? <div className="p-3">Loading...</div> : (
            <table className="table table-hover text-nowrap mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Invoice</th>
                  <th>Amounts</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!data.finances?.length ? <tr><td colSpan="7" className="text-center text-muted py-4">No finance records yet.</td></tr> : data.finances.map((item) => (
                  <tr key={item.finance_id}>
                    <td>{item.title}</td>
                    <td>{item.author_name || "—"}</td>
                    <td>{item.invoice_number || "—"}</td>
                    <td>{item.amount_paid || 0} / {item.amount_due || 0} {item.currency_code || "ETB"}</td>
                    <td><StatusBadge status={item.payment_status} /></td>
                    <td>{item.receipt_number || "—"}</td>
                    <td><Link className="btn btn-sm btn-outline-primary" to={`/ebook/submissions/${item.submission_id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
