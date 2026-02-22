import React, { useEffect, useState } from 'react';
import { fetchManuscripts, deleteManuscript } from '../../api/manuscript.api';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import { Link } from 'react-router-dom';

export default function ManuscriptList() {
  const [manuscripts, setManuscripts] = useState([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [modalFiles, setModalFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileType, setFileType] = useState('original');

  // Payment detail modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  /* ============================
     LOAD
  ============================ */
  useEffect(() => {
    loadManuscripts();
  }, []);

  useEffect(() => {
    let filtered = manuscripts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.category_name?.toLowerCase().includes(term) ||
          m.author_name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    setFilteredManuscripts(filtered);
  }, [searchTerm, statusFilter, manuscripts]);

  const loadManuscripts = async () => {
    try {
      const res = await fetchManuscripts();
      setManuscripts(res.data);
      setFilteredManuscripts(res.data);
    } catch (err) {
      console.error('Error loading manuscripts:', err);
    }
  };

  /* ============================
     DELETE (DRAFT ONLY)
  ============================ */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draft manuscript?')) return;

    try {
      await deleteManuscript(id);
      const updated = manuscripts.filter((m) => m.id !== id);
      setManuscripts(updated);
      setFilteredManuscripts(updated);
    } catch (err) {
      console.error('Error deleting manuscript:', err);
      alert('Failed to delete manuscript');
    }
  };

  /* ============================
     FILE MODAL
  ============================ */
  const openFileModal = async (manuscript) => {
    setSelectedManuscript(manuscript);
    setUploadFiles([]);
    setFileType(manuscript.status === 'rejected' ? 'revision' : 'original');
    setModalOpen(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/files/manuscript/${manuscript.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalFiles(res.data);
    } catch {
      setModalFiles([]);
    }
  };

  const closeModal = () => setModalOpen(false);
  const handleFileChange = (e) => setUploadFiles(e.target.files);

  const handleUploadFiles = async () => {
    if (!uploadFiles.length) return alert('Select at least one file');

    const formData = new FormData();
    [...uploadFiles].forEach((f) => formData.append('files', f));

    formData.append('manuscript_id', selectedManuscript.id);
    formData.append('file_type', fileType);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get(
        `http://localhost:5000/api/files/manuscript/${selectedManuscript.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalFiles(res.data);
      setUploadFiles([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      alert('Failed to upload files');
    }
  };

  /* ============================
     REVISE & RESUBMIT (REJECTED)
  ============================ */
  const handleResubmit = async (manuscript) => {
    if (!window.confirm('Confirm revise & resubmit?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/manuscripts/${manuscript.id}/resubmit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Resubmitted successfully');
      loadManuscripts();
    } catch (err) {
      console.error('Error resubmitting:', err);
      alert('Failed to resubmit');
    }
  };

  /* ============================
     PAYMENT DETAIL VIEW
  ============================ */
const viewPaymentDetails = async (manuscript) => {
  try {
    setLoadingPayment(true);
    setSelectedManuscript(manuscript);
    
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `http://localhost:5000/api/payments/manuscript/${manuscript.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (res.data && res.data.success && res.data.payment) {
      setPaymentDetails(res.data.payment);
      setPaymentModalOpen(true);
      setPaymentReceipt(null);
    } else {
      alert('No payment record found for this manuscript');
    }
  } catch (err) {
    console.error('Error fetching payment details:', err);
    if (err.response?.status === 404) {
      alert('No payment record found for this manuscript');
    } else {
      alert(err.response?.data?.error || 'Failed to load payment details');
    }
  } finally {
    setLoadingPayment(false);
  }
};

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentDetails(null);
    setPaymentReceipt(null);
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type (accept images and PDFs)
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

    setPaymentReceipt(file);
  };

  const submitPaymentReceipt = async () => {
    if (!paymentReceipt) {
      alert('Please select a receipt file');
      return;
    }

    try {
      setUploadingReceipt(true);
      
      const formData = new FormData();
      formData.append('receipt', paymentReceipt);
      formData.append('payment_id', paymentDetails.id);
      formData.append('manuscript_id', paymentDetails.manuscript_id);

      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/payments/upload-receipt',
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Payment receipt uploaded successfully');
      
      // Refresh payment details
      const updatedRes = await axios.get(
        `http://localhost:5000/api/payments/manuscript/${paymentDetails.manuscript_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPaymentDetails(updatedRes.data.payment);
      setPaymentReceipt(null);
      
      // Reload manuscripts to update status if changed
      loadManuscripts();
      
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getPaymentMethodName = (method) => {
    const names = {
      'telebirr': 'Telebirr',
      'cbe_birr': 'CBE Birr',
      'bank_transfer': 'Bank Transfer',
      'credit_card': 'Credit Card',
      'cash': 'Cash',
      'paypal': 'PayPal'
    };
    return names[method] || method;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'badge-secondary';
      case 'submitted':
        return 'badge-info';
      case 'screening':
        return 'badge-warning';
      case 'under_review':
        return 'badge-primary';
      case 'accepted':
        return 'badge-success';
      case 'payment_pending':
        return 'badge-warning';
      case 'published':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-dark';
    }
  };

  /* ============================
     UI
  ============================ */
  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">Manuscripts</h3>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '200px' }}
              />
              <select
                className="form-control form-control-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="screening">Screening</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
              <Link to="/manuscripts/create" className="btn btn-success btn-sm">
                + Add Manuscript
              </Link>
            </div>
          </div>

          <div className="card-body">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Files</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManuscripts.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(m.status)}`}>
                        {m.status?.replace('_', ' ') || m.stage_name}
                      </span>
                    </td>
                    <td>{m.stage_name}</td>

                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => openFileModal(m)}
                      >
                        <i className="fas fa-file me-1"></i>Files
                      </button>
                    </td>

                    <td>
                      {m.status === 'payment_pending' ? (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => viewPaymentDetails(m)}
                          disabled={loadingPayment}
                        >
                          {loadingPayment ? (
                            <span className="spinner-border spinner-border-sm me-1"></span>
                          ) : (
                            <i className="fas fa-credit-card me-1"></i>
                          )}
                          View Payment
                        </button>
                      ) : m.status === 'published' ? (
                        <span className="text-success">
                          <i className="fas fa-check-circle me-1"></i>Paid
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* 🔐 ACTION RULES */}
                    <td className="d-flex gap-1">
                      {/* EDIT → Draft & Rejected ONLY */}
                      {(m.status === 'draft' || m.status === 'rejected') && (
                        <Link
                          to={`/manuscripts/edit/${m.id}`}
                          className="btn btn-warning btn-sm"
                        >
                          <i className="fas fa-edit me-1"></i>Edit
                        </Link>
                      )}

                      {/* RESUBMIT → Rejected ONLY */}
                      {m.status === 'rejected' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleResubmit(m)}
                        >
                          <i className="fas fa-redo me-1"></i>Resubmit
                        </button>
                      )}

                      {/* DELETE → Draft ONLY */}
                      {m.status === 'draft' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(m.id)}
                        >
                          <i className="fas fa-trash me-1"></i>Delete
                        </button>
                      )}

                      {/* VIEW DETAILS → All */}
                      <Link
                        to={`/manuscripts/${m.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="fas fa-eye me-1"></i>View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FILE MODAL */}
        {modalOpen && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5>{selectedManuscript?.title}</h5>
                  <button className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Upload Files</label>
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange} 
                      className="form-control"
                    />
                    <button 
                      className="btn btn-success mt-2" 
                      onClick={handleUploadFiles}
                      disabled={!uploadFiles.length}
                    >
                      <i className="fas fa-upload me-1"></i>Upload
                    </button>
                  </div>

                  <hr />
                  <h6>Uploaded Files</h6>
                  {modalFiles.length === 0 ? (
                    <p className="text-muted">No files uploaded yet</p>
                  ) : (
                    <div className="list-group">
                      {modalFiles.map((f) => (
                        <div key={f.id} className="list-group-item d-flex justify-content-between">
                          <a 
                            href={`http://localhost:5000/${f.file_path}`} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            <i className="fas fa-file me-2"></i>
                            {f.file_path.split('/').pop()}
                          </a>
                          <span className="badge bg-info">{f.file_type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT DETAIL MODAL */}
        {paymentModalOpen && paymentDetails && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title">
                    <i className="fas fa-credit-card me-2"></i>
                    Payment Details
                  </h5>
                  <button className="btn-close" onClick={closePaymentModal}></button>
                </div>
                <div className="modal-body">
                  {/* Payment Header */}
                  <div className="payment-header mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Payment Reference</h6>
                      <span className="badge bg-dark">{paymentDetails.payment_reference}</span>
                    </div>
                  </div>

                  {/* Payment Information Card */}
                  <div className="payment-info-card mb-3 p-3 border rounded">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-circle bg-success bg-opacity-10 p-2 rounded-circle me-2">
                            <i className="fas fa-money-bill-wave text-success"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Amount</small>
                            <strong className="h5 text-success">
                              {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-circle bg-info bg-opacity-10 p-2 rounded-circle me-2">
                            <i className="fas fa-credit-card text-info"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Payment Method</small>
                            <strong>
                              {getPaymentMethodIcon(paymentDetails.payment_method)} {getPaymentMethodName(paymentDetails.payment_method)}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-circle bg-warning bg-opacity-10 p-2 rounded-circle me-2">
                            <i className="fas fa-calendar-alt text-warning"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Due Date</small>
                            <strong>{formatDate(paymentDetails.due_date)}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-circle bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                            <i className="fas fa-clock text-primary"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Status</small>
                            <span className={`badge bg-${paymentDetails.status === 'paid' ? 'success' : 'warning'}`}>
                              {paymentDetails.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="payment-instructions mb-3 p-3 bg-info bg-opacity-10 rounded">
                    <h6 className="fw-bold mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Payment Instructions
                    </h6>
                    
                    {paymentDetails.payment_method === 'telebirr' && (
                      <div>
                        <ol className="mb-2 text-dark">
                          <li>Dial *127# on your phone</li>
                          <li>Select "Payment"</li>
                          <li>Enter merchant code: <strong>789012</strong></li>
                          <li>Enter amount: <strong>{paymentDetails.amount} {paymentDetails.currency}</strong></li>
                          <li>Enter payment reference: <strong>{paymentDetails.payment_reference}</strong></li>
                          <li>Confirm payment with your PIN</li>
                        </ol>
                        <div className="alert alert-warning mt-2 mb-0">
                          <small>
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            After payment, upload the receipt below
                          </small>
                        </div>
                      </div>
                    )}
                    
                    {paymentDetails.payment_method === 'cbe_birr' && (
                      <div>
                        <ol className="mb-2">
                          <li>Dial *847# on your phone</li>
                          <li>Select "Payment"</li>
                          <li>Enter merchant account: <strong>1000456789</strong></li>
                          <li>Enter amount: <strong>{paymentDetails.amount} {paymentDetails.currency}</strong></li>
                          <li>Enter reference: <strong>{paymentDetails.payment_reference}</strong></li>
                          <li>Confirm with PIN</li>
                        </ol>
                      </div>
                    )}
                    
                    {paymentDetails.payment_method === 'bank_transfer' && (
                      <div>
                        <table className="table table-sm table-borderless mb-2">
                          <tr>
                            <td>Bank:</td>
                            <td><strong>Commercial Bank of Ethiopia</strong></td>
                          </tr>
                          <tr>
                            <td>Account Name:</td>
                            <td><strong>Journal Publications</strong></td>
                          </tr>
                          <tr>
                            <td>Account Number:</td>
                            <td><strong>1000234567890</strong></td>
                          </tr>
                          <tr>
                            <td>SWIFT Code:</td>
                            <td><strong>CBETETAA</strong></td>
                          </tr>
                          <tr>
                            <td>Reference:</td>
                            <td><strong>{paymentDetails.payment_reference}</strong></td>
                          </tr>
                          <tr>
                            <td>Amount:</td>
                            <td><strong>{paymentDetails.amount} {paymentDetails.currency}</strong></td>
                          </tr>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Receipt Upload Section */}
                  {paymentDetails.status !== 'paid' && (
                    <div className="receipt-section mb-3 p-3 border rounded">
                      <h6 className="fw-bold mb-3">
                        <i className="fas fa-upload me-2"></i>
                        Upload Payment Receipt
                      </h6>
                      <div className="mb-3">
                        <input
                          type="file"
                          className="form-control"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleReceiptUpload}
                        />
                        <small className="text-muted">
                          Accepted formats: JPG, PNG, PDF (Max 5MB)
                        </small>
                      </div>
                      
                      {paymentReceipt && (
                        <div className="selected-file mb-2 p-2 bg-light rounded">
                          <i className="fas fa-file me-2"></i>
                          {paymentReceipt.name}
                          <span className="text-muted ms-2">
                            ({(paymentReceipt.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                      )}
                      
                      <button
                        className="btn btn-success w-100"
                        onClick={submitPaymentReceipt}
                        disabled={!paymentReceipt || uploadingReceipt}
                      >
                        {uploadingReceipt ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt me-2"></i>
                            Submit Payment Receipt
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Paid Details */}
                  {paymentDetails.status === 'paid' && (
                    <div className="paid-details mb-3 p-3 bg-success bg-opacity-10 rounded">
                      <div className="d-flex align-items-center mb-3">
                        <div className="icon-circle bg-success bg-opacity-25 p-2 rounded-circle me-3">
                          <i className="fas fa-check-circle text-success fa-2x"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 text-success">Payment Completed</h6>
                          <small>Paid on {formatDate(paymentDetails.paid_at)}</small>
                        </div>
                      </div>
                      
                      {paymentDetails.transaction_reference && (
                        <p className="mb-2">
                          <strong>Transaction Reference:</strong> {paymentDetails.transaction_reference}
                        </p>
                      )}
                      
                      {paymentDetails.receipt_url && (
                        <a 
                          href={paymentDetails.receipt_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-outline-success btn-sm"
                        >
                          <i className="fas fa-file-pdf me-2"></i>View Receipt
                        </a>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="metadata p-2 bg-light rounded">
                    <small className="text-muted d-block">
                      <i className="fas fa-clock me-1"></i>
                      Created: {formatDate(paymentDetails.created_at)}
                    </small>
                    {paymentDetails.created_by_name && (
                      <small className="text-muted d-block">
                        <i className="fas fa-user me-1"></i>
                        Created by: {paymentDetails.created_by_name}
                      </small>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closePaymentModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .icon-circle {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}
      </style>
    </MainLayout>
  );
}