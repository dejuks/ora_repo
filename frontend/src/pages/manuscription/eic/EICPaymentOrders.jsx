import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import axios from "axios";

export default function EICPaymentOrders() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Payment detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    loadPaymentOrders();
  }, []);

  const loadPaymentOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(
        'http://localhost:5000/api/payments/all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data && res.data.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error("Error loading payment orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.manuscript_title?.toLowerCase().includes(search.toLowerCase()) ||
      p.author_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_reference?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && p.status === "pending";
    if (filter === "paid") return matchesSearch && p.status === "paid";
    if (filter === "overdue") return matchesSearch && p.status === "overdue";
    
    return matchesSearch;
  });

  const viewPaymentDetail = async (payment) => {
    try {
      setDetailLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/payments/${payment.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data && res.data.success) {
        setSelectedPayment(res.data.payment);
        setShowDetailModal(true);
        setReceiptFile(null);
      }
    } catch (err) {
      console.error("Error loading payment detail:", err);
      alert("Failed to load payment details");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
    setReceiptFile(null);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only JPG, PNG, or PDF files');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setReceiptFile(file);
  };

  const submitReceipt = async () => {
    if (!receiptFile) {
      alert('Please select a receipt file');
      return;
    }

    try {
      setUploadingReceipt(true);
      
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('payment_id', selectedPayment.id);
      formData.append('manuscript_id', selectedPayment.manuscript_id);

      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/payments/upload-receipt',
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Receipt uploaded successfully');
      loadPaymentOrders(); // Refresh list
      closeDetailModal();
      
    } catch (err) {
      console.error('Error uploading receipt:', err);
      alert(err.response?.data?.error || 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const formatCurrency = (amount, currency = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge bg-warning",
      paid: "badge bg-success",
      overdue: "badge bg-danger",
      cancelled: "badge bg-secondary"
    };
    return badges[status] || "badge bg-secondary";
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'telebirr': '📱',
      'cbe_birr': '📱',
      'bank_transfer': '🏦',
      'credit_card': '💳',
      'cash': '💰',
      'paypal': '🅿️'
    };
    return icons[method] || '💳';
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-credit-card me-2"></i>
              Payment Orders
            </h3>
            
            <div className="card-tools d-flex gap-2">
              <select
                className="form-control form-control-sm"
                style={{ width: 150 }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: 200 }}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              
              <button
                className="btn btn-sm btn-info"
                onClick={loadPaymentOrders}
                title="Refresh"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <div className="card-body table-responsive p-0" style={{ maxHeight: "70vh" }}>
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading payment orders...</p>
              </div>
            ) : (
              <table className="table table-hover table-striped table-bordered mb-0">
                <thead className="thead-light">
                  <tr>
                    <th width="50">#</th>
                    <th>Reference</th>
                    <th>Manuscript</th>
                    <th width="150">Author</th>
                    <th width="120">Amount</th>
                    <th width="100">Method</th>
                    <th width="100">Due Date</th>
                    <th width="100">Status</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No payment orders found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p, i) => {
                      const daysRemaining = p.due_date ? getDaysRemaining(p.due_date) : null;
                      
                      return (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{p.payment_reference}</strong>
                            <small className="d-block text-muted">
                              ID: {p.id.substring(0, 8)}...
                            </small>
                          </td>
                          <td>
                            <strong>{p.manuscript_title}</strong>
                            {p.manuscript_id && (
                              <small className="d-block text-muted">
                                MS-{p.manuscript_id.substring(0, 8)}
                              </small>
                            )}
                          </td>
                          <td>
                            {p.author_name}
                            <small className="d-block text-muted">{p.author_email}</small>
                          </td>
                          <td>
                            <strong className="text-success">
                              {formatCurrency(p.amount, p.currency)}
                            </strong>
                          </td>
                          <td>
                            <span title={p.payment_method}>
                              {getPaymentMethodIcon(p.payment_method)} {p.payment_method?.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div>{formatDate(p.due_date)}</div>
                            {p.status === 'pending' && daysRemaining !== null && (
                              <small className={`text-${daysRemaining < 3 ? 'danger' : 'muted'}`}>
                                {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`}
                              </small>
                            )}
                            {p.status === 'paid' && p.paid_at && (
                              <small className="text-success d-block">
                                Paid: {formatDate(p.paid_at)}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className={getStatusBadge(p.status)}>
                              {p.status.toUpperCase()}
                            </span>
                            {p.status === 'paid' && p.receipt_path && (
                              <i className="fas fa-file-invoice text-success ms-2" title="Receipt uploaded"></i>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-info"
                                onClick={() => viewPaymentDetail(p)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              
                              {p.status === 'pending' && (
                                <button
                                  className="btn btn-success"
                                  onClick={() => viewPaymentDetail(p)}
                                  title="Upload Receipt"
                                >
                                  <i className="fas fa-upload"></i>
                                </button>
                              )}
                              
                              {p.status === 'paid' && p.receipt_path && (
                                <a
                                  href={`http://localhost:5000/${p.receipt_path}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-primary"
                                  title="View Receipt"
                                >
                                  <i className="fas fa-file-pdf"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Total: {filteredPayments.length} payment order(s)
            </small>
            
            <div className="payment-summary">
              <span className="badge bg-warning me-2">
                Pending: {payments.filter(p => p.status === 'pending').length}
              </span>
              <span className="badge bg-success me-2">
                Paid: {payments.filter(p => p.status === 'paid').length}
              </span>
              <span className="badge bg-danger">
                Overdue: {payments.filter(p => p.status === 'overdue').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-credit-card me-2"></i>
                  Payment Order Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Payment Header */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Reference</small>
                      <strong className="h5">{selectedPayment.payment_reference}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Status</small>
                      <span className={`badge fs-6 ${getStatusBadge(selectedPayment.status)}`}>
                        {selectedPayment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <i className="fas fa-money-bill-wave fa-2x text-success mb-2"></i>
                        <h6>Amount</h6>
                        <strong className="text-success">
                          {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <i className="fas fa-credit-card fa-2x text-info mb-2"></i>
                        <h6>Method</h6>
                        <strong>
                          {getPaymentMethodIcon(selectedPayment.payment_method)} {selectedPayment.payment_method?.replace('_', ' ')}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <i className="fas fa-calendar fa-2x text-warning mb-2"></i>
                        <h6>Due Date</h6>
                        <strong>{formatDate(selectedPayment.due_date)}</strong>
                        {selectedPayment.status === 'pending' && (
                          <div className={`text-${getDaysRemaining(selectedPayment.due_date) < 3 ? 'danger' : 'muted'} small`}>
                            {getDaysRemaining(selectedPayment.due_date)} days remaining
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manuscript Information */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Manuscript Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <p className="mb-1"><strong>Title:</strong> {selectedPayment.manuscript_title}</p>
                        <p className="mb-1"><strong>Author:</strong> {selectedPayment.author_name}</p>
                        <p className="mb-1"><strong>Email:</strong> {selectedPayment.author_email}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1"><strong>Manuscript ID:</strong> {selectedPayment.manuscript_id?.substring(0, 8)}</p>
                        <p className="mb-1"><strong>Payment ID:</strong> {selectedPayment.id?.substring(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedPayment.phone_number || selectedPayment.bank_name) && (
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Payment Details</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {selectedPayment.phone_number && (
                          <div className="col-md-4">
                            <small className="text-muted d-block">Phone Number</small>
                            <strong>{selectedPayment.phone_number}</strong>
                          </div>
                        )}
                        {selectedPayment.bank_name && (
                          <div className="col-md-4">
                            <small className="text-muted d-block">Bank Name</small>
                            <strong>{selectedPayment.bank_name}</strong>
                          </div>
                        )}
                        {selectedPayment.account_number && (
                          <div className="col-md-4">
                            <small className="text-muted d-block">Account Number</small>
                            <strong>{selectedPayment.account_number}</strong>
                          </div>
                        )}
                      </div>
                      {selectedPayment.transaction_reference && (
                        <div className="mt-2">
                          <small className="text-muted d-block">Transaction Reference</small>
                          <strong>{selectedPayment.transaction_reference}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Receipt Upload Section */}
                {selectedPayment.status === 'pending' && (
                  <div className="card border-warning mb-3">
                    <div className="card-header bg-warning text-white">
                      <h6 className="mb-0">Upload Payment Receipt</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <input
                          type="file"
                          className="form-control"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleReceiptUpload}
                        />
                        <small className="text-muted">
                          Accepted: JPG, PNG, PDF (Max 5MB)
                        </small>
                      </div>
                      
                      {receiptFile && (
                        <div className="selected-file p-2 bg-light rounded mb-2">
                          <i className="fas fa-file me-2"></i>
                          {receiptFile.name}
                          <span className="text-muted ms-2">
                            ({(receiptFile.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                      )}
                      
                      <button
                        className="btn btn-success w-100"
                        onClick={submitReceipt}
                        disabled={!receiptFile || uploadingReceipt}
                      >
                        {uploadingReceipt ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt me-2"></i>
                            Submit Receipt
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Receipt View Section */}
                {selectedPayment.status === 'paid' && selectedPayment.receipt_path && (
                  <div className="card border-success mb-3">
                    <div className="card-header bg-success text-white">
                      <h6 className="mb-0">Payment Receipt</h6>
                    </div>
                    <div className="card-body text-center">
                      <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                      <p>Payment completed on {formatDate(selectedPayment.paid_at)}</p>
                      <a
                        href={`http://localhost:5000/${selectedPayment.receipt_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        <i className="fas fa-file-pdf me-2"></i>
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="small text-muted">
                  <div>Created: {formatDate(selectedPayment.created_at)}</div>
                  {selectedPayment.paid_at && (
                    <div>Paid: {formatDate(selectedPayment.paid_at)}</div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeDetailModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}