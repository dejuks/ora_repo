import React, { useEffect, useState } from "react";
import libraryApi from "../../../api/library.api";
import { ReportShell, StatCard, number } from "./reportShared.js";

export default function LoanReportsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await libraryApi.getLoansReport());
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load loans report");
      }
    })();
  }, []);

  const overview = data?.overview || {};
  return (
    <ReportShell title="Loan Reports" subtitle="Borrowing, returns, overdue pressure, and due-soon activity." error={error} loading={!data && !error}>
      <div className="row">
        <StatCard title="Active Loans" value={number(overview.active_loans)} color="bg-primary" icon="fas fa-book-reader" />
        <StatCard title="Overdue Loans" value={number(overview.overdue_loans)} color="bg-danger" icon="fas fa-clock" />
        <StatCard title="Returns Last 30 Days" value={number(overview.returns_last_30_days)} color="bg-success" icon="fas fa-undo" />
        <StatCard title="Avg Loan Days" value={number(overview.avg_loan_days)} color="bg-info" icon="fas fa-hourglass-half" />
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card"><div className="card-header"><h3 className="card-title">Due Soon / Overdue</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Member</th><th>Title</th><th>Due</th><th>Status</th></tr></thead><tbody>{(data?.dueSoon || []).length === 0 ? <tr><td colSpan="4" className="text-center p-4">No due-soon loans.</td></tr> : data.dueSoon.map((row) => <tr key={row.loan_id}><td>{row.full_name}</td><td>{row.title}</td><td>{row.due_date ? new Date(row.due_date).toLocaleDateString() : ""}</td><td className="text-capitalize">{String(row.status).replaceAll('_', ' ')}</td></tr>)}</tbody></table></div></div>
        </div>
        <div className="col-md-6">
          <div className="card"><div className="card-header"><h3 className="card-title">Monthly Loan Trend</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Month</th><th>Loans</th><th>Returns</th></tr></thead><tbody>{(data?.monthlyTrend || []).map((row) => <tr key={row.month}><td>{row.month}</td><td>{number(row.loan_count)}</td><td>{number(row.return_count)}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-7">
          <div className="card"><div className="card-header"><h3 className="card-title">Recent Loan Activity</h3></div><div className="card-body table-responsive p-0"><table className="table table-hover"><thead><tr><th>Member</th><th>Title</th><th>Loan Date</th><th>Due Date</th><th>Status</th></tr></thead><tbody>{(data?.recentLoans || []).map((row) => <tr key={row.loan_id}><td>{row.full_name}</td><td>{row.title}</td><td>{row.loan_date ? new Date(row.loan_date).toLocaleDateString() : ""}</td><td>{row.due_date ? new Date(row.due_date).toLocaleDateString() : ""}</td><td className="text-capitalize">{String(row.status).replaceAll('_', ' ')}</td></tr>)}</tbody></table></div></div>
        </div>
        <div className="col-md-5">
          <div className="card"><div className="card-header"><h3 className="card-title">Most Borrowed Titles</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped"><thead><tr><th>Title</th><th>Borrows</th><th>Overdues</th></tr></thead><tbody>{(data?.topBorrowed || []).length === 0 ? <tr><td colSpan="3" className="text-center p-4">No borrowing history yet.</td></tr> : data.topBorrowed.map((row, idx) => <tr key={`${row.title}-${idx}`}><td>{row.title}</td><td>{number(row.borrow_count)}</td><td>{number(row.overdue_count)}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>
    </ReportShell>
  );
}
