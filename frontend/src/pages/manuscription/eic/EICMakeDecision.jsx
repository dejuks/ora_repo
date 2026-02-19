import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getManuscriptForDecisionAPI,
  makeDecisionAPI,
  initiatePaymentAPI
} from "../../../api/eic.decision.api";

export default function EICMakeDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Payment methods configuration
  const paymentMethods = [
    { id: 'telebirr', name: 'Telebirr', icon: '📱', countries: ['Ethiopia'] },
    { id: 'cbe_birr', name: 'CBE Birr', icon: '📱', countries: ['Ethiopia'] },
    { id: 'mpesa', name: 'M-PESA', icon: '📱', countries: ['Kenya', 'Tanzania'] },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', countries: ['All'] },
    { id: 'credit_card', name: 'Credit Card', icon: '💳', countries: ['All'] },
    { id: 'paypal', name: 'PayPal', icon: '🅿️', countries: ['All'] },
    { id: 'cash', name: 'Cash', icon: '💰', countries: ['Ethiopia'] },
    { id: 'check', name: 'Check', icon: '📝', countries: ['All'] }
  ];

  const [paymentDetails, setPaymentDetails] = useState({
    amount: "",
    currency: "ETB",
    payment_method: "telebirr",
    payment_type: "publication_fee",
    due_date: "",
    notes: "",
    // Additional fields based on payment method
    phone_number: "",
    bank_name: "",
    account_number: "",
    transaction_reference: ""
  });

  useEffect(() => {
    loadManuscript();
  }, [id]);

  const loadManuscript = async () => {
    try {
      setLoading(true);
      const data = await getManuscriptForDecisionAPI(id);
      setManuscript(data);
      
      // Set default payment amount based on journal policies if available
      if (data.default_publication_fee) {
        setPaymentDetails(prev => ({
          ...prev,
          amount: data.default_publication_fee,
          due_date: getDefaultDueDate()
        }));
      }
    } catch (err) {
      console.error("Error loading manuscript:", err);
      alert("Failed to load manuscript details");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().split('T')[0];
  };

  const handleDecision = async () => {
    if (!decision) {
      alert("Please select a decision");
      return;
    }

    // If decision is accept, show payment modal first
    if (decision === "accept") {
      setShowConfirm(false);
      setShowPaymentModal(true);
      return;
    }

    // For other decisions, proceed normally
    await submitDecision();
  };

  const submitDecision = async (paymentData = null) => {
    try {
      setSubmitting(true);
      
      const decisionData = {
        decision,
        decision_comment: comment
      };

      // If payment data is provided, include it
      if (paymentData) {
        decisionData.payment = paymentData;
      }

      await makeDecisionAPI(id, decisionData);
      
      // Show success message based on decision type
      if (decision === "accept" && paymentData) {
        alert("Manuscript accepted and payment order created successfully");
        navigate("/eic/payments/pending");
      } else {
        alert(`Decision recorded successfully: ${decision}`);
        navigate("/eic/completed-reviews");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to record decision");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
      setShowPaymentModal(false);
    }
  };

  const handlePaymentSubmit = async () => {
    // Validate payment details
    if (!paymentDetails.amount || parseFloat(paymentDetails.amount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (!paymentDetails.due_date) {
      alert("Please select a due date");
      return;
    }

    // Validate based on payment method
    if (paymentDetails.payment_method === 'telebirr' || 
        paymentDetails.payment_method === 'cbe_birr' || 
        paymentDetails.payment_method === 'mpesa') {
      if (!paymentDetails.phone_number) {
        alert(`Phone number is required for ${getPaymentMethodName(paymentDetails.payment_method)} payments`);
        return;
      }
    }

    if (paymentDetails.payment_method === 'bank_transfer') {
      if (!paymentDetails.bank_name || !paymentDetails.account_number) {
        alert("Bank name and account number are required for bank transfer");
        return;
      }
    }

    try {
      setPaymentProcessing(true);
      
      // Prepare payment data based on method
      const paymentData = {
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        payment_method: paymentDetails.payment_method,
        payment_type: paymentDetails.payment_type,
        due_date: paymentDetails.due_date,
        notes: paymentDetails.notes,
        manuscript_title: manuscript.title,
        author_name: manuscript.author_name,
        author_email: manuscript.author_email
      };

      // Add method-specific fields
      if (paymentDetails.payment_method === 'telebirr' || 
          paymentDetails.payment_method === 'cbe_birr' || 
          paymentDetails.payment_method === 'mpesa') {
        paymentData.phone_number = paymentDetails.phone_number;
      }

      if (paymentDetails.payment_method === 'bank_transfer') {
        paymentData.bank_name = paymentDetails.bank_name;
        paymentData.account_number = paymentDetails.account_number;
      }

      if (paymentDetails.transaction_reference) {
        paymentData.transaction_reference = paymentDetails.transaction_reference;
      }

      // Create payment order
      const paymentResult = await initiatePaymentAPI(id, paymentData);

      // Submit decision with payment info
      await submitDecision({
        ...paymentData,
        payment_id: paymentResult.payment_id,
        payment_status: 'pending'
      });

    } catch (err) {
      alert(err.response?.data?.error || "Failed to create payment order");
      setPaymentProcessing(false);
    }
  };

  const getPaymentMethodName = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : methodId;
  };

  const getPaymentMethodIcon = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.icon : '💳';
  };

  const getRecommendationBadge = (rec) => {
    const badges = {
      accept: "badge bg-success",
      minor_revision: "badge bg-info",
      major_revision: "badge bg-warning",
      reject: "badge bg-danger"
    };
    return badges[rec] || "badge bg-secondary";
  };

  const getDecisionIcon = (decision) => {
    const icons = {
      accept: "fas fa-check-circle text-success",
      revision: "fas fa-sync-alt text-warning",
      reject: "fas fa-times-circle text-danger"
    };
    return icons[decision] || "fas fa-question-circle";
  };

  const getDecisionColor = (decision) => {
    const colors = {
      accept: "success",
      revision: "warning",
      reject: "danger"
    };
    return colors[decision] || "secondary";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  // Decision Card Component for displaying existing decisions
  const DecisionCard = ({ decision }) => {
    const decisionColor = getDecisionColor(decision.decision);
    const decisionIcon = getDecisionIcon(decision.decision);
    
    return (
      <div className={`card border-${decisionColor} mb-3 shadow-sm`}>
        <div className={`card-header bg-${decisionColor} bg-opacity-10 border-${decisionColor}`}>
          <div className="d-flex align-items-center">
            <div className={`decision-icon-circle bg-${decisionColor} bg-opacity-25 p-3 rounded-circle me-3`}>
              <i className={`${decisionIcon} fa-2x text-${decisionColor}`}></i>
            </div>
            <div>
              <h5 className="mb-1 fw-bold">
                Decision: <span className={`text-${decisionColor}`}>{decision.decision.toUpperCase()}</span>
              </h5>
              <p className="mb-0 text-muted small">
                <i className="fas fa-calendar-alt me-2"></i>
                {formatDate(decision.decision_date)}
              </p>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Decision Maker Info */}
          <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
            <div className="decision-maker-avatar bg-secondary bg-opacity-10 p-2 rounded-circle me-2">
              <i className="fas fa-user-tie text-secondary"></i>
            </div>
            <div>
              <span className="fw-bold">Decision by:</span>
              <span className="ms-2">{decision.decided_by_name}</span>
            </div>
          </div>

          {/* Decision Comments */}
          {decision.decision_comment && (
            <div className="decision-feedback mb-3">
              <h6 className="fw-bold mb-2">
                <i className="fas fa-comment-dots me-2 text-primary"></i>
                Feedback to Author:
              </h6>
              <div className="feedback-bubble p-3 bg-light rounded-3">
                <p className="mb-0">{decision.decision_comment}</p>
              </div>
            </div>
          )}

          {/* Payment Information if available */}
          {decision.payment && (
            <div className="payment-info mt-3 p-3 bg-success bg-opacity-10 rounded-3 border border-success">
              <h6 className="fw-bold text-success mb-2">
                <i className="fas fa-credit-card me-2"></i>
                Payment Information
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Amount:</strong> {formatCurrency(decision.payment.amount, decision.payment.currency)}
                  </p>
                  <p className="mb-1">
                    <strong>Method:</strong> {getPaymentMethodName(decision.payment.payment_method)} {getPaymentMethodIcon(decision.payment.payment_method)}
                  </p>
                  <p className="mb-1">
                    <strong>Due Date:</strong> {new Date(decision.payment.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Status:</strong>{' '}
                    <span className={`badge bg-${decision.payment.status === 'paid' ? 'success' : 'warning'}`}>
                      {decision.payment.status || 'pending'}
                    </span>
                  </p>
                  {decision.payment.phone_number && (
                    <p className="mb-1">
                      <strong>Phone:</strong> {decision.payment.phone_number}
                    </p>
                  )}
                  {decision.payment.paid_date && (
                    <p className="mb-1">
                      <strong>Paid Date:</strong> {new Date(decision.payment.paid_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container-fluid text-center p-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading manuscript details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!manuscript) {
    return (
      <MainLayout>
        <div className="container-fluid p-4">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Manuscript not found
          </div>
          <Link to="/eic/completed-reviews" className="btn btn-primary">
            Back to List
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid p-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/eic/completed-reviews">Completed Reviews</Link>
            </li>
            <li className="breadcrumb-item active">Make Decision</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="card mb-4 border-primary shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">
              <i className="fas fa-gavel me-2"></i>
              Final Decision: {manuscript.title}
            </h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>
                    <i className="fas fa-user me-2"></i>Author:
                  </strong>{" "}
                  {manuscript.author_name}
                </p>
                <p className="text-muted small">{manuscript.author_email}</p>
                
                {manuscript.author_affiliation && (
                  <p>
                    <strong>
                      <i className="fas fa-building me-2"></i>Affiliation:
                    </strong>{" "}
                    {manuscript.author_affiliation}
                  </p>
                )}
              </div>
              <div className="col-md-6">
                <p>
                  <strong>
                    <i className="fas fa-calendar me-2"></i>Submitted:
                  </strong>{" "}
                  {formatDate(manuscript.submitted_at)}
                </p>
                
                {manuscript.assigned_editor_name && (
                  <p>
                    <strong>
                      <i className="fas fa-user-edit me-2"></i>Assigned Editor:
                    </strong>{" "}
                    {manuscript.assigned_editor_name}
                  </p>
                )}
                
                <p>
                  <strong>
                    <i className="fas fa-tag me-2"></i>AE Recommendation:
                  </strong>{" "}
                  {manuscript.ae_recommendation ? (
                    <span className={getRecommendationBadge(manuscript.ae_recommendation)}>
                      {manuscript.ae_recommendation.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="badge bg-secondary">No recommendation</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Abstract */}
            <div className="mt-3 p-3 bg-light rounded">
              <h6 className="font-weight-bold">Abstract</h6>
              <p>{manuscript.abstract || "No abstract provided"}</p>
            </div>
            
            {/* Keywords */}
            {manuscript.keywords && (
              <div className="mt-2">
                <strong>Keywords:</strong> {manuscript.keywords}
              </div>
            )}
          </div>
        </div>

        {/* Decisions Section */}
        {manuscript.decisions?.length > 0 ? (
          <div className="decisions-section">
            <div className="d-flex align-items-center mb-3">
              <h4 className="mb-0">
                <i className="fas fa-clipboard-check me-2 text-success"></i>
                Decision Record
              </h4>
              <span className="badge bg-success ms-3">
                {manuscript.decisions.length} Decision{manuscript.decisions.length > 1 ? 's' : ''}
              </span>
            </div>
            
            {manuscript.decisions.map((dec, idx) => (
              <DecisionCard key={idx} decision={dec} />
            ))}
            
            <div className="mt-4 text-center">
              <Link to="/eic/completed-reviews" className="btn btn-primary px-4">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Completed Reviews
              </Link>
            </div>
          </div>
        ) : (
          <div className="card border-success shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-check-circle me-2"></i>
                Make Your Decision
              </h5>
            </div>
            <div className="card-body">
              <div className="form-group mb-4">
                <label className="font-weight-bold">Select Decision</label>
                <div className="mt-2">
                  <div className="form-check mb-2 p-3 border rounded hover-shadow transition">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="accept"
                      name="decision"
                      value="accept"
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <label className="form-check-label w-100" htmlFor="accept">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success p-2 me-3" style={{ minWidth: '80px' }}>Accept</span>
                        <div>
                          <strong className="d-block">Accept manuscript for publication</strong>
                          <p className="text-muted small mt-1 mb-0">
                            The manuscript meets all criteria and will be published. 
                            <span className="text-success ms-2">
                              <i className="fas fa-credit-card me-1"></i>Payment order will be created
                            </span>
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-check mb-2 p-3 border rounded hover-shadow transition">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="revision"
                      name="decision"
                      value="revision"
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <label className="form-check-label w-100" htmlFor="revision">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-warning p-2 me-3" style={{ minWidth: '80px' }}>Revision</span>
                        <div>
                          <strong className="d-block">Author needs to revise manuscript</strong>
                          <p className="text-muted small mt-1 mb-0">
                            The manuscript requires revisions before it can be accepted.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-check mb-2 p-3 border rounded hover-shadow transition">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="reject"
                      name="decision"
                      value="reject"
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <label className="form-check-label w-100" htmlFor="reject">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-danger p-2 me-3" style={{ minWidth: '80px' }}>Reject</span>
                        <div>
                          <strong className="d-block">Reject manuscript</strong>
                          <p className="text-muted small mt-1 mb-0">
                            The manuscript does not meet the criteria for publication.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="font-weight-bold">Decision Comments / Feedback</label>
                <div className="feedback-editor border rounded p-3 bg-light">
                  <textarea
                    className="form-control border-0 bg-transparent"
                    rows="5"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide detailed feedback to the author about your decision..."
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    These comments will be shared with the author.
                  </small>
                  <span className={`badge ${comment.length > 0 ? 'bg-success' : 'bg-secondary'}`}>
                    {comment.length} characters
                  </span>
                </div>
              </div>

              <button
                className="btn btn-lg btn-success px-5"
                onClick={() => setShowConfirm(true)}
                disabled={!decision || submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    {decision === 'accept' ? 'Accept & Create Payment' : 'Record Decision'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className={`modal-header bg-${getDecisionColor(decision)} text-white`}>
                  <h5 className="modal-title">
                    <i className={`${getDecisionIcon(decision)} me-2`}></i>
                    Confirm {decision.charAt(0).toUpperCase() + decision.slice(1)} Decision
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="text-center mb-4">
                    <div className={`decision-preview-icon bg-${getDecisionColor(decision)} bg-opacity-10 p-4 rounded-circle d-inline-block`}>
                      <i className={`${getDecisionIcon(decision)} fa-3x text-${getDecisionColor(decision)}`}></i>
                    </div>
                  </div>
                  
                  <p className="mb-3 text-center">
                    Are you sure you want to mark this manuscript as <strong className={`text-${getDecisionColor(decision)}`}>{decision}</strong>?
                  </p>
                  
                  {decision === 'accept' && (
                    <div className="alert alert-info mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> You will be redirected to create a payment order for the author.
                    </div>
                  )}
                  
                  <div className="manuscript-info p-3 bg-light rounded mb-3">
                    <p className="mb-1"><strong>Title:</strong> {manuscript.title}</p>
                    <p className="mb-0"><strong>Author:</strong> {manuscript.author_name}</p>
                  </div>
                  
                  {comment && (
                    <div className="feedback-preview p-3 border-start border-4 border-primary bg-light rounded">
                      <strong className="d-block mb-2">
                        <i className="fas fa-comment-dots me-2 text-primary"></i>
                        Your Feedback:
                      </strong>
                      <p className="mb-0">{comment}</p>
                    </div>
                  )}
                  
                  <div className="alert alert-warning mt-3 mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Warning:</strong> This action cannot be undone.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                    disabled={submitting}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                  <button
                    className={`btn btn-${getDecisionColor(decision)}`}
                    onClick={handleDecision}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        {decision === 'accept' ? 'Continue to Payment' : 'Confirm Decision'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal for Accepted Manuscripts */}
        {showPaymentModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-credit-card me-2"></i>
                    Create Payment Order
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setShowConfirm(true);
                    }}
                    disabled={paymentProcessing}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-success mb-4">
                    <i className="fas fa-check-circle me-2"></i>
                    Manuscript accepted! Please create a payment order for the author.
                  </div>

                  <div className="author-info mb-4 p-3 bg-light rounded">
                    <h6 className="fw-bold mb-3">Author Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Name:</strong> {manuscript.author_name}</p>
                        <p className="mb-1"><strong>Email:</strong> {manuscript.author_email}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Manuscript:</strong> {manuscript.title}</p>
                        <p className="mb-1"><strong>ID:</strong> {manuscript.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="payment-form">
                    <h6 className="fw-bold mb-3">Payment Details</h6>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Amount *</label>
                        <div className="input-group">
                          <span className="input-group-text">${paymentDetails.currency === 'USD' ? '$' : 'Br'}</span>
                          <input
                            type="number"
                            className="form-control"
                            value={paymentDetails.amount}
                            onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <small className="text-muted">Enter the publication fee amount</small>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Currency</label>
                        <select
                          className="form-select"
                          value={paymentDetails.currency}
                          onChange={(e) => setPaymentDetails({...paymentDetails, currency: e.target.value})}
                        >
                          <option value="ETB">ETB - Ethiopian Birr</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="KES">KES - Kenyan Shilling</option>
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Payment Method *</label>
                        <select
                          className="form-select"
                          value={paymentDetails.payment_method}
                          onChange={(e) => setPaymentDetails({...paymentDetails, payment_method: e.target.value})}
                        >
                          <option value="telebirr">📱 Telebirr (Ethiopia)</option>
                          <option value="cbe_birr">📱 CBE Birr (Ethiopia)</option>
                          <option value="mpesa">📱 M-PESA (Kenya/Tanzania)</option>
                          <option value="bank_transfer">🏦 Bank Transfer</option>
                          <option value="credit_card">💳 Credit Card</option>
                          <option value="paypal">🅿️ PayPal</option>
                          <option value="cash">💰 Cash</option>
                          <option value="check">📝 Check</option>
                        </select>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Payment Type</label>
                        <select
                          className="form-select"
                          value={paymentDetails.payment_type}
                          onChange={(e) => setPaymentDetails({...paymentDetails, payment_type: e.target.value})}
                        >
                          <option value="publication_fee">Publication Fee</option>
                          <option value="processing_fee">Processing Fee</option>
                          <option value="membership_fee">Membership Fee</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Conditional fields based on payment method */}
                    {(paymentDetails.payment_method === 'telebirr' || 
                      paymentDetails.payment_method === 'cbe_birr' || 
                      paymentDetails.payment_method === 'mpesa') && (
                      <div className="row mb-3">
                        <div className="col-12">
                          <label className="form-label fw-bold">
                            <i className="fas fa-phone me-2"></i>
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            value={paymentDetails.phone_number}
                            onChange={(e) => setPaymentDetails({...paymentDetails, phone_number: e.target.value})}
                            placeholder="e.g., 251912345678"
                            required
                          />
                          <small className="text-muted">
                            Enter the phone number for {getPaymentMethodName(paymentDetails.payment_method)} payment
                          </small>
                        </div>
                      </div>
                    )}

                    {paymentDetails.payment_method === 'bank_transfer' && (
                      <>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Bank Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={paymentDetails.bank_name}
                              onChange={(e) => setPaymentDetails({...paymentDetails, bank_name: e.target.value})}
                              placeholder="e.g., Commercial Bank of Ethiopia"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Account Number *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={paymentDetails.account_number}
                              onChange={(e) => setPaymentDetails({...paymentDetails, account_number: e.target.value})}
                              placeholder="Enter account number"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Due Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={paymentDetails.due_date}
                          onChange={(e) => setPaymentDetails({...paymentDetails, due_date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                        <small className="text-muted">Payment deadline for the author</small>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Transaction Reference (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={paymentDetails.transaction_reference}
                          onChange={(e) => setPaymentDetails({...paymentDetails, transaction_reference: e.target.value})}
                          placeholder="If already have reference"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={paymentDetails.notes}
                        onChange={(e) => setPaymentDetails({...paymentDetails, notes: e.target.value})}
                        placeholder="Enter any additional payment instructions or notes..."
                      ></textarea>
                    </div>

                    {/* Payment Method Instructions */}
                    <div className={`payment-instructions mt-3 p-3 bg-${paymentDetails.payment_method === 'telebirr' ? 'success' : 'info'} bg-opacity-10 rounded-3`}>
                      <h6 className="fw-bold mb-2">
                        <i className="fas fa-info-circle me-2"></i>
                        {getPaymentMethodName(paymentDetails.payment_method)} Instructions:
                      </h6>
                      {paymentDetails.payment_method === 'telebirr' && (
                        <ul className="mb-0 small">
                          <li>Dial *127# on your phone</li>
                          <li>Select "Payment"</li>
                          <li>Enter merchant code: 789012</li>
                          <li>Enter amount: {paymentDetails.amount} {paymentDetails.currency}</li>
                          <li>Confirm payment</li>
                        </ul>
                      )}
                      {paymentDetails.payment_method === 'cbe_birr' && (
                        <ul className="mb-0 small">
                          <li>Dial *847# on your phone</li>
                          <li>Select "Payment"</li>
                          <li>Enter merchant account: 1000456789</li>
                          <li>Enter amount: {paymentDetails.amount} {paymentDetails.currency}</li>
                          <li>Confirm with PIN</li>
                        </ul>
                      )}
                      {paymentDetails.payment_method === 'mpesa' && (
                        <ul className="mb-0 small">
                          <li>Go to M-PESA menu</li>
                          <li>Select "Lipa Na M-PESA"</li>
                          <li>Enter business number: 543210</li>
                          <li>Enter amount: {paymentDetails.amount} {paymentDetails.currency}</li>
                          <li>Enter PIN to confirm</li>
                        </ul>
                      )}
                      {paymentDetails.payment_method === 'bank_transfer' && (
                        <ul className="mb-0 small">
                          <li>Bank: Commercial Bank of Ethiopia</li>
                          <li>Account Name: Journal Publications</li>
                          <li>Account Number: 1000234567890</li>
                          <li>SWIFT: CBETETAA</li>
                          <li>Use payment reference as description</li>
                        </ul>
                      )}
                    </div>

                    {/* Payment Summary */}
                    <div className="payment-summary mt-4 p-3 bg-light rounded">
                      <h6 className="fw-bold mb-3">Payment Summary</h6>
                      <div className="row">
                        <div className="col-md-4">
                          <p className="mb-2">
                            <strong>Amount:</strong><br/>
                            {paymentDetails.amount ? formatCurrency(paymentDetails.amount, paymentDetails.currency) : 'Not set'}
                          </p>
                        </div>
                        <div className="col-md-4">
                          <p className="mb-2">
                            <strong>Method:</strong><br/>
                            {getPaymentMethodName(paymentDetails.payment_method)} {getPaymentMethodIcon(paymentDetails.payment_method)}
                          </p>
                        </div>
                        <div className="col-md-4">
                          <p className="mb-2">
                            <strong>Due Date:</strong><br/>
                            {paymentDetails.due_date ? new Date(paymentDetails.due_date).toLocaleDateString() : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setShowConfirm(true);
                    }}
                    disabled={paymentProcessing}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handlePaymentSubmit}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Payment Order...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card me-2"></i>
                        Create Payment Order & Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .hover-shadow {
            transition: all 0.3s ease;
          }
          .hover-shadow:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          .transition {
            transition: all 0.3s ease;
          }
          .decision-icon-circle {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .feedback-bubble {
            position: relative;
          }
          .decision-preview-icon {
            width: 80px;
            height: 80px;
          }
          .payment-summary {
            border-left: 4px solid #28a745;
          }
          .payment-instructions {
            border-left: 4px solid #17a2b8;
          }
        `}</style>
      </div>
    </MainLayout>
  );
}