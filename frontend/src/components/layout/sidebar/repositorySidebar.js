// src/components/layout/sidebar/repositorySidebar.js

export function buildRepositoryRoutes(ROLES) {
  const A = ROLES?.REPOSITORY_ADMIN;
  const AU = ROLES?.REPOSITORY_AUTHOR;
  const C = ROLES?.REPOSITORY_CURATOR;
  const R = ROLES?.REPOSITORY_CONTENT_REVIEWER;
  const RA = ROLES?.RESEARCHER_AUTHOR;
  const PU = ROLES?.REPOSITORY_PUBLIC_USER;
  const G = ROLES?.REPOSITORY_GUEST;

  return [
    {
      name: "Admin Dashboard",
      path: "/repository/admin/dashboard",
      icon: "fas fa-tachometer-alt",
      roles: [A],
    },
    {
      name: "All Submissions",
      icon: "fas fa-inbox",
      roles: [A],
      subMenu: [
        { name: "Pending Review", path: "/repository/submissions/pending", icon: "fas fa-clock", roles: [A] },
        { name: "Under Curation", path: "/repository/submissions/curation", icon: "fas fa-edit", roles: [A] },
        { name: "Ready for Approval", path: "/repository/submissions/ready", icon: "fas fa-check-circle", roles: [A] },
        { name: "Approved", path: "/repository/submissions/approved", icon: "fas fa-check", roles: [A] },
        { name: "Rejected", path: "/repository/submissions/rejected", icon: "fas fa-times", roles: [A] },
        { name: "All Items", path: "/repository/submissions/all", icon: "fas fa-list", roles: [A] },
      ],
    },
    {
      name: "Configuration",
      icon: "fas fa-cogs",
      roles: [A],
      subMenu: [
        { name: "Repository Settings", path: "/repository/settings/general", icon: "fas fa-sliders-h", roles: [A] },
        { name: "Policy Management", path: "/repository/settings/policies", icon: "fas fa-file-contract", roles: [A] },
        { name: "Metadata Schemas", path: "/repository/settings/metadata", icon: "fas fa-database", roles: [A] },
        { name: "Workflow Designer", path: "/repository/settings/workflow", icon: "fas fa-project-diagram", roles: [A] },
        { name: "License Templates", path: "/repository/settings/licenses", icon: "fas fa-balance-scale", roles: [A] },
      ],
    },
    {
      name: "Analytics & Reports",
      icon: "fas fa-chart-bar",
      roles: [A],
      subMenu: [
        { name: "Comprehensive Reports", path: "/repository/reports/analytics", icon: "fas fa-chart-line", roles: [A] },
        { name: "Usage Statistics", path: "/repository/reports/usage", icon: "fas fa-chart-pie", roles: [A] },
        { name: "Processing Times", path: "/repository/reports/timelines", icon: "fas fa-stopwatch", roles: [A] },
        { name: "Data Exports", path: "/repository/reports/exports", icon: "fas fa-file-export", roles: [A] },
      ],
    },

    {
      name: "My Repository",
      path: "/repository/author/dashboard",
      icon: "fas fa-home",
      roles: [AU, RA],
    },
    {
      name: "Submissions",
      icon: "fas fa-upload",
      roles: [AU],
      subMenu: [
        { name: "New Submission", path: "/repository/manuscript/create", icon: "fas fa-plus-circle", roles: [AU] },
        { name: "My Submission", path: "/repository/author/submit/list", icon: "fas fa-file-upload", roles: [AU] },
        { name: "Access & License", path: "/repository/author/submit/access", icon: "fas fa-lock-open", roles: [AU] },
      ],
    },
    {
      name: "My Deposits",
      icon: "fas fa-folder",
      roles: [AU],
      subMenu: [
        { name: "Drafts", path: "/repository/author/deposits/drafts", icon: "fas fa-edit", roles: [AU] },
        { name: "Under Review", path: "/repository/author/deposits/review", icon: "fas fa-hourglass-half", roles: [AU] },
        { name: "Returned for Revision", path: "/repository/author/deposits/returned", icon: "fas fa-redo", roles: [AU] },
        { name: "Approved", path: "/repository/author/deposits/approved", icon: "fas fa-check-circle", roles: [AU] },
        { name: "Rejected", path: "/repository/author/deposits/rejected", icon: "fas fa-times-circle", roles: [AU] },
      ],
    },
    {
      name: "My Profile",
      icon: "fas fa-user",
      roles: [AU],
      subMenu: [
        { name: "Profile Info", path: "/repository/author/profile", icon: "fas fa-id-card", roles: [AU] },
        { name: "My Publications", path: "/repository/author/publications", icon: "fas fa-book", roles: [AU] },
      ],
    },

    {
      name: "Submit",
      icon: "fas fa-plus-circle",
      roles: [RA],
      subMenu: [
        { name: "Repository Items", path: "/repository/author/submit/list", icon: "fas fa-file-upload", roles: [RA] },
        { name: "Add New", path: "/repository/create", icon: "fas fa-folder-plus", roles: [RA] },
      ],
    },
    {
      name: "Researcher Deposits",
      icon: "fas fa-folder",
      roles: [RA],
      subMenu: [
        { name: "Drafts", path: "/repository/author/deposits/drafts", icon: "fas fa-edit", roles: [RA] },
        { name: "Under Review", path: "/repository/author/deposits/review", icon: "fas fa-hourglass-half", roles: [RA] },
        { name: "Returned to Revision", path: "/repository/author/deposits/returned", icon: "fas fa-redo", roles: [RA] },
        { name: "Approved", path: "/repository/author/deposits/approved", icon: "fas fa-check", roles: [RA] },
        { name: "Embargoed", path: "#", icon: "fas fa-lock", roles: [RA] },
      ],
    },

    {
      name: "Curator Dashboard",
      path: "/repository/curator/dashboard",
      icon: "fas fa-tachometer-alt",
      roles: [C],
    },
    {
      name: "Submission Queue",
      icon: "fas fa-inbox",
      roles: [C],
      subMenu: [
        { name: "New (Unreviewed)", path: "/repository/curator/queue/new", icon: "fas fa-exclamation-circle", roles: [C] },
        { name: "In Progress", path: "/repository/curator/queue/in-progress", icon: "fas fa-spinner", roles: [C] },
        { name: "Ready for Approval", path: "/repository/curator/queue/ready", icon: "fas fa-check-circle", roles: [C] },
        { name: "Returned Items", path: "/repository/curator/queue/returned", icon: "fas fa-undo", roles: [C] },
      ],
    },
    {
      name: "Collections",
      icon: "fas fa-folder-open",
      roles: [C],
      subMenu: [
        { name: "By Author", path: "/repository/collections/author", icon: "fas fa-user-graduate", roles: [C] },
        { name: "By Resource Type", path: "/repository/collections/type", icon: "fas fa-th-large", roles: [C] },
      ],
    },
    {
      name: "Reports",
      icon: "fas fa-chart-bar",
      roles: [C],
      subMenu: [
        { name: "Submission Trends", path: "/repository/reports/trends", icon: "fas fa-chart-bar", roles: [C] },
        { name: "Processing Times", path: "/repository/reports/timelines", icon: "fas fa-clock", roles: [C] },
        { name: "Curator Performance", path: "/repository/reports/curator-performance", icon: "fas fa-user-check", roles: [C] },
        { name: "My Analytics", path: "/repository/reports/my-analytics", icon: "fas fa-chart-pie", roles: [C] },
      ],
    },

    {
      name: "Reviewer Dashboard",
      path: "/repository/reviewer/dashboard",
      icon: "fas fa-tachometer-alt",
      roles: [R],
    },
    {
      name: "Review Queue",
      icon: "fas fa-clipboard-list",
      roles: [R],
      subMenu: [
        { name: "New Assignments", path: "/repository/reviewer/queue/new", icon: "fas fa-exclamation-circle", roles: [R] },
        { name: "In Progress", path: "/repository/reviewer/queue/in-progress", icon: "fas fa-spinner", roles: [R] },
        { name: "Completed", path: "/repository/reviewer/queue/completed", icon: "fas fa-check-circle", roles: [R] },
        { name: "Scheduled", path: "/repository/reviewer/queue/scheduled", icon: "fas fa-calendar-alt", roles: [R] },
      ],
    },
    {
      name: "Review Tools",
      icon: "fas fa-tools",
      roles: [R],
      subMenu: [
        { name: "View Submission", path: "/repository/reviewer/tools/view", icon: "fas fa-eye", roles: [R] },
        { name: "Review Form", path: "/repository/reviewer/tools/form", icon: "fas fa-file-alt", roles: [R] },
        { name: "Similarity Check", path: "/repository/reviewer/tools/similarity", icon: "fas fa-search", roles: [R] },
        { name: "Quality Assessment", path: "/repository/reviewer/tools/quality", icon: "fas fa-star", roles: [R] },
        { name: "Private Notes", path: "/repository/reviewer/tools/notes", icon: "fas fa-sticky-note", roles: [R] },
      ],
    },

    {
      name: "Search",
      path: "/repository/search",
      icon: "fas fa-search",
      roles: [PU, G],
    },
    {
      name: "Browse",
      icon: "fas fa-compass",
      roles: [PU, G],
      subMenu: [
        { name: "By Collection", path: "/repository/browse/collections", icon: "fas fa-folder", roles: [PU, G] },
        { name: "By Author", path: "/repository/browse/authors", icon: "fas fa-user-graduate", roles: [PU, G] },
        { name: "By Subject", path: "/repository/browse/subjects", icon: "fas fa-tags", roles: [PU, G] },
        { name: "By Date", path: "/repository/browse/date", icon: "fas fa-calendar", roles: [PU, G] },
        { name: "By Department", path: "/repository/browse/department", icon: "fas fa-building", roles: [PU, G] },
      ],
    },
    {
      name: "Featured",
      icon: "fas fa-star",
      roles: [PU, G],
      subMenu: [
        { name: "Recent Additions", path: "/repository/featured/recent", icon: "fas fa-clock", roles: [PU, G] },
        { name: "Most Viewed", path: "/repository/featured/popular", icon: "fas fa-fire", roles: [PU, G] },
        { name: "Most Downloaded", path: "/repository/featured/downloaded", icon: "fas fa-download", roles: [PU, G] },
        { name: "Editor's Picks", path: "/repository/featured/picks", icon: "fas fa-award", roles: [PU, G] },
      ],
    },
    {
      name: "Tools",
      icon: "fas fa-toolbox",
      roles: [PU, G],
      subMenu: [
        { name: "Citation Generator", path: "/repository/tools/citation", icon: "fas fa-quote-right", roles: [PU, G] },
        { name: "Export Citations", path: "/repository/tools/export", icon: "fas fa-file-export", roles: [PU, G] },
        { name: "Save to List", path: "/repository/tools/savelist", icon: "fas fa-bookmark", roles: [PU, G] },
        { name: "Email Alert", path: "/repository/tools/alerts", icon: "fas fa-envelope", roles: [PU, G] },
      ],
    },
  ];
}