
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";

const roles = [
  {
    title: "1. Author / Researcher",
    tone: "primary",
    points: ["Create draft and submit metadata + files", "Respond to revisions", "Submit payment proof or waiver request", "Approve final proof"],
    links: [
      ["Create submission", "/ebook/submissions/create"],
      ["My submissions", "/ebook/my-submissions"],
      ["My revisions", "/ebook/my-revisions"],
      ["My payments", "/ebook/my-payments"],
      ["My proofs", "/ebook/my-proofs"],
      ["Rejected by editor", "/ebook/my-rejected"],
    ],
  },
  {
    title: "2. Book Editor",
    tone: "warning",
    points: ["Screen new manuscripts", "Assign and monitor reviewers", "Issue editorial decisions", "Approve handoff to finance and production"],
    links: [
      ["Screening queue", "/ebook/editor/screening"],
      ["Review queue", "/ebook/editor/reviews"],
      ["Handoff queue", "/ebook/editor/handoff"],
      ["Reviewer manager", "/ebook/reviewer-manager"],
    ],
  },
  {
    title: "3. Peer Reviewer",
    tone: "info",
    points: ["Accept or decline assignments", "Submit structured review", "Attach annotated files", "Request extensions when needed"],
    links: [["Reviewer dashboard", "/ebook/reviewer"]],
  },
  {
    title: "4. Finance Officer",
    tone: "danger",
    points: ["Validate BPC obligations", "Approve or decline waivers", "Record payments", "Clear titles for production"],
    links: [["Finance page", "/ebook/finance"]],
  },
  {
    title: "5. Digital Content Manager",
    tone: "success",
    points: ["Prepare final PDF and EPUB", "Send proof to author", "Record proof approval", "Release publication metadata"],
    links: [["Production page", "/ebook/production"], ["Publication management", "/ebook/management/publications"]],
  },
  {
    title: "6. System Administrator",
    tone: "secondary",
    points: ["Manage workflow rules", "Audit system activity", "Check storage and health", "Run reindex and admin tools"],
    links: [["Admin tools", "/ebook/admin"]],
  },
];

const statuses = [
  "draft", "submitted", "screening", "under_review", "revisions_required", "revised_submission",
  "accepted", "finance_pending", "finance_cleared", "in_production", "proof_sent", "proof_approved", "published", "public_access"
];

export default function EbookWorkflowOverviewPage() {
  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 12 }}>
          <div>
            <h1 className="mb-1">ORA eBook Workflow Overview</h1>
            <p className="text-muted mb-0">Role-separated entry points and the final aligned lifecycle, kept on one page so users can understand where to go next.</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <Link className="btn btn-outline-secondary" to="/ebook/dashboard">Dashboard</Link>
            <Link className="btn btn-primary" to="/ebook/submissions/create">New submission</Link>
          </div>
        </div>
      </section>

      <div className="card card-outline card-dark mb-3">
        <div className="card-header"><h3 className="card-title">Final workflow statuses</h3></div>
        <div className="card-body">
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            {statuses.map((item) => (
              <span key={item} className="badge badge-light border px-3 py-2 text-capitalize">{item.replaceAll("_", " ")}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="row">
        {roles.map((role) => (
          <div className="col-lg-6 mb-3" key={role.title}>
            <div className={`card card-outline card-${role.tone} h-100`}>
              <div className="card-header"><h3 className="card-title">{role.title}</h3></div>
              <div className="card-body">
                <ul className="mb-3">
                  {role.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                  {role.links.map(([label, href]) => (
                    <Link key={href} className={`btn btn-sm btn-${role.tone}`} to={href}>{label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
