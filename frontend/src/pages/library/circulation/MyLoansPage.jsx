import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { getCurrentMember } from '../shared/libraryHelpers';

export default function MyLoansPage({ historyMode = false }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const me = await getCurrentMember();
      if (!me) {
        setRows([]);
        return;
      }
      const loans = await libraryApi.list('loans', { limit: 500 });
      setRows((loans.rows || []).filter((row) => row.member_id === me.member_id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => {
    if (historyMode) return rows.filter((row) => !['active', 'overdue'].includes(row.status));
    return rows.filter((row) => ['active', 'overdue'].includes(row.status));
  }, [rows, historyMode]);

  const handleRenew = async (row) => {
    const newDueDate = window.prompt('Enter new due date (YYYY-MM-DD)');
    if (!newDueDate) return;
    try {
      await libraryApi.renewLoan(row.loan_id, { new_due_date: newDueDate });
      setNotice('Loan renewed successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to renew loan');
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>{historyMode ? 'Borrowing History' : 'My Loans'}</h1><p className="text-muted mb-0">{historyMode ? 'Review your completed loan transactions.' : 'Track active loans, due dates, and renewals.'}</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0">
          <table className="table table-striped">
            <thead><tr><th>Copy</th><th>Loan Date</th><th>Due Date</th><th>Status</th><th>Renewals</th>{!historyMode ? <th>Action</th> : null}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={historyMode ? 5 : 6} className="text-center p-4">Loading...</td></tr> : null}
              {!loading && filteredRows.length === 0 ? <tr><td colSpan={historyMode ? 5 : 6} className="text-center p-4">No records found.</td></tr> : null}
              {!loading && filteredRows.map((row) => (
                <tr key={row.loan_id}>
                  <td>{row.copy_id}</td>
                  <td>{row.loan_date ? new Date(row.loan_date).toLocaleDateString() : ''}</td>
                  <td>{row.due_date ? new Date(row.due_date).toLocaleDateString() : ''}</td>
                  <td>{row.status}</td>
                  <td>{row.renewal_count || 0}</td>
                  {!historyMode ? <td><button className="btn btn-sm btn-warning" onClick={() => handleRenew(row)} disabled={!['active', 'overdue'].includes(row.status)}>Renew</button></td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </div></section>
    </MainLayout>
  );
}
