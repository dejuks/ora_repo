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
  EBOOK: "aeca9002-e3e1-498d-a9da-34066db00744",
};

/* ===============================
   ROLE UUIDS / ROLE CODES
================================ */
const ROLES = {
  SUPER_ADMIN: "bf22a62f-e672-4e88-9c28-fa1eee3e0e22",
  EDITOR: "33333333-aaaa-bbbb-cccc-333333333333",
  LIBRARY_MANAGER: "5042b3f2-2cd6-4a1b-8015-6774c3956409",
  RESEARCHER_NETWORK_MANAGER: "d2db77c2-177c-44e6-921a-d635abd674d3",

  JOURNAL_MANAGER: "311b2831-99d3-426b-9a7c-6453756d5d9a",
  JOURNAL_AUTHOR: "1d67d32d-dcee-4302-8369-26ca00385a09",
  REVIEWER: "5c6f2f3e-8f4b-4d3a-9f7a-2e5e8b6c4d2b",
  JOURNAL_EIC: "ad657069-0dd4-4bd1-8a19-ee6733dd303d",
  JOURNAL_ASSOCIATE_EDITOR: "45494844-658a-4837-8df6-f6fc61348bbb",
  JOURNAL_REFREE: "30d22914-dc7f-4532-ba19-31be2beb2e9d",

  REPOSITORY_ADMIN: "5205b388-a2e4-4e40-baae-8fe018e08d18",
  REPOSITORY_CURATOR: "7047bc22-6575-436c-9777-e06869004a4a",
  REPOSITORY_CONTENT_REVIEWER: "9ef6032d-85da-4d1b-910e-72469e4f068c",
  RESEARCHER_AUTHOR: "bcb471d4-e59c-45f3-b512-e7c17a03c46c",
  REPOSITORY_PUBLIC_USER: "bcb471d4-e59c-45f3-b512-e7c17a03c46c",
  REPOSITORY_GUEST: "efdda7b9-6884-42c7-b6f3-bed7ab4eb92e",

  ORO_WIKI_MANAGER: "f06cb194-d9cf-4fb1-9ce8-55ded280e9b9",
  ORO_WIKI_EDITOR: "7caffcac-18e8-4682-8341-7c405071551c",
  ORO_WIKI_BUREAUCRAT: "faa28d6c-de7f-41ce-961a-6c975885f47a",
  ORO_WIKI_OVERSIGHTER: "5d46563f-a72c-433c-9115-4219c9e16a6c",
  ORO_WIKI_PUBLISHER: "8c7747ae-837d-425e-874b-fb97cf7776e6",

  EBOOK_AUTHOR: "60ac2e7a-39a5-4ff6-80e2-6d95423ec1d8",
  EBOOK_EDITOR: "ec2b0056-b7fc-4860-926e-101d7cc10c33",
  EBOOK_REVIEWER: "7caffcac-18e8-4682-8341-7c405071551c",
  EBOOK_FINANCE_OFFICER: "00000000-0000-0000-0000-000000000001",
  EBOOK_DIGITAL_CONTENT_MANAGER: "00000000-0000-0000-0000-000000000002",
  EBOOK_ADMIN: "00000000-0000-0000-0000-000000000003",

  RESEARCHER_NETWORK_MODERATOR: "ee6bebf7-5961-4917-9752-8ad704d40c77",

  // Library role names/codes
  LIBRARY_ADMIN: "LIBRARY_ADMIN",
  LIBRARY_MANAGER_CODE: "LIBRARY_MANAGER",
  LIBRARIAN: "LIBRARIAN",
  CATALOGER: "CATALOGER",
  ACQUISITION_OFFICER: "ACQUISITION_OFFICER",
  INVENTORY_MANAGER: "INVENTORY_MANAGER",
  CONTENT_UPLOADER: "CONTENT_UPLOADER",
  LIBRARY_MEMBER: "LIBRARY_MEMBER",
};

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  if (!user) return null;

  const moduleId = user.module_id;
  const userRoleIds = user.roles?.map((r) => r.role_id) || [];
  const userRoleNames =
    user.roles
      ?.map((r) => (r.role_name || r.name || r.code || "").toString())
      .filter(Boolean)
      .map((s) => s.toUpperCase()) || [];

  const hasRole = (allowedRoles = []) => {
    return allowedRoles.some((ar) => {
      if (!ar) return false;
      const s = ar.toString();
      if (s.includes("-")) return userRoleIds.includes(s);
      return userRoleNames.includes(s.toUpperCase());
    });
  };

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const filterRoutesByRole = (routes) =>
    routes
      .map((route) => {
        if (route.roles && !hasRole(route.roles)) return null;

        if (route.subMenu) {
          const children = route.subMenu.filter((c) =>
            c.roles ? hasRole(c.roles) : true
          );
          if (!children.length) return null;
          return { ...route, subMenu: children };
        }
        return route;
      })
      .filter(Boolean);

  const moduleRoutes = {
    [MODULES.SYSTEM_WIDE]: [
      {
        type: "single",
        path: "/admin-dashboard",
        name: "Dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.SUPER_ADMIN],
      },
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

    [MODULES.JOURNAL]: [
      {
        name: "Dashboard",
        path: "/journal-dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR, ROLES.REVIEWER],
      },
      {
        name: "Dashboard",
        path: "/journal/author-dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.JOURNAL_AUTHOR],
      },
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
            path: "/module/users/add",
            icon: "fas fa-user-tag",
          },
        ],
      },
      {
        name: "Journals",
        icon: "fas fa-book",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
        subMenu: [
          {
            name: "Add Journal",
            path: "/journal/create",
            icon: "fas fa-plus",
          },
        ],
      },
      {
        name: "Submissions",
        icon: "fas fa-file-alt",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.JOURNAL_AUTHOR, ROLES.EDITOR],
        subMenu: [
          {
            name: "My Submissions",
            path: "/journal/manuscripts",
            icon: "fas fa-inbox",
            roles: [ROLES.JOURNAL_AUTHOR],
          },
          {
            name: "New Submission",
            path: "/manuscripts/create",
            icon: "fas fa-paper-plane",
            roles: [ROLES.JOURNAL_AUTHOR],
          },
          {
            name: "IncompleteSubmissions",
            path: "/manuscript/draft-manuscript",
            icon: "fas fa-file",
            roles: [ROLES.JOURNAL_AUTHOR],
          },
          {
            name: "Revisions",
            path: "/journal/manuscripts/revisions",
            icon: "fas fa-edit",
            roles: [ROLES.JOURNAL_AUTHOR],
          },
        ],
      },
    ],

    [MODULES.EBOOK]: [
      {
        name: "Dashboard",
        path: "/ebook/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [
          ROLES.EBOOK_AUTHOR,
          ROLES.EBOOK_EDITOR,
          ROLES.EBOOK_REVIEWER,
          ROLES.EBOOK_DIGITAL_CONTENT_MANAGER,
          ROLES.EBOOK_FINANCE_OFFICER,
          ROLES.EBOOK_ADMIN,
        ],
      },
      {
        name: "Author Workspace",
        icon: "fas fa-pen-nib",
        roles: [ROLES.EBOOK_AUTHOR],
        subMenu: [
          {
            name: "New Submission",
            path: "/ebook/submit",
            icon: "fas fa-paper-plane",
            roles: [ROLES.EBOOK_AUTHOR],
          },
          {
            name: "My Submissions",
            path: "/ebook/my-submissions",
            icon: "fas fa-inbox",
            roles: [ROLES.EBOOK_AUTHOR],
          },
          {
            name: "Draft / Incomplete",
            path: "/ebook/author/draft",
            icon: "fas fa-file",
            roles: [ROLES.EBOOK_AUTHOR],
          },
          {
            name: "Revisions",
            path: "/ebook/submissions/revisions",
            icon: "fas fa-edit",
            roles: [ROLES.EBOOK_AUTHOR],
          },
          {
            name: "Reviewer Comments",
            path: "/ebook/submissions/reviewer-comments",
            icon: "fas fa-comments",
            roles: [ROLES.EBOOK_AUTHOR],
          },
          {
            name: "Final Proof Approval",
            path: "/ebook/submissions/final-proof",
            icon: "fas fa-check-double",
            roles: [ROLES.EBOOK_AUTHOR],
          },
          {
            name: "Copyright / License",
            path: "/ebook/submissions/license",
            icon: "fas fa-file-signature",
            roles: [ROLES.EBOOK_AUTHOR],
          },
        ],
      },
      {
        name: "Screening",
        icon: "fas fa-user-shield",
        roles: [ROLES.EBOOK_EDITOR],
        subMenu: [
          {
            name: "Initial Screening",
            path: "/ebook/editor/screening",
            icon: "fas fa-search",
            roles: [ROLES.EBOOK_EDITOR],
          },
          {
            name: "Assigned manuscripts",
            path: "/editor/assigned",
            icon: "fas fa-user-check",
            roles: [ROLES.EBOOK_EDITOR],
          },
          {
            name: "Rejected manuscripts",
            path: "/editor/rejected",
            icon: "fas fa-clipboard-list",
            roles: [ROLES.EBOOK_EDITOR],
          },
        ],
      },
      {
        name: "Peer Review",
        icon: "fas fa-user-check",
        roles: [ROLES.EBOOK_REVIEWER, "EBOOK_REVIEWER", "REVIEWER"],
        subMenu: [
          {
            name: "My Reviews",
            path: "/reviewer/my-reviews",
            icon: "fas fa-inbox",
            roles: [ROLES.EBOOK_REVIEWER, "EBOOK_REVIEWER", "REVIEWER"],
          },
          {
            name: "Completed",
            path: "/reviewer/completed",
            icon: "fas fa-check-circle",
            roles: [ROLES.EBOOK_REVIEWER, "EBOOK_REVIEWER", "REVIEWER"],
          },
        ],
      },
      {
        name: "Finance (BPC)",
        icon: "fas fa-money-check-alt",
        roles: [
          ROLES.EBOOK_FINANCE_OFFICER,
          "EBOOK_FINANCE_OFFICER",
          "FINANCE",
          ROLES.EBOOK_EDITOR,
        ],
        subMenu: [
          {
            name: "Pending Clearance",
            path: "/ebook/finance/pending",
            icon: "fas fa-hourglass-half",
            roles: [
              ROLES.EBOOK_FINANCE_OFFICER,
              "EBOOK_FINANCE_OFFICER",
              "FINANCE",
            ],
          },
        ],
      },
      {
        name: "Digital Production",
        icon: "fas fa-cogs",
        roles: [
          ROLES.EBOOK_DIGITAL_CONTENT_MANAGER,
          "EBOOK_DIGITAL_CONTENT_MANAGER",
          "DIGITAL_CONTENT_MANAGER",
        ],
        subMenu: [
          {
            name: "Production Queue",
            path: "/ebook/production/queue",
            icon: "fas fa-layer-group",
            roles: [
              ROLES.EBOOK_DIGITAL_CONTENT_MANAGER,
              "EBOOK_DIGITAL_CONTENT_MANAGER",
              "DIGITAL_CONTENT_MANAGER",
            ],
          },
        ],
      },
      {
        name: "Public Library",
        path: "/ebook/library",
        icon: "fas fa-book-open",
        roles: [
          ROLES.EBOOK_AUTHOR,
          ROLES.EBOOK_EDITOR,
          ROLES.EBOOK_REVIEWER,
          ROLES.EBOOK_DIGITAL_CONTENT_MANAGER,
          ROLES.EBOOK_FINANCE_OFFICER,
          ROLES.EBOOK_ADMIN,
          "EBOOK_AUTHOR",
          "EBOOK_EDITOR",
          "EBOOK_REVIEWER",
          "EBOOK_DIGITAL_CONTENT_MANAGER",
          "EBOOK_FINANCE_OFFICER",
          "EBOOK_ADMIN",
        ],
      },
    ],

    /* ================= LIBRARY MODULE ================= */
    [MODULES.LIBRARY]: [
      // Role-specific dashboards
      {
        name: "Dashboard",
        path: "/library/admin/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.LIBRARY_ADMIN],
      },
      {
        name: "Dashboard",
        path: "/library/manager/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE],
      },
      {
        name: "Dashboard",
        path: "/library/librarian/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.LIBRARIAN],
      },
      {
        name: "Dashboard",
        path: "/library/cataloger/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.CATALOGER],
      },
      {
        name: "Dashboard",
        path: "/library/acquisition/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.ACQUISITION_OFFICER],
      },
      {
        name: "Dashboard",
        path: "/library/inventory/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.INVENTORY_MANAGER],
      },
      {
        name: "Dashboard",
        path: "/library/uploader/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.CONTENT_UPLOADER],
      },
      {
        name: "Dashboard",
        path: "/library/member/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.LIBRARY_MEMBER],
      },

      // Admin
      {
        name: "Administration",
        icon: "fas fa-users-cog",
        roles: [ROLES.LIBRARY_ADMIN],
        subMenu: [
          {
            name: "Library Users",
            path: "/library/users",
            icon: "fas fa-users",
            roles: [ROLES.LIBRARY_ADMIN],
          },
          {
            name: "Create User",
            path: "/library/users/create",
            icon: "fas fa-user-plus",
            roles: [ROLES.LIBRARY_ADMIN],
          },
          {
            name: "Roles & Permissions",
            path: "/library/roles",
            icon: "fas fa-user-shield",
            roles: [ROLES.LIBRARY_ADMIN],
          },
          {
            name: "System Logs",
            path: "/library/audit-logs",
            icon: "fas fa-file-alt",
            roles: [ROLES.LIBRARY_ADMIN],
          },
          {
            name: "Settings",
            path: "/library/settings",
            icon: "fas fa-cogs",
            roles: [ROLES.LIBRARY_ADMIN],
          },
          {
            name: "Material Types",
            path: "/library/settings/material-types",
            icon: "fas fa-layer-group",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.CATALOGER],
          },
          {
            name: "Categories",
            path: "/library/settings/categories",
            icon: "fas fa-folder-open",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.CATALOGER],
          },
          {
            name: "Publishers",
            path: "/library/settings/publishers",
            icon: "fas fa-building",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.CATALOGER],
          },
          {
            name: "Languages",
            path: "/library/settings/languages",
            icon: "fas fa-language",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.CATALOGER],
          },
          {
            name: "Subjects",
            path: "/library/settings/subjects",
            icon: "fas fa-tags",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.CATALOGER],
          },

          
        ],
      },
      

      // Manager
      {
        name: "Management",
        icon: "fas fa-clipboard-list",
        roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE],
        subMenu: [
          {
            name: "Policies",
            path: "/library/policies",
            icon: "fas fa-gavel",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE],
          },
          {
            name: "Acquisition Approvals",
            path: "/library/acquisitions/approvals",
            icon: "fas fa-check-circle",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE],
          },
          {
            name: "Reports",
            path: "/library/reports",
            icon: "fas fa-chart-bar",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE],
          },
        ],
      },

      // Catalog
      {
        name: "Catalog",
        icon: "fas fa-book",
        roles: [
          ROLES.LIBRARY_ADMIN,
          ROLES.LIBRARY_MANAGER,
          ROLES.LIBRARY_MANAGER_CODE,
          ROLES.LIBRARIAN,
          ROLES.CATALOGER,
          ROLES.LIBRARY_MEMBER,
        ],
        subMenu: [
          {
            name: "Browse Catalog",
            path: "/library/books",
            icon: "fas fa-search",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.LIBRARIAN,
              ROLES.CATALOGER,
              ROLES.LIBRARY_MEMBER,
            ],
          },
          {
            name: "All Books",
            path: "/library/books/all",
            icon: "fas fa-list",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.LIBRARIAN,
              ROLES.CATALOGER,
            ],
          },
          {
            name: "Add Book",
            path: "/library/books/new",
            icon: "fas fa-plus",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.CATALOGER,
            ],
          },
          {
            name: "Book Copies",
            path: "/library/copies",
            icon: "fas fa-copy",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.CATALOGER,
              ROLES.INVENTORY_MANAGER,
              ROLES.LIBRARIAN,
            ],
          },
        ],
      },

      // Circulation
      {
        name: "Circulation",
        icon: "fas fa-exchange-alt",
        roles: [
          ROLES.LIBRARY_ADMIN,
          ROLES.LIBRARY_MANAGER,
          ROLES.LIBRARY_MANAGER_CODE,
          ROLES.LIBRARIAN,
          ROLES.LIBRARY_MEMBER,
        ],
        subMenu: [
          {
            name: "All Loans",
            path: "/library/loans",
            icon: "fas fa-hand-holding",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE, ROLES.LIBRARIAN],
          },
          {
            name: "My Loans",
            path: "/library/my-loans",
            icon: "fas fa-book-reader",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "All Holds",
            path: "/library/holds",
            icon: "fas fa-clock",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE, ROLES.LIBRARIAN],
          },
          {
            name: "My Holds",
            path: "/library/my-holds",
            icon: "fas fa-bookmark",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "All Fines",
            path: "/library/fines",
            icon: "fas fa-money-bill-wave",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE, ROLES.LIBRARIAN],
          },
          {
            name: "My Fines",
            path: "/library/my-fines",
            icon: "fas fa-receipt",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "Borrowing History",
            path: "/library/history",
            icon: "fas fa-history",
            roles: [ROLES.LIBRARY_MEMBER],
          },
        ],
      },

      // Acquisitions
      {
        name: "Acquisitions",
        icon: "fas fa-shopping-cart",
        roles: [
          ROLES.LIBRARY_ADMIN,
          ROLES.LIBRARY_MANAGER,
          ROLES.LIBRARY_MANAGER_CODE,
          ROLES.ACQUISITION_OFFICER,
        ],
        subMenu: [
          {
            name: "Requests",
            path: "/library/acquisitions/requests",
            icon: "fas fa-file-signature",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.ACQUISITION_OFFICER,
            ],
          },
          {
            name: "Orders",
            path: "/library/acquisitions/orders",
            icon: "fas fa-shopping-basket",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.ACQUISITION_OFFICER,
            ],
          },
          {
            name: "Deliveries",
            path: "/library/acquisitions/deliveries",
            icon: "fas fa-truck",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.ACQUISITION_OFFICER,
            ],
          },
          {
            name: "Vendors",
            path: "/library/vendors",
            icon: "fas fa-store",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.ACQUISITION_OFFICER,
            ],
          },
        ],
      },

      // Inventory
      {
        name: "Inventory",
        icon: "fas fa-boxes",
        roles: [
          ROLES.LIBRARY_ADMIN,
          ROLES.LIBRARY_MANAGER,
          ROLES.LIBRARY_MANAGER_CODE,
          ROLES.INVENTORY_MANAGER,
          ROLES.LIBRARIAN,
        ],
        subMenu: [
          {
            name: "Audit",
            path: "/library/inventory/audits",
            icon: "fas fa-clipboard-check",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.INVENTORY_MANAGER,
            ],
          },
          {
            name: "Missing Items",
            path: "/library/inventory/missing",
            icon: "fas fa-search-minus",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.INVENTORY_MANAGER,
            ],
          },
          {
            name: "Damaged Items",
            path: "/library/inventory/damaged",
            icon: "fas fa-exclamation-triangle",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.INVENTORY_MANAGER,
            ],
          },
          {
            name: "Tags / Barcodes",
            path: "/library/inventory/tags",
            icon: "fas fa-barcode",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.INVENTORY_MANAGER,
              ROLES.CATALOGER,
            ],
          },
        ],
      },

      // Digital Library / Digital Librarian
      {
        name: "Digital Library",
        icon: "fas fa-laptop",
        roles: [
          ROLES.LIBRARY_ADMIN,
          ROLES.LIBRARY_MANAGER,
          ROLES.LIBRARY_MANAGER_CODE,
          ROLES.CONTENT_UPLOADER,
          ROLES.LIBRARY_MEMBER,
        ],
        subMenu: [
          {
            name: "Resources",
            path: "/library/digital",
            icon: "fas fa-folder-open",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.CONTENT_UPLOADER,
              ROLES.LIBRARY_MEMBER,
            ],
          },
          {
            name: "Upload Resource",
            path: "/library/digital/new",
            icon: "fas fa-upload",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.CONTENT_UPLOADER,
            ],
          },
          {
            name: "Metadata Management",
            path: "/library/digital/metadata",
            icon: "fas fa-tags",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.CONTENT_UPLOADER,
            ],
          },
          {
            name: "Access Rights",
            path: "/library/digital/access",
            icon: "fas fa-user-lock",
            roles: [
              ROLES.LIBRARY_ADMIN,
              ROLES.LIBRARY_MANAGER,
              ROLES.LIBRARY_MANAGER_CODE,
              ROLES.CONTENT_UPLOADER,
            ],
          },
          {
            name: "Approvals",
            path: "/library/digital/approvals",
            icon: "fas fa-check-double",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE],
          },
          {
            name: "Usage Analytics",
            path: "/library/digital/analytics",
            icon: "fas fa-chart-line",
            roles: [ROLES.LIBRARY_ADMIN, ROLES.LIBRARY_MANAGER, ROLES.LIBRARY_MANAGER_CODE, ROLES.CONTENT_UPLOADER],
          },
        ],
      },

      // Member self-service
      {
        name: "My Library",
        icon: "fas fa-user-graduate",
        roles: [ROLES.LIBRARY_MEMBER],
        subMenu: [
          {
            name: "Dashboard",
            path: "/library/member/dashboard",
            icon: "fas fa-home",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "Browse Catalog",
            path: "/library/books",
            icon: "fas fa-search",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "My Loans",
            path: "/library/my-loans",
            icon: "fas fa-book",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "My Holds",
            path: "/library/my-holds",
            icon: "fas fa-bookmark",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "My Fines",
            path: "/library/my-fines",
            icon: "fas fa-money-check-alt",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "Borrowing History",
            path: "/library/history",
            icon: "fas fa-history",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "Account Status",
            path: "/library/account",
            icon: "fas fa-user-check",
            roles: [ROLES.LIBRARY_MEMBER],
          },
          {
            name: "Digital Resources",
            path: "/library/digital",
            icon: "fas fa-download",
            roles: [ROLES.LIBRARY_MEMBER],
          },
        ],
      },
    ],

    [MODULES.ORO_WIKI]: [
      {
        name: "Manager Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_MANAGER],
      },
      {
        name: "Editor Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_EDITOR],
      },
      {
        name: "Publisher Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_PUBLISHER],
      },
      {
        name: "Governance Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_BUREAUCRAT],
      },
      {
        name: "Oversight Dashboard",
        path: "/wiki/dashboard",
        icon: "fas fa-globe",
        roles: [ROLES.ORO_WIKI_OVERSIGHTER],
      },
    ],

    [MODULES.REPOSITORY]: [
      {
        name: "Dashboard",
        path: "/repository/admin/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.REPOSITORY_ADMIN],
      },
      {
        name: "Curation Dashboard",
        path: "/repository/curator/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.REPOSITORY_CURATOR],
      },
      {
        name: "Reviewer Dashboard",
        path: "/repository/reviewer/dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.REPOSITORY_CONTENT_REVIEWER],
      },
      {
        name: "My Repository",
        path: "/repository/author/dashboard",
        icon: "fas fa-home",
        roles: [ROLES.RESEARCHER_AUTHOR],
      },
      {
        name: "Search",
        path: "/repository/search",
        icon: "fas fa-search",
        roles: [ROLES.REPOSITORY_PUBLIC_USER, ROLES.REPOSITORY_GUEST],
      },
    ],

    [MODULES.RESEARCHER_NETWORK]: [
      {
        name: "Dashboard",
        path: "/research-network/dashboard",
        icon: "fas fa-network-wired",
        roles: [
          ROLES.RESEARCHER_NETWORK_MANAGER,
          ROLES.RESEARCHER_NETWORK_MODERATOR,
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
        ],
      },
      {
        name: "Groups & Moderation",
        icon: "fas fa-users-cog",
        roles: [
          ROLES.RESEARCHER_NETWORK_MODERATOR,
          ROLES.RESEARCHER_NETWORK_MANAGER,
        ],
        subMenu: [
          {
            name: "Research Groups",
            path: "/research-network/groups",
            icon: "fas fa-layer-group",
          },
          {
            name: "Membership Requests",
            path: "/research-network/groups/requests",
            icon: "fas fa-user-check",
          },
          {
            name: "Group Discussions",
            path: "/research-network/groups/discussions",
            icon: "fas fa-comments",
          },
        ],
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
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img src="ora.png" className="img-circle elevation-2" alt="User" />
          </div>
          <div className="info">
            <Link to="/profile" className="d-block">
              {user.full_name}
            </Link>
            <small className="text-muted">{user.module_name}</small>
          </div>
        </div>

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

            <li className="nav-item mt-2">
              <button
                type="button"
                className="nav-link btn btn-link text-left w-100"
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