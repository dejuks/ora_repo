import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const normalizeRoleName = (value) => (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");

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

const PANEL_META = {
  admin: {
    title: "Ebook administration overview",
    subtitle: "Monitor every workflow area, jump to configuration tools, and supervise the full publishing operation.",
    links: [
      { label: "Admin tools", to: "/ebook/admin", style: "dark" },
      { label: "All submissions", to: "/ebook/submissions", style: "primary" },
      { label: "Publication management", to: "/ebook/management/publications", style: "outline-secondary" },
    ],
  },
  author: {
    title: "Author dashboard",
    subtitle: "Use the stage queues below to move manuscripts from submission to revision, payment, proof approval, and publication.",
    links: [
      { label: "My submissions", to: "/ebook/my-submissions", style: "primary" },
      { label: "Revision requests", to: "/ebook/my-revisions", style: "warning" },
      { label: "Payments", to: "/ebook/my-payments", style: "danger" },
      { label: "Proof approvals", to: "/ebook/my-proofs", style: "success" },
      { label: "Rejected by editor", to: "/ebook/my-rejected", style: "dark" },
      { label: "Create submission", to: "/ebook/submissions/create", style: "outline-secondary" },
    ],
  },
  editor: {
    title: "Editor dashboard",
    subtitle: "Screen incoming manuscripts, manage reviewers, and keep editorial decisions moving.",
    links: [
      { label: "Screening queue", to: "/ebook/editor/screening", style: "primary" },
      { label: "Review monitoring", to: "/ebook/editor/reviews", style: "warning" },
      { label: "Accepted handoff", to: "/ebook/editor/handoff", style: "success" },
      { label: "Reviewer manager", to: "/ebook/reviewer-manager", style: "outline-secondary" },
    ],
  },
  reviewer: {
    title: "Reviewer dashboard",
    subtitle: "Review active assignments, submit recommendations, and track review progress.",
    links: [
      { label: "Reviewer workspace", to: "/ebook/reviewer", style: "primary" },
      { label: "Public catalog", to: "/ebook/publications", style: "outline-secondary" },
    ],
  },
  finance: {
    title: "Finance dashboard",
    subtitle: "Review waiver requests, verify payment proof, and clear submissions for production.",
    links: [
      { label: "Finance queue", to: "/ebook/finance", style: "danger" },
      { label: "All submissions", to: "/ebook/submissions", style: "outline-secondary" },
    ],
  },
  production: {
    title: "Production dashboard",
    subtitle: "Validate files, prepare ISBN and DOI metadata, and release approved publications.",
    links: [
      { label: "Production queue", to: "/ebook/production", style: "success" },
      { label: "Publication management", to: "/ebook/management/publications", style: "outline-secondary" },
    ],
  },
  reader: {
    title: "Public reader dashboard",
    subtitle: "Browse published eBooks, open detail pages, and access downloadable public files.",
    links: [
      { label: "Open public catalog", to: "/ebook/publications", style: "primary" },
    ],
  },
};

const ADMIN_LINK_GROUPS = [
  { title: "Author tools", items: [{ label: "My submissions", to: "/ebook/my-submissions" }, { label: "Revision requests", to: "/ebook/my-revisions" }, { label: "Payments", to: "/ebook/my-payments" }, { label: "Proof approvals", to: "/ebook/my-proofs" }, { label: "Rejected by editor", to: "/ebook/my-rejected" }] },
  { title: "Editorial tools", items: [{ label: "Screening queue", to: "/ebook/editor/screening" }, { label: "Review monitoring", to: "/ebook/editor/reviews" }, { label: "Accepted handoff", to: "/ebook/editor/handoff" }, { label: "Reviewer manager", to: "/ebook/reviewer-manager" }] },
  { title: "Operations", items: [{ label: "Finance", to: "/ebook/finance" }, { label: "Production", to: "/ebook/production" }, { label: "Publications", to: "/ebook/management/publications" }] },
];

function prettifyKey(key) {
  return String(key || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function StageQueueCard({ title, value, description, to, buttonLabel, tone }) {
  return (
    <div className="col-lg-3 col-md-6 mb-3">
      <div className={`card card-outline card-${tone} h-100`}>
        <div className="card-body d-flex flex-column">
          <div className="text-muted text-sm mb-2">{title}</div>
          <h2 className="mb-2">{value}</h2>
          <p className="text-muted mb-3">{description}</p>
          <Link className={`btn btn-${tone} mt-auto`} to={to}>{buttonLabel}</Link>
        </div>
      </div>
    </div>
  );
}

export default function EbookDashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const roleNames = user?.roles?.map((r) => normalizeRoleName(r.role_name || r.name || r.code)) || [];
  const panel = useMemo(() => roleNames.map((role) => ROLE_TO_PANEL[role]).find(Boolean) || "author", [roleNames.join(",")]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [authorQueues, setAuthorQueues] = useState({ revisions: 0, payments: 0, proofs: 0, rejected: 0 });
  const [editorQueues, setEditorQueues] = useState({ screening: 0, reviews: 0, handoff: 0, overdue: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const loader = {
          admin: ebookApi.getEditorDashboard,
          author: ebookApi.getAuthorDashboard,
          editor: ebookApi.getEditorDashboard,
          reviewer: ebookApi.getReviewerDashboard,
          finance: ebookApi.getFinanceDashboard,
          production: ebookApi.getProductionDashboard,
          reader: async () => ({ summary: {}, publications: [] }),
        }[panel] || ebookApi.getAuthorDashboard;
        const result = await loader();
        setData(result);
        if (panel === "author") {
          const [revisions, payments, proofs, rejected] = await Promise.all([
            ebookApi.listMySubmissions({ stage: "revisions", limit: 100 }),
            ebookApi.listMySubmissions({ stage: "payments", limit: 100 }),
            ebookApi.listMySubmissions({ stage: "proofs", limit: 100 }),
            ebookApi.listMySubmissions({ status: "rejected", limit: 100 }),
          ]);
          setAuthorQueues({
            revisions: revisions?.rows?.length || 0,
            payments: payments?.rows?.length || 0,
            proofs: proofs?.rows?.length || 0,
            rejected: rejected?.rows?.length || 0,
          });
        }
        if (panel === "editor") {
          const [screening, reviews, handoff] = await Promise.all([
            ebookApi.getEditorQueue({ stage: "screening" }),
            ebookApi.getEditorQueue({ stage: "reviews" }),
            ebookApi.getEditorQueue({ stage: "handoff" }),
          ]);
          setEditorQueues({
            screening: screening?.rows?.length || 0,
            reviews: reviews?.rows?.length || 0,
            handoff: handoff?.rows?.length || 0,
            overdue: reviews?.summary?.overdue || 0,
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load eBook dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [panel]);

  const summary = data?.summary || {};
  const rows = data?.submissions || data?.assignments || data?.finances || data?.production || [];
  const meta = PANEL_META[panel] || PANEL_META.author;
  const summaryEntries = Object.entries(summary).slice(0, 8);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="card card-outline card-primary mb-0">
          <div className="card-body d-flex justify-content-between align-items-start flex-wrap" style={{ gap: 16 }}>
            <div>
              <h1 className="mb-2">{meta.title}</h1>
              <p className="text-muted mb-0">{meta.subtitle}</p>
            </div>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              {meta.links.map((item) => (
                <Link key={item.to} className={`btn btn-${item.style}`} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="card"><div className="card-body">Loading dashboard...</div></div>
      ) : (
        <>
          {panel === "author" ? (
            <div className="row mb-3">
              <StageQueueCard title="My submissions" value={summary.total_submissions ?? rows.length ?? 0} description="View all manuscripts and open detailed workflow history." to="/ebook/my-submissions" buttonLabel="Open submissions" tone="primary" />
              <StageQueueCard title="Revision requests" value={authorQueues.revisions} description="Manuscripts waiting for revised files and resubmission." to="/ebook/my-revisions" buttonLabel="Handle revisions" tone="warning" />
              <StageQueueCard title="Payments & waivers" value={authorQueues.payments} description="Accepted manuscripts waiting for payment proof or waiver action." to="/ebook/my-payments" buttonLabel="Open payments" tone="danger" />
              <StageQueueCard title="Proof approvals" value={authorQueues.proofs} description="Final proofs ready for your confirmation before release." to="/ebook/my-proofs" buttonLabel="Review proofs" tone="success" />
              <StageQueueCard title="Rejected by editor" value={authorQueues.rejected} description="Submissions closed by editorial decision for your review and record." to="/ebook/my-rejected" buttonLabel="Open rejected" tone="dark" />
            </div>
          ) : null}
          {panel === "reader" ? (
            <div className="row mb-3">
              <StageQueueCard title="Public catalog" value={rows.length ?? 0} description="Open the published eBook catalog and browse released titles." to="/ebook/publications" buttonLabel="Browse catalog" tone="primary" />
            </div>
          ) : null}
          {panel === "editor" ? (
            <div className="row mb-3">
              <StageQueueCard title="Editorial screening" value={editorQueues.screening} description="New or returned manuscripts waiting for screening and next-step routing." to="/ebook/editor/screening" buttonLabel="Open screening" tone="primary" />
              <StageQueueCard title="Under review" value={editorQueues.reviews} description="Track reviewer assignments, submissions, and overdue items." to="/ebook/editor/reviews" buttonLabel="Monitor reviews" tone="warning" />
              <StageQueueCard title="Accepted handoff" value={editorQueues.handoff} description="Accepted manuscripts moving to finance clearance and production handoff." to="/ebook/editor/handoff" buttonLabel="Open handoff" tone="success" />
              <StageQueueCard title="Overdue reviewers" value={editorQueues.overdue} description="Assignments that need follow-up from the editor or reviewer manager." to="/ebook/reviewer-manager" buttonLabel="Follow up" tone="danger" />
            </div>
          ) : null}

          <div className="row mb-3">
            {summaryEntries.length ? summaryEntries.map(([key, value], index) => (
              <div className="col-md-6 col-xl-3 mb-3" key={key}>
                <div className={`card h-100 card-outline ${index % 2 === 0 ? "card-primary" : "card-info"}`}>
                  <div className="card-body">
                    <div className="text-muted text-sm mb-2">{prettifyKey(key)}</div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h2 className="mb-0">{value ?? 0}</h2>
                      <span className="badge badge-light">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12"><div className="alert alert-light border">No summary metrics are available for this dashboard yet.</div></div>
            )}
          </div>

          {panel === "admin" ? (
            <div className="row mb-4">
              {ADMIN_LINK_GROUPS.map((group) => (
                <div className="col-lg-4 mb-3" key={group.title}>
                  <div className="card h-100 card-outline card-secondary">
                    <div className="card-header"><h3 className="card-title mb-0">{group.title}</h3></div>
                    <div className="card-body d-flex flex-column" style={{ gap: 10 }}>
                      {group.items.map((item) => (
                        <Link key={item.to} className="btn btn-outline-primary text-left" to={item.to}>{item.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="card card-outline card-secondary">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
              <h3 className="card-title mb-0">Recent workflow items</h3>
              <small className="text-muted">Latest records for the current role workspace</small>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Title / Item</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {!rows.length ? (
                    <tr><td colSpan="4" className="text-center text-muted py-4">No records found.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.submission_id || row.assignment_id || row.finance_id || row.production_id || row.id}>
                      <td>
                        <div className="font-weight-bold">{row.title || row.invoice_number || row.repository_path || "Workflow item"}</div>
                        <small className="text-muted">{row.author_name || row.reviewer_name || row.slug || "-"}</small>
                      </td>
                      <td><StatusBadge value={row.status || row.payment_status || row.submission_status} /></td>
                      <td>{row.author_name || row.reviewer_name || row.editor_name || "-"}</td>
                      <td>
                        {row.assignment_id ? (
                          <Link className="btn btn-sm btn-outline-primary" to={`/ebook/review-assignments/${row.assignment_id}`}>Open</Link>
                        ) : row.submission_id ? (
                          <Link className="btn btn-sm btn-outline-primary" to={`/ebook/submissions/${row.submission_id}`}>Open</Link>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
