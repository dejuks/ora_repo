export function buildEbookRoutes(ROLES) {
  const A = ROLES?.EBOOK_ADMIN;
  const AU = ROLES?.EBOOK_AUTHOR;
  const E = ROLES?.EBOOK_EDITOR;
  const R = ROLES?.EBOOK_REVIEWER;
  const D = ROLES?.EBOOK_DIGITAL_CONTENT_MANAGER;
  const DX = ROLES?.EBOOK_DCM;
  const F = ROLES?.EBOOK_FINANCE;
  const PR = ROLES?.PUBLIC_READER;
  const EPR = ROLES?.EBOOK_PUBLIC_READER;

  return [
    {
      name: "Dashboard",
      path: "/ebook/dashboard",
      icon: "fas fa-tachometer-alt",
      roles: [A, AU, E, R, D, DX, F, PR, EPR],
    },
    {
      name: "Author Workspace",
      icon: "fas fa-user-edit",
      roles: [AU, A],
      subMenu: [
        { name: "My Submissions", path: "/ebook/manuscripts", icon: "fas fa-file-alt", roles: [AU, A] },
        { name: "My Drafts", path: "/ebook/manuscripts/drafts", icon: "fas fa-file-alt", roles: [AU, A] },
        { name: "Revision Requests", path: "/ebook/manuscripts/revisions", icon: "fas fa-edit", roles: [AU, A] },
        { name: "Payments", path: "/ebook/my-payments", icon: "fas fa-credit-card", roles: [AU, A] },
        { name: "Proof Approvals", path: "/ebook/my-proofs", icon: "fas fa-check-circle", roles: [AU, A] },
        { name: "Rejected by Editor", path: "/ebook/my-rejected", icon: "fas fa-times-circle", roles: [AU, A] },
     ],
    },
    {
      name: "Editorial",
      icon: "fas fa-pen-fancy",
      roles: [E, A],
      subMenu: [
        { name: "Screening Queue", path: "/ora/ebook/editor/screening", icon: "fas fa-filter", roles: [E, A] },
        { name: "Screened Submissions", path: "/ora/ebook/editor/screened", icon: "fas fa-check-circle", roles: [E, A] },
        // { name: "Decision Queue", path: "/ebook/editor/decision", icon: "fas fa-check-circle", roles: [E, A] },
        // { name: "Review Monitoring", path: "/ebook/editor/reviews", icon: "fas fa-eye", roles: [E, A] },
        // { name: "Accepted & Handoff", path: "/ebook/editor/handoff", icon: "fas fa-handshake", roles: [E, A] },
        // { name: "Reviewer Manager", path: "/ebook/reviewer-manager", icon: "fas fa-users-cog", roles: [E, A] },
        // { name: "All Submissions", path: "/ebook/submissions", icon: "fas fa-list", roles: [E, A] },
      ],
    },
    {
      name: "Reviewer",
      icon: "fas fa-star",
      roles: [R, A],
      subMenu: [
        { name: "My Assignments", path: "/oraebook/reviewer/pending", icon: "fas fa-clock", roles: [R, A] },
        { name: "Accepted Assignments", path: "/ebook/reviewer/accepted", icon: "fas fa-check", roles: [R, A] },
        { name: "Rejected Assignments", path: "/ebook/reviewer/rejected", icon: "fas fa-times", roles: [R, A] },
        { name: "Completed Reviews", path: "/ebook/reviewer/completed", icon: "fas fa-check-double", roles: [R, A] },
        { name: "Overdue Assignments", path: "/ebook/reviewer/overdue", icon: "fas fa-exclamation-triangle", roles: [R, A] },
        { name: "All my Assigned", path: "/ebook/reviewer", icon: "fas fa-inbox", roles: [R, A] },
      ],
    },
    {
      name: "Finance",
      icon: "fas fa-coins",
      roles: [F, A],
      subMenu: [
        { name: "Finance Dashboard", path: "/ebook/finance", icon: "fas fa-chart-line", roles: [F, A] },
        { name: "Pending Payments", path: "/ebook/finance/pending-payments", icon: "fas fa-hourglass-half", roles: [F, A] },
        { name: "Calculate BPC", path: "/ebook/finance/calculate-bpc", icon: "fas fa-calculator", roles: [F, A] },
        { name: "Set Publishing Fees", path: "/ebook/finance/publishing-fees", icon: "fas fa-tag", roles: [F, A] },
        { name: "Generate Invoices", path: "/ebook/finance/invoices", icon: "fas fa-file-invoice", roles: [F, A] },
        { name: "Payment Verification", path: "/ebook/finance/verify-payment", icon: "fas fa-check-double", roles: [F, A] },
        { name: "Payment History", path: "/ebook/finance/payment-history", icon: "fas fa-history", roles: [F, A] },
        { name: "Waivers & Discounts", path: "/ebook/finance/waivers", icon: "fas fa-percent", roles: [F, A] },
        { name: "Financial Reports", path: "/ebook/finance/reports", icon: "fas fa-chart-bar", roles: [F, A] },
        { name: "Ready for Production", path: "/ebook/finance/ready-for-production", icon: "fas fa-forward", roles: [F, A] },
      ],
    },
    {
      name: "Production",
      icon: "fas fa-industry",
      roles: [D, DX, A],
      subMenu: [
        { name: "Production Queue", path: "/ebook/production", icon: "fas fa-tasks", roles: [D, DX, A] },
        { name: "Publication Management", path: "/ebook/management/publications", icon: "fas fa-book", roles: [D, DX, A] },
      ],
    },
    {
      name: "Administration",
      icon: "fas fa-user-shield",
      roles: [A],
      subMenu: [
        { name: "Ebook Admin", path: "/ebook/admin", icon: "fas fa-crown", roles: [A] },
        { name: "All Submissions", path: "/ebook/submissions", icon: "fas fa-list", roles: [A] },
        { name: "Publication Management", path: "/ebook/management/publications", icon: "fas fa-book", roles: [A] },
      ],
    },
    {
      name: "Public Reader",
      icon: "fas fa-book-reader",
      roles: [PR, EPR, A],
      subMenu: [
        { name: "Public Catalog", path: "/ebook/publications", icon: "fas fa-book-open", roles: [PR, EPR, A] },
      ],
    },
  ];
}
