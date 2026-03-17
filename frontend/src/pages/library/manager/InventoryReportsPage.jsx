import React, { useEffect, useState } from "react";
import libraryApi from "../../../api/library.api";
import { ReportShell, StatCard, number } from "./reportShared.js";

export default function InventoryReportsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await libraryApi.getInventoryReport());
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load inventory report");
      }
    })();
  }, []);

  const overview = data?.overview || {};
  return (
    <ReportShell title="Inventory Reports" subtitle="Copies, exceptions, branch distribution, and audit progress." error={error} loading={!data && !error}>
      <div className="row">
        <StatCard title="Total Copies" value={number(overview.total_copies)} color="bg-primary" icon="fas fa-copy" />
        <StatCard title="Available Copies" value={number(overview.available_copies)} color="bg-success" icon="fas fa-check-circle" />
        <StatCard title="Lost Copies" value={number(overview.lost_copies)} color="bg-danger" icon="fas fa-times-circle" />
        <StatCard title="Damaged Copies" value={number(overview.damaged_copies)} color="bg-warning" icon="fas fa-exclamation-triangle" />
      </div>
      <div className="row">
        <div className="col-md-5">
          <div className="card"><div className="card-header"><h3 className="card-title">Status Breakdown</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>{(data?.statusBreakdown || []).map((row) => <tr key={row.status}><td className="text-capitalize">{String(row.status).replaceAll('_', ' ')}</td><td>{number(row.count)}</td></tr>)}</tbody></table></div></div>
        </div>
        <div className="col-md-7">
          <div className="card"><div className="card-header"><h3 className="card-title">Branch Distribution</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Branch</th><th>Copies</th><th>Available</th><th>Exceptions</th></tr></thead><tbody>{(data?.branchDistribution || []).map((row) => <tr key={row.branch_name}><td>{row.branch_name}</td><td>{number(row.copies)}</td><td>{number(row.available)}</td><td>{number(row.exceptions)}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-7">
          <div className="card"><div className="card-header"><h3 className="card-title">Open Inventory Issues</h3></div><div className="card-body table-responsive p-0"><table className="table table-hover"><thead><tr><th>Type</th><th>Title</th><th>Accession</th><th>Created</th><th>Note</th></tr></thead><tbody>{(data?.openIssues || []).length === 0 ? <tr><td colSpan="5" className="text-center p-4">No open damage or lost-item issues.</td></tr> : data.openIssues.map((row) => <tr key={`${row.issue_type}-${row.issue_id}`}><td className="text-capitalize">{row.issue_type}</td><td>{row.title}</td><td>{row.accession_number}</td><td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : ""}</td><td>{row.note}</td></tr>)}</tbody></table></div></div>
        </div>
        <div className="col-md-5">
          <div className="card"><div className="card-header"><h3 className="card-title">Recent Audits</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Audit</th><th>Status</th><th>Checked</th><th>Missing</th></tr></thead><tbody>{(data?.recentAudits || []).length === 0 ? <tr><td colSpan="4" className="text-center p-4">No audits yet.</td></tr> : data.recentAudits.map((row) => <tr key={row.audit_id}><td>{row.audit_name}</td><td className="text-capitalize">{String(row.status).replaceAll('_', ' ')}</td><td>{number(row.checked_items)}</td><td>{number(row.missing_items)}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>
    </ReportShell>
  );
}
