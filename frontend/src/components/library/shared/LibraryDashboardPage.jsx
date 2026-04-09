import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';
import { formatCurrency, getCurrentMember, loadResource, sumOutstandingFines } from './libraryHelpers.js';

function SmallBox({ title, value, icon, color, to }) {
  const body = (
    <div className={`small-box ${color || 'bg-info'}`}>
      <div className="inner">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
      <div className="icon"><i className={icon}></i></div>
      {to ? <span className="small-box-footer">Open <i className="fas fa-arrow-circle-right"></i></span> : null}
    </div>
  );

  return <div className="col-lg-3 col-md-6">{to ? <Link to={to}>{body}</Link> : body}</div>;
}

export default function LibraryDashboardPage({
  title,
  subtitle,
  load,
  statCards,
  quickLinks = [],
  sections = [],
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const member = await getCurrentMember().catch(() => null);
        const common = {
          member,
          reportSummary: await libraryApi.getReportSummary().catch(() => null),
          materials: (await loadResource('materials').catch(() => ({ rows: [] }))).rows || [],
          copies: (await loadResource('copies').catch(() => ({ rows: [] }))).rows || [],
          loans: (await loadResource('loans').catch(() => ({ rows: [] }))).rows || [],
          holds: (await loadResource('holds').catch(() => ({ rows: [] }))).rows || [],
          fines: (await loadResource('fines').catch(() => ({ rows: [] }))).rows || [],
          digitalResources: (await loadResource('digital-resources').catch(() => ({ rows: [] }))).rows || [],
          digitalSubmissions: (await loadResource('digital-submissions').catch(() => ({ rows: [] }))).rows || [],
          acquisitionRequests: (await loadResource('acquisition-requests').catch(() => ({ rows: [] }))).rows || [],
          purchaseOrders: (await loadResource('purchase-orders').catch(() => ({ rows: [] }))).rows || [],
          deliveries: (await loadResource('acquisition-receipts').catch(() => ({ rows: [] }))).rows || [],
          audits: (await loadResource('inventory-audits').catch(() => ({ rows: [] }))).rows || [],
          damageReports: (await loadResource('damage-reports').catch(() => ({ rows: [] }))).rows || [],
          lostReports: (await loadResource('lost-item-reports').catch(() => ({ rows: [] }))).rows || [],
          auditLogs: (await loadResource('audit-logs').catch(() => ({ rows: [] }))).rows || [],
          users: (await loadResource('members').catch(() => ({ rows: [] }))).rows || [],
          categories: (await loadResource('categories').catch(() => ({ rows: [] }))).rows || [],
          contributors: (await loadResource('contributors').catch(() => ({ rows: [] }))).rows || [],
          memberTypes: (await loadResource('member-types').catch(() => ({ rows: [] }))).rows || [],
          collections: (await loadResource('digital-collections').catch(() => ({ rows: [] }))).rows || [],
          downloads: member ? (await libraryApi.getMyCirculationOverview().catch(() => ({ downloads: [] }))).downloads || [] : [],
        };
        const finalData = load ? await load(common) : common;
        if (mounted) setData(finalData);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  const cards = data ? statCards(data) : [];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>{title}</h1>
          {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}

          <div className="row">
            {cards.map((card) => (
              <SmallBox key={card.title} {...card} value={loading ? '...' : card.value} />
            ))}
          </div>

          {quickLinks.length ? (
            <div className="card card-outline card-primary">
              <div className="card-header"><h3 className="card-title">Quick actions</h3></div>
              <div className="card-body d-flex flex-wrap gap-2">
                {quickLinks.map((item) => (
                  <Link key={item.to} to={item.to} className={`btn ${item.className || 'btn-outline-primary'} mr-2 mb-2`}>
                    <i className={`${item.icon || 'fas fa-arrow-right'} mr-1`}></i> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="row">
            {sections.map((section) => (
              <div className={section.colClassName || 'col-lg-6'} key={section.title}>
                <div className={`card ${section.cardClassName || ''}`}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title">{section.title}</h3>
                    {section.to ? <Link to={section.to}>Open</Link> : null}
                  </div>
                  <div className="card-body p-0 table-responsive">
                    {loading ? (
                      <div className="p-4 text-center">Loading...</div>
                    ) : section.type === 'list' ? (
                      <ul className="list-group list-group-flush">
                        {(section.items(data) || []).length === 0 ? (
                          <li className="list-group-item text-muted">No records found.</li>
                        ) : (
                          section.items(data).map((item, idx) => (
                            <li className="list-group-item" key={idx}>{section.renderItem(item)}</li>
                          ))
                        )}
                      </ul>
                    ) : (
                      <table className="table table-striped mb-0">
                        <thead>
                          <tr>
                            {section.columns.map((col) => <th key={col.key}>{col.label}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {(section.rows(data) || []).length === 0 ? (
                            <tr><td colSpan={section.columns.length} className="text-center p-4">No records found.</td></tr>
                          ) : (
                            section.rows(data).map((row, idx) => (
                              <tr key={row.id || row.loan_id || row.hold_id || row.fine_id || row.material_id || idx}>
                                {section.columns.map((col) => (
                                  <td key={col.key}>{col.render ? col.render(row) : String(row[col.key] ?? '')}</td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export function memberDashboardData(common) {
  const memberId = common.member?.member_id;
  const myLoans = common.loans.filter((row) => row.member_id === memberId);
  const myHolds = common.holds.filter((row) => row.member_id === memberId);
  const myFines = common.fines.filter((row) => row.member_id === memberId);
  const activeLoans = myLoans.filter((row) => ['active', 'overdue'].includes(row.status));
  const history = myLoans.filter((row) => ['returned', 'lost', 'closed'].includes(row.status));
  return {
    ...common,
    myLoans,
    myHolds,
    myFines,
    activeLoans,
    history,
    outstandingBalance: sumOutstandingFines(myFines),
    downloadableResources: common.digitalResources.filter((row) => row.is_active !== false),
  };
}

export { formatCurrency };
