import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import { Link } from 'react-router-dom';
import libraryApi from '../../../api/library.api';

function StatCard({ title, value, color = 'bg-info', icon = 'fas fa-chart-bar' }) {
  return (
    <div className="col-lg-3 col-md-6">
      <div className={`small-box ${color}`}>
        <div className="inner">
          <h3>{value}</h3>
          <p>{title}</p>
        </div>
        <div className="icon"><i className={icon}></i></div>
      </div>
    </div>
  );
}

export default function InventoryReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await libraryApi.getInventoryReport();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load inventory report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = data?.summary || {};
  const recentAudits = data?.recentAudits || [];
  const missingItems = data?.missingItems || [];
  const damagedItems = data?.damagedItems || [];
  const branchRows = data?.branches || [];

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h1>Inventory Report</h1>
            <p className="text-muted mb-0">Monitor audits, missing items, damaged materials, and copy distribution.</p>
          </div>
          <div>
            <Link to="/library/inventory/audits" className="btn btn-primary mr-2">
              <i className="fas fa-clipboard-check mr-1"></i> Manage Audits
            </Link>
            <button className="btn btn-outline-secondary" onClick={load}>
              <i className="fas fa-sync-alt mr-1"></i> Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}

          <div className="row">
            <StatCard title="Total Audits" value={loading ? '...' : (summary.totalAudits || 0)} color="bg-primary" icon="fas fa-clipboard-list" />
            <StatCard title="Open Audits" value={loading ? '...' : (summary.openAudits || 0)} color="bg-warning" icon="fas fa-hourglass-half" />
            <StatCard title="Missing Items" value={loading ? '...' : (summary.unresolvedMissingItems || 0)} color="bg-danger" icon="fas fa-search-minus" />
            <StatCard title="Damaged Items" value={loading ? '...' : (summary.unresolvedDamagedItems || 0)} color="bg-maroon" icon="fas fa-exclamation-triangle" />
          </div>

          <div className="row">
            <StatCard title="Items Not Found" value={loading ? '...' : (summary.itemsNotFound || 0)} color="bg-danger" icon="fas fa-question-circle" />
            <StatCard title="Discrepancy Items" value={loading ? '...' : (summary.discrepancyItems || 0)} color="bg-info" icon="fas fa-balance-scale" />
            <StatCard title="Total Copies" value={loading ? '...' : (summary.totalCopies || 0)} color="bg-success" icon="fas fa-copy" />
            <StatCard title="Tracked Branches" value={loading ? '...' : branchRows.length} color="bg-secondary" icon="fas fa-code-branch" />
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header"><h3 className="card-title">Recent Audits</h3></div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Audit</th>
                        <th>Status</th>
                        <th>Branch</th>
                        <th>Items</th>
                        <th>Not Found</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && recentAudits.length === 0 ? <tr><td colSpan="5" className="text-center p-4">No audits found.</td></tr> : null}
                      {recentAudits.map((row) => (
                        <tr key={row.audit_id}>
                          <td>{row.audit_name}</td>
                          <td>{row.status}</td>
                          <td>{row.branch_name || '-'}</td>
                          <td>{row.total_items}</td>
                          <td>{row.not_found_items}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card">
                <div className="card-header"><h3 className="card-title">Branch Distribution</h3></div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Branch</th>
                        <th>Total</th>
                        <th>Available</th>
                        <th>On Loan</th>
                        <th>Lost / Damaged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && branchRows.length === 0 ? <tr><td colSpan="5" className="text-center p-4">No branch inventory found.</td></tr> : null}
                      {branchRows.map((row) => (
                        <tr key={row.branch_id}>
                          <td>{row.branch_name}</td>
                          <td>{row.total_copies}</td>
                          <td>{row.available_copies}</td>
                          <td>{row.on_loan_copies}</td>
                          <td>{Number(row.lost_copies || 0) + Number(row.damaged_copies || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="card card-outline card-danger">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Unresolved Missing Items</h3>
                  <Link to="/library/inventory/missing">Open</Link>
                </div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Accession</th>
                        <th>Branch</th>
                        <th>Replacement Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && missingItems.length === 0 ? <tr><td colSpan="4" className="text-center p-4">No unresolved missing items.</td></tr> : null}
                      {missingItems.map((row) => (
                        <tr key={row.lost_report_id}>
                          <td>{row.title || '-'}</td>
                          <td>{row.accession_number || row.barcode || row.copy_id}</td>
                          <td>{row.branch_name || '-'}</td>
                          <td>{row.replacement_cost || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-outline card-warning">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Unresolved Damaged Items</h3>
                  <Link to="/library/inventory/damaged">Open</Link>
                </div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Severity</th>
                        <th>Branch</th>
                        <th>Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && damagedItems.length === 0 ? <tr><td colSpan="4" className="text-center p-4">No unresolved damaged items.</td></tr> : null}
                      {damagedItems.map((row) => (
                        <tr key={row.damage_report_id}>
                          <td>{row.title || '-'}</td>
                          <td>{row.severity || '-'}</td>
                          <td>{row.branch_name || '-'}</td>
                          <td>{row.estimated_cost || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
