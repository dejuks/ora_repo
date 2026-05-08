// src/pages/reviewer/EbookReviewerCompletedPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function EbookReviewerCompletedPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/oraebook/reviewer/completed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRows(res.data.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load completed reviews");
    } finally {
      setLoading(false);
    }
  };

  const scorePercent = (score) => {
    return `${(Number(score || 0) / 10) * 100}%`;
  };

  return (
    <MainLayout>
      <div className="review-page">

        {/* ================= HEADER ================= */}
        <div className="review-header">
          <div>
            <h1>Completed Reviews</h1>

            <p>
              Monitor finalized manuscript reviews and reviewer evaluations
            </p>
          </div>

          <div className="review-stat-card">
            <span>{rows.length}</span>
            <small>Total Reviews</small>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="review-table-card">

          {loading ? (
            <div className="loading-area">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : rows.length === 0 ? (
            <div className="empty-area">
              <h4>No Completed Reviews</h4>
              <p>
                Completed reviews will appear here
              </p>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table review-table align-middle mb-0">
{/* // table header black */}
                <thead >
                  <tr>
                    <th>#</th>
                    <th>Manuscript</th>
                    <th>Status</th>
                    <th>Recommendation</th>
                    <th>Completed Date</th>
                    <th className="text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {rows.map((item, index) => (

                    <tr key={item.assignment_id}>

                      {/* NUMBER */}
                      <td className="fw-bold text-primary">
                        {index + 1}
                      </td>

                      {/* TITLE */}
                      <td>
                        <div className="manuscript-title">
                          {item.title}
                        </div>

                        <small className="text-muted">
                          Assignment ID:
                          {" "}
                          {item.assignment_id}
                        </small>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className="status-pill success">
                          {item.status}
                        </span> {item.payment_status}
                      </td>

                      {/* RECOMMENDATION */}
                      <td>
                        <span className="recommendation-pill">
                          {item.recommendation || "-"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td>

                        <div className="fw-semibold">
                          {item.completed_at
                            ? new Date(
                                item.completed_at
                              ).toLocaleDateString()
                            : "-"}
                        </div>

                        <small className="text-muted">

                          {item.completed_at
                            ? new Date(
                                item.completed_at
                              ).toLocaleTimeString()
                            : ""}

                        </small>

                      </td>

                      {/* ACTION */}
                      <td className="text-center">


                        <button
                          className="action-btn"
                          onClick={() =>
                            setSelectedReview(item)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ================= MODAL ================= */}
        {selectedReview && (

          <div className="custom-modal-overlay">

            <div className="custom-modal">

              {/* HEADER */}
              <div className="custom-modal-header">

                <div>
                  <h2>Review Details</h2>

                  <p>
                    Completed manuscript review summary
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setSelectedReview(null)
                  }
                >
                  ×
                </button>

              </div>

              {/* BODY */}
              <div className="custom-modal-body">

                {/* TITLE */}
                <div className="review-title-card">

                  <h3>
                    {selectedReview.title}
                  </h3>

                  <div className="d-flex gap-2 flex-wrap mt-3">

                    <span className="status-pill success">
                      {selectedReview.status}
                    </span>

                    <span className="recommendation-pill">
                      {selectedReview.recommendation}
                    </span>

                  </div>

                </div>

                {/* INFO GRID */}
                <div className="review-info-grid">

                  <div className="info-card">
                    <div className="info-icon">
                      📅
                    </div>

                    <div className="info-label">
                      Completed Date
                    </div>

                    <div className="info-value">

                      {selectedReview.completed_at
                        ? new Date(
                            selectedReview.completed_at
                          ).toLocaleDateString()
                        : "-"}

                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      🌍
                    </div>

                    <div className="info-label">
                      Language
                    </div>

                    <div className="info-value">
                      {selectedReview.language || "-"}
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      ⭐
                    </div>

                    <div className="info-label">
                      Recommendation
                    </div>

                    <div className="info-value">
                      {selectedReview.recommendation || "-"}
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      ✅
                    </div>

                    <div className="info-label">
                      Review Status
                    </div>

                    <div className="info-value text-success">
                      {selectedReview.status}
                    </div>
                  </div>

                </div>

                {/* SCORES */}
                <div className="section-card">

                  <div className="section-header">
                    Review Scores
                  </div>

                  <div className="score-grid">

                    {/* ORIGINALITY */}
                    <div className="score-card">

                      <div className="score-label">
                        Originality
                      </div>

                      <div className="score-value text-primary">
                        {selectedReview.originality_score || 0}
                      </div>

                      <div className="score-progress">
                        <div
                          className="score-progress-fill bg-primary"
                          style={{
                            width: scorePercent(
                              selectedReview.originality_score
                            ),
                          }}
                        />
                      </div>

                    </div>

                    {/* CLARITY */}
                    <div className="score-card">

                      <div className="score-label">
                        Clarity
                      </div>

                      <div className="score-value text-success">
                        {selectedReview.clarity_score || 0}
                      </div>

                      <div className="score-progress">
                        <div
                          className="score-progress-fill bg-success"
                          style={{
                            width: scorePercent(
                              selectedReview.clarity_score
                            ),
                          }}
                        />
                      </div>

                    </div>

                    {/* METHODOLOGY */}
                    <div className="score-card">

                      <div className="score-label">
                        Methodology
                      </div>

                      <div className="score-value text-warning">
                        {selectedReview.methodology_score || 0}
                      </div>

                      <div className="score-progress">
                        <div
                          className="score-progress-fill bg-warning"
                          style={{
                            width: scorePercent(
                              selectedReview.methodology_score
                            ),
                          }}
                        />
                      </div>

                    </div>

                    {/* RELEVANCE */}
                    <div className="score-card">

                      <div className="score-label">
                        Relevance
                      </div>

                      <div className="score-value text-danger">
                        {selectedReview.relevance_score || 0}
                      </div>

                      <div className="score-progress">
                        <div
                          className="score-progress-fill bg-danger"
                          style={{
                            width: scorePercent(
                              selectedReview.relevance_score
                            ),
                          }}
                        />
                      </div>

                    </div>

                  </div>

                </div>

                {/* COMMENTS */}
                <div className="comments-grid">

                  {/* AUTHOR COMMENTS */}
                  <div className="section-card">

                    <div className="section-header">
                      Comments For Author
                    </div>

                    <div className="review-note">

                      {selectedReview.comments_for_author ||
                        "No comments available"}

                    </div>

                  </div>

                  {/* CONFIDENTIAL */}
                  <div className="section-card">

                    <div className="section-header">
                      Confidential Comments
                    </div>

                    <div className="review-note">

                      {selectedReview.confidential_comments ||
                        "No confidential comments"}

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="custom-modal-footer">

                <button
                  className="btn btn-secondary px-4"
                  onClick={() =>
                    setSelectedReview(null)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================= CSS ================= */}
        <style>{`

          .review-page{
            background:#f8fafc;
            min-height:100vh;
            padding:24px;
          }

          .review-header{
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:32px;
            border-radius:28px;
            margin-bottom:24px;
            background:linear-gradient(
              135deg,
              #0f172a,
              #1e293b
            );
            color:white;
            box-shadow:0 10px 35px rgba(0,0,0,.08);
          }

          .review-header h1{
            font-size:32px;
            font-weight:700;
            margin-bottom:8px;
          }

          .review-header p{
            margin:0;
            opacity:.75;
          }

          .review-stat-card{
            width:150px;
            height:120px;
            border-radius:24px;
            background:rgba(255,255,255,.08);
            backdrop-filter:blur(10px);
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
          }

          .review-stat-card span{
            font-size:42px;
            font-weight:700;
            line-height:1;
          }

          .review-table-card{
            background:white;
            border-radius:28px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(15,23,42,.06);
          }

         .review-table thead{
  background:white;
  border-bottom:1px solid #e2e8f0;
}

.review-table thead th{
  color:#0f172a;
  padding:18px;
  border:none;
  font-size:13px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.5px;
}

          .review-table tbody td{
            padding:18px;
            border-bottom:1px solid #f1f5f9;
          }

          .review-table tbody tr{
            transition:.2s;
          }

          .review-table tbody tr:hover{
            background:#f8fafc;
          }

          .manuscript-title{
            font-size:15px;
            font-weight:600;
            color:#0f172a;
            margin-bottom:4px;
          }

          .status-pill{
            padding:8px 14px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
          }

          .status-pill.success{
            background:#dcfce7;
            color:#166534;
          }

          .recommendation-pill{
            padding:8px 14px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
            background:#dbeafe;
            color:#1d4ed8;
          }

          .action-btn{
            width:42px;
            height:42px;
            border:none;
            border-radius:14px;
            background:#f1f5f9;
            color:#0f172a;
            transition:.2s;
          }

          .action-btn:hover{
            background:#dbeafe;
            color:#2563eb;
          }

          .loading-area,
          .empty-area{
            padding:80px;
            text-align:center;
          }

          .custom-modal-overlay{
            position:fixed;
            inset:0;
            background:rgba(15,23,42,.6);
            backdrop-filter:blur(5px);
            z-index:9999;
            overflow:auto;
            padding:30px;
          }

          .custom-modal{
            background:white;
            border-radius:30px;
            overflow:hidden;
            max-width:1300px;
            margin:auto;
            box-shadow:0 20px 60px rgba(0,0,0,.15);
          }

          .custom-modal-header{
            background:linear-gradient(
              135deg,
              #0f172a,
              #1e293b
            );
            padding:28px 32px;
            color:white;
            display:flex;
            justify-content:space-between;
            align-items:center;
          }

          .custom-modal-header h2{
            margin:0;
            font-weight:700;
          }

          .custom-modal-header p{
            margin:6px 0 0;
            opacity:.75;
          }

          .close-btn{
            width:44px;
            height:44px;
            border:none;
            border-radius:14px;
            background:rgba(255,255,255,.1);
            color:white;
            font-size:28px;
          }

          .custom-modal-body{
            padding:32px;
            background:#f8fafc;
          }

          .review-title-card{
            background:white;
            padding:28px;
            border-radius:24px;
            margin-bottom:24px;
            box-shadow:0 5px 20px rgba(15,23,42,.05);
          }

          .review-title-card h3{
            margin:0;
            font-size:28px;
            font-weight:700;
            color:#0f172a;
          }

          .review-info-grid{
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:20px;
            margin-bottom:24px;
          }

          .info-card{
            background:white;
            border-radius:24px;
            padding:24px;
            text-align:center;
            box-shadow:0 5px 20px rgba(15,23,42,.05);
          }

          .info-icon{
            font-size:34px;
            margin-bottom:10px;
          }

          .info-label{
            color:#64748b;
            margin-bottom:6px;
          }

          .info-value{
            font-size:18px;
            font-weight:700;
            color:#0f172a;
          }

          .section-card{
            background:white;
            border-radius:24px;
            padding:24px;
            margin-bottom:24px;
            box-shadow:0 5px 20px rgba(15,23,42,.05);
          }

          .section-header{
            font-size:20px;
            font-weight:700;
            color:#0f172a;
            margin-bottom:24px;
          }

          .score-grid{
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:20px;
          }

          .score-card{
            background:#f8fafc;
            border-radius:20px;
            padding:20px;
          }

          .score-label{
            color:#64748b;
            margin-bottom:10px;
          }

          .score-value{
            font-size:42px;
            font-weight:700;
            line-height:1;
            margin-bottom:16px;
          }

          .score-progress{
            height:10px;
            border-radius:999px;
            overflow:hidden;
            background:#e2e8f0;
          }

          .score-progress-fill{
            height:100%;
            border-radius:999px;
          }

          .comments-grid{
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:24px;
          }

          .review-note{
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:18px;
            padding:20px;
            min-height:220px;
            line-height:1.9;
            color:#334155;
          }

          .custom-modal-footer{
            background:white;
            padding:24px 32px;
            border-top:1px solid #f1f5f9;
            display:flex;
            justify-content:flex-end;
          }

          @media(max-width:992px){

            .review-info-grid{
              grid-template-columns:repeat(2,1fr);
            }

            .score-grid{
              grid-template-columns:repeat(2,1fr);
            }

            .comments-grid{
              grid-template-columns:1fr;
            }

          }

          @media(max-width:768px){

            .review-page{
              padding:16px;
            }

            .review-header{
              flex-direction:column;
              align-items:flex-start;
              gap:20px;
            }

            .review-stat-card{
              width:100%;
            }

            .review-info-grid{
              grid-template-columns:1fr;
            }

            .score-grid{
              grid-template-columns:1fr;
            }

            .custom-modal-body{
              padding:20px;
            }

          }

        `}</style>

      </div>
    </MainLayout>
  );
}