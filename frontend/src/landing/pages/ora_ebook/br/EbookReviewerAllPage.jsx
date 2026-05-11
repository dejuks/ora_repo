// src/pages/reviewer/EbookReviewerAllPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function EbookReviewerAllPage() {

  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState([]);

  const [selectedReview, setSelectedReview] = useState(null);

  // FILTERS
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [recommendationFilter, setRecommendationFilter] =
    useState("all");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/oraebook/reviewer/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRows(res.data.data || []);

    } catch (error) {

      console.error(error);

      alert("Failed to load reviewer records");

    } finally {

      setLoading(false);

    }

  };

  const scorePercent = (score) => {
    return `${(Number(score || 0) / 10) * 100}%`;
  };

  // ================= FILTER DATA =================
  const filteredRows = useMemo(() => {

    return rows.filter((item) => {

      const matchesSearch =
        item.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        String(item.assignment_id)
          .includes(search);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : item.status === statusFilter;

      const matchesRecommendation =
        recommendationFilter === "all"
          ? true
          : item.recommendation === recommendationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRecommendation
      );

    });

  }, [rows, search, statusFilter, recommendationFilter]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(
    filteredRows.length / rowsPerPage
  );

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ================= STATUS COLORS =================
  const getStatusClass = (status) => {

    switch (status) {

      case "completed":
        return "success";

      case "rejected":
        return "danger";

      case "accepted":
        return "primary";

      case "pending":
        return "warning";

      default:
        return "secondary";

    }

  };

  return (
    <MainLayout>

      <div className="review-page">

        {/* ================= HEADER ================= */}
        <div className="review-header">

          <div>

            <h1>
              All Reviewer Activities
            </h1>

            <p>
              Monitor all reviewer actions,
              statuses, evaluations, and
              manuscript activities
            </p>

          </div>

          <div className="review-stat-card">

            <span>
              {filteredRows.length}
            </span>

            <small>
              Total Records
            </small>

          </div>

        </div>

        {/* ================= FILTERS ================= */}
        <div className="filter-card">

          {/* SEARCH */}
          <div className="filter-item">

            <label>
              Search
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Search manuscript..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

          </div>

          {/* STATUS */}
          <div className="filter-item">

            <label>
              Status
            </label>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >

              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

          </div>

          {/* RECOMMENDATION */}
          <div className="filter-item">

            <label>
              Recommendation
            </label>

            <select
              className="form-select"
              value={recommendationFilter}
              onChange={(e) => {
                setRecommendationFilter(
                  e.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option value="all">
                All Recommendations
              </option>

              <option value="accept">
                Accept
              </option>

              <option value="minor revision">
                Minor Revision
              </option>

              <option value="major revision">
                Major Revision
              </option>

              <option value="reject">
                Reject
              </option>

            </select>

          </div>

        </div>

        {/* ================= TABLE ================= */}
        <div className="review-table-card">

          {loading ? (

            <div className="loading-area">
              <div className="spinner-border text-primary"></div>
            </div>

          ) : filteredRows.length === 0 ? (

            <div className="empty-area">

              <h4>
                No Reviewer Activities
              </h4>

              <p>
                Reviewer records will appear here
              </p>

            </div>

          ) : (

            <>

              <div className="table-responsive">

                <table className="table review-table align-middle mb-0">

                  <thead>

                    <tr>

                      <th>#</th>

                      <th>
                        Manuscript
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Recommendation
                      </th>

                      {/* <th>
                        Scores
                      </th> */}

                      <th>
                        Date
                      </th>

                      <th className="text-center">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedRows.map(
                      (item, index) => (

                        <tr
                          key={item.assignment_id}
                        >

                          <td className="fw-bold text-primary">

                            {(currentPage - 1) *
                              rowsPerPage +
                              index +
                              1}

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

                            <span
                              className={`status-pill ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>

                          </td>

                          {/* RECOMMENDATION */}
                          <td>

                            <span className="recommendation-pill">

                              {item.recommendation ||
                                "-"}

                            </span>

                          </td>

                          {/* SCORE
                          <td>

                            <div className="score-mini">

                              <div>
                                O:
                                {" "}
                                {item.originality_score ||
                                  0}
                              </div>

                              <div>
                                C:
                                {" "}
                                {item.clarity_score ||
                                  0}
                              </div>

                              <div>
                                M:
                                {" "}
                                {item.methodology_score ||
                                  0}
                              </div>

                              <div>
                                R:
                                {" "}
                                {item.relevance_score ||
                                  0}
                              </div>

                            </div>

                          </td> */}

                          {/* DATE */}
                          <td>

                            <div className="fw-semibold">

                              {item.updated_at
                                ? new Date(
                                    item.updated_at
                                  ).toLocaleDateString()
                                : "-"}

                            </div>

                            <small className="text-muted">

                              {item.updated_at
                                ? new Date(
                                    item.updated_at
                                  ).toLocaleTimeString()
                                : ""}

                            </small>

                          </td>

                          {/* ACTION */}
                          <td className="text-center">

                            <button
                              className="action-btn"
                              onClick={() =>
                                setSelectedReview(
                                  item
                                )
                              }
                            >

                              <i className="fas fa-eye"></i>

                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* ================= PAGINATION ================= */}
              <div className="pagination-wrapper">

                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                >
                  Previous
                </button>

                <div className="page-info">

                  Page
                  {" "}
                  {currentPage}
                  {" "}
                  of
                  {" "}
                  {totalPages}

                </div>

                <button
                  className="page-btn"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            </>

          )}

        </div>

        {/* ================= MODAL ================= */}
        {selectedReview && (

          <div className="custom-modal-overlay">

            <div className="custom-modal">

              {/* HEADER */}
              <div className="custom-modal-header">

                <div>

                  <h2>
                    Review Details
                  </h2>

                  <p>
                    Complete reviewer activity details
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

                    <span
                      className={`status-pill ${getStatusClass(
                        selectedReview.status
                      )}`}
                    >
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
                      📘
                    </div>

                    <div className="info-label">
                      Manuscript
                    </div>

                    <div className="info-value">

                      {selectedReview.title}

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

                      {selectedReview.language ||
                        "-"}

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

                      {selectedReview.recommendation ||
                        "-"}

                    </div>

                  </div>

                  <div className="info-card">

                    <div className="info-icon">
                      📅
                    </div>

                    <div className="info-label">
                      Last Updated
                    </div>

                    <div className="info-value">

                      {selectedReview.updated_at
                        ? new Date(
                            selectedReview.updated_at
                          ).toLocaleDateString()
                        : "-"}

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

                        {selectedReview.originality_score ||
                          0}

                      </div>

                      <div className="score-progress">

                        <div
                          className="score-progress-fill bg-primary"
                          style={{
                            width:
                              scorePercent(
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

                        {selectedReview.clarity_score ||
                          0}

                      </div>

                      <div className="score-progress">

                        <div
                          className="score-progress-fill bg-success"
                          style={{
                            width:
                              scorePercent(
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

                        {selectedReview.methodology_score ||
                          0}

                      </div>

                      <div className="score-progress">

                        <div
                          className="score-progress-fill bg-warning"
                          style={{
                            width:
                              scorePercent(
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

                        {selectedReview.relevance_score ||
                          0}

                      </div>

                      <div className="score-progress">

                        <div
                          className="score-progress-fill bg-danger"
                          style={{
                            width:
                              scorePercent(
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

                  <div className="section-card">

                    <div className="section-header">
                      Comments For Author
                    </div>

                    <div className="review-note">

                      {selectedReview.comments_for_author ||
                        "No comments available"}

                    </div>

                  </div>

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
          }

          .review-header h1{
            font-size:32px;
            font-weight:700;
            margin-bottom:8px;
          }

          .review-stat-card{
            width:160px;
            height:120px;
            border-radius:24px;
            background:rgba(255,255,255,.08);
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
          }

          .review-stat-card span{
            font-size:42px;
            font-weight:700;
          }

          .filter-card{
            background:white;
            border-radius:24px;
            padding:24px;
            margin-bottom:24px;
            display:grid;
            grid-template-columns:2fr 1fr 1fr;
            gap:20px;
          }

          .filter-item label{
            font-size:14px;
            font-weight:600;
            margin-bottom:8px;
            display:block;
            color:#334155;
          }

          .review-table-card{
            background:white;
            border-radius:28px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(15,23,42,.06);
          }

          .review-table thead{
            background:#f8fafc;
          }

          .review-table thead th{
            padding:18px;
            border:none;
            font-size:13px;
            font-weight:700;
            text-transform:uppercase;
          }

          .review-table tbody td{
            padding:18px;
            border-bottom:1px solid #f1f5f9;
          }

          .review-table tbody tr:hover{
            background:#f8fafc;
          }

          .manuscript-title{
            font-weight:600;
            color:#0f172a;
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

          .status-pill.danger{
            background:#fee2e2;
            color:#b91c1c;
          }

          .status-pill.warning{
            background:#fef3c7;
            color:#92400e;
          }

          .status-pill.primary{
            background:#dbeafe;
            color:#1d4ed8;
          }

          .status-pill.secondary{
            background:#e2e8f0;
            color:#334155;
          }

          .recommendation-pill{
            padding:8px 14px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
            background:#ede9fe;
            color:#6d28d9;
          }

          .score-mini{
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:4px;
            font-size:12px;
            font-weight:600;
          }

          .action-btn{
            width:42px;
            height:42px;
            border:none;
            border-radius:14px;
            background:#f1f5f9;
          }

          .pagination-wrapper{
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:24px;
          }

          .page-btn{
            border:none;
            padding:10px 18px;
            border-radius:12px;
            background:#0f172a;
            color:white;
          }

          .page-btn:disabled{
            opacity:.4;
          }

          .custom-modal-overlay{
            position:fixed;
            inset:0;
            background:rgba(15,23,42,.6);
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

          .review-title-card,
          .section-card,
          .info-card{
            background:white;
            border-radius:24px;
            box-shadow:0 5px 20px rgba(15,23,42,.05);
          }

          .review-title-card{
            padding:28px;
            margin-bottom:24px;
          }

          .review-info-grid{
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:20px;
            margin-bottom:24px;
          }

          .info-card{
            padding:24px;
            text-align:center;
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
          }

          .section-card{
            padding:24px;
            margin-bottom:24px;
          }

          .section-header{
            font-size:20px;
            font-weight:700;
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

          .score-value{
            font-size:42px;
            font-weight:700;
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
          }

          .custom-modal-footer{
            background:white;
            padding:24px 32px;
            border-top:1px solid #f1f5f9;
            display:flex;
            justify-content:flex-end;
          }

          .loading-area,
          .empty-area{
            padding:80px;
            text-align:center;
          }

          @media(max-width:992px){

            .filter-card{
              grid-template-columns:1fr;
            }

            .review-info-grid,
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

            .review-info-grid,
            .score-grid{
              grid-template-columns:1fr;
            }

          }

        `}</style>

      </div>

    </MainLayout>
  );
}