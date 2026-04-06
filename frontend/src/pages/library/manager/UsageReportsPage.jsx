import React, { useEffect, useState } from "react";
import libraryApi from "../../../api/library.api";
import { ReportShell, StatCard, number, currency } from "./reportShared.js";

export default function UsageReportsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await libraryApi.getUsageReport());
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load usage report");
      }
    })();
  }, []);

  const overview = data?.overview || {};
  return (
    <ReportShell title="Usage Reports" subtitle="Library-wide service usage, digital activity, and branch load." error={error} loading={!data && !error}>
      <div className="row">
        <StatCard title="Active Materials" value={number(overview.active_materials)} color="bg-primary" icon="fas fa-book" />
        <StatCard title="Active Members" value={number(overview.active_members)} color="bg-success" icon="fas fa-users" />
        <StatCard title="Loans Last 30 Days" value={number(overview.loans_last_30_days)} color="bg-info" icon="fas fa-book-reader" />
        <StatCard title="Digital Events Last 30 Days" value={number(overview.digital_events_last_30_days)} color="bg-warning" icon="fas fa-laptop" />
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card"><div className="card-header"><h3 className="card-title">Branch Activity</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Branch</th><th>Copies</th><th>Active Loans</th></tr></thead><tbody>{(data?.branches || []).map((row) => <tr key={row.branch_name}><td>{row.branch_name}</td><td>{number(row.copy_count)}</td><td>{number(row.active_loans)}</td></tr>)}</tbody></table></div></div>
        </div>
        <div className="col-md-6">
          <div className="card"><div className="card-header"><h3 className="card-title">Monthly Activity</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Month</th><th>Loans</th><th>Digital Events</th></tr></thead><tbody>{(data?.monthlyActivity || []).map((row) => <tr key={row.month}><td>{row.month}</td><td>{number(row.loan_count)}</td><td>{number(row.digital_count)}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-7">
          <div className="card"><div className="card-header"><h3 className="card-title">Top Digital Resources</h3></div><div className="card-body table-responsive p-0"><table className="table table-hover"><thead><tr><th>Title</th><th>Usage</th><th>Views</th><th>Downloads</th></tr></thead><tbody>{(data?.topDigitalResources || []).length === 0 ? <tr><td colSpan="4" className="text-center p-4">No digital usage data yet.</td></tr> : data.topDigitalResources.map((row, idx) => <tr key={`${row.title}-${idx}`}><td>{row.title || "Untitled"}</td><td>{number(row.usage_count)}</td><td>{number(row.view_count)}</td><td>{number(row.download_count)}</td></tr>)}</tbody></table></div></div>
        </div>
        <div className="col-md-5">
          <div className="card"><div className="card-header"><h3 className="card-title">Pipeline Snapshot</h3></div><div className="card-body"><p><strong>Pending Digital Submissions:</strong> {number(overview.pending_digital_submissions)}</p><p><strong>Outstanding Fine Balance:</strong> {currency(overview.outstanding_fine_balance)}</p><hr />{(data?.acquisitionPipeline || []).map((row) => <div key={row.status} className="d-flex justify-content-between border-bottom py-2"><span className="text-capitalize">{String(row.status).replaceAll('_', ' ')}</span><strong>{number(row.count)}</strong></div>)}</div></div>
        </div>
      </div>
    </ReportShell>
  );
}
