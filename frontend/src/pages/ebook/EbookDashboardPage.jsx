import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

const normalizeRoleName = (value) =>
  (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");

const ROLE_TO_PANEL = {
  EBOOK_ADMIN: "admin",
  EBOOK_AUTHOR: "author",
  EBOOK_EDITOR: "editor",
  EBOOK_REVIEWER: "reviewer",
  EBOOK_FINANCE: "finance",
  EBOOK_DIGITAL_CONTENT_MANAGER: "production",
  EBOOK_DCM: "production",
  PUBLIC_READER: "reader",
  EBOOK_PUBLIC_READER: "reader",
};


// ebook reviewer
const PANEL_META = {
  admin: {
    title: "ORA eBook Publishing administration overview",
    subtitle:
      "Monitor every workflow area, jump to configuration tools, and supervise the full publishing operation.",
    links: [
      { label: "Admin tools", to: "/ebook/admin", style: "dark" },
      { label: "All submissions", to: "/ebook/submissions", style: "primary" },
      {
        label: "Publication management",
        to: "/ebook/management/publications",
        style: "outline-secondary",
      },
    ],
  },
  author: {
    title: "My eBook Dashboard",
    subtitle:
      "Manage your submitted manuscripts, track revisions, payments, and published works.",
    links: [
      {
        label: "My Submissions",
        to: "/ebook/manuscripts/my-submissions",
        style: "primary",
      },
      {
        label: "Revision Requests",
        to: "/ebook/my-revisions",
        style: "warning",
      },
      { label: "Payments", to: "/ebook/my-payments", style: "danger" },
      { label: "Proof Approvals", to: "/ebook/my-proofs", style: "success" },
      { label: "Published Works", to: "/ebook/my-published", style: "info" },
      {
        label: "Create New Submission",
        to: "/ebook/submissions/create",
        style: "outline-secondary",
      },
    ],
  },
  editor: {
    title: "ORA eBook Editor dashboard",
    subtitle:
      "Screen incoming manuscripts, manage reviewers, and keep editorial decisions moving.",
    links: [
      {
        label: "Screening queue",
        to: "/ebook/editor/screening",
        style: "primary",
      },
      {
        label: "Review monitoring",
        to: "/ebook/editor/reviews",
        style: "warning",
      },
      {
        label: "Accepted handoff",
        to: "/ebook/editor/handoff",
        style: "success",
      },
      {
        label: "Reviewer manager",
        to: "/ebook/reviewer-manager",
        style: "outline-secondary",
      },
    ],
  },
  reviewer: {
    title: "ORA eBook Reviewer dashboard",
    subtitle:
      "Review active assignments, submit recommendations, and track review progress.",
    links: [
      { label: "Reviewer workspace", to: "/ebook/reviewer", style: "primary" },
      {
        label: "Public catalog",
        to: "/ebook/publications",
        style: "outline-secondary",
      },
    ],
  },
  finance: {
    title: "ORA eBook Finance dashboard",
    subtitle:
      "Review waiver requests, verify payment proof, and clear submissions for production.",
    links: [
      { label: "Finance queue", to: "/ebook/finance", style: "danger" },
      {
        label: "All submissions",
        to: "/ebook/submissions",
        style: "outline-secondary",
      },
    ],
  },
  production: {
    title: "ORA eBook Production dashboard",
    subtitle:
      "Validate files, prepare ISBN and DOI metadata, and release approved publications.",
    links: [
      { label: "Production queue", to: "/ebook/production", style: "success" },
      {
        label: "Publication management",
        to: "/ebook/management/publications",
        style: "outline-secondary",
      },
    ],
  },
  reader: {
    title: "My Reading Dashboard",
    subtitle:
      "Browse and access eBooks you've downloaded or saved to your library.",
    links: [
      { label: "My Library", to: "/ebook/my-library", style: "primary" },
      {
        label: "Browse Catalog",
        to: "/ebook/publications",
        style: "outline-secondary",
      },
      { label: "Reading History", to: "/ebook/history", style: "outline-info" },
    ],
  },
};

function prettifyKey(key) {
  return String(key || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function StageQueueCard({ title, value, description, to, buttonLabel, tone }) {
  return (
    <div className="col-lg-3 col-md-6 mb-3">
      <div className={`card card-outline card-${tone} h-100`}>
        <div className="card-body d-flex flex-column">
          <div className="text-muted text-sm mb-2">{title}</div>
          <h2 className="mb-2">{value}</h2>
          <p className="text-muted mb-3">{description}</p>
          <Link className={`btn btn-${tone} mt-auto`} to={to}>
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EbookDashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id || user?.user_id || user?.uuid;

  const roleNames =
    user?.roles?.map((r) =>
      normalizeRoleName(r.role_name || r.name || r.code),
    ) || [];
  const panel = useMemo(
    () =>
      roleNames.map((role) => ROLE_TO_PANEL[role]).find(Boolean) || "author",
    [roleNames.join(",")],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [authorQueues, setAuthorQueues] = useState({
    revisions: 0,
    payments: 0,
    proofs: 0,
    rejected: 0,
    published: 0,
  });
  const [editorQueues, setEditorQueues] = useState({
    screening: 0,
    reviews: 0,
    handoff: 0,
    overdue: 0,
  });
  const [mySubmissions, setMySubmissions] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // For authors - get only their own submissions
        if (panel === "author") {
          // Get user's own submissions
          const mySubs = await ebookApi.listMySubmissions({
            author_id: userId,
            limit: 100,
          });

          const submissions = mySubs?.rows || [];
          setMySubmissions(submissions);

          // Calculate queue counts from user's own submissions
          const revisions = submissions.filter(
            (s) => s.stage === "revisions" || s.status === "revision_requested",
          ).length;
          const payments = submissions.filter(
            (s) => s.stage === "payments" || s.status === "payment_pending",
          ).length;
          const proofs = submissions.filter(
            (s) => s.stage === "proofs" || s.status === "proof_pending",
          ).length;
          const rejected = submissions.filter(
            (s) => s.status === "rejected",
          ).length;
          const published = submissions.filter(
            (s) => s.status === "published" || s.stage === "published",
          ).length;

          setAuthorQueues({
            revisions,
            payments,
            proofs,
            rejected,
            published,
          });

          setData({
            summary: {
              total_submissions: submissions.length,
              published_works: published,
              pending_revisions: revisions,
              under_review: submissions.filter(
                (s) => s.status === "under_review",
              ).length,
            },
            submissions: submissions,
          });
        }
        // For readers - get their downloaded/purchased books
        else if (panel === "reader") {
          const myLibrary = await ebookApi.getMyLibrary({ user_id: userId });
          const readingHistory = await ebookApi.getReadingHistory({
            user_id: userId,
          });

          setData({
            summary: {
              books_in_library: myLibrary?.rows?.length || 0,
              recently_read: readingHistory?.recent?.length || 0,
              total_downloads: myLibrary?.total_downloads || 0,
            },
            library: myLibrary?.rows || [],
            history: readingHistory?.recent || [],
          });
        }
        // For editors - get assigned manuscripts only
        else if (panel === "editor") {
          const assignedManuscripts = await ebookApi.getEditorAssignments({
            editor_id: userId,
            limit: 100,
          });

          const screening =
            assignedManuscripts?.filter((m) => m.stage === "screening") || [];
          const reviews =
            assignedManuscripts?.filter((m) => m.stage === "reviews") || [];
          const handoff =
            assignedManuscripts?.filter((m) => m.stage === "handoff") || [];

          setEditorQueues({
            screening: screening.length,
            reviews: reviews.length,
            handoff: handoff.length,
            overdue: reviews.filter((r) => r.is_overdue).length,
          });

          setData({
            summary: {
              assigned_manuscripts: assignedManuscripts.length,
              screening_queue: screening.length,
              under_review: reviews.length,
              ready_for_handoff: handoff.length,
            },
            submissions: assignedManuscripts,
          });
        }
        // For reviewers - get their review assignments only
        
     else if (panel === "reviewer") {
  try {
    const res = await ebookApi.getReviewerAssignments({ limit: 100 });

    const assignments = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.rows)
      ? res.rows
      : [];

    setData({
      summary: {
        pending_reviews: assignments.filter((a) =>
          ["assigned", "accepted"].includes(a.status)
        ).length,
        completed_reviews: assignments.filter(
          (a) => a.status === "submitted"
        ).length,
        total_assigned: assignments.length,
      },
      assignments,
    });
  } catch (error) {
    console.error("Reviewer dashboard error:", error);
    setError(
      error?.response?.data?.message || error?.message || "Failed to load dashboard data"
    );
  }
}
        // For finance - get their assigned finance items
        else if (panel === "finance") {
          const myFinanceItems = await ebookApi.getFinanceItems({
            finance_officer_id: userId,
            limit: 100,
          });

          setData({
            summary: {
              pending_verification:
                myFinanceItems?.filter((f) => f.status === "pending").length ||
                0,
              approved:
                myFinanceItems?.filter((f) => f.status === "approved").length ||
                0,
              total_processed: myFinanceItems?.length || 0,
            },
            finances: myFinanceItems || [],
          });
        }
        // For production - get their assigned production items
        else if (panel === "production") {
          const myProductionItems = await ebookApi.getProductionItems({
            production_manager_id: userId,
            limit: 100,
          });

          setData({
            summary: {
              in_production:
                myProductionItems?.filter((p) => p.status === "in_progress")
                  .length || 0,
              completed:
                myProductionItems?.filter((p) => p.status === "completed")
                  .length || 0,
              total_assigned: myProductionItems?.length || 0,
            },
            production: myProductionItems || [],
          });
        }
        // For admin - can see everything
        else if (panel === "admin") {
          const allSubmissions = await ebookApi.getAllSubmissions({
            limit: 100,
          });
          setData({
            summary: {
              total_submissions: allSubmissions?.rows?.length || 0,
              total_authors: allSubmissions?.unique_authors || 0,
              total_published:
                allSubmissions?.rows?.filter((s) => s.status === "published")
                  .length || 0,
            },
            submissions: allSubmissions?.rows || [],
          });
        }
        // Default fallback
        else {
          const result = await ebookApi.getAuthorDashboard({
            author_id: userId,
          });
          setData(result);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(
          err?.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      load();
    } else {
      setError("User not authenticated. Please log in.");
      setLoading(false);
    }
  }, [panel, userId]);

  const summary = data?.summary || {};
  const meta = PANEL_META[panel] || PANEL_META.author;

  // Get the appropriate rows based on panel type
  const getRows = () => {
    if (panel === "author") return data?.submissions || [];
    if (panel === "reader") return data?.library || [];
    if (panel === "reviewer") return data?.assignments || [];
    if (panel === "finance") return data?.finances || [];
    if (panel === "production") return data?.production || [];
    return data?.submissions || [];
  };

  const rows = getRows();
  const summaryEntries = Object.entries(summary).slice(0, 8);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="card card-outline card-primary mb-0">
          <div
            className="card-body d-flex justify-content-between align-items-start flex-wrap"
            style={{ gap: 16 }}
          >
            <div>
              <h1 className="mb-2">{meta.title}</h1>
              <p className="text-muted mb-0">{meta.subtitle}</p>
              {user?.name && (
                <small className="text-muted d-block mt-1">
                  Welcome back, {user.name || user.full_name}
                </small>
              )}
            </div>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              {meta.links.map((item) => (
                <Link
                  key={item.to}
                  className={`btn btn-${item.style}`}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="card">
          <div className="card-body">Loading your dashboard...</div>
        </div>
      ) : (
        <>
          {/* Author-specific queue cards */}
          {panel === "author" ? (
            <div className="row mb-3">
              <StageQueueCard
                title="My Submissions"
                value={summary.total_submissions || 0}
                description="All manuscripts you have submitted"
                to="/ebook/manuscripts/my-submissions"
                buttonLabel="View All"
                tone="primary"
              />
              <StageQueueCard
                title="Published Works"
                value={authorQueues.published}
                description="Your eBooks that are published and available"
                to="/ebook/my-published"
                buttonLabel="View Published"
                tone="success"
              />
              <StageQueueCard
                title="Revision Requests"
                value={authorQueues.revisions}
                description="Manuscripts waiting for your revisions"
                to="/ebook/my-revisions"
                buttonLabel="Handle Revisions"
                tone="warning"
              />
              <StageQueueCard
                title="Pending Payments"
                value={authorQueues.payments}
                description="Accepted manuscripts awaiting payment"
                to="/ebook/my-payments"
                buttonLabel="View Payments"
                tone="danger"
              />
              <StageQueueCard
                title="Proof Approvals"
                value={authorQueues.proofs}
                description="Final proofs ready for your confirmation"
                to="/ebook/my-proofs"
                buttonLabel="Review Proofs"
                tone="info"
              />
            </div>
          ) : null}

          {/* Reader-specific queue cards */}
          {panel === "reader" ? (
            <div className="row mb-3">
              <StageQueueCard
                title="My Library"
                value={summary.books_in_library || 0}
                description="Books you have downloaded or purchased"
                to="/ebook/my-library"
                buttonLabel="Browse Library"
                tone="primary"
              />
              <StageQueueCard
                title="Recently Read"
                value={summary.recently_read || 0}
                description="Continue reading where you left off"
                to="/ebook/history"
                buttonLabel="Continue Reading"
                tone="info"
              />
              <StageQueueCard
                title="Browse Catalog"
                value="Explore"
                description="Discover new eBooks from our collection"
                to="/ebook/publications"
                buttonLabel="Browse All"
                tone="success"
              />
            </div>
          ) : null}

          {/* Editor-specific queue cards */}
          {panel === "editor" ? (
            <div className="row mb-3">
              <StageQueueCard
                title="Screening Queue"
                value={editorQueues.screening}
                description="Manuscripts assigned to you for screening"
                to="/ebook/editor/screening"
                buttonLabel="Open Screening"
                tone="primary"
              />
              <StageQueueCard
                title="Under Review"
                value={editorQueues.reviews}
                description="Manuscripts you are monitoring"
                to="/ebook/editor/reviews"
                buttonLabel="Monitor Reviews"
                tone="warning"
              />
              <StageQueueCard
                title="Ready for Handoff"
                value={editorQueues.handoff}
                description="Accepted manuscripts ready for production"
                to="/ebook/editor/handoff"
                buttonLabel="Process Handoff"
                tone="success"
              />
              <StageQueueCard
                title="Overdue Reviews"
                value={editorQueues.overdue}
                description="Reviews that need follow-up"
                to="/ebook/reviewer-manager"
                buttonLabel="Follow Up"
                tone="danger"
              />
            </div>
          ) : null}

          {/* Summary Metrics Cards */}
          {summaryEntries.length > 0 ? (
            <div className="row mb-3">
              {summaryEntries.map(([key, value], index) => (
                <div className="col-md-6 col-xl-3 mb-3" key={key}>
                  <div
                    className={`card h-100 card-outline ${index % 2 === 0 ? "card-primary" : "card-info"}`}
                  >
                    <div className="card-body">
                      <div className="text-muted text-sm mb-2">
                        {prettifyKey(key)}
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <h2 className="mb-0">{value ?? 0}</h2>
                        <span className="badge badge-light">
                          {panel === "author" ? "Your data" : "Live"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row mb-3">
              <div className="col-12">
                <div className="alert alert-info border">
                  No data available yet. Start by creating your first
                  submission!
                </div>
              </div>
            </div>
          )}

          {/* Recent Items Table - Shows only user's data */}
          <div className="card card-outline card-secondary">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
              <h3 className="card-title mb-0">
                {panel === "author" && "My Recent Submissions"}
                {panel === "reader" && "Recent Books in My Library"}
                {panel === "editor" && "My Assigned Manuscripts"}
                {panel === "reviewer" && "My Review Assignments"}
                {panel === "finance" && "My Finance Items"}
                {panel === "production" && "My Production Items"}
                {(!panel || panel === "admin") && "Recent Activity"}
              </h3>
              <small className="text-muted">
                Showing only items you have access to
              </small>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Title / Item</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!rows.length ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        {panel === "author" &&
                          "You haven't submitted any eBooks yet. Click 'Create New Submission' to get started!"}
                        {panel === "reader" &&
                          "Your library is empty. Browse the catalog to add books!"}
                        {panel === "editor" &&
                          "No manuscripts assigned to you yet."}
                        {panel === "reviewer" &&
                          "No review assignments at this time."}
                        {(!panel || panel === "admin") &&
                          "No recent activity to display."}
                      </td>
                    </tr>
                  ) : (
                    rows.slice(0, 10).map((row, idx) => (
                      <tr
                        key={
                          row.submission_id ||
                          row.id ||
                          row.assignment_id ||
                          idx
                        }
                      >
                        <td>
                          <div className="font-weight-bold">
                            {row.title ||
                              row.book_title ||
                              row.invoice_number ||
                              "Workflow item"}
                          </div>
                          <small className="text-muted">
                            {row.author_name ||
                              row.authors?.join(", ") ||
                              "You"}
                          </small>
                        </td>
                        <td>
                          <StatusBadge
                            value={
                              row.status ||
                              row.payment_status ||
                              row.submission_status ||
                              "draft"
                            }
                          />
                        </td>
                        <td>
                          <small>
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString()
                              : row.date || "Recent"}
                          </small>
                        </td>
                        <td>
                          {row.submission_id ? (
                            <Link
                              className="btn btn-sm btn-outline-primary"
                              to={`/ebook/submissions/${row.submission_id}`}
                            >
                              View
                            </Link>
                          ) : row.id ? (
                            <Link
                              className="btn btn-sm btn-outline-primary"
                              to={`/ebook/items/${row.id}`}
                            >
                              Open
                            </Link>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Card for Authors */}
          {panel === "author" && authorQueues.published > 0 && (
            <div className="card mt-3 bg-success bg-opacity-10">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">🎉 Congratulations!</h5>
                    <p className="mb-0 text-muted">
                      You have {authorQueues.published} published eBook
                      {authorQueues.published !== 1 ? "s" : ""}
                      {authorQueues.published > 0 &&
                        ". Share your work with readers worldwide!"}
                    </p>
                  </div>
                  <Link to="/ebook/my-published" className="btn btn-success">
                    View Published Works
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
