// src/ebooks/components/ScreeningAssessment.jsx
import React, { useState, useEffect } from 'react';
import { getScreeningFormData, submitScreeningAssessment } from '../../../api/ebooks';

export default function ScreeningAssessment({ ebookId, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    relevanceScore: 3,
    scopeMatch: true,
    qualityScore: 3,
    comments: '',
    recommendedAction: '',
    reviewerIds: []
  });
  
  const [reviewers, setReviewers] = useState([]);
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadScreeningData();
  }, [ebookId]);

  const loadScreeningData = async () => {
    try {
      const res = await getScreeningFormData(ebookId);
      if (res.success) {
        setEbook(res.data.ebook);
        setReviewers(res.data.reviewers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recommendedAction) {
      alert('Please select a recommended action');
      return;
    }
    
    if (formData.recommendedAction === 'SEND_TO_REVIEW' && formData.reviewerIds.length === 0) {
      alert('Please assign at least one reviewer');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await submitScreeningAssessment(ebookId, formData);
      if (res.success) {
        onComplete?.(res);
      } else {
        alert(res.message || 'Failed to submit screening');
      }
    } catch (err) {
      alert('Failed to submit screening');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading screening form...</p>
    </div>
  );

  return (
    <div>
      {ebook && (
        <div className="alert alert-info mb-3">
          <strong>Manuscript:</strong> {ebook.title}<br />
          <strong>Author:</strong> {ebook.author_name}<br />
          <strong>Submitted:</strong> {new Date(ebook.submitted_at).toLocaleDateString()}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Relevance Score */}
        <div className="mb-3">
          <label className="form-label fw-bold">Relevance to Journal Scope (1-5)</label>
          <input
            type="range"
            className="form-range"
            min="1"
            max="5"
            value={formData.relevanceScore}
            onChange={(e) => setFormData({
              ...formData,
              relevanceScore: parseInt(e.target.value)
            })}
          />
          <div className="d-flex justify-content-between">
            <span className="small">Low Relevance</span>
            <span className="badge bg-primary">Score: {formData.relevanceScore}</span>
            <span className="small">High Relevance</span>
          </div>
        </div>

        {/* Scope Match */}
        <div className="mb-3">
          <label className="form-label fw-bold">Matches Journal Scope?</label>
          <div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="scopeMatch"
                id="scopeYes"
                checked={formData.scopeMatch === true}
                onChange={() => setFormData({...formData, scopeMatch: true})}
              />
              <label className="form-check-label" htmlFor="scopeYes">Yes</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="scopeMatch"
                id="scopeNo"
                checked={formData.scopeMatch === false}
                onChange={() => setFormData({...formData, scopeMatch: false})}
              />
              <label className="form-check-label" htmlFor="scopeNo">No</label>
            </div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="mb-3">
          <label className="form-label fw-bold">Overall Quality (1-5)</label>
          <select
            className="form-select"
            value={formData.qualityScore}
            onChange={(e) => setFormData({
              ...formData,
              qualityScore: parseInt(e.target.value)
            })}
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>

        {/* Comments */}
        <div className="mb-3">
          <label className="form-label fw-bold">Screening Comments</label>
          <textarea
            className="form-control"
            rows="4"
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            placeholder="Assess manuscript quality, relevance, and any concerns..."
            required
          />
        </div>

        {/* Recommended Action */}
        <div className="mb-3">
          <label className="form-label fw-bold">Recommended Action</label>
          <select
            className="form-select"
            value={formData.recommendedAction}
            onChange={(e) => setFormData({...formData, recommendedAction: e.target.value})}
            required
          >
            <option value="">Select action...</option>
            <option value="SEND_TO_REVIEW" className="text-success">
              ✅ Send to Peer Review
            </option>
            <option value="REQUEST_REVISION" className="text-warning">
              📝 Request Revisions
            </option>
            <option value="REJECT" className="text-danger">
              ❌ Reject
            </option>
          </select>
        </div>

        {/* Reviewer Assignment (only if sending to review) */}
        {formData.recommendedAction === 'SEND_TO_REVIEW' && (
          <div className="mb-3">
            <label className="form-label fw-bold">Assign Reviewers</label>
            <select
              className="form-select"
              multiple
              size="4"
              value={formData.reviewerIds}
              onChange={(e) => setFormData({
                ...formData,
                reviewerIds: Array.from(e.target.selectedOptions, opt => opt.value)
              })}
              required
            >
              {reviewers.length > 0 ? (
                reviewers.map(r => (
                  <option key={r.uuid} value={r.uuid}>
                    {r.full_name} ({r.email})
                  </option>
                ))
              ) : (
                <option disabled>No reviewers available</option>
              )}
            </select>
            {reviewers.length === 0 && (
              <div className="alert alert-warning mt-2">
                No reviewers found. Please add reviewers to the system first.
              </div>
            )}
            <small className="text-muted">
              Hold Ctrl/Cmd to select multiple reviewers
            </small>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Submitting...
              </>
            ) : 'Complete Screening'}
          </button>
        </div>
      </form>
    </div>
  );
}