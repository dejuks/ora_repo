import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';
import { formatCurrency, formatDate, StatusBadge } from '../shared/libraryHelpers.js';

export default function AccountPage() {
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const overview = await libraryApi.getMyCirculationOverview();
        setMember(overview?.member || null);
        const summary = overview?.summary || {};
        setStats({
          activeLoans: summary.active_loans || 0,
          activeHolds: summary.active_holds || 0,
          outstandingFines: summary.outstanding_balance || 0,
          totalHistory: summary.loan_history_count || 0,
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load member account');
      }
    })();
  }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Library Account</h1><p className="text-muted mb-0">Membership profile, circulation eligibility, and self-service summary.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!member ? <div className="alert alert-info">No linked library member account was found for the signed-in user.</div> : <div className="row"><div className="col-lg-5"><div className="card card-primary card-outline"><div className="card-header"><h3 className="card-title">Member profile</h3></div><div className="card-body"><dl className="row mb-0"><dt className="col-sm-5">Member code</dt><dd className="col-sm-7">{member.member_code || '-'}</dd><dt className="col-sm-5">Status</dt><dd className="col-sm-7"><StatusBadge status={member.status} /></dd><dt className="col-sm-5">Member type</dt><dd className="col-sm-7">{member.member_type_name || '-'}</dd><dt className="col-sm-5">Branch</dt><dd className="col-sm-7">{member.branch_name || '-'}</dd><dt className="col-sm-5">Department</dt><dd className="col-sm-7">{member.department || '-'}</dd><dt className="col-sm-5">Program</dt><dd className="col-sm-7">{member.program || '-'}</dd><dt className="col-sm-5">Admission year</dt><dd className="col-sm-7">{member.admission_year || '-'}</dd><dt className="col-sm-5">Expiry date</dt><dd className="col-sm-7">{formatDate(member.expiry_date)}</dd></dl></div></div></div><div className="col-lg-7"><div className="row"><div className="col-md-6"><div className="small-box bg-info"><div className="inner"><h3>{stats ? stats.activeLoans : '...'}</h3><p>Active loans</p></div></div></div><div className="col-md-6"><div className="small-box bg-warning"><div className="inner"><h3>{stats ? stats.activeHolds : '...'}</h3><p>Active holds</p></div></div></div><div className="col-md-6"><div className="small-box bg-danger"><div className="inner"><h3>{stats ? formatCurrency(stats.outstandingFines) : '...'}</h3><p>Outstanding fines</p></div></div></div><div className="col-md-6"><div className="small-box bg-success"><div className="inner"><h3>{stats ? stats.totalHistory : '...'}</h3><p>Total loan records</p></div></div></div></div></div></div>}
      </div></section>
    </MainLayout>
  );
}
