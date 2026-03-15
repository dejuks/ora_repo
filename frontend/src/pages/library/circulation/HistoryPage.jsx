import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { formatCurrency, formatDate, StatusBadge } from '../shared/libraryHelpers';

export default function HistoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const result = await libraryApi.getMyCirculationOverview();
        setData(result);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load borrowing history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const all = data?.loanHistory || [];
    return all.filter((row) => {
      const statusOk = !filters.status || row.status === filters.status;
      const searchValue = `${row.material_title || ''} ${row.accession_number || ''} ${row.branch_name || ''}`.toLowerCase();
      const searchOk = !filters.search || searchValue.includes(filters.search.toLowerCase());
      return statusOk && searchOk;
    });
  }, [data, filters]);

  const fineRows = data?.fines || [];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Borrowing History</h1>
          <p className="text-muted mb-0">Review current and past loans, due dates, returns, and account fines.</p>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading borrowing history...</div> : null}

          <div className="row">
            <div className="col-md-3"><div className="small-box bg-info"><div className="inner"><h3>{data?.summary?.active_loans || 0}</h3><p>Active Loans</p></div><div className="icon"><i className="fas fa-book-reader" /></div></div></div>
            <div className="col-md-3"><div className="small-box bg-danger"><div className="inner"><h3>{data?.summary?.overdue_loans || 0}</h3><p>Overdue Loans</p></div><div className="icon"><i className="fas fa-exclamation-triangle" /></div></div></div>
            <div className="col-md-3"><div className="small-box bg-warning"><div className="inner"><h3>{data?.summary?.holds || 0}</h3><p>Active Holds</p></div><div className="icon"><i className="fas fa-bookmark" /></div></div></div>
            <div className="col-md-3"><div className="small-box bg-success"><div className="inner"><h3>{formatCurrency(data?.summary?.outstanding_balance || 0)}</h3><p>Outstanding Balance</p></div><div className="icon"><i className="fas fa-money-bill-wave" /></div></div></div>
          </div>

          <div className="card card-outline card-primary">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label>Status</label>
                  <select className="form-control" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div className="col-md-5 mb-3">
                  <label>Search</label>
                  <input className="form-control" value={filters.search} onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))} placeholder="Search title, accession, or branch" />
                </div>
                <div className="col-md-4 mb-3 d-flex align-items-end justify-content-end">
                  <button className="btn btn-secondary" onClick={() => setFilters({ status: '', search: '' })}>Reset Filters</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Loan timeline</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Accession</th>
                    <th>Loan Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Branch</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && rows.length === 0 ? <tr><td colSpan="7" className="text-center p-4">No history records found.</td></tr> : null}
                  {rows.map((row) => (
                    <tr key={row.loan_id}>
                      <td>{row.material_title || '-'}</td>
                      <td>{row.accession_number || '-'}</td>
                      <td>{formatDate(row.loan_date, true)}</td>
                      <td>{formatDate(row.due_date, true)}</td>
                      <td>{formatDate(row.return_date, true)}</td>
                      <td>{row.branch_name || '-'}</td>
                      <td><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Fine history</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Reason</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Waived</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && fineRows.length === 0 ? <tr><td colSpan="7" className="text-center p-4">No fines found.</td></tr> : null}
                  {fineRows.map((row) => (
                    <tr key={row.fine_id}>
                      <td>{row.material_title || '-'}</td>
                      <td>{row.reason || '-'}</td>
                      <td>{formatCurrency(row.amount)}</td>
                      <td>{formatCurrency(row.paid_amount)}</td>
                      <td>{formatCurrency(row.waived_amount)}</td>
                      <td>{formatCurrency(row.outstanding_amount)}</td>
                      <td><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
