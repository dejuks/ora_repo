import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';
import { formatDate, StatusBadge } from '../shared/libraryHelpers.js';

export default function MyLoansPage({ historyMode = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const overview = await libraryApi.getMyCirculationOverview();
      setData(overview);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your loans');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const rows = useMemo(() => {
    const source = historyMode ? data?.loanHistory || [] : data?.activeLoans || [];
    return [...source].sort((a, b) => new Date(b.loan_date || 0) - new Date(a.loan_date || 0));
  }, [data, historyMode]);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>{historyMode ? 'Borrowing History' : 'My Loans'}</h1><p className="text-muted mb-0">{historyMode ? 'Completed and closed borrowing history.' : 'Track active loans, due dates, and renewal status.'}</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0"><table className="table table-striped mb-0"><thead><tr><th>Material</th><th>Accession</th><th>Branch</th><th>Loan Date</th><th>Due Date</th><th>Status</th><th>Renewals</th>{!historyMode ? <th>Action</th> : null}</tr></thead><tbody>
          {loading ? <tr><td colSpan={historyMode ? 7 : 8} className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan={historyMode ? 7 : 8} className="text-center p-4">No records found.</td></tr> : null}
          {!loading && rows.map((row)=> <tr key={row.loan_id}><td>{row.material_title || '-'}</td><td>{row.accession_number || row.copy_id}</td><td>{row.branch_name || '-'}</td><td>{formatDate(row.loan_date, true)}</td><td>{formatDate(row.due_date, true)}</td><td><StatusBadge status={row.status} /></td><td>{row.renewal_count || 0}</td>{!historyMode ? <td><button className="btn btn-sm btn-warning" disabled={!['active','overdue'].includes(row.status)} onClick={async()=>{ const newDueDate = window.prompt('Enter new due date (YYYY-MM-DD)'); if(!newDueDate) return; try { await libraryApi.renewLoan(row.loan_id,{ new_due_date:newDueDate }); setNotice('Loan renewed successfully.'); await loadData(); } catch(err){ setError(err?.response?.data?.message || 'Failed to renew loan'); } }}>Renew</button></td> : null}</tr>)}
        </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
