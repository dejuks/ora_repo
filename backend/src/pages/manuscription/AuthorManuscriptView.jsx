import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import Swal from 'sweetalert2';
import {
  FaBookOpen,
  FaUser,
  FaTag,
  FaCalendar,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaCreditCard,
  FaReceipt
} from 'react-icons/fa';

export default function AuthorManuscriptView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manuscript, setManuscript] = useState(null);
  const [files, setFiles] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadManuscriptData();
  }, [id]);

  const loadManuscriptData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch manuscript details
      const manuscriptRes = await axios.get(
        `${API_BASE_URL}/manuscripts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setManuscript(manuscriptRes.data);

      // Fetch manuscript files
      try {
        const filesRes = await axios.get(
          `${API_BASE_URL}/files/manuscript/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFiles(Array.isArray(filesRes.data) ? filesRes.data : []);
      } catch (fileErr) {
        console.error('Error loading files:', fileErr);
        setFiles([]);
      }

      // Fetch payment details if manuscript is in payment_pending or published
      if (['payment_pending', 'published'].includes(manuscriptRes.data.status)) {
        try {
          const paymentRes = await axios.get(
            `${API_BASE_URL}/payments/manuscript/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (paymentRes.data && paymentRes.data.success && paymentRes.data.payment) {
            setPayment(paymentRes.data.payment);
          }
        } catch (paymentErr) {
          console.error('Error loading payment:', paymentErr);
        }
      }

    } catch (err) {
      console.error('Error loading manuscript:', err);
      setError(err.response?.data?.message || 'Failed to load manuscript');
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     FILE HANDLING
  ============================ */
  const handleFileOpen = async (file) => {
    try {
      const token = localStorage.getItem('token');
      
      Swal.fire({
        title: 'Opening file...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/files/download/${file.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      Swal.close();

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error('Error opening file:', err);
      Swal.close();
      Swal.fire('Error', 'Failed to open file', 'error');
    }
  };

  /* ============================
     PAYMENT RECEIPT HANDLING
  ============================ */
  const handleReceiptUpload = (e) => {
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
      formData.append('payment_id', payment.id);
      formData.append('manuscript_id', id);

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
      
      // Refresh payment data
      const updatedRes = await axios.get(
        `${API_BASE_URL}/payments/manuscript/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPayment(updatedRes.data.payment);
      setPaymentReceipt(null);
      
    } catch (err) {
      console.error('Error uploading receipt:', err);
      Swal.fire('Error', err.response?.data?.error || 'Failed to upload receipt', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  /* ============================
     STATUS HELPERS
  ============================ */
  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { class: 'badge-secondary', icon: FaClock, text: 'Draft' },
      'submitted': { class: 'badge-info', icon: FaPaperPlane, text: 'Submitted' },
      'screening': { class: 'badge-warning', icon: FaSpinner, text: 'Screening' },
      'under_review': { class: 'badge-primary', icon: FaEye, text: 'Under Review' },
      'accepted': { class: 'badge-success', icon: FaCheckCircle, text: 'Accepted' },
      'payment_pending': { class: 'badge-warning', icon: FaCreditCard, text: 'Payment Pending' },
      'published': { class: 'badge-success', icon: FaBookOpen, text: 'Published' },
      'rejected': { class: 'badge-danger', icon: FaTimesCircle, text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { class: 'badge-dark', icon: FaClock, text: status };
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class} px-3 py-2`}>
        <Icon className="me-1" /> {config.text}
      </span>
    );
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

  const formatCurrency = (amount, currency = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  /* ============================
     ACTIONS
  ============================ */
  const handleDelete = async () => {
    if (manuscript.status !== 'draft') {
      Swal.fire('Error', 'Only drafts can be deleted', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Manuscript?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_BASE_URL}/manuscripts/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        Swal.fire('Deleted!', 'Manuscript deleted successfully', 'success');
        navigate('/manuscripts');
      } catch (err) {
        console.error('Error deleting manuscript:', err);
        Swal.fire('Error', 'Failed to delete manuscript', 'error');
      }
    }
  };

  const handleResubmit = async () => {
    const result = await Swal.fire({
      title: 'Resubmit Manuscript',
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
          `${API_BASE_URL}/manuscripts/${id}/resubmit`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire('Success', 'Manuscript resubmitted successfully', 'success');
        loadManuscriptData();
      } catch (err) {
        console.error('Error resubmitting:', err);
        Swal.fire('Error', 'Failed to resubmit', 'error');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container-fluid py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading manuscript...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !manuscript) {
    return (
      <MainLayout>
        <div className="container-fluid py-5 text-center">
          <div className="alert alert-danger">
            <FaTimesCircle className="me-2" />
            {error || 'Manuscript not found'}
          </div>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/manuscripts')}
          >
            <FaArrowLeft className="me-2" /> Back to Manuscripts
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <button 
                  className="btn btn-outline-secondary me-3"
                  onClick={() => navigate('/manuscripts')}
                >
                  <FaArrowLeft className="me-2" /> Back
                </button>
                <h1 className="h3 d-inline-block mb-0">Manuscript Details</h1>
              </div>
              <div>
                {(manuscript.status === 'draft' || manuscript.status === 'rejected') && (
                  <Link
                    to={`/manuscripts/edit/${id}`}
                    className="btn btn-warning me-2"
                  >
                    <FaEdit className="me-2" /> Edit
                  </Link>
                )}
                {manuscript.status === 'rejected' && (
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleResubmit}
                  >
                    <FaPaperPlane className="me-2" /> Resubmit
                  </button>
                )}
                {manuscript.status === 'draft' && (
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    <FaTrash className="me-2" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-4">
                    {getStatusBadge(manuscript.status)}
                  </div>
                  <div className="text-muted">
                    <FaCalendar className="me-2" />
                    Submitted: {formatDate(manuscript.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <FaBookOpen className="me-2" /> Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  <FaFileAlt className="me-2" /> Files ({files.length})
                </button>
              </li>
              {payment && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payment')}
                  >
                    <FaCreditCard className="me-2" /> Payment
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="card">
                <div className="card-body">
                  <h2 className="h4 mb-4">{manuscript.title}</h2>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Authors</h6>
                      <p className="mb-3">
                        <FaUser className="me-2 text-primary" />
                        {manuscript.authors || 'Not specified'}
                      </p>
                      
                      <h6 className="text-muted mb-2">Keywords</h6>
                      <p className="mb-3">
                        <FaTag className="me-2 text-primary" />
                        {manuscript.keywords || 'Not specified'}
                      </p>
                      
                      {manuscript.affiliations && (
                        <>
                          <h6 className="text-muted mb-2">Affiliations</h6>
                          <p className="mb-3">{manuscript.affiliations}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      {manuscript.category_name && (
                        <>
                          <h6 className="text-muted mb-2">Category</h6>
                          <p className="mb-3">{manuscript.category_name}</p>
                        </>
                      )}
                      
                      {manuscript.stage_name && (
                        <>
                          <h6 className="text-muted mb-2">Current Stage</h6>
                          <p className="mb-3">{manuscript.stage_name}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <h6 className="text-muted mb-2">Abstract</h6>
                  <p className="mb-4">{manuscript.abstract}</p>

                  {manuscript.cover_letter && (
                    <>
                      <h6 className="text-muted mb-2">Cover Letter</h6>
                      <p className="mb-4">{manuscript.cover_letter}</p>
                    </>
                  )}

                  {manuscript.ethical_statement && (
                    <>
                      <h6 className="text-muted mb-2">Ethical Statement</h6>
                      <p className="mb-4">{manuscript.ethical_statement}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Manuscript Files</h5>
                </div>
                <div className="card-body">
                  {files.length === 0 ? (
                    <p className="text-muted text-center py-4">
                      <FaFileAlt className="fa-3x mb-3" />
                      <br />
                      No files uploaded yet
                    </p>
                  ) : (
                    <div className="list-group">
                      {files.map((file) => (
                        <div key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <FaFileAlt className="me-3 text-primary" size={20} />
                            <div>
                              <h6 className="mb-1">{file.filename || file.original_filename}</h6>
                              <small className="text-muted">
                                Type: {file.file_type || 'Unknown'} • 
                                Uploaded: {formatDate(file.created_at)}
                              </small>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleFileOpen(file)}
                          >
                            <FaEye className="me-1" /> View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && payment && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Payment Details</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <th>Amount:</th>
                            <td>{formatCurrency(payment.amount, payment.currency)}</td>
                          </tr>
                          <tr>
                            <th>Payment Method:</th>
                            <td>{payment.payment_method}</td>
                          </tr>
                          <tr>
                            <th>Reference:</th>
                            <td><code>{payment.payment_reference}</code></td>
                          </tr>
                          <tr>
                            <th>Status:</th>
                            <td>
                              <span className={`badge bg-${payment.status === 'completed' ? 'success' : 'warning'}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <th>Date:</th>
                            <td>{formatDate(payment.created_at)}</td>
                          </tr>
                          {payment.transaction_id && (
                            <tr>
                              <th>Transaction ID:</th>
                              <td>{payment.transaction_id}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {payment.status !== 'completed' && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <h6>Upload Payment Receipt</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="file"
                            className="form-control mb-2"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleReceiptUpload}
                            disabled={uploadingReceipt}
                          />
                          {paymentReceipt && (
                            <button
                              className="btn btn-primary"
                              onClick={submitPaymentReceipt}
                              disabled={uploadingReceipt}
                            >
                              {uploadingReceipt ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FaReceipt className="me-2" /> Submit Receipt
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {payment.receipt_url && (
                    <div className="mt-3">
                      <a 
                        href={payment.receipt_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-info"
                      >
                        <FaReceipt className="me-2" /> View Receipt
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}