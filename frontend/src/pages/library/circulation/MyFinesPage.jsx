import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { formatCurrency, getCurrentMember, outstandingFine } from '../shared/libraryHelpers';

export default function MyFinesPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const me = await getCurrentMember();
      if (!me) {
        setRows([]);
        return;
      }
      const fines = await libraryApi.list('fines', { limit: 500 });
      setRows((fines.rows || []).filter((row) => row.member_id === me.member_id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your fines');
    }
  };

  useEffect(() => { load(); }, []);

  const payFine = async (row) => {
    const amount = window.prompt(`Enter payment amount (outstanding ${outstandingFine(row)})`);
    if (!amount) return;
    try {
      await libraryApi.payFine(row.fine_id, { amount: Number(amount), payment_method: 'manual' });
      setNotice('Fine payment recorded successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Fines</h1><p className="text-muted mb-0">Review outstanding balances and payment status.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0"><table className="table table-striped">
          <thead><tr><th>Reason</th><th>Total</th><th>Paid</th><th>Waived</th><th>Outstanding</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{rows.length===0?<tr><td colSpan="7" className="text-center p-4">No fines found.</td></tr>:rows.map((row)=><tr key={row.fine_id}><td>{row.reason}</td><td>{formatCurrency(row.amount)}</td><td>{formatCurrency(row.paid_amount)}</td><td>{formatCurrency(row.waived_amount)}</td><td>{formatCurrency(outstandingFine(row))}</td><td>{row.status}</td><td><button className="btn btn-sm btn-success" disabled={outstandingFine(row) <= 0} onClick={() => payFine(row)}>Pay</button></td></tr>)}</tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
