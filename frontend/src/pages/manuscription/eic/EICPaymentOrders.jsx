import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import axios from "axios";
import { paymentAPI } from "../../../api/payment.api";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

  // Payment status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  // Payment history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadPaymentOrders();
  }, []);

  const loadPaymentOrders = async () => {
    try {
      setLoading(true);
      
      const response = await paymentAPI.getAllPayments();
      console.log("API Response:", response);
      
      if (response && response.success) {
        setPayments(response.payments || []);
      } else {
        console.error("Unexpected response structure:", response);
        setPayments([]);
      }
    } catch (err) {
      console.error("Error loading payment orders:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load payment orders'
      });
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
    if (filter === "unpaid") return matchesSearch && p.status === "unpaid";
    
    return matchesSearch;
  });

  const viewPaymentDetail = async (payment) => {
    try {
      setDetailLoading(true);
      
      const response = await paymentAPI.getPaymentById(payment.id);
      
      if (response && response.success) {
        setSelectedPayment(response.payment || payment);
        setShowDetailModal(true);
        setReceiptFile(null);
      } else {
        setSelectedPayment(payment);
        setShowDetailModal(true);
        setReceiptFile(null);
      }
    } catch (err) {
      console.error("Error loading payment detail:", err);
      setSelectedPayment(payment);
      setShowDetailModal(true);
      setReceiptFile(null);
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

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Warning', 'Please upload only JPG, PNG, or PDF files', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Warning', 'File size must be less than 5MB', 'warning');
      return;
    }

    setReceiptFile(file);
  };

  const submitReceipt = async () => {
    if (!receiptFile) {
      Swal.fire('Warning', 'Please select a receipt file', 'warning');
      return;
    }

    try {
      setUploadingReceipt(true);
      
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('payment_id', selectedPayment.id);
      formData.append('manuscript_id', selectedPayment.manuscript_id);

      const response = await paymentAPI.uploadReceipt(formData);

      if (response && response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Receipt uploaded successfully'
        });
        loadPaymentOrders();
        closeDetailModal();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to upload receipt'
        });
      }
      
    } catch (err) {
      console.error('Error uploading receipt:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Failed to upload receipt'
      });
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Open payment status update modal
  const openStatusModal = (payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status || 'pending');
    setStatusNotes('');
    setTransactionReference(payment.transaction_reference || '');
    setShowStatusModal(true);
  };

  // Update payment status
  const updatePaymentStatus = async () => {
    if (!newStatus) {
      Swal.fire('Warning', 'Please select a status', 'warning');
      return;
    }

    try {
      setStatusUpdating(true);
      
      const updateData = {
        status: newStatus,
        notes: statusNotes,
        transaction_reference: transactionReference
      };

      const response = await paymentAPI.updatePaymentStatus(selectedPayment.id, updateData);

      if (response && response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Payment status updated to ${newStatus}`
        });
        setShowStatusModal(false);
        loadPaymentOrders();
        
        if (newStatus === 'paid') {
          sendPaymentConfirmation(selectedPayment);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update payment status'
        });
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Failed to update payment status'
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Send payment confirmation email
  const sendPaymentConfirmation = async (payment) => {
    const result = await Swal.fire({
      title: 'Send Confirmation?',
      text: 'Do you want to send a payment confirmation email to the author?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, send email',
      cancelButtonText: 'No, thanks'
    });

    if (result.isConfirmed) {
      try {
        await paymentAPI.sendPaymentConfirmation(payment.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Payment confirmation email sent to author'
        });
      } catch (err) {
        console.error('Error sending confirmation:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send confirmation email'
        });
      }
    }
  };

  // View payment history
  const viewPaymentHistory = async (payment) => {
    try {
      setLoadingHistory(true);
      setSelectedPayment(payment);
      
      const response = await paymentAPI.getPaymentHistory(payment.id);
      
      if (response && response.success) {
        setPaymentHistory(response.history || []);
        setShowHistoryModal(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load payment history'
        });
      }
    } catch (err) {
      console.error('Error loading payment history:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load payment history'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Mark as unpaid (for disputes/refunds)
  const markAsUnpaid = async (payment) => {
    const result = await Swal.fire({
      title: 'Mark as Unpaid?',
      text: 'This will mark the payment as unpaid. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, mark as unpaid'
    });

    if (result.isConfirmed) {
      try {
        const response = await paymentAPI.updatePaymentStatus(payment.manuscript_id, {
          status: 'unpaid',
          notes: 'Payment marked as unpaid by administrator'
        });

        if (response && response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Payment marked as unpaid'
          });
          loadPaymentOrders();
        }
      } catch (err) {
        console.error('Error updating payment:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update payment status'
        });
      }
    }
  };

  // Generate invoice
  const generateInvoice = async (payment) => {
    try {
      const response = await paymentAPI.generateInvoice(payment.manuscript_id);
      
      if (response && response.success && response.invoice_url) {
        window.open(response.invoice_url, '_blank');
        
        Swal.fire({
          icon: 'success',
          title: 'Invoice Generated',
          text: 'Invoice has been generated successfully'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to generate invoice'
        });
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate invoice'
      });
    }
  };

  const formatCurrency = (amount, currency = 'ETB') => {
    if (!amount) return 'N/A';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge bg-warning",
      paid: "badge bg-success",
      overdue: "badge bg-danger",
      unpaid: "badge bg-secondary",
      cancelled: "badge bg-dark",
      refunded: "badge bg-info"
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
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL || 'http://localhost:5000'}/${cleanPath}`;
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
                <option value="unpaid">Unpaid</option>
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
                    <th width="200">Actions</th>
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
                              ID: {p.id?.substring(0, 8)}...
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
                            {p.author_email && (
                              <small className="d-block text-muted">{p.author_email}</small>
                            )}
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
                              {p.status?.toUpperCase()}
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
                              
                              <button
                                className="btn btn-warning"
                                onClick={() => openStatusModal(p)}
                                title="Update Status"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              
                              {/* <button
                                className="btn btn-secondary"
                                onClick={() => viewPaymentHistory(p)}
                                title="View History"
                              >
                                <i className="fas fa-history"></i>
                              </button>
                               */}
                              {/* {p.status === 'paid' && (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => generateInvoice(p)}
                                  title="Generate Invoice"
                                >
                                  <i className="fas fa-file-invoice"></i>
                                </button>
                              )} */}
                              
                              {p.status === 'paid' && (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => markAsUnpaid(p)}
                                  title="Mark as Unpaid"
                                >
                                  <i className="fas fa-times-circle"></i>
                                </button>
                              )}
                              
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
                                  href={getFileUrl(p.receipt_path)}
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
              <span className="badge bg-secondary me-2">
                Unpaid: {payments.filter(p => p.status === 'unpaid').length}
              </span>
              <span className="badge bg-danger">
                Overdue: {payments.filter(p => p.status === 'overdue').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      PAYMENT DETAIL MODAL - Redesigned to match screenshot
      {showDetailModal && selectedPayment && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-light border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Update Payment Status</h5>
                  <button type="button" className="btn-close" onClick={closeDetailModal}></button>
                </div>
                <div className="modal-body">
                  {/* Reference and ID */}
                  <div className="mb-3">
                    <div className="fw-bold">{selectedPayment.payment_reference}</div>
                    <small className="text-muted">ID: {selectedPayment.id?.substring(0, 13)}</small>
                  </div>

                  {/* Author and Manuscript Info */}
                  <div className="mb-3">
                    <div className="fw-bold">{selectedPayment.author_name}</div>
                    <div>{selectedPayment.manuscript_title}</div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`badge ${getStatusBadge(selectedPayment.status)} fs-6 p-2`}>
                      {selectedPayment.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Amount and Method Row */}
                  <div className="row mb-4">
                    <div className="col-6">
                      <small className="text-muted d-block">Amount</small>
                      <span className="fw-bold">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Method</small>
                      <span className="fw-bold">
                        {getPaymentMethodIcon(selectedPayment.payment_method)} {selectedPayment.payment_method?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Due Date and Status Row */}
                  <div className="row mb-4">
                    <div className="col-6">
                      <small className="text-muted d-block">Due Date</small>
                      <span className="fw-bold">{formatDate(selectedPayment.due_date)}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Status</small>
                      <div className="d-flex align-items-center">
                        <span className={`badge ${getStatusBadge(selectedPayment.status)} me-2`}>
                          {selectedPayment.status?.toUpperCase()}
                        </span>
                        {selectedPayment.status === 'paid' && selectedPayment.paid_at && (
                          <small className="text-success">
                            Paid: {formatDate(selectedPayment.paid_at)}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button className="btn btn-sm btn-outline-secondary" title="View">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-warning" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-info" title="History">
                      <i className="fas fa-history"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-primary" title="Invoice">
                      <i className="fas fa-file-invoice"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STATUS UPDATE MODAL */}
      {showStatusModal && selectedPayment && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-light border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Update Payment Status</h5>
                  <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
                </div>
                <div className="modal-body">
                  {/* Reference */}
                  <div className="mb-3">
                    <div className="fw-bold">{selectedPayment.payment_reference}</div>
                  </div>

                  {/* Current Status */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Current Status</small>
                    <span className={`badge ${getStatusBadge(selectedPayment.status)} p-2`}>
                      {selectedPayment.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* New Status Dropdown */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">New Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Transaction Reference */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Transaction Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="Enter transaction reference"
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Add any notes about this status update"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowStatusModal(false)}
                      disabled={statusUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={updatePaymentStatus}
                      disabled={!newStatus || statusUpdating}
                    >
                      {statusUpdating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Status'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {showHistoryModal && selectedPayment && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-light border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Payment History</h5>
                  <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loadingHistory ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : paymentHistory.length === 0 ? (
                    <p className="text-muted text-center py-4">No payment history found</p>
                  ) : (
                    paymentHistory.map((item, index) => (
                      <div key={index} className="mb-3 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className={`badge ${getStatusBadge(item.old_status)} me-2`}>
                              {item.old_status}
                            </span>
                            <i className="fas fa-arrow-right mx-2"></i>
                            <span className={`badge ${getStatusBadge(item.new_status)}`}>
                              {item.new_status}
                            </span>
                          </div>
                          <small className="text-muted">{formatDate(item.created_at)}</small>
                        </div>
                        {item.notes && (
                          <div className="mt-2 text-muted">
                            <small>{item.notes}</small>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowHistoryModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}