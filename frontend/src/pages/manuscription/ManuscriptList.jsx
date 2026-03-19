import React, { useEffect, useState } from 'react';
import { fetchManuscripts, deleteManuscript } from '../../api/manuscript.api';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ManuscriptList() {
  const [manuscripts, setManuscripts] = useState([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [modalFiles, setModalFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileType, setFileType] = useState('original');
  const [uploading, setUploading] = useState(false);

  // Payment detail modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  /* ============================
     LOAD
  ============================ */
  useEffect(() => {
    loadManuscripts();
  }, []);

  useEffect(() => {
    // Ensure manuscripts is an array before filtering
    const manuscriptsArray = Array.isArray(manuscripts) ? manuscripts : [];
    let filtered = manuscriptsArray;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(term)) ||
          (m.category_name && m.category_name.toLowerCase().includes(term)) ||
          (m.author_name && m.author_name.toLowerCase().includes(term))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    setFilteredManuscripts(filtered);
  }, [searchTerm, statusFilter, manuscripts]);

  const loadManuscripts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchManuscripts();
      // Ensure we always set arrays
      const data = res?.data || res || [];
      setManuscripts(Array.isArray(data) ? data : []);
      setFilteredManuscripts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading manuscripts:', err);
      setError(err.response?.data?.message || 'Failed to load manuscripts');
      setManuscripts([]);
      setFilteredManuscripts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     DELETE (DRAFT ONLY)
  ============================ */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Draft?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await deleteManuscript(id);
        Swal.fire('Deleted!', 'Manuscript deleted successfully', 'success');
        loadManuscripts();
      } catch (err) {
        console.error('Error deleting manuscript:', err);
        Swal.fire('Error', 'Failed to delete manuscript', 'error');
      }
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
    setModalFiles([]);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE_URL}/files/manuscript/${manuscript.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Files loaded:', res.data);
      setModalFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading files:', err);
      setModalFiles([]);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedManuscript(null);
    setModalFiles([]);
    setUploadFiles([]);
  };

  const handleFileChange = (e) => setUploadFiles(e.target.files);

  const handleUploadFiles = async () => {
    if (!uploadFiles.length) {
      Swal.fire('Warning', 'Select at least one file', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    [...uploadFiles].forEach((f) => formData.append('files', f));

    formData.append('manuscript_id', selectedManuscript.id);
    formData.append('file_type', fileType);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire('Success', 'Files uploaded successfully', 'success');

      const res = await axios.get(
        `${API_BASE_URL}/files/manuscript/${selectedManuscript.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalFiles(Array.isArray(res.data) ? res.data : []);
      setUploadFiles([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      Swal.fire('Error', 'Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  /* ============================
     FILE OPEN HANDLER - Check available endpoints
  ============================ */
  const handleFileOpen = async (file) => {
    try {
      const token = localStorage.getItem('token');
      
      // Show loading indicator
      Swal.fire({
        title: 'Opening file...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Try different possible endpoints
      const possibleEndpoints = [
        `${API_BASE_URL}/files/download/${file.file_path?.split('/').pop()}`,
        `${API_BASE_URL}/files/${file.id}`,
        `${API_BASE_URL}/files/view/${file.id}`,
        `${API_BASE_URL}/files/file/${file.id}`,
        `${API_BASE_URL}/download/${file.id}`,
        `${API_BASE_URL}/file/${file.id}`
      ];

      let response = null;
      let successEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          });
          successEndpoint = endpoint;
          break;
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
        }
      }

      if (!response) {
        throw new Error('No working endpoint found for file download');
      }

      console.log('Success with endpoint:', successEndpoint);

      // Close loading indicator
      Swal.close();

      // Create blob from response data
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error('Error opening file:', err);
      Swal.close();
      
      // Show more detailed error
      Swal.fire({
        icon: 'error',
        title: 'Failed to open file',
        text: err.message || 'Please check if the file endpoint is correct',
        footer: 'Check console for more details'
      });
    }
  };

  /* ============================
     REVISE & RESUBMIT (REJECTED)
  ============================ */
  const handleResubmit = async (manuscript) => {
    const result = await Swal.fire({
      title: 'Confirm Resubmit',
      text: 'Are you sure you want to resubmit this manuscript?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Yes, resubmit'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_BASE_URL}/manuscripts/${manuscript.id}/resubmit`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire('Success', 'Resubmitted successfully', 'success');
        loadManuscripts();
      } catch (err) {
        console.error('Error resubmitting:', err);
        Swal.fire('Error', 'Failed to resubmit', 'error');
      }
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
        `${API_BASE_URL}/payments/manuscript/${manuscript.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data && res.data.success && res.data.payment) {
        setPaymentDetails(res.data.payment);
        setPaymentModalOpen(true);
        setPaymentReceipt(null);
      } else {
        Swal.fire('Info', 'No payment record found for this manuscript', 'info');
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      if (err.response?.status === 404) {
        Swal.fire('Info', 'No payment record found for this manuscript', 'info');
      } else {
        Swal.fire('Error', err.response?.data?.error || 'Failed to load payment details', 'error');
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

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Error', 'Please upload only JPG, PNG, or PDF files', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'File size must be less than 5MB', 'error');
      return;
    }

    setPaymentReceipt(file);
  };

  const submitPaymentReceipt = async () => {
    if (!paymentReceipt) {
      Swal.fire('Warning', 'Please select a receipt file', 'warning');
      return;
    }

    try {
      setUploadingReceipt(true);
      
      const formData = new FormData();
      formData.append('receipt', paymentReceipt);
      formData.append('payment_id', paymentDetails.id);
      formData.append('manuscript_id', paymentDetails.manuscript_id);

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/payments/upload-receipt`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      Swal.fire('Success', 'Payment receipt uploaded successfully', 'success');
      
      const updatedRes = await axios.get(
        `${API_BASE_URL}/payments/manuscript/${paymentDetails.manuscript_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPaymentDetails(updatedRes.data.payment);
      setPaymentReceipt(null);
      loadManuscripts();
      
    } catch (err) {
      console.error('Error uploading receipt:', err);
      Swal.fire('Error', err.response?.data?.error || 'Failed to upload receipt', 'error');
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
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
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
      case 'draft': return 'badge-secondary';
      case 'submitted': return 'badge-info';
      case 'screening': return 'badge-warning';
      case 'under_review': return 'badge-primary';
      case 'accepted': return 'badge-success';
      case 'payment_pending': return 'badge-warning';
      case 'published': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-dark';
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
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}
            
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
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : !Array.isArray(filteredManuscripts) || filteredManuscripts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <i className="fas fa-file-alt fa-3x mb-3"></i>
                      <p>No manuscripts found</p>
                      {(searchTerm || statusFilter) ? (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                          }}
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <Link to="/manuscripts/create" className="btn btn-sm btn-primary">
                          Create Your First Manuscript
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredManuscripts.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title || 'Untitled'}</td>
                      <td>
                          <span className='btn btn-sm btn-secondary'> {m.status}</span>
                      </td>
                      <td>{m.stage_name || '—'}</td>
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
                      <td className="d-flex gap-1">
                        {(m.status === 'draft' || m.status === 'rejected') && (
                          <Link
                            to={`/manuscripts/edit/${m.id}`}
                            className="btn btn-warning btn-sm"
                          >
                            <i className="fas fa-edit me-1"></i>
                          </Link>
                        )}
                        {m.status === 'rejected' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleResubmit(m)}
                          >
                            <i className="fas fa-redo me-1"></i>
                          </button>
                        )}
                        {m.status === 'draft' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(m.id)}
                          >
                            <i className="fas fa-trash me-1"></i>
                          </button>
                        )}
                        <Link
                          to={`/manuscripts/${m.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <i className="fas fa-eye me-1"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
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
                  <h5>{selectedManuscript?.title || 'Files'}</h5>
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
                      disabled={uploading}
                    />
                    <button 
                      className="btn btn-success mt-2" 
                      onClick={handleUploadFiles}
                      disabled={!uploadFiles.length || uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload me-1"></i>Upload
                        </>
                      )}
                    </button>
                  </div>

                  <hr />
                  <h6>Uploaded Files</h6>
                  {!Array.isArray(modalFiles) || modalFiles.length === 0 ? (
                    <p className="text-muted">No files uploaded yet</p>
                  ) : (
                    <div className="list-group">
                      {modalFiles.map((f) => (
                        <div key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-file me-2"></i>
                            <button
                              onClick={() => handleFileOpen(f)}
                              className="btn btn-link text-decoration-none p-0"
                              style={{ cursor: 'pointer', color: '#0d6efd' }}
                            >
                              {f.filename || f.original_filename || f.file_path?.split('/').pop() || 'File'}
                            </button>
                          </div>
                          <span className="badge bg-info">{f.file_type || 'Unknown'}</span>
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
                  <div className="payment-header mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Payment Reference</h6>
                      <span className="badge bg-dark">{paymentDetails.payment_reference}</span>
                    </div>
                  </div>
                  
                  <div className="payment-details">
                    <div className="row mb-2">
                      <div className="col-5">
                        <strong>Amount:</strong>
                      </div>
                      <div className="col-7">
                        {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                      </div>
                    </div>
                    
                    <div className="row mb-2">
                      <div className="col-5">
                        <strong>Payment Method:</strong>
                      </div>
                      <div className="col-7">
                        {getPaymentMethodIcon(paymentDetails.payment_method)} {getPaymentMethodName(paymentDetails.payment_method)}
                      </div>
                    </div>
                    
                    <div className="row mb-2">
                      <div className="col-5">
                        <strong>Status:</strong>
                      </div>
                      <div className="col-7">
                        <span className={`badge bg-${paymentDetails.status === 'completed' ? 'success' : 'warning'}`}>
                          {paymentDetails.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="row mb-2">
                      <div className="col-5">
                        <strong>Date:</strong>
                      </div>
                      <div className="col-7">
                        {formatDate(paymentDetails.created_at)}
                      </div>
                    </div>
                    
                    {paymentDetails.transaction_id && (
                      <div className="row mb-2">
                        <div className="col-5">
                          <strong>Transaction ID:</strong>
                        </div>
                        <div className="col-7">
                          {paymentDetails.transaction_id}
                        </div>
                      </div>
                    )}
                  </div>

                  {paymentDetails.status !== 'completed' && (
                    <div className="mt-4">
                      <h6>Upload Payment Receipt</h6>
                      <input
                        type="file"
                        className="form-control mb-2"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleReceiptUpload}
                        disabled={uploadingReceipt}
                      />
                      {paymentReceipt && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={submitPaymentReceipt}
                          disabled={uploadingReceipt}
                        >
                          {uploadingReceipt ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-upload me-1"></i>Submit Receipt
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {paymentDetails.receipt_url && (
                    <div className="mt-3">
                      <a 
                        href={paymentDetails.receipt_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-info btn-sm"
                      >
                        <i className="fas fa-receipt me-1"></i>View Receipt
                      </a>
                    </div>
                  )}
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
    </MainLayout>
  );
}