import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';
import { formatCurrency, formatDate, StatusBadge } from '../shared/libraryHelpers.js';

function SummaryBox({ title, value, color, icon }) {
  return (
    <div className="col-lg-3 col-md-6">
      <div className={`small-box ${color || 'bg-info'}`}>
        <div className="inner">
          <h3>{value}</h3>
          <p>{title}</p>
        </div>
        <div className="icon"><i className={icon}></i></div>
      </div>
    </div>
  );
}

function TableCard({ title, rows, columns, emptyText = 'No records found.' }) {
  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">{title}</h3></div>
      <div className="card-body table-responsive p-0">
        <table className="table table-striped mb-0">
          <thead><tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr></thead>
          <tbody>
            {!rows?.length ? <tr><td colSpan={columns.length} className="text-center p-4">{emptyText}</td></tr> : null}
            {rows?.map((row, idx) => (
              <tr key={row.loan_id || row.hold_id || row.fine_id || row.copy_id || idx}>
                {columns.map((col) => <td key={col.key}>{col.render ? col.render(row) : String(row[col.key] ?? '')}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CirculationDeskPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [memberSearch, setMemberSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberOverview, setMemberOverview] = useState(null);
  const [memberOverviewLoading, setMemberOverviewLoading] = useState(false);

  const [copySearch, setCopySearch] = useState('');
  const [copyRows, setCopyRows] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [selectedCopyId, setSelectedCopyId] = useState('');

  const [processingAction, setProcessingAction] = useState('');
  const [fineAmounts, setFineAmounts] = useState({});

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await libraryApi.getCirculationSummary();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load circulation desk summary');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (query = '') => {
    setMemberLoading(true);
    try {
      const result = await libraryApi.list('members', { limit: 50, search: query || undefined });
      setMembers(result?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load members');
      setMembers([]);
    } finally {
      setMemberLoading(false);
    }
  };

  const loadCopies = async (query = '') => {
    setCopyLoading(true);
    try {
      const result = await libraryApi.list('copies', { limit: 100, search: query || undefined });
      const available = (result?.rows || []).filter((row) => ['available', 'reserved', 'borrowed', 'processing'].includes(row.status));
      setCopyRows(available);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load copies');
      setCopyRows([]);
    } finally {
      setCopyLoading(false);
    }
  };

  const loadMemberOverview = async (memberId) => {
    if (!memberId) {
      setMemberOverview(null);
      return;
    }
    setMemberOverviewLoading(true);
    try {
      const result = await libraryApi.getMemberCirculationOverview(memberId);
      setMemberOverview(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load member circulation overview');
      setMemberOverview(null);
    } finally {
      setMemberOverviewLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadMembers('');
    loadCopies('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadMembers(memberSearch); }, 300);
    return () => clearTimeout(timer);
  }, [memberSearch]);

  useEffect(() => {
    const timer = setTimeout(() => { loadCopies(copySearch); }, 300);
    return () => clearTimeout(timer);
  }, [copySearch]);

  useEffect(() => {
    loadMemberOverview(selectedMemberId);
  }, [selectedMemberId]);

  const selectedMember = useMemo(
    () => members.find((row) => row.member_id === selectedMemberId) || memberOverview?.member || null,
    [members, selectedMemberId, memberOverview]
  );

  const availableCopies = useMemo(
    () => copyRows.filter((row) => row.status === 'available' && row.is_circulation_allowed),
    [copyRows]
  );

  const openLoanRows = memberOverview?.activeLoans || [];
  const readyHoldRows = memberOverview?.holds?.filter((row) => row.status === 'ready_for_pickup' || row.status === 'queued') || [];
  const fineRows = memberOverview?.fines?.filter((row) => ['unpaid', 'partial'].includes(row.status)) || [];

  const withBusy = async (label, fn) => {
    setProcessingAction(label);
    setError('');
    setNotice('');
    try {
      await fn();
      await Promise.all([loadSummary(), loadMembers(memberSearch), loadCopies(copySearch)]);
      if (selectedMemberId) await loadMemberOverview(selectedMemberId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Operation failed');
    } finally {
      setProcessingAction('');
    }
  };

  const checkoutSelectedCopy = async () => {
    if (!selectedMemberId || !selectedCopyId) {
      setError('Select both a member and an available copy before checkout.');
      return;
    }
    await withBusy('checkout', async () => {
      await libraryApi.borrowLoan({ member_id: selectedMemberId, copy_id: selectedCopyId });
      setNotice('Checkout completed successfully.');
      setSelectedCopyId('');
    });
  };

  const quickReturnLoan = async (loanId) => {
    await withBusy(`return-${loanId}`, async () => {
      await libraryApi.returnLoan(loanId, {});
      setNotice('Item checked in successfully.');
    });
  };

  const quickRenewLoan = async (loanId) => {
    await withBusy(`renew-${loanId}`, async () => {
      await libraryApi.renewLoan(loanId, {});
      setNotice('Loan renewed successfully.');
    });
  };

  const quickFulfillHold = async (hold) => {
    await withBusy(`hold-${hold.hold_id}`, async () => {
      await libraryApi.fulfillHold(hold.hold_id, { copy_id: hold.copy_id || selectedCopyId || undefined });
      setNotice('Hold fulfilled and checked out successfully.');
    });
  };

  const quickPayFine = async (fine) => {
    const amount = Number(fineAmounts[fine.fine_id] || fine.outstanding_amount || 0);
    if (!amount || amount <= 0) {
      setError('Enter a valid fine payment amount.');
      return;
    }
    await withBusy(`fine-pay-${fine.fine_id}`, async () => {
      await libraryApi.payFine(fine.fine_id, { amount, payment_method: 'desk' });
      setNotice('Fine payment recorded successfully.');
    });
  };

  const quickWaiveFine = async (fine) => {
    const amount = Number(fineAmounts[fine.fine_id] || fine.outstanding_amount || 0);
    if (!amount || amount <= 0) {
      setError('Enter a valid waiver amount.');
      return;
    }
    await withBusy(`fine-waive-${fine.fine_id}`, async () => {
      await libraryApi.waiveFine(fine.fine_id, { amount, reason: 'Desk waiver' });
      setNotice('Fine waiver recorded successfully.');
    });
  };

  const summary = data?.summary || {};

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Circulation Desk</h1>
          <p className="text-muted mb-0">Checkout, check-in, fulfill holds, and settle fines from one operational screen.</p>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}
          {loading ? <div className="alert alert-info">Loading circulation summary...</div> : null}

          <div className="row">
            <SummaryBox title="Active loans" value={summary.active_loans ?? '0'} color="bg-info" icon="fas fa-book-reader" />
            <SummaryBox title="Overdue loans" value={summary.overdue_loans ?? '0'} color="bg-danger" icon="fas fa-exclamation-triangle" />
            <SummaryBox title="Ready holds" value={summary.ready_holds ?? '0'} color="bg-warning" icon="fas fa-bookmark" />
            <SummaryBox title="Outstanding balance" value={formatCurrency(summary.outstanding_fine_balance || 0)} color="bg-success" icon="fas fa-money-bill-wave" />
          </div>

          <div className="row">
            <div className="col-lg-4">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">1. Find member</h3></div>
                <div className="card-body">
                  <label className="small text-muted">Search member code / department / program</label>
                  <input className="form-control mb-3" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Type member code or keywords" />
                  <label className="small text-muted">Select member</label>
                  <select className="form-control" value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
                    <option value="">Choose member...</option>
                    {members.map((row) => (
                      <option key={row.member_id} value={row.member_id}>{row.member_code} {row.department ? `• ${row.department}` : ''}</option>
                    ))}
                  </select>
                  <div className="mt-3 text-muted small">
                    {memberLoading ? 'Loading members...' : selectedMember ? (
                      <>
                        <div><strong>Member code:</strong> {selectedMember.member_code}</div>
                        <div><strong>Status:</strong> {selectedMember.status || '-'}</div>
                        <div><strong>Department:</strong> {selectedMember.department || '-'}</div>
                        <div><strong>Program:</strong> {selectedMember.program || '-'}</div>
                      </>
                    ) : 'Select a member to open circulation actions.'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card card-outline card-info">
                <div className="card-header"><h3 className="card-title">2. Select copy</h3></div>
                <div className="card-body">
                  <label className="small text-muted">Search accession / barcode</label>
                  <input className="form-control mb-3" value={copySearch} onChange={(e) => setCopySearch(e.target.value)} placeholder="Type accession number or barcode" />
                  <label className="small text-muted">Available copy for checkout</label>
                  <select className="form-control" value={selectedCopyId} onChange={(e) => setSelectedCopyId(e.target.value)}>
                    <option value="">Choose copy...</option>
                    {availableCopies.map((row) => (
                      <option key={row.copy_id} value={row.copy_id}>{row.accession_number || row.barcode || row.copy_id}</option>
                    ))}
                  </select>
                  <button className="btn btn-primary btn-block mt-3" onClick={checkoutSelectedCopy} disabled={!selectedMemberId || !selectedCopyId || processingAction === 'checkout'}>
                    {processingAction === 'checkout' ? 'Processing...' : 'Check Out Selected Copy'}
                  </button>
                  <div className="small text-muted mt-3">{copyLoading ? 'Loading copies...' : `${availableCopies.length} available copy/copies ready for issue.`}</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card card-outline card-success">
                <div className="card-header"><h3 className="card-title">3. Member summary</h3></div>
                <div className="card-body">
                  {memberOverviewLoading ? <p className="mb-0 text-muted">Loading member overview...</p> : !memberOverview ? <p className="mb-0 text-muted">Choose a member to view loans, holds, fines, and desk actions.</p> : (
                    <>
                      <div className="mb-2"><strong>Active loans:</strong> {memberOverview.summary?.active_loans || 0}</div>
                      <div className="mb-2"><strong>Overdue loans:</strong> {memberOverview.summary?.overdue_loans || 0}</div>
                      <div className="mb-2"><strong>Open holds:</strong> {memberOverview.summary?.holds || 0}</div>
                      <div className="mb-2"><strong>Open fines:</strong> {memberOverview.summary?.fines_open || 0}</div>
                      <div className="mb-0"><strong>Outstanding balance:</strong> {formatCurrency(memberOverview.summary?.outstanding_balance || 0)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <TableCard
                title="Selected member: open loans"
                rows={openLoanRows}
                columns={[
                  { key: 'material_title', label: 'Material' },
                  { key: 'accession_number', label: 'Accession' },
                  { key: 'due_date', label: 'Due date', render: (row) => formatDate(row.due_date, true) },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-success" onClick={() => quickReturnLoan(row.loan_id)} disabled={processingAction === `return-${row.loan_id}`}>Return</button>
                      <button className="btn btn-outline-primary" onClick={() => quickRenewLoan(row.loan_id)} disabled={processingAction === `renew-${row.loan_id}`}>Renew</button>
                    </div>
                  ) },
                ]}
                emptyText="No open loans for the selected member."
              />
            </div>
            <div className="col-lg-6">
              <TableCard
                title="Selected member: holds queue"
                rows={readyHoldRows}
                columns={[
                  { key: 'material_title', label: 'Material' },
                  { key: 'accession_number', label: 'Copy' },
                  { key: 'requested_at', label: 'Requested', render: (row) => formatDate(row.requested_at, true) },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    row.status === 'ready_for_pickup' || row.copy_id ? <button className="btn btn-sm btn-warning" onClick={() => quickFulfillHold(row)} disabled={processingAction === `hold-${row.hold_id}`}>Fulfill</button> : <span className="text-muted">Waiting</span>
                  ) },
                ]}
                emptyText="No active holds for the selected member."
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-7">
              <TableCard
                title="Loans due soon"
                rows={data?.dueSoon || []}
                columns={[
                  { key: 'member_code', label: 'Member' },
                  { key: 'material_title', label: 'Material' },
                  { key: 'accession_number', label: 'Accession' },
                  { key: 'due_date', label: 'Due date', render: (row) => formatDate(row.due_date, true) },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                ]}
              />
            </div>
            <div className="col-lg-5">
              <TableCard
                title="Selected member: fine desk"
                rows={fineRows}
                columns={[
                  { key: 'material_title', label: 'Material' },
                  { key: 'reason', label: 'Reason' },
                  { key: 'outstanding_amount', label: 'Outstanding', render: (row) => formatCurrency(row.outstanding_amount) },
                  {
                    key: 'amount',
                    label: 'Desk amount',
                    render: (row) => (
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={fineAmounts[row.fine_id] ?? row.outstanding_amount ?? ''}
                        onChange={(e) => setFineAmounts((prev) => ({ ...prev, [row.fine_id]: e.target.value }))}
                      />
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (row) => (
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-success" onClick={() => quickPayFine(row)} disabled={processingAction === `fine-pay-${row.fine_id}`}>Pay</button>
                        <button className="btn btn-outline-secondary" onClick={() => quickWaiveFine(row)} disabled={processingAction === `fine-waive-${row.fine_id}`}>Waive</button>
                      </div>
                    ),
                  },
                ]}
                emptyText="No unpaid fines for the selected member."
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-7">
              <TableCard
                title="Current open loans"
                rows={data?.activeLoans || []}
                columns={[
                  { key: 'member_code', label: 'Member' },
                  { key: 'material_title', label: 'Material' },
                  { key: 'accession_number', label: 'Accession' },
                  { key: 'branch_name', label: 'Branch' },
                  { key: 'due_date', label: 'Due date', render: (row) => formatDate(row.due_date, true) },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                ]}
              />
            </div>
            <div className="col-lg-5">
              <TableCard
                title="Ready for pickup"
                rows={data?.readyHolds || []}
                columns={[
                  { key: 'member_code', label: 'Member' },
                  { key: 'material_title', label: 'Material' },
                  { key: 'accession_number', label: 'Copy' },
                  { key: 'ready_at', label: 'Ready at', render: (row) => formatDate(row.ready_at, true) },
                  { key: 'expiry_at', label: 'Expires', render: (row) => formatDate(row.expiry_at, true) },
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
