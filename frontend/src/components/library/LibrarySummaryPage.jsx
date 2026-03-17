import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout.jsx";
import libraryApi from "../../api/library.api";
import { formatCurrency, formatDate, StatusBadge } from "../../pages/library/shared/libraryHelpers.js";

const cards = [
  { key: 'materials', label: 'Catalog Materials', color: 'bg-primary', icon: 'fas fa-book' },
  { key: 'copies', label: 'Physical Copies', color: 'bg-info', icon: 'fas fa-copy' },
  { key: 'activeLoans', label: 'Active Loans', color: 'bg-success', icon: 'fas fa-hand-holding' },
  { key: 'pendingHolds', label: 'Pending Holds', color: 'bg-warning', icon: 'fas fa-bookmark' },
  { key: 'outstandingFineBalance', label: 'Outstanding Fine Balance', color: 'bg-danger', icon: 'fas fa-money-bill-wave', formatter: formatCurrency },
  { key: 'pendingDigitalSubmissions', label: 'Pending Digital Submissions', color: 'bg-secondary', icon: 'fas fa-upload' },
  { key: 'activeDigitalResources', label: 'Active Digital Resources', color: 'bg-dark', icon: 'fas fa-laptop' },
];

export default function LibrarySummaryPage() {
  const [summary, setSummary] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [summaryData, overdueData] = await Promise.all([libraryApi.getReportSummary(), libraryApi.getOverdueLoans()]);
        setSummary(summaryData);
        setOverdue(overdueData || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load library reports');
      }
    })();
  }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Library Reports</h1><p className="text-muted mb-0">Operational overview across physical and digital library services.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row">
          {cards.map((card) => (
            <div className="col-lg-3 col-md-6" key={card.key}>
              <div className={`small-box ${card.color}`}>
                <div className="inner"><h3>{summary ? (card.formatter ? card.formatter(summary[card.key]) : summary[card.key]) : '...'}</h3><p>{card.label}</p></div>
                <div className="icon"><i className={card.icon}></i></div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Overdue Loans</h3></div>
          <div className="card-body table-responsive p-0">
            <table className="table table-striped">
              <thead><tr><th>Member</th><th>Member Code</th><th>Title</th><th>Accession</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {overdue.length === 0 ? <tr><td colSpan="6" className="text-center p-4">No overdue loans found.</td></tr> : overdue.map((row) => (
                  <tr key={row.loan_id}><td>{row.full_name}</td><td>{row.member_code}</td><td>{row.title}</td><td>{row.accession_number}</td><td>{formatDate(row.due_date, true)}</td><td><StatusBadge status={row.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div></section>
    </MainLayout>
  );
}
