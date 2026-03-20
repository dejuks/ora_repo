import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth.js";
import ebookApi from "../../api/ebook.api";

/* ===============================
   MODULE UUIDS
================================ */
const MODULES = {
  SYSTEM_WIDE: "e936cd83-5383-4220-8cb5-8d1df4338b86",
  JOURNAL: "991aefe2-d96c-4712-a5c4-3be6b56dfe68",
  LIBRARY: "8e1967f9-b9d7-42a9-ae20-2e1d7cdc16bb",
  ORO_WIKI: "643dd068-b8d7-4cc1-bb14-ec42f11180fc",
  REPOSITORY: "87efa5b1-59dd-4c1e-8168-c82a519cb167",
  RESEARCHER_NETWORK: "e35249ea-4f4f-4a2d-9389-4903a6e1ad64",
  EBOOK: "aeca9002-e3e1-498d-a9da-34066db00744",
};

/* ===============================
   ROLE UUIDS
================================ */
const ROLES = {
  SUPER_ADMIN: "bf22a62f-e672-4e88-9c28-fa1eee3e0e22",
  EDITOR: "33333333-aaaa-bbbb-cccc-333333333333",
  LIBRARY_MANAGER_UUID: "5042b3f2-2cd6-4a1b-8015-6774c3956409",
  RESEARCHER_NETWORK_MANAGER: "d2db77c2-177c-44e6-921a-d635abd674d3",

  JOURNAL_MANAGER: "311b2831-99d3-426b-9a7c-6453756d5d9a",
  JOURNAL_AUTHOR: "1d67d32d-dcee-4302-8369-26ca00385a09",
  REVIEWER: "5c6f2f3e-8f4b-4d3a-9f7a-2e5e8b6c4d2b",
  JOURNAL_EIC: "ad657069-0dd4-4bd1-8a19-ee6733dd303d",
  JOURNAL_ASSOCIATE_EDITOR: "45494844-658a-4837-8df6-f6fc61348bbb",
  JOURNAL_REFREE: "30d22914-dc7f-4532-ba19-31be2beb2e9d",

  // Library Roles
  LIBRARY_ADMIN: "LIBRARY_ADMIN",
  LIBRARY_MANAGER: "LIBRARY_MANAGER",
  LIBRARIAN: "LIBRARIAN",
  CATALOGER: "CATALOGER",
  ACQUISITION_OFFICER: "ACQUISITION_OFFICER",
  INVENTORY_MANAGER: "INVENTORY_MANAGER",
  CONTENT_UPLOADER: "CONTENT_UPLOADER",
  LIBRARY_MEMBER: "LIBRARY_MEMBER",
  EXTERNAL_PUBLISHER: "EXTERNAL_PUBLISHER",

  // Ebook Roles
  EBOOK_ADMIN: "EBOOK_ADMIN",
  EBOOK_AUTHOR: "EBOOK_AUTHOR",
  EBOOK_EDITOR: "EBOOK_EDITOR",
  EBOOK_REVIEWER: "EBOOK_REVIEWER",
  EBOOK_DIGITAL_CONTENT_MANAGER: "EBOOK_DIGITAL_CONTENT_MANAGER",
  EBOOK_DCM: "EBOOK_DCM",
  EBOOK_FINANCE_OFFICER: "EBOOK_FINANCE_OFFICER",
  PUBLIC_READER: "PUBLIC_READER",
  EBOOK_PUBLIC_READER: "EBOOK_PUBLIC_READER",

  // Repository Roles
  REPOSITORY_ADMIN: "5205b388-a2e4-4e40-baae-8fe018e08d18",
  REPOSITORY_CURATOR: "7047bc22-6575-436c-9777-e06869004a4a",
  REPOSITORY_CONTENT_REVIEWER: "9ef6032d-85da-4d1b-910e-72469e4f068c",
  RESEARCHER_AUTHOR: "bcb471d4-e59c-45f3-b512-e7c17a03c46c",
  REPOSITORY_PUBLIC_USER: "bcb471d4-e59c-45f3-b512-e7c17a03c46c",
  REPOSITORY_GUEST: "efdda7b9-6884-42c7-b6f3-bed7ab4eb92e",

  // Oromo Wiki Roles
  ORO_WIKI_MANAGER: "f06cb194-d9cf-4fb1-9ce8-55ded280e9b9",
  ORO_WIKI_EDITOR: "7caffcac-18e8-4682-8341-7c405071551c",
  ORO_WIKI_BUREAUCRAT: "faa28d6c-de7f-41ce-961a-6c975885f47a",
  ORO_WIKI_OVERSIGHTER: "5d46563f-a72c-433c-9115-4219c9e16a6c",
  ORO_WIKI_PUBLISHER: "8c7747ae-837d-425e-874b-fb97cf7776e6",

  // Researcher Network Roles
  RESEARCHER_NETWORK_MODERATOR: "ee6bebf7-5961-4917-9752-8ad704d40c77",
};

function normalizeRoleName(value) {
  return (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");
}

function buildLibraryRoutes() {
  const A = ROLES.LIBRARY_ADMIN;
  const M = [ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_UUID];
  const L = ROLES.LIBRARIAN;
  const C = ROLES.CATALOGER;
  const AQ = ROLES.ACQUISITION_OFFICER;
  const I = ROLES.INVENTORY_MANAGER;
  const U = ROLES.CONTENT_UPLOADER;
  const MB = ROLES.LIBRARY_MEMBER;
  const P = ROLES.EXTERNAL_PUBLISHER;

  return [
    {
      name: "Dashboards",
      icon: "fas fa-tachometer-alt",
      subMenu: [
        { name: "Admin Dashboard", path: "/library/admin/dashboard", icon: "fas fa-user-shield", roles: [A] },
        { name: "Manager Dashboard", path: "/library/manager/dashboard", icon: "fas fa-user-tie", roles: M },
        { name: "Librarian Dashboard", path: "/library/librarian/dashboard", icon: "fas fa-user-graduate", roles: [L] },
        { name: "Cataloger Dashboard", path: "/library/cataloger/dashboard", icon: "fas fa-tags", roles: [C] },
        { name: "Acquisition Dashboard", path: "/library/acquisition/dashboard", icon: "fas fa-shopping-cart", roles: [AQ] },
        { name: "Inventory Dashboard", path: "/library/inventory/dashboard", icon: "fas fa-warehouse", roles: [I] },
        { name: "Uploader Dashboard", path: "/library/uploader/dashboard", icon: "fas fa-upload", roles: [U] },
        { name: "Member Dashboard", path: "/library/member/dashboard", icon: "fas fa-user", roles: [MB] },
      ],
    },
    {
      name: "Administration",
      icon: "fas fa-crown",
      roles: [A],
      subMenu: [
        { name: "Library Users", path: "/library/admin/users", icon: "fas fa-users-cog", roles: [A] },
        { name: "Create User", path: "/library/users/create", icon: "fas fa-user-plus", roles: [A] },
        { name: "Roles & Permissions", path: "/library/roles", icon: "fas fa-key", roles: [A] },
        { name: "System Logs", path: "/library/audit-logs", icon: "fas fa-history", roles: [A] },
        { name: "Security Alerts", path: "/library/admin/security-alerts", icon: "fas fa-shield-alt", roles: [A] },
        { name: "System Settings", path: "/library/admin/system-settings", icon: "fas fa-cogs", roles: [A] },
      ],
    },
    {
      name: "Library Settings",
      icon: "fas fa-sliders-h",
      roles: [A, ...M, L, C, I],
      subMenu: [
        { name: "Library Settings", path: "/library/settings", icon: "fas fa-tools", roles: [A] },
        { name: "Material Types", path: "/library/settings/material-types", icon: "fas fa-layer-group", roles: [A, C] },
        { name: "Categories", path: "/library/settings/categories", icon: "fas fa-folder-tree", roles: [A, C] },
        { name: "Publishers", path: "/library/settings/publishers", icon: "fas fa-building", roles: [A, C] },
        { name: "Languages", path: "/library/settings/languages", icon: "fas fa-language", roles: [A, C] },
        { name: "Subjects", path: "/library/settings/subjects", icon: "fas fa-book-open", roles: [A, C] },
        { name: "Contributors", path: "/library/settings/contributors", icon: "fas fa-users", roles: [A, C] },
        { name: "Branches", path: "/library/settings/branches", icon: "fas fa-code-branch", roles: [A, L] },
        { name: "Locations", path: "/library/settings/locations", icon: "fas fa-map-marker-alt", roles: [A, L, I] },
        { name: "Member Types", path: "/library/settings/member-types", icon: "fas fa-id-card", roles: [A, ...M] },
      ],
    },
    {
      name: "Management & Reports",
      icon: "fas fa-chart-line",
      roles: [A, ...M],
      subMenu: [
        { name: "Policies", path: "/library/policies", icon: "fas fa-file-contract", roles: [A, ...M] },
        { name: "Summary Reports", path: "/library/reports", icon: "fas fa-chart-pie", roles: [A, ...M] },
        { name: "Usage Reports", path: "/library/manager/usage-reports", icon: "fas fa-chart-bar", roles: [A, ...M] },
        { name: "Loan Reports", path: "/library/manager/loan-reports", icon: "fas fa-hand-holding-heart", roles: [A, ...M] },
        { name: "Inventory Reports", path: "/library/manager/inventory-reports", icon: "fas fa-clipboard-list", roles: [A, ...M] },
        { name: "Acquisition Approvals", path: "/library/acquisitions/approvals", icon: "fas fa-check-double", roles: [A, ...M] },
      ],
    },
    {
      name: "Catalog & Circulation",
      icon: "fas fa-book",
      roles: [A, ...M, L, C, I, AQ, MB],
      subMenu: [
        { name: "OPAC Search", path: "/library/opac", icon: "fas fa-search", roles: [A, ...M, L, C, I, AQ, MB] },
        { name: "Browse Catalog", path: "/library/books", icon: "fas fa-books", roles: [A, ...M, L, C, I, AQ, MB] },
        { name: "All Books", path: "/library/books/all", icon: "fas fa-list", roles: [A, ...M, L, C] },
        { name: "Add Book", path: "/library/books/new", icon: "fas fa-plus-circle", roles: [A, ...M, L, C] },
        { name: "Catalog Metadata", path: "/library/books/metadata", icon: "fas fa-tags", roles: [A, ...M, L, C] },
        { name: "Cataloging Tools", path: "/library/cataloger/tools", icon: "fas fa-tools", roles: [A, ...M, C] },
        { name: "Book Copies", path: "/library/copies", icon: "fas fa-copy", roles: [A, ...M, L, C, I] },
        { name: "Circulation Desk", path: "/library/circulation/desk", icon: "fas fa-desktop", roles: [A, ...M, L] },
        { name: "Loans", path: "/library/loans", icon: "fas fa-hand-holding", roles: [A, ...M, L] },
        { name: "Holds / Reservations", path: "/library/holds", icon: "fas fa-calendar-check", roles: [A, ...M, L] },
        { name: "Fines & Fees", path: "/library/fines", icon: "fas fa-dollar-sign", roles: [A, ...M, L] },
        { name: "Borrowing History", path: "/library/history", icon: "fas fa-history", roles: [A, ...M, L, MB] },
      ],
    },
    {
      name: "Acquisitions",
      icon: "fas fa-truck",
      roles: [A, ...M, AQ],
      subMenu: [
        { name: "Requests", path: "/library/acquisitions/requests", icon: "fas fa-clipboard-list", roles: [A, ...M, AQ] },
        { name: "Orders", path: "/library/acquisitions/orders", icon: "fas fa-shopping-cart", roles: [A, ...M, AQ] },
        { name: "Deliveries", path: "/library/acquisitions/deliveries", icon: "fas fa-truck-loading", roles: [A, ...M, AQ] },
        { name: "Vendors", path: "/library/vendors", icon: "fas fa-store", roles: [A, ...M, AQ] },
      ],
    },
    {
      name: "Inventory",
      icon: "fas fa-boxes",
      roles: [A, ...M, I, L, C],
      subMenu: [
        { name: "Inventory Report", path: "/library/inventory/report", icon: "fas fa-file-alt", roles: [A, ...M, I, L] },
        { name: "Audits", path: "/library/inventory/audits", icon: "fas fa-clipboard-check", roles: [A, ...M, I, L] },
        { name: "Missing Items", path: "/library/inventory/missing", icon: "fas fa-question-circle", roles: [A, ...M, I, L] },
        { name: "Damaged Items", path: "/library/inventory/damaged", icon: "fas fa-exclamation-triangle", roles: [A, ...M, I, L] },
        { name: "Tags / Barcodes", path: "/library/inventory/tags", icon: "fas fa-qrcode", roles: [A, ...M, I, C, L] },
      ],
    },
    {
      name: "Digital Library",
      icon: "fas fa-cloud-upload-alt",
      roles: [A, ...M, L, U, MB, P],
      subMenu: [
        { name: "Digital Resources", path: "/library/digital", icon: "fas fa-cloud", roles: [A, ...M, L, U, MB, P] },
        { name: "Upload Resource", path: "/library/digital/new", icon: "fas fa-upload", roles: [A, ...M, L, U, P] },
        { name: "Metadata Management", path: "/library/digital/metadata", icon: "fas fa-tags", roles: [A, ...M, L, U, P] },
        { name: "Access Rights", path: "/library/digital/access", icon: "fas fa-key", roles: [A, ...M, L] },
        { name: "Approvals", path: "/library/digital/approvals", icon: "fas fa-check-circle", roles: [A, ...M, L] },
        { name: "Collections", path: "/library/digital/collections", icon: "fas fa-folder", roles: [A, ...M, L] },
        { name: "Workflow Tracking", path: "/library/digital/workflow", icon: "fas fa-tasks", roles: [A, ...M, L, U] },
        { name: "Usage Analytics", path: "/library/digital/analytics", icon: "fas fa-chart-line", roles: [A, ...M, L, U] },
        { name: "Member Digital Portal", path: "/library/member/digital", icon: "fas fa-user", roles: [MB] },
        { name: "Publisher Packages", path: "/library/digital/publisher-packages", icon: "fas fa-box", roles: [A, ...M, L, P] },
      ],
    },
    {
      name: "My Library",
      icon: "fas fa-id-card",
      roles: [MB],
      subMenu: [
        { name: "My Account", path: "/library/account", icon: "fas fa-user-circle", roles: [MB] },
        { name: "My Loans", path: "/library/my-loans", icon: "fas fa-hand-holding", roles: [MB] },
        { name: "My Holds", path: "/library/my-holds", icon: "fas fa-calendar-check", roles: [MB] },
        { name: "My Fines", path: "/library/my-fines", icon: "fas fa-dollar-sign", roles: [MB] },
        { name: "Borrowing History", path: "/library/history", icon: "fas fa-history", roles: [MB] },
        { name: "Digital Library", path: "/library/member/digital", icon: "fas fa-cloud", roles: [MB] },
      ],
    },
  ];
}

function isReviewerOverdue(row) {
  if (!row?.due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(row.due_date);
  due.setHours(0, 0, 0, 0);
  return due < today && ["assigned", "accepted"].includes(String(row.status || "").toLowerCase());
}

function getReviewerCounts(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return {
    all: safeRows.length,
    pending: safeRows.filter((row) => row.status === "assigned").length,
    accepted: safeRows.filter((row) => row.status === "accepted").length,
    rejected: safeRows.filter((row) => row.status === "declined").length,
    completed: safeRows.filter((row) => row.status === "submitted").length,
    overdue: safeRows.filter((row) => isReviewerOverdue(row)).length,
  };
}

function withReviewerCount(name, count) {
  return `${name} (${count ?? 0})`;
}

function buildEbookRoutes() {
  const A = ROLES.EBOOK_ADMIN;
  const AU = ROLES.EBOOK_AUTHOR;
  const E = ROLES.EBOOK_EDITOR;
  const R = ROLES.EBOOK_REVIEWER;
  const D = ROLES.EBOOK_DIGITAL_CONTENT_MANAGER;
  const DX = ROLES.EBOOK_DCM;
  const F = ROLES.EBOOK_FINANCE_OFFICER;
  const PR = ROLES.PUBLIC_READER;
  const EPR = ROLES.EBOOK_PUBLIC_READER;

  return [
    { 
      name: "Dashboard", 
      path: "/ebook/dashboard", 
      icon: "fas fa-tachometer-alt",
      roles: [A, AU, E, R, D, DX, F, PR, EPR] 
    },
    {
      name: "Author Workspace",
      icon: "fas fa-user-edit",
      roles: [AU, A],
      subMenu: [
        { name: "My Submissions", path: "/ebook/my-submissions", icon: "fas fa-file-alt", roles: [AU, A] },
        { name: "Revision Requests", path: "/ebook/my-revisions", icon: "fas fa-edit", roles: [AU, A] },
        { name: "Payments & Waivers", path: "/ebook/my-payments", icon: "fas fa-credit-card", roles: [AU, A] },
        { name: "Proof Approvals", path: "/ebook/my-proofs", icon: "fas fa-check-circle", roles: [AU, A] },
        { name: "Rejected by Editor", path: "/ebook/my-rejected", icon: "fas fa-times-circle", roles: [AU, A] },
        { name: "Create Submission", path: "/ebook/submissions/create", icon: "fas fa-plus-circle", roles: [AU, A] },
        { name: "All Manuscripts", path: "/ebook/submissions", icon: "fas fa-list", roles: [AU, A] },
      ],
    },
    {
      name: "Editorial",
      icon: "fas fa-pen-fancy",
      roles: [E, A],
      subMenu: [
        { name: "Screening Queue", path: "/ebook/editor/screening", icon: "fas fa-filter", roles: [E, A] },
        { name: "Review Monitoring", path: "/ebook/editor/reviews", icon: "fas fa-eye", roles: [E, A] },
        { name: "Accepted & Handoff", path: "/ebook/editor/handoff", icon: "fas fa-handshake", roles: [E, A] },
        { name: "Reviewer Manager", path: "/ebook/reviewer-manager", icon: "fas fa-users-cog", roles: [E, A] },
        { name: "All Submissions", path: "/ebook/submissions", icon: "fas fa-list", roles: [E, A] },
      ],
    },
    {
      name: "Reviewer",
      icon: "fas fa-star",
      roles: [R, A],
      subMenu: [
        { name: "My Assigned Submissions", path: "/ebook/reviewer", icon: "fas fa-inbox", roles: [R, A] },
        { name: "Pending Assignments", path: "/ebook/reviewer/pending", icon: "fas fa-clock", roles: [R, A] },
        { name: "Accepted Assignments", path: "/ebook/reviewer/accepted", icon: "fas fa-check", roles: [R, A] },
        { name: "Rejected Assignments", path: "/ebook/reviewer/rejected", icon: "fas fa-times", roles: [R, A] },
        { name: "Completed Reviews", path: "/ebook/reviewer/completed", icon: "fas fa-check-double", roles: [R, A] },
        { name: "Overdue Assignments", path: "/ebook/reviewer/overdue", icon: "fas fa-exclamation-triangle", roles: [R, A] },
      ],
    },
    {
      name: "Finance",
      icon: "fas fa-coins",
      roles: [F, A],
      subMenu: [
        { name: "Finance Dashboard", path: "/ebook/finance", icon: "fas fa-chart-line", roles: [F, A] },
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
      ],
    },
    {
      name: "Public Reader",
      icon: "fas fa-book-reader",
      roles: [A, AU, E, R, D, DX, F, PR, EPR],
      subMenu: [
        { name: "Public Catalog", path: "/ebook/publications", icon: "fas fa-book-open", roles: [A, AU, E, R, D, DX, F, PR, EPR] },
      ],
    },
  ];
}

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [reviewerCounts, setReviewerCounts] = useState({ all: 0, pending: 0, accepted: 0, rejected: 0, completed: 0, overdue: 0 });

  // Always call hooks at the top level, before any conditional returns
  const moduleId = user?.module_id;
  const userRoleIds = user?.roles?.map((r) => r.role_id) || [];
  const userRoleNames =
    user?.roles
      ?.map((r) => normalizeRoleName(r.role_name || r.name || r.code))
      .filter(Boolean) || [];

  const hasRole = (allowedRoles = []) =>
    allowedRoles.some((allowed) => {
      const raw = (allowed || "").toString();
      if (!raw) return false;
      return raw.includes("-") ? userRoleIds.includes(raw) : userRoleNames.includes(normalizeRoleName(raw));
    });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // useEffect for fetching reviewer counts - always called
  useEffect(() => {
    // If no user, don't fetch
    if (!user) return;
    
    let active = true;
    const isEbookModule = user?.module_id === MODULES.EBOOK;
    const canSeeReviewerMenu = hasRole([ROLES.EBOOK_REVIEWER, ROLES.EBOOK_ADMIN]);

    if (!isEbookModule || !canSeeReviewerMenu) return undefined;

    ebookApi
      .getReviewerDashboard()
      .then((result) => {
        if (!active) return;
        setReviewerCounts(getReviewerCounts(result?.assignments || []));
      })
      .catch(() => {
        if (!active) return;
        setReviewerCounts({ all: 0, pending: 0, accepted: 0, rejected: 0, completed: 0, overdue: 0 });
      });

    return () => {
      active = false;
    };
  }, [user, userRoleIds.join(","), userRoleNames.join(",")]); // Add proper dependencies

  const filterRoutesByRole = (routes) =>
    routes
      .map((route) => {
        if (route.roles && !hasRole(route.roles)) return null;

        if (route.subMenu) {
          let visibleChildren = route.subMenu.filter((sub) => !sub.roles || hasRole(sub.roles));
          
          // Apply reviewer counts to Reviewer menu items
          if (route.name === "Reviewer") {
            visibleChildren = visibleChildren.map((sub) => {
              const countMap = {
                "/ebook/reviewer": reviewerCounts.all,
                "/ebook/reviewer/pending": reviewerCounts.pending,
                "/ebook/reviewer/accepted": reviewerCounts.accepted,
                "/ebook/reviewer/rejected": reviewerCounts.rejected,
                "/ebook/reviewer/completed": reviewerCounts.completed,
                "/ebook/reviewer/overdue": reviewerCounts.overdue,
              };
              return { ...sub, name: withReviewerCount(sub.name, countMap[sub.path] ?? 0) };
            });
          }
          
          if (!visibleChildren.length) return null;
          return { ...route, subMenu: visibleChildren };
        }
        return route;
      })
      .filter(Boolean);

  // Module Routes (combining all from both files)
  const moduleRoutes = {
    [MODULES.SYSTEM_WIDE]: [
      {
        name: "Dashboard",
        path: "/admin-dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        name: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.SUPER_ADMIN],
        subMenu: [
          { name: "All Users", path: "/users", icon: "fas fa-list", roles: [ROLES.SUPER_ADMIN] },
          { name: "Roles", path: "/roles", icon: "fas fa-user-tag", roles: [ROLES.SUPER_ADMIN] },
          { name: "Permissions", path: "/permissions", icon: "fas fa-key", roles: [ROLES.SUPER_ADMIN] },
          { name: "Modules", path: "/modules", icon: "fas fa-th", roles: [ROLES.SUPER_ADMIN] },
        ],
      },
      {
        name: "System Settings",
        icon: "fas fa-cogs",
        roles: [ROLES.SUPER_ADMIN],
        subMenu: [
          { name: "General Settings", path: "/settings/general", icon: "fas fa-sliders-h", roles: [ROLES.SUPER_ADMIN] },
          { name: "Audit Logs", path: "/settings/logs", icon: "fas fa-file-alt", roles: [ROLES.SUPER_ADMIN] },
        ],
      },
      {
        name: "Reports",
        icon: "fas fa-chart-pie",
        roles: [ROLES.SUPER_ADMIN],
        subMenu: [
          { name: "User Activity", path: "/reports/user-activity", icon: "fas fa-user-clock", roles: [ROLES.SUPER_ADMIN] },
          { name: "System Usage", path: "/reports/system-usage", icon: "fas fa-server", roles: [ROLES.SUPER_ADMIN] },
        ],
      },
    ],

    [MODULES.JOURNAL]: [
      {
        name: "Dashboard",
        path: "/journal-dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR, ROLES.REVIEWER],
      },
      {
        name: "Users & Roles",
        icon: "fas fa-users",
        roles: [ROLES.JOURNAL_MANAGER],
        subMenu: [
          { name: "All Users", path: "/journal/users", icon: "fas fa-user" },
          { name: "Add New User", path: "/module/users/add", icon: "fas fa-user-tag" },
        ],
      },
      {
        name: "Journals",
        icon: "fas fa-book",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
        subMenu: [
          { name: "Add Journal", path: "/journal/create", icon: "fas fa-plus" },
          { name: "Journal List", path: "/journal/list", icon: "fas fa-list" },
        ],
      },
      {
        name: "Author Dashboard",
        path: "/journal/author-dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
      {
        name: "Submissions",
        icon: "fas fa-file-alt",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.JOURNAL_AUTHOR, ROLES.EDITOR],
        subMenu: [
          { name: "My Submissions", path: "/journal/manuscripts", icon: "fas fa-inbox", roles: [ROLES.JOURNAL_AUTHOR] },
          { name: "New Submission", path: "/manuscripts/create", icon: "fas fa-paper-plane", roles: [ROLES.JOURNAL_AUTHOR] },
          { name: "Incomplete Submissions", path: "/manuscript/draft-manuscript", icon: "fas fa-file", roles: [ROLES.JOURNAL_AUTHOR] },
          { name: "Revisions", path: "/journal/manuscripts/revisions", icon: "fas fa-edit", roles: [ROLES.JOURNAL_AUTHOR] },
        ],
      },
      {
        name: "Editorial Oversight",
        icon: "fas fa-user-shield",
        roles: [ROLES.JOURNAL_EIC],
        subMenu: [
          { name: "All Submissions", path: "/journal/eic/submissions", icon: "fas fa-folder-open" },
          { name: "Publication Payments", path: "/eic/payment-orders", icon: "fas fa-credit-card" },
          // { name: "Final Decisions", path: "/journal/eic/final-decisions", icon: "fas fa-gavel" },
          // { name: "Ethics & Compliance", path: "/journal/eic/ethics", icon: "fas fa-balance-scale" },
          // { name: "Production Approval", path: "/journal/eic/production", icon: "fas fa-check-double" },
          // { name: "Issue Scheduling", path: "/journal/eic/issues", icon: "fas fa-calendar-alt" },
          // { name: "Editorial Reports", path: "/journal/eic/reports", icon: "fas fa-chart-line" },
        ],
      },
      {
        name: "Manuscript Handling",
        icon: "fas fa-user-edit",
        roles: [ROLES.JOURNAL_ASSOCIATE_EDITOR],
        subMenu: [
          { name: "Submitted Manuscripts", path: "/manuscript/ae/assigned-manuscripts", icon: "fas fa-folder-open" },
          { name: "Initial Screening", path: "/manuscription/ae/screening", icon: "fas fa-search" },
          // { name: "Review Evaluation", path: "/journal/ae/review-evaluation", icon: "fas fa-check-circle" },
          { name: "Under Review", path: "/manuscript/ae/under-review", icon: "fas fa-hourglass-half" },
          // { name: "Recommendations to EIC", path: "/journal/ae/recommendations", icon: "fas fa-gavel" },
          // { name: "Ethics & Compliance", path: "/journal/ae/ethics", icon: "fas fa-balance-scale" },
          // { name: "Production Tracking", path: "/journal/ae/production", icon: "fas fa-industry" },
        ],
      },
      {
        name: "Peer Review",
        icon: "fas fa-user-check",
        roles: [ROLES.JOURNAL_REFREE],
        subMenu: [
          { name: "Assigned Reviews", path: "/journal/reviewer/assigned", icon: "fas fa-inbox" },
          // { name: "Review Workspace", path: "/journal/reviewer/workspace", icon: "fas fa-file-alt" },
          // { name: "Submit Review Report", path: "/journal/reviewer/submit-review", icon: "fas fa-paper-plane" },
          // { name: "Blind Review Files", path: "/journal/reviewer/files", icon: "fas fa-user-secret" },
          // { name: "Ethics & COPE Compliance", path: "/journal/reviewer/ethics", icon: "fas fa-balance-scale" },
          // { name: "Completed Reviews", path: "/journal/reviewer/completed", icon: "fas fa-check-circle" },
        ],
      },
      {
        name: "Profile & Declarations",
        icon: "fas fa-id-card",
        roles: [ROLES.JOURNAL_AUTHOR, ROLES.REVIEWER, ROLES.EDITOR, ROLES.JOURNAL_MANAGER],
        subMenu: [
          { name: "My Profile", path: "/journal/profile", icon: "fas fa-user" },
          { name: "Ethics Declarations", path: "/journal/declarations", icon: "fas fa-shield-alt" },
        ],
      },
    ],

    [MODULES.LIBRARY]: buildLibraryRoutes(),

    [MODULES.EBOOK]: buildEbookRoutes(),

    [MODULES.ORO_WIKI]: [
      {
        name: "Manager Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_MANAGER],
      },
      {
        name: "Content Management",
        icon: "fas fa-file-alt",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
          { name: "Recent Changes", path: "/wiki/recent-changes", icon: "fas fa-clock" },
          { name: "Popular Articles", path: "/wiki/popular", icon: "fas fa-star" },
          { name: "Random Article", path: "/wiki/random", icon: "fas fa-random" },
          { name: "Check Vandalism", path: "/wiki/vandalism/check", icon: "fas fa-flag" },
        ],
      },
      {
        name: "Categories",
        icon: "fas fa-folder",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          { name: "All Categories", path: "/wiki/categories", icon: "fas fa-list" },
          { name: "Create Category", path: "/wiki/categories/create", icon: "fas fa-plus" },
        ],
      },
      {
        name: "Media Library",
        icon: "fas fa-photo-video",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          { name: "All Media", path: "/wiki/media", icon: "fas fa-images" },
          { name: "Upload Media", path: "/wiki/media/upload", icon: "fas fa-upload" },
        ],
      },
      {
        name: "Users & Roles",
        icon: "fas fa-users",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          { name: "All Users", path: "/wiki/users", icon: "fas fa-user" },
          { name: "Roles", path: "/wiki/roles", icon: "fas fa-user-tag" },
        ],
      },
      {
        name: "Settings",
        path: "/wiki/settings",
        icon: "fas fa-cogs",
        roles: [ROLES.ORO_WIKI_MANAGER],
      },
      {
        name: "Reports",
        path: "/wiki/reports",
        icon: "fas fa-chart-bar",
        roles: [ROLES.ORO_WIKI_MANAGER],
      },
      {
        name: "Editor Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_EDITOR],
      },
      {
        name: "My Articles",
        icon: "fas fa-file-alt",
        roles: [ROLES.ORO_WIKI_EDITOR],
        subMenu: [
          { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
          { name: "Create Article", path: "/wiki/articles/create", icon: "fas fa-plus" },
          { name: "Drafts", path: "/wiki/articles/drafts", icon: "fas fa-edit" },
        ],
      },
      {
        name: "Media Library",
        icon: "fas fa-photo-video",
        roles: [ROLES.ORO_WIKI_EDITOR],
        subMenu: [
          { name: "All Media", path: "/wiki/media", icon: "fas fa-images" },
          { name: "Upload Media", path: "/wiki/media/upload", icon: "fas fa-upload" },
        ],
      },
      {
        name: "Publisher Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_PUBLISHER],
      },
      {
        name: "Publishing",
        icon: "fas fa-upload",
        roles: [ROLES.ORO_WIKI_PUBLISHER],
        subMenu: [
          { name: "Publishing Queue", path: "/wiki/articles/publish", icon: "fas fa-upload" },
          { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
        ],
      },
      {
        name: "Media Library",
        icon: "fas fa-photo-video",
        roles: [ROLES.ORO_WIKI_PUBLISHER],
        subMenu: [
          { name: "All Media", path: "/wiki/media", icon: "fas fa-images" },
        ],
      },
      {
        name: "Governance Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_BUREAUCRAT],
      },
      {
        name: "Users & Roles",
        icon: "fas fa-users",
        roles: [ROLES.ORO_WIKI_BUREAUCRAT],
        subMenu: [
          { name: "All Users", path: "/wiki/users", icon: "fas fa-user" },
          { name: "Roles", path: "/wiki/roles", icon: "fas fa-user-tag" },
        ],
      },
      {
        name: "Reports",
        path: "/wiki/reports",
        icon: "fas fa-chart-bar",
        roles: [ROLES.ORO_WIKI_BUREAUCRAT],
      },
      {
        name: "Oversight Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_OVERSIGHTER],
      },
      {
        name: "Moderation",
        path: "/wiki/moderation",
        icon: "fas fa-shield-alt",
        roles: [ROLES.ORO_WIKI_OVERSIGHTER],
      },
    ],

    [MODULES.REPOSITORY]: [
      {
        name: "Admin Dashboard",
        path: "/repository/admin/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.REPOSITORY_ADMIN],
      },
      {
        name: "All Submissions",
        icon: "fas fa-inbox",
        roles: [ROLES.REPOSITORY_ADMIN],
        subMenu: [
          { name: "Pending Review", path: "/repository/submissions/pending", icon: "fas fa-clock" },
          { name: "Under Curation", path: "/repository/submissions/curation", icon: "fas fa-edit" },
          { name: "Ready for Approval", path: "/repository/submissions/ready", icon: "fas fa-check-circle" },
          { name: "Approved", path: "/repository/submissions/approved", icon: "fas fa-check" },
          { name: "Rejected", path: "/repository/submissions/rejected", icon: "fas fa-times" },
          { name: "All Items", path: "/repository/submissions/all", icon: "fas fa-list" },
        ],
      },
      {
        name: "Users & Roles",
        icon: "fas fa-users",
        roles: [ROLES.REPOSITORY_ADMIN],
        subMenu: [
          { name: "All Users", path: "/journal/users", icon: "fas fa-user" },
          { name: "Add New User", path: "/journal/users/add", icon: "fas fa-user-tag" },
        ],
      },
      {
        name: "Configuration",
        icon: "fas fa-cogs",
        roles: [ROLES.REPOSITORY_ADMIN],
        subMenu: [
          { name: "Repository Settings", path: "/repository/settings/general", icon: "fas fa-sliders-h" },
          { name: "Policy Management", path: "/repository/settings/policies", icon: "fas fa-file-contract" },
          { name: "Metadata Schemas", path: "/repository/settings/metadata", icon: "fas fa-database" },
          { name: "Workflow Designer", path: "/repository/settings/workflow", icon: "fas fa-project-diagram" },
          { name: "License Templates", path: "/repository/settings/licenses", icon: "fas fa-balance-scale" },
        ],
      },
      {
        name: "Analytics & Reports",
        icon: "fas fa-chart-bar",
        roles: [ROLES.REPOSITORY_ADMIN],
        subMenu: [
          { name: "Comprehensive Reports", path: "/repository/reports/analytics", icon: "fas fa-chart-line" },
          { name: "Usage Statistics", path: "/repository/reports/usage", icon: "fas fa-chart-pie" },
          { name: "Processing Times", path: "/repository/reports/timelines", icon: "fas fa-stopwatch" },
          { name: "Data Exports", path: "/repository/reports/exports", icon: "fas fa-file-export" },
        ],
      },
      {
        name: "Curator Dashboard",
        path: "/repository/curator/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.REPOSITORY_CURATOR],
      },
      {
        name: "Submission Queue",
        icon: "fas fa-inbox",
        roles: [ROLES.REPOSITORY_CURATOR],
        subMenu: [
          { name: "New (Unreviewed)", path: "/repository/curator/queue/new", icon: "fas fa-exclamation-circle" },
          { name: "In Progress", path: "/repository/curator/queue/in-progress", icon: "fas fa-spinner" },
          { name: "Ready for Approval", path: "/repository/curator/queue/ready", icon: "fas fa-check-circle" },
          { name: "Returned Items", path: "/repository/curator/queue/returned", icon: "fas fa-undo" },
        ],
      },
      {
        name: "Collections",
        icon: "fas fa-folder-open",
        roles: [ROLES.REPOSITORY_CURATOR],
        subMenu: [
          { name: "By Author", path: "/repository/collections/author", icon: "fas fa-user-graduate" },
          { name: "By Resource Type", path: "/repository/collections/type", icon: "fas fa-th-large" },
        ],
      },
      {
        name: "Reports",
        icon: "fas fa-chart-bar",
        roles: [ROLES.REPOSITORY_CURATOR],
        subMenu: [
          { name: "Submission Trends", path: "/repository/reports/trends", icon: "fas fa-chart-bar" },
          { name: "Processing Times", path: "/repository/reports/timelines", icon: "fas fa-clock" },
          { name: "Curator Performance", path: "/repository/reports/curator-performance", icon: "fas fa-user-check" },
          { name: "My Analytics", path: "/repository/reports/my-analytics", icon: "fas fa-chart-pie" },
        ],
      },
      {
        name: "Reviewer Dashboard",
        path: "/repository/reviewer/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.REPOSITORY_CONTENT_REVIEWER],
      },
      {
        name: "Review Queue",
        icon: "fas fa-clipboard-list",
        roles: [ROLES.REPOSITORY_CONTENT_REVIEWER],
        subMenu: [
          { name: "New Assignments", path: "/repository/reviewer/queue/new", icon: "fas fa-exclamation-circle" },
          { name: "In Progress", path: "/repository/reviewer/queue/in-progress", icon: "fas fa-spinner" },
          { name: "Completed", path: "/repository/reviewer/queue/completed", icon: "fas fa-check-circle" },
          { name: "Scheduled", path: "/repository/reviewer/queue/scheduled", icon: "fas fa-calendar-alt" },
        ],
      },
      {
        name: "Review Tools",
        icon: "fas fa-tools",
        roles: [ROLES.REPOSITORY_CONTENT_REVIEWER],
        subMenu: [
          { name: "View Submission", path: "/repository/reviewer/tools/view", icon: "fas fa-eye" },
          { name: "Review Form", path: "/repository/reviewer/tools/form", icon: "fas fa-file-alt" },
          { name: "Similarity Check", path: "/repository/reviewer/tools/similarity", icon: "fas fa-search" },
          { name: "Quality Assessment", path: "/repository/reviewer/tools/quality", icon: "fas fa-star" },
          { name: "Private Notes", path: "/repository/reviewer/tools/notes", icon: "fas fa-sticky-note" },
        ],
      },
      {
        name: "My Repository",
        path: "/repository/author/dashboard",
        icon: "fas fa-home",
        roles: [ROLES.RESEARCHER_AUTHOR],
      },
      {
        name: "Submit",
        icon: "fas fa-plus-circle",
        roles: [ROLES.RESEARCHER_AUTHOR],
        subMenu: [
          { name: "Repository Items", path: "/repository/author/submit/list", icon: "fas fa-file-upload" },
          { name: "Add New", path: "/repository/create", icon: "fas fa-folder-plus" },
        ],
      },
      {
        name: "My Deposits",
        icon: "fas fa-folder",
        roles: [ROLES.RESEARCHER_AUTHOR],
        subMenu: [
          { name: "Drafts", path: "/repository/author/deposits/drafts", icon: "fas fa-edit" },
          { name: "Under Review", path: "/repository/author/deposits/review", icon: "fas fa-hourglass-half" },
          { name: "Returned to Revision", path: "/repository/author/deposits/returned", icon: "fas fa-redo" },
          { name: "Approved", path: "/repository/author/deposits/approved", icon: "fas fa-check" },
          { name: "Embargoed", path: "#", icon: "fas fa-lock" },
        ],
      },
      {
        name: "Search",
        path: "/repository/search",
        icon: "fas fa-search",
        roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
      },
      {
        name: "Browse",
        icon: "fas fa-compass",
        roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
        subMenu: [
          { name: "By Collection", path: "/repository/browse/collections", icon: "fas fa-folder" },
          { name: "By Author", path: "/repository/browse/authors", icon: "fas fa-user-graduate" },
          { name: "By Subject", path: "/repository/browse/subjects", icon: "fas fa-tags" },
          { name: "By Date", path: "/repository/browse/date", icon: "fas fa-calendar" },
          { name: "By Department", path: "/repository/browse/department", icon: "fas fa-building" },
        ],
      },
      {
        name: "Featured",
        icon: "fas fa-star",
        roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
        subMenu: [
          { name: "Recent Additions", path: "/repository/featured/recent", icon: "fas fa-clock" },
          { name: "Most Viewed", path: "/repository/featured/popular", icon: "fas fa-fire" },
          { name: "Most Downloaded", path: "/repository/featured/downloaded", icon: "fas fa-download" },
          { name: "Editor's Picks", path: "/repository/featured/picks", icon: "fas fa-award" },
        ],
      },
      {
        name: "Tools",
        icon: "fas fa-toolbox",
        roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
        subMenu: [
          { name: "Citation Generator", path: "/repository/tools/citation", icon: "fas fa-quote-right" },
          { name: "Export Citations", path: "/repository/tools/export", icon: "fas fa-file-export" },
          { name: "Save to List", path: "/repository/tools/savelist", icon: "fas fa-bookmark" },
          { name: "Email Alert", path: "/repository/tools/alerts", icon: "fas fa-envelope" },
        ],
      },
    ],

    [MODULES.RESEARCHER_NETWORK]: [
      {
        name: "Dashboard",
        path: "/research-network/dashboard",
        icon: "fas fa-network-wired",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER, ROLES.RESEARCHER_NETWORK_MODERATOR],
      },
      {
        name: "Users & Roles",
        icon: "fas fa-users",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          { name: "All Users", path: "/journal/users", icon: "fas fa-user" },
          { name: "Add New User", path: "/journal/users/add", icon: "fas fa-user-tag" },
        ],
      },
      {
        name: "Research Projects",
        icon: "fas fa-flask",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          { name: "All Projects", path: "/research-network/projects", icon: "fas fa-list" },
          { name: "Create Project", path: "/research-network/projects/create", icon: "fas fa-plus" },
          { name: "Ongoing Projects", path: "/research-network/projects/ongoing", icon: "fas fa-spinner" },
          { name: "Completed Projects", path: "/research-network/projects/completed", icon: "fas fa-check" },
        ],
      },
      {
        name: "Collaborations",
        icon: "fas fa-handshake",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          { name: "All Collaborations", path: "/research-network/collaborations", icon: "fas fa-list" },
          { name: "New Collaboration", path: "/research-network/collaborations/create", icon: "fas fa-plus" },
        ],
      },
      {
        name: "Researchers",
        icon: "fas fa-user-graduate",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          { name: "All Researchers", path: "/research-network/researchers", icon: "fas fa-list" },
          { name: "Invite Researcher", path: "/research-network/researchers/invite", icon: "fas fa-user-plus" },
        ],
      },
      {
        name: "Funding",
        icon: "fas fa-hand-holding-usd",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          { name: "All Funding", path: "/research-network/funding", icon: "fas fa-list" },
          { name: "Add Funding", path: "/research-network/funding/create", icon: "fas fa-plus" },
        ],
      },
      {
        name: "Reports",
        path: "/research-network/reports",
        icon: "fas fa-chart-bar",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
      },
      {
        name: "Settings",
        path: "/research-network/settings",
        icon: "fas fa-cogs",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
      },
      {
        name: "Groups & Moderation",
        icon: "fas fa-users-cog",
        roles: [ROLES.RESEARCHER_NETWORK_MODERATOR, ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          { name: "Research Groups", path: "/research-network/groups", icon: "fas fa-layer-group" },
          { name: "Membership Requests", path: "/research-network/groups/requests", icon: "fas fa-user-check" },
          { name: "Group Discussions", path: "/research-network/groups/discussions", icon: "fas fa-comments" },
          { name: "Reported Issues", path: "/research-network/groups/reports", icon: "fas fa-flag" },
          { name: "Conflict Resolution", path: "/research-network/groups/conflicts", icon: "fas fa-balance-scale" },
          { name: "Community Guidelines", path: "/research-network/guidelines", icon: "fas fa-book" },
        ],
      },
    ],
  };

  // Early return after all hooks have been called
  if (!user) {
    return null;
  }

  const routes = moduleRoutes[moduleId] ? filterRoutesByRole(moduleRoutes[moduleId]) : [];

  const toggleMenu = (label) => setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const roleNames =
  user?.roles?.length
    ? user.roles.map((r) => r.role_name || r.name || r.code)
    : user?.user_roles?.map((ur) => ur.role?.role_name || ur.role?.name) || [];

const cleanedRoleNames = roleNames.filter(Boolean);

  return (
    <aside className="main-sidebar sidebar-modern elevation-4">
      <style>{`
        .sidebar-modern {
          background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.02);
          min-height: 100vh;
          width: 250px;
          position: fixed;
          left: 0;
          top: 0;
          transition: all 0.3s ease;
          z-index: 1030;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .brand-link {
          display: flex;
          align-items: center;
          padding: 1.2rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          text-decoration: none;
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(135deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.5px;
        }

        .user-panel {
          padding: 1.2rem 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(5px);
        }

        .user-panel .image img {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(52, 152, 219, 0.15);
          object-fit: cover;
        }

        .user-panel .info a {
          color: #2c3e50;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
        }

        .user-panel .info small {
          color: #7f8c8d;
          font-size: 0.75rem;
          display: block;
          margin-top: 2px;
        }

        .nav-sidebar {
          padding: 1rem 0.5rem;
        }

        .nav-item {
          margin-bottom: 0.25rem;
          list-style: none;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.7rem 1rem;
          border-radius: 12px;
          color: #4a5568;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }

        .nav-link:hover {
          background: linear-gradient(90deg, #f0f7ff, #ffffff);
          color: #3498db;
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
        }

        .nav-link.active {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          box-shadow: 0 6px 15px rgba(52, 152, 219, 0.3);
        }

        .nav-link.active i {
          color: white;
        }

        .nav-link i {
          margin-right: 12px;
          font-size: 1.1rem;
          width: 24px;
          text-align: center;
          color: #7f8c8d;
        }

        .nav-link:hover i {
          color: #3498db;
        }

        .nav-link p {
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-link .right {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .nav-item.menu-open .nav-link .right {
          transform: rotate(-90deg);
        }

        .nav-treeview {
          padding-left: 2.5rem;
          margin: 0.25rem 0;
          list-style: none;
        }

        .nav-treeview .nav-link {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          border-radius: 10px;
        }

        .nav-treeview .nav-link i {
          font-size: 0.7rem;
          margin-right: 8px;
          color: #95a5a6;
        }

        .logout-btn {
          margin-top: 2rem;
          padding: 0 0.5rem;
        }

        .logout-btn .nav-link {
          background: linear-gradient(135deg, #fee2e2, #fff5f5);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.1);
        }

        .logout-btn .nav-link i {
          color: #e74c3c;
        }

        .logout-btn .nav-link:hover {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
        }

        .nav-section-title {
          padding: 1rem 1rem 0.5rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #95a5a6;
          font-weight: 600;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .nav-item {
          animation: slideIn 0.3s ease forwards;
        }
      `}</style>

      <Link to="/" className="brand-link">
        <span className="brand-text font-weight-light">ORA</span>
      </Link>

      <div className="sidebar">
        <div className="user-panel">
          <div className="d-flex align-items-center">
            <div className="image me-3">
              <img src="/ora.png" className="img-circle" alt="User" />
            </div>
            <div className="info">
              <Link to="/profile" className="d-block">
                {user.full_name}
              </Link>
             <small className="text-muted d-block">{user.module_name}</small>

{cleanedRoleNames.length > 0 && (
  <small className="text-primary" style={{ fontSize: "0.75rem" }}>
    {cleanedRoleNames.join(", ")}
  </small>
)}
            </div>
          </div>
        </div>

        <nav className="mt-3">
          <ul className="nav nav-pills nav-sidebar flex-column">
            {routes.length > 0 && (
              <li className="nav-section-title">MAIN NAVIGATION</li>
            )}
            
            {routes.map((route, i) => {
              if (!route.subMenu) {
                return (
                  <li className="nav-item" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                    <Link
                      to={route.path}
                      className={`nav-link ${isActive(route.path) ? "active" : ""}`}
                    >
                      <i className={route.icon} />
                      <p>{route.name}</p>
                    </Link>
                  </li>
                );
              }

              const open = expandedMenus[route.name];
              const hasActiveChild = route.subMenu.some((sub) => isActive(sub.path));
              
              return (
                <li
                  key={i}
                  className={`nav-item has-treeview ${open || hasActiveChild ? "menu-open" : ""}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <button
                    className={`nav-link ${hasActiveChild ? "active" : ""}`}
                    onClick={() => toggleMenu(route.name)}
                    type="button"
                  >
                    <i className={route.icon} />
                    <p>
                      {route.name}
                      <i className="right fas fa-angle-left" />
                    </p>
                  </button>
                  <ul className="nav nav-treeview">
                    {route.subMenu.map((sub, idx) => (
                      <li className="nav-item" key={idx}>
                        <Link
                          to={sub.path}
                          className={`nav-link ${isActive(sub.path) ? "active" : ""}`}
                        >
                          <i className={sub.icon || "far fa-circle"} />
                          <p>{sub.name}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}

            <li className="nav-item logout-btn">
              <button
                className="nav-link w-100 text-start border-0"
                onClick={handleLogout}
                type="button"
              >
                <i className="fas fa-sign-out-alt" />
                <p>Logout</p>
              </button>
            </li>
          </ul>
        </nav>

        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #3498db, #9b59b6, #e74c3c)',
          margin: '1rem 0',
          borderRadius: '2px',
          opacity: 0.3
        }} />
      </div>
    </aside>
  );
}