// src/ebook/pages/AuthorDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";

import { listMyEbooks } from "../../api/ebooks.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

export default function AuthorDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    profile: null,
    manuscripts: [],
    recentActivities: [],
    earnings: { labels: [], values: [], total: 0, bpcPaid: 0, bpcWaived: 0, royalties: 0 },
    citations: { labels: [], values: [], total: 0, bySource: [] },
    notifications: [],
    stats: { published: 0, inReview: 0, revisions: 0, drafts: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("6months");
  const [refreshing, setRefreshing] = useState(false);

  // ---------- Helpers ----------
  const safeDate = (d) => {
    if (!d) return null;
    const x = new Date(d);
    return Number.isNaN(x.getTime()) ? null : x;
  };

  const timeAgo = (date) => {
    if (!date) return "—";
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.max(0, Math.floor(seconds)) + " seconds ago";
  };

  const getLastNMonths = (n) => {
    const months = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        fullName: d.toLocaleString("default", { month: "long", year: "numeric" }),
        shortName: d.toLocaleString("default", { month: "short" }),
      });
    }
    return months;
  };

  const calculateTotalDownloads = (manuscripts) => manuscripts.reduce((sum, ms) => sum + (ms.downloads || 0), 0);
  const calculateTotalCitations = (manuscripts) => manuscripts.reduce((sum, ms) => sum + (ms.citations || 0), 0);

  const calculateHIndex = (manuscripts) => {
    const citations = manuscripts.map((ms) => ms.citations || 0).sort((a, b) => b - a);
    let h = 0;
    for (let i = 0; i < citations.length; i++) {
      if (citations[i] >= i + 1) h = i + 1;
      else break;
    }
    return h;
  };

  const generateActivitiesFromManuscripts = (manuscripts) => {
    const activities = [];

    manuscripts.forEach((ms) => {
      const sub = safeDate(ms.submitted_at);
      const upd = safeDate(ms.updated_at);

      if (sub) {
        activities.push({
          id: `sub-${ms.ebook_id}`,
          action: "submitted",
          target: ms.title || "Untitled",
          time: timeAgo(sub),
          icon: "fa-upload",
          color: "primary",
          timestamp: sub,
        });
      }

      if (upd && (!sub || sub.getTime() !== upd.getTime())) {
        activities.push({
          id: `upd-${ms.ebook_id}`,
          action: ms.status === "PUBLISHED" ? "published" : "updated",
          target: ms.title || "Untitled",
          time: timeAgo(upd),
          icon: ms.status === "PUBLISHED" ? "fa-check" : "fa-edit",
          color: ms.status === "PUBLISHED" ? "success" : "info",
          timestamp: upd,
        });
      }
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
  };

  const generateNotifications = (manuscripts) => {
    const notifications = [];
    const now = new Date();

    manuscripts.forEach((ms) => {
      // Revision deadline warning
      if (ms.status === "REVISION_REQUESTED" && ms.revision_deadline) {
        const deadline = safeDate(ms.revision_deadline);
        if (deadline) {
          const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 7 && daysLeft > 0) {
            notifications.push({
              id: `rev-${ms.ebook_id}`,
              type: "deadline",
              message: `Revision deadline approaching for "${ms.title || "Untitled"}"`,
              time: `${daysLeft} days left`,
              urgent: daysLeft <= 3,
              link: `/ebook/${ms.ebook_id}/revision`,
            });
          }
        }
      }

      // Review updates (if your API provides review_count)
      if (ms.status === "UNDER_REVIEW" && (ms.review_count || 0) > 0) {
        notifications.push({
          id: `review-${ms.ebook_id}`,
          type: "review",
          message: `New review comments received for "${ms.title || "Untitled"}"`,
          time: "New",
          urgent: false,
          link: `/ebook/${ms.ebook_id}`,
        });
      }
    });

    return notifications.slice(0, 10);
  };

  const generateEarningsData = () => {
    const months = getLastNMonths(6);
    return {
      labels: months.map((m) => m.shortName),
      values: months.map(() => Math.floor(Math.random() * 3000) + 2000),
      total: 20900,
      bpcPaid: 2,
      bpcWaived: 1,
      royalties: 12500,
    };
  };

  const generateCitationsData = () => {
    const months = getLastNMonths(6);
    return {
      labels: months.map((m) => m.shortName),
      values: months.map((_, i) => 45 + i * 15 + Math.floor(Math.random() * 10)),
      total: 845,
      bySource: [
        { source: "Journal Articles", count: 452, color: "#3498db" },
        { source: "Conference Papers", count: 215, color: "#2ecc71" },
        { source: "Books", count: 128, color: "#f39c12" },
        { source: "Theses", count: 50, color: "#e74c3c" },
      ],
    };
  };

  const getStatusBadge = (status) => {
    const badges = {
      PUBLISHED: { class: "badge-success", text: "Published", icon: "fa-check-circle" },
      ACCEPTED: { class: "badge-success", text: "Accepted", icon: "fa-check" },
      UNDER_REVIEW: { class: "badge-warning", text: "Under Review", icon: "fa-clock" },
      SCREENING: { class: "badge-info", text: "Screening", icon: "fa-search" },
      SUBMITTED: { class: "badge-primary", text: "Submitted", icon: "fa-file" },
      REVISION_REQUESTED: { class: "badge-warning", text: "Revision Required", icon: "fa-edit" },
      DRAFT: { class: "badge-secondary", text: "Draft", icon: "fa-pencil-alt" },
      REJECTED: { class: "badge-danger", text: "Rejected", icon: "fa-times-circle" },
    };
    return badges[status] || { class: "badge-secondary", text: status || "Unknown", icon: "fa-file" };
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return "bg-danger";
    if (progress < 60) return "bg-warning";
    if (progress < 90) return "bg-info";
    return "bg-success";
  };

  const getManuscriptProgress = (ms) => {
    if (ms.status === "PUBLISHED") return 100;
    if (ms.status === "ACCEPTED") return 90;
    if (ms.status === "UNDER_REVIEW") return 60;
    if (ms.status === "SCREENING") return 40;
    if (ms.status === "SUBMITTED") return 30;
    if (ms.status === "REVISION_REQUESTED") return 50;
    if (ms.status === "DRAFT") return 20;
    return 0;
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 18, font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          titleFont: { size: 13, weight: "bold" },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 6,
          displayColors: true,
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.06)" } },
        x: { grid: { display: false } },
      },
    }),
    []
  );

  // ---------- Data Fetch ----------
  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      const manuscriptsRes = await listMyEbooks();
      if (!manuscriptsRes.success) throw new Error(manuscriptsRes.message || "Failed to fetch manuscripts");

      const manuscripts = manuscriptsRes.data || [];

      const stats = {
        published: manuscripts.filter((m) => m.status === "PUBLISHED").length,
        inReview: manuscripts.filter((m) => ["SUBMITTED", "SCREENING", "UNDER_REVIEW"].includes(m.status)).length,
        revisions: manuscripts.filter((m) => m.status === "REVISION_REQUESTED").length,
        drafts: manuscripts.filter((m) => m.status === "DRAFT").length,
      };

      const activities = generateActivitiesFromManuscripts(manuscripts);
      const notifications = generateNotifications(manuscripts);

      const earnings = generateEarningsData(); // replace later with API
      const citations = generateCitationsData(); // replace later with API

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const profile = {
        name: user.full_name || "Author",
        orcid: user.orcid || "—",
        affiliation: user.affiliation || "—",
        email: user.email || "—",
        memberSince: user.created_at
          ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
          : "—",
        totalPublications: stats.published,
        totalDownloads: calculateTotalDownloads(manuscripts),
        hIndex: calculateHIndex(manuscripts),
        citations: calculateTotalCitations(manuscripts),
        researchAreas: user.research_areas || [],
        avatar: (user.full_name || "AU")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      };

      setDashboardData({
        profile,
        manuscripts,
        recentActivities: activities,
        earnings,
        citations,
        notifications,
        stats,
      });

      setError(null);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  // ---------- Chart Data ----------
  const earningsChartData = useMemo(
    () => ({
      labels: dashboardData.earnings.labels,
      datasets: [
        {
          label: "Monthly Earnings",
          data: dashboardData.earnings.values,
          borderColor: "rgb(40, 167, 69)",
          backgroundColor: "rgba(40, 167, 69, 0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    }),
    [dashboardData.earnings]
  );

  const citationsTrendData = useMemo(
    () => ({
      labels: dashboardData.citations.labels,
      datasets: [
        {
          label: "Monthly Citations",
          data: dashboardData.citations.values,
          borderColor: "rgb(0, 123, 255)",
          backgroundColor: "rgba(0, 123, 255, 0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    }),
    [dashboardData.citations]
  );

  const citationsBySourceData = useMemo(
    () => ({
      labels: dashboardData.citations.bySource.map((x) => x.source),
      datasets: [
        {
          data: dashboardData.citations.bySource.map((x) => x.count),
          backgroundColor: dashboardData.citations.bySource.map((x) => x.color),
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    }),
    [dashboardData.citations.bySource]
  );

  const citationGrowth = useMemo(() => {
    const vals = dashboardData.citations.values || [];
    if (vals.length < 2 || vals[0] === 0) return 0;
    const g = (vals[vals.length - 1] / vals[0] - 1) * 100;
    return Math.round(g);
  }, [dashboardData.citations.values]);

  // ---------- UI ----------
  if (loading) {
    return (
      <MainLayout>
        <div className="content-wrapper">
          <section className="content">
            <div className="container-fluid">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
                  <div className="text-muted mt-3">Loading your dashboard...</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="content-wrapper">
          <section className="content">
            <div className="container-fluid">
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle mr-2" />
                {error}
                <button className="btn btn-sm btn-danger ml-3" onClick={handleRefresh}>
                  <i className="fas fa-sync-alt mr-1" /> Retry
                </button>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  const profile = dashboardData.profile;

  return (
    <MainLayout>
      <div className="content-header">
        {/* Header */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 className="m-0">
                  <i className="fas fa-tachometer-alt mr-2" />
                  Author Dashboard
                </h1>
                <div className="text-muted">Overview of your submissions, activity, and performance</div>
              </div>

              <div className="mt-2 mt-sm-0 d-flex align-items-center" style={{ gap: 10 }}>
                <button className="btn btn-outline-primary" onClick={handleRefresh} disabled={refreshing}>
                  <i className={`fas fa-sync-alt mr-2 ${refreshing ? "fa-spin" : ""}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>

                <select
                  className="form-control"
                  style={{ width: 180 }}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="ytd">Year to Date</option>
                  <option value="all">All Time</option>
                </select>

                <button className="btn btn-primary" onClick={() => navigate("/ebook/submit")}>
                  <i className="fas fa-plus mr-2" />
                  New Submission
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="content">
          <div className="container-fluid">
            {/* Profile Card */}
            {profile && (
              <div className="card card-primary card-outline">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center">
                        <div className="author-avatar-pro">
                          <span>{profile.avatar}</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="mb-1">{profile.name}</h3>
                          <div className="text-muted">
                            <i className="fas fa-university mr-2" />
                            {profile.affiliation}
                          </div>
                          <div className="mt-2">
                            <span className="badge badge-info mr-2">
                              <i className="fab fa-orcid mr-1" />
                              {profile.orcid}
                            </span>
                            <span className="badge badge-secondary">
                              <i className="far fa-calendar-alt mr-1" />
                              Member since {profile.memberSince}
                            </span>
                          </div>

                          {Array.isArray(profile.researchAreas) && profile.researchAreas.length > 0 && (
                            <div className="mt-3">
                              {profile.researchAreas.slice(0, 6).map((area, idx) => (
                                <span key={idx} className="badge badge-light mr-2 mb-2 p-2">
                                  <i className="fas fa-tag mr-1" />
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 mt-3 mt-md-0">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="kpi">
                            <div className="kpi-value text-primary">{profile.totalPublications}</div>
                            <div className="kpi-label">Publications</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="kpi">
                            <div className="kpi-value text-success">{profile.totalDownloads.toLocaleString()}</div>
                            <div className="kpi-label">Downloads</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="kpi">
                            <div className="kpi-value text-info">{profile.hIndex}</div>
                            <div className="kpi-label">h-index</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-muted small mt-2">
                        Total citations: <b>{profile.citations}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Small Boxes */}
            <div className="row">
              <div className="col-lg-3 col-6">
                <div className="small-box bg-info">
                  <div className="inner">
                    <h3>{dashboardData.stats.published}</h3>
                    <p>Published</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-book" />
                  </div>
                  <button className="small-box-footer btn btn-link text-white p-0" onClick={() => setActiveTab("manuscripts")}>
                    View manuscripts <i className="fas fa-arrow-circle-right" />
                  </button>
                </div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="small-box bg-warning">
                  <div className="inner">
                    <h3>{dashboardData.stats.inReview}</h3>
                    <p>In Review</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-clock" />
                  </div>
                  <button className="small-box-footer btn btn-link text-white p-0" onClick={() => setActiveTab("manuscripts")}>
                    Track status <i className="fas fa-arrow-circle-right" />
                  </button>
                </div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="small-box bg-success">
                  <div className="inner">
                    <h3>{profile?.citations || 0}</h3>
                    <p>Total Citations</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-quote-right" />
                  </div>
                  <div className="small-box-footer text-white">
                    Growth {citationGrowth > 0 ? `↑ ${citationGrowth}%` : "—"}
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="small-box bg-danger">
                  <div className="inner">
                    <h3>{dashboardData.notifications.filter((n) => n.urgent).length}</h3>
                    <p>Urgent Actions</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-exclamation-triangle" />
                  </div>
                  <button className="small-box-footer btn btn-link text-white p-0" onClick={() => setActiveTab("notifications")}>
                    View alerts <i className="fas fa-arrow-circle-right" />
                  </button>
                </div>
              </div>
            </div>

            {/* Urgent Callout */}
            {dashboardData.notifications.filter((n) => n.urgent).length > 0 && (
              <div className="callout callout-danger">
                <h5 className="mb-2">
                  <i className="fas fa-exclamation-triangle mr-2" />
                  Attention Required
                </h5>
                {dashboardData.notifications
                  .filter((n) => n.urgent)
                  .map((n) => (
                    <div key={n.id} className="d-flex justify-content-between align-items-center flex-wrap mb-1">
                      <div>
                        • {n.message} <b>({n.time})</b>
                      </div>
                      {n.link ? (
                        <button className="btn btn-sm btn-danger" onClick={() => navigate(n.link)}>
                          View
                        </button>
                      ) : null}
                    </div>
                  ))}
              </div>
            )}

            {/* Tabs (AdminLTE Pro style = nav-pills inside card header) */}
            <div className="card">
              <div className="card-header p-2">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
                      <i className="fas fa-home mr-1" /> Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === "manuscripts" ? "active" : ""}`} onClick={() => setActiveTab("manuscripts")}>
                      <i className="fas fa-file-alt mr-1" /> Manuscripts{" "}
                      <span className="badge badge-light ml-2">{dashboardData.manuscripts.length}</span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
                      <i className="fas fa-chart-line mr-1" /> Analytics
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
                      <i className="fas fa-bell mr-1" /> Notifications{" "}
                      {dashboardData.notifications.length > 0 ? <span className="badge badge-danger ml-2">{dashboardData.notifications.length}</span> : null}
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="row">
                    {/* Manuscripts table */}
                    <div className="col-md-8">
                      <div className="card card-outline card-primary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-tasks mr-2" />
                            Submission Pipeline
                          </h3>
                          <div className="card-tools">
                            <button className="btn btn-sm btn-primary" onClick={() => navigate("/ebook/submit")}>
                              <i className="fas fa-plus mr-1" /> New
                            </button>
                          </div>
                        </div>

                        <div className="card-body p-0">
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th>Title</th>
                                  <th>Status</th>
                                  <th style={{ width: 180 }}>Progress</th>
                                  <th>Submitted</th>
                                  <th className="text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(dashboardData.manuscripts || []).slice(0, 6).map((ms) => {
                                  const badge = getStatusBadge(ms.status);
                                  const progress = getManuscriptProgress(ms);
                                  const submitted = safeDate(ms.submitted_at);

                                  return (
                                    <tr key={ms.ebook_id}>
                                      <td>
                                        <div className="font-weight-bold">{ms.title || "Untitled"}</div>
                                        <div className="text-muted small">
                                          <i className="fas fa-hashtag mr-1" />
                                          {String(ms.ebook_id || "").slice(0, 8)}...
                                        </div>
                                      </td>

                                      <td>
                                        <span className={`badge ${badge.class} p-2 text-uppercase`}>
                                          <i className={`fas ${badge.icon} mr-1`} />
                                          {badge.text}
                                        </span>
                                      </td>

                                      <td>
                                        <div className="progress progress-xs mb-1">
                                          <div className={`progress-bar ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="text-muted small">{progress}%</div>
                                      </td>

                                      <td>
                                        <div className="text-muted small">{submitted ? submitted.toLocaleDateString() : "—"}</div>
                                      </td>

                                      <td className="text-right">
                                        <button className="btn btn-xs btn-info mr-1" onClick={() => navigate(`/ebook/${ms.ebook_id}`)} title="View">
                                          <i className="fas fa-eye" />
                                        </button>
                                        {(ms.status === "DRAFT" || ms.status === "REVISION_REQUESTED") && (
                                          <button className="btn btn-xs btn-warning" onClick={() => navigate(`/ebook/${ms.ebook_id}/edit`)} title="Edit">
                                            <i className="fas fa-edit" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}

                                {dashboardData.manuscripts.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">
                                      <i className="fas fa-inbox mr-2" />
                                      No manuscripts yet. Click <b>New</b> to submit your first one.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {dashboardData.manuscripts.length > 6 && (
                          <div className="card-footer text-center">
                            <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("manuscripts")}>
                              View all ({dashboardData.manuscripts.length})
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity feed */}
                    <div className="col-md-4">
                      <div className="card card-outline card-secondary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-history mr-2" />
                            Activity Feed
                          </h3>
                        </div>

                        <div className="card-body p-0">
                          <ul className="products-list product-list-in-card pl-2 pr-2">
                            {dashboardData.recentActivities.map((a) => (
                              <li key={a.id} className="item">
                                <div className="product-img">
                                  <span className={`badge badge-${a.color} activity-dot`}>
                                    <i className={`fas ${a.icon}`} />
                                  </span>
                                </div>
                                <div className="product-info">
                                  <span className="product-title">
                                    You {a.action}{" "}
                                    <span className="text-primary">{a.target.length > 26 ? a.target.slice(0, 26) + "..." : a.target}</span>
                                    <span className="float-right text-muted text-sm">{a.time}</span>
                                  </span>
                                  <span className="product-description text-muted">Submission workflow update</span>
                                </div>
                              </li>
                            ))}

                            {dashboardData.recentActivities.length === 0 && (
                              <li className="item text-center text-muted py-4">
                                <i className="fas fa-inbox mr-2" />
                                No recent activity
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div className="info-box bg-light">
                        <span className="info-box-icon bg-primary">
                          <i className="fas fa-file-alt" />
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Drafts</span>
                          <span className="info-box-number">{dashboardData.stats.drafts}</span>
                          <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => navigate("/ebook/drafts")}>
                            Continue drafts
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="col-md-6">
                      <div className="card card-outline card-success">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-dollar-sign mr-2" />
                            Earnings (Mock)
                          </h3>
                          <div className="card-tools text-muted small">Total: ${dashboardData.earnings.total}</div>
                        </div>
                        <div className="card-body">
                          <div style={{ height: 260 }}>
                            <Line data={earningsChartData} options={chartOptions} />
                          </div>

                          <div className="row mt-3">
                            <div className="col-4 text-center">
                              <div className="text-muted small">BPC Paid</div>
                              <div className="font-weight-bold">{dashboardData.earnings.bpcPaid}</div>
                            </div>
                            <div className="col-4 text-center">
                              <div className="text-muted small">BPC Waived</div>
                              <div className="font-weight-bold">{dashboardData.earnings.bpcWaived}</div>
                            </div>
                            <div className="col-4 text-center">
                              <div className="text-muted small">Royalties</div>
                              <div className="font-weight-bold">${dashboardData.earnings.royalties}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card card-outline card-primary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-quote-right mr-2" />
                            Citations (Mock)
                          </h3>
                          <div className="card-tools text-muted small">Total: {dashboardData.citations.total}</div>
                        </div>

                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div style={{ height: 220 }}>
                                <Doughnut
                                  data={citationsBySourceData}
                                  options={{
                                    ...chartOptions,
                                    plugins: { ...chartOptions.plugins, legend: { display: false } },
                                  }}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <table className="table table-sm mb-0">
                                <tbody>
                                  {dashboardData.citations.bySource.map((x, i) => (
                                    <tr key={i}>
                                      <td style={{ width: 18 }}>
                                        <span className="badge" style={{ backgroundColor: x.color, width: 12, height: 12 }} />
                                      </td>
                                      <td>{x.source}</td>
                                      <td className="text-right font-weight-bold">{x.count}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="text-muted small mt-2">Replace with real analytics API when ready.</div>
                            </div>
                          </div>

                          <hr />

                          <div style={{ height: 220 }}>
                            <Line data={citationsTrendData} options={chartOptions} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MANUSCRIPTS TAB */}
                {activeTab === "manuscripts" && (
                  <div className="card card-outline card-primary">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-file-alt mr-2" />
                        All Manuscripts
                      </h3>
                      <div className="card-tools">
                        <button className="btn btn-sm btn-primary" onClick={() => navigate("/ebook/submit")}>
                          <i className="fas fa-plus mr-1" /> New Submission
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th style={{ width: 55 }}>#</th>
                              <th>Title</th>
                              <th>Status</th>
                              <th style={{ width: 220 }}>Stage</th>
                              <th>Submitted</th>
                              <th className="text-right">Downloads</th>
                              <th className="text-right">Citations</th>
                              <th className="text-right">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {dashboardData.manuscripts.map((ms, idx) => {
                              const badge = getStatusBadge(ms.status);
                              const progress = getManuscriptProgress(ms);
                              const submitted = safeDate(ms.submitted_at);

                              return (
                                <tr key={ms.ebook_id}>
                                  <td>{idx + 1}</td>
                                  <td>
                                    <div className="font-weight-bold">{ms.title || "Untitled"}</div>
                                    <div className="text-muted small">ID: {String(ms.ebook_id).slice(0, 8)}...</div>
                                  </td>
                                  <td>
                                    <span className={`badge ${badge.class} p-2 text-uppercase`}>
                                      <i className={`fas ${badge.icon} mr-1`} />
                                      {badge.text}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="text-muted small">{ms.stage || "Processing"}</div>
                                    <div className="progress progress-xs mt-2">
                                      <div className={`progress-bar ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
                                    </div>
                                  </td>
                                  <td className="text-muted small">{submitted ? submitted.toLocaleDateString() : "—"}</td>
                                  <td className="text-right">{(ms.downloads || 0).toLocaleString()}</td>
                                  <td className="text-right">{(ms.citations || 0).toLocaleString()}</td>
                                  <td className="text-right">
                                    <div className="btn-group">
                                      <button className="btn btn-xs btn-info" onClick={() => navigate(`/ebook/${ms.ebook_id}`)} title="View">
                                        <i className="fas fa-eye" />
                                      </button>
                                      {(ms.status === "DRAFT" || ms.status === "REVISION_REQUESTED") && (
                                        <button
                                          className="btn btn-xs btn-warning"
                                          onClick={() => navigate(`/ebook/${ms.ebook_id}/edit`)}
                                          title="Edit"
                                        >
                                          <i className="fas fa-edit" />
                                        </button>
                                      )}
                                      {ms.status === "REVISION_REQUESTED" && (
                                        <button
                                          className="btn btn-xs btn-primary"
                                          onClick={() => navigate(`/ebook/${ms.ebook_id}/revision`)}
                                          title="Submit Revision"
                                        >
                                          <i className="fas fa-undo-alt" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                            {dashboardData.manuscripts.length === 0 && (
                              <tr>
                                <td colSpan={8} className="text-center text-muted py-5">
                                  <i className="fas fa-inbox mr-2" />
                                  No manuscripts found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === "analytics" && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card card-outline card-primary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-chart-line mr-2" />
                            Citation Trend (Mock)
                          </h3>
                        </div>
                        <div className="card-body">
                          <div style={{ height: 320 }}>
                            <Line data={citationsTrendData} options={chartOptions} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card card-outline card-success">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-chart-pie mr-2" />
                            Performance KPIs
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-6">
                              <div className="info-box bg-light">
                                <span className="info-box-icon bg-success">
                                  <i className="fas fa-download" />
                                </span>
                                <div className="info-box-content">
                                  <span className="info-box-text">Downloads</span>
                                  <span className="info-box-number">{profile?.totalDownloads?.toLocaleString() || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="info-box bg-light">
                                <span className="info-box-icon bg-info">
                                  <i className="fas fa-quote-right" />
                                </span>
                                <div className="info-box-content">
                                  <span className="info-box-text">Citations</span>
                                  <span className="info-box-number">{profile?.citations?.toLocaleString() || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="info-box bg-light">
                                <span className="info-box-icon bg-primary">
                                  <i className="fas fa-award" />
                                </span>
                                <div className="info-box-content">
                                  <span className="info-box-text">h-index</span>
                                  <span className="info-box-number">{profile?.hIndex || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="info-box bg-light">
                                <span className="info-box-icon bg-warning">
                                  <i className="fas fa-star" />
                                </span>
                                <div className="info-box-content">
                                  <span className="info-box-text">i10-index</span>
                                  <span className="info-box-number">{(profile?.hIndex || 0) + 3}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="callout callout-info mb-0">
                            <div className="small text-muted">
                              These analytics are mocked for now. When you add real APIs, just replace `generateEarningsData()` and
                              `generateCitationsData()`.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && (
                  <div className="card card-outline card-primary">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-bell mr-2" />
                        Notifications
                      </h3>
                      <div className="card-tools">
                        <button className="btn btn-sm btn-secondary" onClick={() => alert("Mark all read: connect backend later")}>
                          <i className="fas fa-check-double mr-1" /> Mark all read
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-0">
                      <div className="list-group list-group-flush">
                        {dashboardData.notifications.length > 0 ? (
                          dashboardData.notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`list-group-item d-flex justify-content-between align-items-center flex-wrap ${
                                n.urgent ? "list-group-item-danger" : ""
                              }`}
                            >
                              <div>
                                <div className="font-weight-bold mb-1">
                                  {n.urgent ? <i className="fas fa-exclamation-circle text-danger mr-2" /> : <i className="far fa-bell mr-2" />}
                                  {n.message}
                                </div>
                                <div className="text-muted small">{n.time}</div>
                              </div>

                              <div className="mt-2 mt-sm-0">
                                {n.link ? (
                                  <button className={`btn btn-sm ${n.urgent ? "btn-danger" : "btn-primary"} mr-2`} onClick={() => navigate(n.link)}>
                                    View
                                  </button>
                                ) : null}
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => alert("Dismiss: connect backend later")}>
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted py-5">
                            <i className="fas fa-bell-slash fa-3x mb-3" />
                            <div className="font-weight-bold">No notifications</div>
                            <div className="small">You're all caught up.</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-bolt mr-2" />
                  Quick Actions
                </h3>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 col-sm-6 col-12 mb-2">
                    <button className="btn btn-block btn-primary" onClick={() => navigate("/ebook/submit")}>
                      <i className="fas fa-upload mr-2" />
                      Submit New
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 col-12 mb-2">
                    <button className="btn btn-block btn-warning" onClick={() => navigate("/ebook/drafts")}>
                      <i className="fas fa-pencil-alt mr-2" />
                      Continue Draft
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 col-12 mb-2">
                    <button className="btn btn-block btn-success" onClick={() => window.open("/author-guide", "_blank")}>
                      <i className="fas fa-book-open mr-2" />
                      Guidelines
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 col-12 mb-2">
                    <button className="btn btn-block btn-info" onClick={() => window.open("/faq", "_blank")}>
                      <i className="fas fa-question-circle mr-2" />
                      Help
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Styles */}
            <style>{`
              .author-avatar-pro{
                width:82px;height:82px;border-radius:999px;
                display:flex;align-items:center;justify-content:center;
                color:#fff;font-weight:800;font-size:30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 10px 20px rgba(0,0,0,0.12);
              }
              .kpi .kpi-value{font-size:26px;font-weight:800;line-height:1;}
              .kpi .kpi-label{color:#6c757d;font-size:12px;margin-top:6px;}
              .activity-dot{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;}
              .small-box{border-radius:14px; overflow:hidden;}
              .small-box:hover{transform: translateY(-3px); transition: .2s ease; box-shadow: 0 12px 26px rgba(0,0,0,0.12);}
              .card{border-radius:14px;}
              .card-header{border-top-left-radius:14px;border-top-right-radius:14px;}
              .nav-pills .nav-link{border-radius:10px;}
              .progress-xs{height:.35rem;}
            `}</style>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}