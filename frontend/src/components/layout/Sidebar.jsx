import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

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
};

/* ===============================
   ROLE UUIDS
================================ */
const ROLES = {
  SUPER_ADMIN: "bf22a62f-e672-4e88-9c28-fa1eee3e0e22",
  JOURNAL_MANAGER: "311b2831-99d3-426b-9a7c-6453756d5d9a",
  EDITOR: "33333333-aaaa-bbbb-cccc-333333333333",
  LIBRARY_MANAGER: "5042b3f2-2cd6-4a1b-8015-6774c3956409",
  ORO_WIKI_MANAGER: "f06cb194-d9cf-4fb1-9ce8-55ded280e9b9",
  RESEARCHER_NETWORK_MANAGER: "d2db77c2-177c-44e6-921a-d635abd674d3",
  JOURNAL_AUTHOR: "1d67d32d-dcee-4302-8369-26ca00385a09",
  
  // Repository Roles (Updated to match SRS terminology)
  REPOSITORY_ADMIN: "5205b388-a2e4-4e40-baae-8fe018e08d18",
  REPOSITORY_CURATOR: "7047bc22-6575-436c-9777-e06869004a4a",
  REPOSITORY_CONTENT_REVIEWER: "9ef6032d-85da-4d1b-910e-72469e4f068c",
  RESEARCHER_AUTHOR: "bcb471d4-e59c-45f3-b512-e7c17a03c46c", // For depositing
  REPOSITORY_PUBLIC_USER: "bcb471d4-e59c-45f3-b512-e7c17a03c46c",
  REPOSITORY_GUEST: "efdda7b9-6884-42c7-b6f3-bed7ab4eb92e",
};

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  if (!user) return null;

  const moduleId = user.module_id;
  const userRoleIds = user.roles?.map((r) => r.role_id) || [];

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  /* ===============================
     FILTER ROUTES BY ROLE
================================ */
  const filterRoutesByRole = (routes) =>
    routes
      .map((route) => {
        if (!route.roles.some((r) => userRoleIds.includes(r))) return null;

        if (route.subMenu) {
          const children = route.subMenu.filter((c) =>
            c.roles ? c.roles.some((r) => userRoleIds.includes(r)) : true,
          );
          if (!children.length) return null;
          return { ...route, subMenu: children };
        }
        return route;
      })
      .filter(Boolean);

  
     // MODULE ROUTES
  const moduleRoutes = {
    [MODULES.SYSTEM_WIDE]: [
  // Dashboard
  {
    type: "single",
    path: "/admin-dashboard",
    name: "Dashboard",
    icon: "fas fa-tachometer-alt",
    roles: [ROLES.SUPER_ADMIN],
  },

  // User Management
  {
    name: "User Management",
    icon: "fas fa-users",
    roles: [ROLES.SUPER_ADMIN],
    subMenu: [
      {
        name: "All Users",
        path: "/users",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-list",
      },
      {
        name: "Roles",
        path: "/roles",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-user-tag",
      },
      {
        name: "Modules",
        path: "/modules",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-th",
      },
    ],
  },

  // System Settings
  {
    name: "System Settings",
    icon: "fas fa-cogs",
    roles: [ROLES.SUPER_ADMIN],
    subMenu: [
      {
        name: "General Settings",
        path: "/settings/general",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-sliders-h",
      },
      {
        name: "Permissions",
        path: "/permissions",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-key",
      },
      {
        name: "Audit Logs",
        path: "/settings/logs",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-file-alt",
      },
    ],
  },

  // Reports
  {
    name: "Reports",
    icon: "fas fa-chart-pie",
    roles: [ROLES.SUPER_ADMIN],
    subMenu: [
      {
        name: "User Activity",
        path: "/reports/user-activity",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-user-clock",
      },
      {
        name: "System Usage",
        path: "/reports/system-usage",
        roles: [ROLES.SUPER_ADMIN],
        icon: "fas fa-server",
      },
    ],
  },
],

// ================= JOURNAL MODULE =================
[MODULES.JOURNAL]: [
  /* ================= DASHBOARD ================= */
  {
    name: "Dashboard",
    path: "/journal/dashboard",
    icon: "fas fa-tachometer-alt",
    roles: [
      ROLES.JOURNAL_MANAGER,
      ROLES.JOURNAL_AUTHOR,
      ROLES.EDITOR,
      ROLES.REVIEWER,
    ],
  },

  /* ================= USERS & ROLES ================= */
  {
    name: "Users & Roles",
    icon: "fas fa-users",
    roles: [ROLES.JOURNAL_MANAGER],
    subMenu: [
      {
        name: "All Users",
        path: "/journal/users",
        icon: "fas fa-user",
      },
      {
        name: "Add New User",
        path: "/journal/users/add",
        icon: "fas fa-user-tag",
      },
    ],
  },

  /* ================= JOURNALS ================= */
  {
    name: "Journals",
    icon: "fas fa-book",
    roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
    subMenu: [
      {
        name: "All Journals",
        path: "/journal/list",
        icon: "fas fa-list",
      },
      {
        name: "Add Journal",
        path: "/journal/create",
        icon: "fas fa-plus",
      },
    ],
  },

  /* ================= MANUSCRIPTS ================= */
  {
    name: "Manuscripts",
    icon: "fas fa-file-alt",
    roles: [ROLES.JOURNAL_MANAGER, ROLES.JOURNAL_AUTHOR, ROLES.EDITOR],
    subMenu: [
      /* ----- AUTHOR ----- */
       {
        name: "Journals",
        path: "/journal/list",
        icon: "fas fa-upload",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
      {
        name: "Submit Manuscript",
        path: "/journal/manuscripts",
        icon: "fas fa-paper-plane",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
      {
        name: "Draft Manuscript",
        path: "/journal/draft-manuscript",
        icon: "fas fa-paper-plane",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
      {
        name: "Revisions Required",
        path: "/journal/manuscripts/revisions",
        icon: "fas fa-edit",
        roles: [ROLES.JOURNAL_AUTHOR],
      },

      /* ----- EDITOR / MANAGER ----- */
      {
        name: "All Manuscripts",
        path: "/journal/manuscripts",
        icon: "fas fa-database",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
      },
      {
        name: "Accepted Manuscripts",
        path: "/journal/manuscripts/accepted",
        icon: "fas fa-check-circle",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
      },
      ,
      {
        name: "Manuscription Status",
        path: "/journal/manuscripts-status",
        icon: "fas fa-balance-scale",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
      },
    ],
  },

  /* ================= REVIEWS ================= */
  {
    name: "Reviews",
    icon: "fas fa-clipboard-check",
    roles: [
      ROLES.JOURNAL_MANAGER,
      ROLES.REVIEWER,
      ROLES.JOURNAL_AUTHOR, // only if author is also reviewer
      ROLES.EDITOR,
    ],
    subMenu: [
      {
        name: "Assigned Reviews",
        path: "/journal/reviews/reviewer",
        icon: "fas fa-tasks",
        roles: [ROLES.REVIEWER],
      },
      {
        name: "Submit Review",
        path: "/journal/reviews/submit/:manuscriptId",
        icon: "fas fa-paper-plane",
        roles: [ROLES.REVIEWER],
      },
      {
        name: "Review History",
        path: "/journal/reviews/history",
        icon: "fas fa-history",
        roles: [ROLES.REVIEWER],
      },
      {
        name: "Reviewer Invitations",
        path: "/journal/reviews/invitations",
        icon: "fas fa-user-check",
        roles: [ROLES.REVIEWER],
      },
      {
        name: "Reviewer Workload",
        path: "/journal/reviews/workload",
        icon: "fas fa-balance-scale",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
      }
    ],
  },

  /* ================= AUTHORS & CO-AUTHORS ================= */
  {
    name: "Authors & Co-authors",
    icon: "fas fa-users",
    roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR, ROLES.JOURNAL_AUTHOR],
    subMenu: [
      {
        name: "Author List",
        path: "/journal/authors",
        icon: "fas fa-user-edit",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
      },
      {
        name: "Invite Co-author",
        path: "/journal/coauthors/invite",
        icon: "fas fa-user-plus",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
      {
        name: "My Invitations",
        path: "/journal/coauthors/my-invitations",
        icon: "fas fa-envelope-open-text",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
    ],
  },

  /* ================= PROFILE ================= */
  {
    name: "Profile & Declarations",
    icon: "fas fa-id-card",
    roles: [
      ROLES.JOURNAL_AUTHOR,
      ROLES.REVIEWER,
      ROLES.EDITOR,
      ROLES.JOURNAL_MANAGER,
    ],
    subMenu: [
      {
        name: "My Profile",
        path: "/journal/profile",
        icon: "fas fa-user",
      },
      {
        name: "Ethics Declarations",
        path: "/journal/declarations",
        icon: "fas fa-shield-alt",
      },
    ],
  },
],

// ================= LIBRARY MODULE ================= */
    [MODULES.LIBRARY]: [
      {
        name: "Dashboard",
        path: "/library/dashboard",
        icon: "fas fa-book",
        roles: [ROLES.LIBRARY_MANAGER],
      },
      {
        name: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.LIBRARY_MANAGER],
        subMenu: [
          {
            name: "All Users",
            path: "/library/users",
            roles: [ROLES.LIBRARY_MANAGER],
            icon: "fas fa-list",
          },
          {
            name: "Create User",
            path: "/library/users/create",
            roles: [ROLES.LIBRARY_MANAGER],
            icon: "fas fa-user-plus",
          },
        ],
      },
    ],

    /* ================= OROMO WIKIPEDIA ================= */
    [MODULES.ORO_WIKI]: [
      {
        name: "Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_MANAGER],
      },

      {
        name: "Articles",
        icon: "fas fa-file-alt",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
          {
            name: "Create Article",
            path: "/wiki/articles/create",
            icon: "fas fa-plus",
          },
          {
            name: "Drafts",
            path: "/wiki/articles/drafts",
            icon: "fas fa-edit",
          },
        ],
      },

      {
        name: "Categories",
        icon: "fas fa-folder",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          {
            name: "All Categories",
            path: "/wiki/categories",
            icon: "fas fa-list",
          },
          {
            name: "Create Category",
            path: "/wiki/categories/create",
            icon: "fas fa-plus",
          },
        ],
      },

      {
        name: "Media Library",
        icon: "fas fa-photo-video",
        roles: [ROLES.ORO_WIKI_MANAGER],
        subMenu: [
          { name: "All Media", path: "/wiki/media", icon: "fas fa-images" },
          {
            name: "Upload Media",
            path: "/wiki/media/upload",
            icon: "fas fa-upload",
          },
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
        name: "Moderation",
        path: "/wiki/moderation",
        icon: "fas fa-shield-alt",
        roles: [ROLES.ORO_WIKI_MANAGER],
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
    ],
    /* ================ REPOSITORY MODULE ================ */
[MODULES.REPOSITORY]: [
  /* ===============================
     REPOSITORY ADMINISTRATOR VIEW
  =============================== */
  {
    name: "Dashboard",
    path: "/repository/admin/dashboard",
    icon: "fas fa-tachometer-alt",
    roles: [ROLES.REPOSITORY_ADMIN],
  },
  {
    name: "All Submissions",
    icon: "fas fa-inbox",
    roles: [ROLES.REPOSITORY_ADMIN],
    subMenu: [
      {
        name: "Pending Review",
        path: "/repository/submissions/pending",
        icon: "fas fa-clock",
      },
      {
        name: "Under Curation",
        path: "/repository/submissions/curation",
        icon: "fas fa-edit",
      },
      {
        name: "Ready for Approval",
        path: "/repository/submissions/ready",
        icon: "fas fa-check-circle",
      },
      {
        name: "Approved",
        path: "/repository/submissions/approved",
        icon: "fas fa-check",
      },
      {
        name: "Rejected",
        path: "/repository/submissions/rejected",
        icon: "fas fa-times",
      },
      {
        name: "All Items",
        path: "/repository/submissions/all",
        icon: "fas fa-list",
      },
    ],
  },
  {
    name: "Users & Roles",
    icon: "fas fa-users",
    roles: [ROLES.REPOSITORY_ADMIN],
    subMenu: [
      {
        name: "All Users",
        path: "/journal/users",
        icon: "fas fa-user",
      },
      {
        name: "Add New User",
        path: "/journal/users/add",
        icon: "fas fa-user-tag",
      },
    ],
  },
  {
    name: "Configuration",
    icon: "fas fa-cogs",
    roles: [ROLES.REPOSITORY_ADMIN],
    subMenu: [
      {
        name: "Repository Settings",
        path: "/repository/settings/general",
        icon: "fas fa-sliders-h",
      },
      {
        name: "Policy Management",
        path: "/repository/settings/policies",
        icon: "fas fa-file-contract",
      },
      {
        name: "Metadata Schemas",
        path: "/repository/settings/metadata",
        icon: "fas fa-database",
      },
      {
        name: "Workflow Designer",
        path: "/repository/settings/workflow",
        icon: "fas fa-project-diagram",
      },
      {
        name: "License Templates",
        path: "/repository/settings/licenses",
        icon: "fas fa-balance-scale",
      },
    ],
  },
  {
    name: "Analytics & Reports",
    icon: "fas fa-chart-bar",
    roles: [ROLES.REPOSITORY_ADMIN],
    subMenu: [
      {
        name: "Comprehensive Reports",
        path: "/repository/reports/analytics",
        icon: "fas fa-chart-line",
      },
      {
        name: "Usage Statistics",
        path: "/repository/reports/usage",
        icon: "fas fa-chart-pie",
      },
      {
        name: "Processing Times",
        path: "/repository/reports/timelines",
        icon: "fas fa-stopwatch",
      },
      {
        name: "Data Exports",
        path: "/repository/reports/exports",
        icon: "fas fa-file-export",
      },
    ],
  },

  /* ===============================
     REPOSITORY CURATOR VIEW
  =============================== */
  {
    name: "Curation Dashboard",
    path: "/repository/curator/dashboard",
    icon: "fas fa-tachometer-alt",
    roles: [ROLES.REPOSITORY_CURATOR],
  },
  {
    name: "Submission Queue",
    icon: "fas fa-inbox",
    roles: [ROLES.REPOSITORY_CURATOR],
    subMenu: [
      {
        name: "New (Unreviewed)",
        path: "/repository/curator/queue/new",
        icon: "fas fa-exclamation-circle",
      },
      {
        name: "In Progress",
        path: "/repository/curator/queue/in-progress",
        icon: "fas fa-spinner",
      },
      {
        name: "Ready for Approval",
        path: "/repository/curator/queue/ready",
        icon: "fas fa-check-circle",
      },
      {
        name: "Returned Items",
        path: "/repository/curator/queue/returned",
        icon: "fas fa-undo",
      },
    ],
  },
  // {
  //   name: "Curation Tools",
  //   icon: "fas fa-tools",
  //   roles: [ROLES.REPOSITORY_CURATOR],
  //   subMenu: [
  //     {
  //       name: "Metadata Enhancement",
  //       path: "/repository/curator/tools",
  //       icon: "fas fa-edit",
  //     },
  //     {
  //       name: "Vocabulary Assignment",
  //       path: "/repository/curator/tools/vocabulary",
  //       icon: "fas fa-tags",
  //     },
  //     {
  //       name: "Copyright Check",
  //       path: "/repository/curator/tools/copyright",
  //       icon: "fas fa-copyright",
  //     },
  //     {
  //       name: "Related Items",
  //       path: "/repository/curator/tools/relations",
  //       icon: "fas fa-link",
  //     },
  //     {
  //       name: "Batch Processing",
  //       path: "/repository/curator/tools/batch",
  //       icon: "fas fa-object-group",
  //     },
  //   ],
  // },
  {
    name: "Collections",
    icon: "fas fa-folder-open",
    roles: [ROLES.REPOSITORY_CURATOR],
    subMenu: [
    
      {
        name: "By Author",
        path: "/repository/collections/author",
        icon: "fas fa-user-graduate",
      },
      {
        name: "By Resource Type",
        path: "/repository/collections/type",
        icon: "fas fa-th-large",
      },

    ],
    
  },
  {
    name: "Reports",
    icon: "fas fa-chart-bar",
    roles: [
      ROLES.REPOSITORY_CURATOR
    ],
  subMenu: [
  {
    name: "Submission Trends",
    path: "/repository/reports/trends",
    icon: "fas fa-chart-bar",
    roles: [ROLES.REPOSITORY_CURATOR],
  },
  {
    name: "Processing Times",
    path: "/repository/reports/timelines",
    icon: "fas fa-clock",             
    roles: [ROLES.REPOSITORY_CURATOR],
  },
  {
    name: "Curator Performance",
    path: "/repository/reports/curator-performance",
    icon: "fas fa-user-check",  
    roles: [ROLES.REPOSITORY_CURATOR],
  },
  {
    name: "My Analytics",
    path: "/repository/reports/my-analytics",
    icon: "fas fa-chart-pie",            // ✅ correct
    roles: [ROLES.REPOSITORY_CURATOR],
  },
]
  },

  /* ===============================
     CONTENT REVIEWER VIEW
  =============================== */
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
      {
        name: "New Assignments",
        path: "/repository/reviewer/queue/new",
        icon: "fas fa-exclamation-circle",
      },
      {
        name: "In Progress",
        path: "/repository/reviewer/queue/in-progress",
        icon: "fas fa-spinner",
      },
      {
        name: "Completed",
        path: "/repository/reviewer/queue/completed",
        icon: "fas fa-check-circle",
      },
      {
        name: "Scheduled",
        path: "/repository/reviewer/queue/scheduled",
        icon: "fas fa-calendar-alt",
      },
    ],
  },
  {
    name: "Review Tools",
    icon: "fas fa-tools",
    roles: [ROLES.REPOSITORY_CONTENT_REVIEWER],
    subMenu: [
      {
        name: "View Submission",
        path: "/repository/reviewer/tools/view",
        icon: "fas fa-eye",
      },
      {
        name: "Review Form",
        path: "/repository/reviewer/tools/form",
        icon: "fas fa-file-alt",
      },
      {
        name: "Similarity Check",
        path: "/repository/reviewer/tools/similarity",
        icon: "fas fa-search",
      },
      {
        name: "Quality Assessment",
        path: "/repository/reviewer/tools/quality",
        icon: "fas fa-star",
      },
      {
        name: "Private Notes",
        path: "/repository/reviewer/tools/notes",
        icon: "fas fa-sticky-note",
      },
    ],
  },

  /* ===============================
     RESEARCHER/AUTHOR VIEW
  =============================== */
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
      {
        name: "Repository Items",
        path: "/repository/author/submit/list",
        icon: "fas fa-file-upload",
      },
      {
        name: "Add New",
        path: "/repository/create",
        icon: "fas fa-folder-plus",
      },
    ],
  },
  {
    name: "My Deposits",
    icon: "fas fa-folder",
    roles: [ROLES.RESEARCHER_AUTHOR],
    subMenu: [
      {
        name: "Drafts",
        path: "/repository/author/deposits/drafts",
        icon: "fas fa-edit",
      },
      {
        name: "Under Review",
        path: "/repository/author/deposits/review",
        icon: "fas fa-hourglass-half",
      },
      {
        name: "Returned to Revission",
        path: "/repository/author/deposits/returned",
        icon: "fas fa-redo",
      },
      {
        name: "Approved",
        path: "/repository/author/deposits/approved",
        icon: "fas fa-check",
      },
      {
        name: "Embargoed",
        path: "#",
        icon: "fas fa-lock",
      },
    ],
  },

  /* ===============================
     PUBLIC USER VIEW
  =============================== */
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
      {
        name: "By Collection",
        path: "/repository/browse/collections",
        icon: "fas fa-folder",
      },
      {
        name: "👥 By Author",
        path: "/repository/browse/authors",
        icon: "fas fa-user-graduate",
      },
      {
        name: "🏷️ By Subject",
        path: "/repository/browse/subjects",
        icon: "fas fa-tags",
      },
      {
        name: "📅 By Date",
        path: "/repository/browse/date",
        icon: "fas fa-calendar",
      },
      {
        name: "🎓 By Department",
        path: "/repository/browse/department",
        icon: "fas fa-building",
      },
    ],
  },
  {
    name: "⭐ Featured",
    icon: "fas fa-star",
    roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
    subMenu: [
      {
        name: "🆕 Recent Additions",
        path: "/repository/featured/recent",
        icon: "fas fa-clock",
      },
      {
        name: "📈 Most Viewed",
        path: "/repository/featured/popular",
        icon: "fas fa-fire",
      },
      {
        name: "⬇️ Most Downloaded",
        path: "/repository/featured/downloaded",
        icon: "fas fa-download",
      },
      {
        name: "🏆 Editor's Picks",
        path: "/repository/featured/picks",
        icon: "fas fa-award",
      },
    ],
  },
  {
    name: "🛠️ Tools",
    icon: "fas fa-toolbox",
    roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
    subMenu: [
      {
        name: "📋 Citation Generator",
        path: "/repository/tools/citation",
        icon: "fas fa-quote-right",
      },
      {
        name: "💾 Export Citations",
        path: "/repository/tools/export",
        icon: "fas fa-file-export",
      },
      {
        name: "🔖 Save to List",
        path: "/repository/tools/savelist",
        icon: "fas fa-bookmark",
      },
      {
        name: "📧 Email Alert",
        path: "/repository/tools/alerts",
        icon: "fas fa-envelope",
      },
    ],
  },

  /* ===============================
     SHARED REPORTS (Multiple Roles)
  =============================== */
  {
    name: "Reports",
    icon: "fas fa-chart-bar",
    roles: [
      ROLES.REPOSITORY_ADMIN,
      ROLES.REPOSITORY_CONTENT_REVIEWER,
    ],
    subMenu: [
      {
        name: "📈 Submission Trends",
        path: "/repository/reports/trends",
        icon: "fas fa-chart-line",
        roles: [ROLES.REPOSITORY_ADMIN],
      },
      {
        name: "⏱️ Processing Times",
        path: "/repository/reports/timelines",
        icon: "fas fa-stopwatch",
        roles: [ROLES.REPOSITORY_ADMIN],
      },
      {
        name: "📊 Curator Performance",
        path: "/repository/reports/curator-performance",
        icon: "fas fa-user-chart",
        roles: [ROLES.REPOSITORY_ADMIN],
      },
      {
        name: "👁️ My Analytics",
        path: "/repository/reports/my-analytics",
        icon: "fas fa-chart-pie",
        roles: [ROLES.REPOSITORY_CURATOR],
      },
    ],
  },
],
    [MODULES.RESEARCHER_NETWORK]: [
      {
        name: "Dashboard",
        path: "/research-network/dashboard",
        icon: "fas fa-network-wired",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
      },

      {
    name: "Users & Roles",
    icon: "fas fa-users",
    roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
    subMenu: [
      {
        name: "All Users",
        path: "/journal/users",
        icon: "fas fa-user",
      },
      {
        name: "Add New User",
        path: "/journal/users/add",
        icon: "fas fa-user-tag",
      },
    ],
  },


      {
        name: "Research Projects",
        icon: "fas fa-flask",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          {
            name: "All Projects",
            path: "/research-network/projects",
            icon: "fas fa-list",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "Create Project",
            path: "/research-network/projects/create",
            icon: "fas fa-plus",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "Ongoing Projects",
            path: "/research-network/projects/ongoing",
            icon: "fas fa-spinner",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "Completed Projects",
            path: "/research-network/projects/completed",
            icon: "fas fa-check",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
        ],
      },

      {
        name: "Collaborations",
        icon: "fas fa-handshake",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          {
            name: "All Collaborations",
            path: "/research-network/collaborations",
            icon: "fas fa-list",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "New Collaboration",
            path: "/research-network/collaborations/create",
            icon: "fas fa-plus",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
        ],
      },

      {
        name: "Researchers",
        icon: "fas fa-user-graduate",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          {
            name: "All Researchers",
            path: "/research-network/researchers",
            icon: "fas fa-list",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "Invite Researcher",
            path: "/research-network/researchers/invite",
            icon: "fas fa-user-plus",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
        ],
      },

      {
        name: "Funding",
        icon: "fas fa-hand-holding-usd",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          {
            name: "All Funding",
            path: "/research-network/funding",
            icon: "fas fa-list",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "Add Funding",
            path: "/research-network/funding/create",
            icon: "fas fa-plus",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
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
    ],
  };

  const routes = moduleRoutes[moduleId]
    ? filterRoutesByRole(moduleRoutes[moduleId])
    : [];

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <Link to="/" className="brand-link">
        <span className="brand-text font-weight-light">UMS</span>
      </Link>

      <div className="sidebar">
        {/* User Panel */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img
              src="ora.png"
              className="img-circle elevation-2"
              alt="User"
            />
          </div>
          <div className="info">
            <Link to="/profile" className="d-block">
              {user.full_name}
            </Link>
            <small className="text-muted">{user.module_name}</small>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            {routes.map((route, i) => {
              if (!route.subMenu) {
                return (
                  <li className="nav-item" key={i}>
                    <Link
                      to={route.path}
                      className={`nav-link ${isActive(route.path) ? "active" : ""}`}
                    >
                      <i className={`nav-icon ${route.icon}`} />
                      <p>{route.name}</p>
                    </Link>
                  </li>
                );
              }

              const open = expandedMenus[route.name];
              return (
                <li
                  key={i}
                  className={`nav-item has-treeview ${open ? "menu-open" : ""}`}
                >
                  <a
                    href="#"
                    className={`nav-link ${open ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleMenu(route.name);
                    }}
                  >
                    <i className={`nav-icon ${route.icon}`} />
                    <p>
                      {route.name}
                      <i className="right fas fa-angle-left" />
                    </p>
                  </a>
                  <ul className="nav nav-treeview">
                    {route.subMenu.map((sub, idx) => (
                      <li className="nav-item" key={idx}>
                        <Link
                          to={sub.path}
                          className={`nav-link ${isActive(sub.path) ? "active" : ""}`}
                        >
                          <i className={`far fa-circle nav-icon ${sub.icon}`} />
                          <p>{sub.name}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}

            {/* Logout */}
            <li className="nav-item mt-3">
              <button
                className="nav-link btn btn-danger btn-sm text-left"
                onClick={handleLogout}
              >
                <i className="nav-icon fas fa-sign-out-alt" />
                <p>Logout</p>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
