import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { getCurrentMember, sumOutstandingFines, formatCurrency } from '../shared/libraryHelpers';

export default function AccountPage() {
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const currentMember = await getCurrentMember();
        setMember(currentMember);
        if (!currentMember) return;
        const [loans, holds, fines] = await Promise.all([
          libraryApi.list('loans', { limit: 500 }),
          libraryApi.list('holds', { limit: 500 }),
          libraryApi.list('fines', { limit: 500 }),
        ]);
        const myLoans = (loans.rows || []).filter((row) => row.member_id === currentMember.member_id);
        const myHolds = (holds.rows || []).filter((row) => row.member_id === currentMember.member_id);
        const myFines = (fines.rows || []).filter((row) => row.member_id === currentMember.member_id);
        setStats({
          activeLoans: myLoans.filter((row) => ['active', 'overdue'].includes(row.status)).length,
          activeHolds: myHolds.filter((row) => ['queued', 'ready_for_pickup'].includes(row.status)).length,
          outstandingFines: sumOutstandingFines(myFines),
          totalHistory: myLoans.length,
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load member account');
      }
    })();
  }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Library Account</h1><p className="text-muted mb-0">Membership details and self-service status overview.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!member ? <div className="alert alert-info">No linked library member account was found for the signed-in user.</div> : (
          <div className="row">
            <div className="col-lg-5">
              <div className="card card-primary card-outline">
                <div className="card-header"><h3 className="card-title">Member profile</h3></div>
                <div className="card-body">
                  <dl className="row mb-0">
                    <dt className="col-sm-5">Member code</dt><dd className="col-sm-7">{member.member_code || '-'}</dd>
                    <dt className="col-sm-5">Status</dt><dd className="col-sm-7">{member.status || '-'}</dd>
                    <dt className="col-sm-5">Member type</dt><dd className="col-sm-7">{member.member_type_id || '-'}</dd>
                    <dt className="col-sm-5">Joined</dt><dd className="col-sm-7">{member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}</dd>
                    <dt className="col-sm-5">Expiry date</dt><dd className="col-sm-7">{member.expiry_date ? new Date(member.expiry_date).toLocaleDateString() : 'No expiry set'}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="row">
                <div className="col-md-6"><div className="small-box bg-info"><div className="inner"><h3>{stats ? stats.activeLoans : '...'}</h3><p>Active loans</p></div><div className="icon"><i className="fas fa-book-reader"></i></div></div></div>
                <div className="col-md-6"><div className="small-box bg-warning"><div className="inner"><h3>{stats ? stats.activeHolds : '...'}</h3><p>Active holds</p></div><div className="icon"><i className="fas fa-bookmark"></i></div></div></div>
                <div className="col-md-6"><div className="small-box bg-danger"><div className="inner"><h3>{stats ? formatCurrency(stats.outstandingFines) : '...'}</h3><p>Outstanding fines</p></div><div className="icon"><i className="fas fa-money-bill-wave"></i></div></div></div>
                <div className="col-md-6"><div className="small-box bg-success"><div className="inner"><h3>{stats ? stats.totalHistory : '...'}</h3><p>Total loan records</p></div><div className="icon"><i className="fas fa-history"></i></div></div></div>
              </div>
            </div>
          </div>
        )}
      </div></section>
    </MainLayout>
  );
}
