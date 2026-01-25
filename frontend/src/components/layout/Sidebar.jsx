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
  REPOSITORY_MANAGER: "5205b388-a2e4-4e40-baae-8fe018e08d18",
  RESEARCHER_NETWORK_MANAGER: "d2db77c2-177c-44e6-921a-d635abd674d3",
  JOURNAL_AUTHOR: "1d67d32d-dcee-4302-8369-26ca00385a09",
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
        path: "/journal/coauthors/invitations",
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
      {
        name: "Dashboard",
        path: "/repository/dashboard",
        icon: "fas fa-book",
        roles: [ROLES.REPOSITORY_MANAGER],
      },

      {
        name: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.REPOSITORY_MANAGER],
        subMenu: [
          {
            name: "All Users",
            path: "/repository/users",
            icon: "fas fa-list",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
          {
            name: "Create User",
            path: "/repository/users/create",
            icon: "fas fa-user-plus",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
        ],
      },

      {
        name: "Repositories",
        icon: "fas fa-folder",
        roles: [ROLES.REPOSITORY_MANAGER],
        subMenu: [
          {
            name: "All Repositories",
            path: "/repository/list",
            icon: "fas fa-list",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
          {
            name: "Create Repository",
            path: "/repository/create",
            icon: "fas fa-plus",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
          {
            name: "Archived Repositories",
            path: "/repository/archived",
            icon: "fas fa-archive",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
        ],
      },

      {
        name: "Pull Requests",
        icon: "fas fa-code-branch",
        roles: [ROLES.REPOSITORY_MANAGER],
        subMenu: [
          {
            name: "Open PRs",
            path: "/repository/pull-requests/open",
            icon: "fas fa-exchange-alt",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
          {
            name: "Merged PRs",
            path: "/repository/pull-requests/merged",
            icon: "fas fa-check",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
          {
            name: "Rejected PRs",
            path: "/repository/pull-requests/rejected",
            icon: "fas fa-times",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
        ],
      },

      {
        name: "Contributors",
        icon: "fas fa-user-friends",
        roles: [ROLES.REPOSITORY_MANAGER],
        subMenu: [
          {
            name: "All Contributors",
            path: "/repository/contributors",
            icon: "fas fa-list",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
          {
            name: "Invite Contributor",
            path: "/repository/contributors/invite",
            icon: "fas fa-user-plus",
            roles: [ROLES.REPOSITORY_MANAGER],
          },
        ],
      },

      {
        name: "Settings",
        path: "/repository/settings",
        icon: "fas fa-cogs",
        roles: [ROLES.REPOSITORY_MANAGER],
      },

      {
        name: "Reports",
        path: "/repository/reports",
        icon: "fas fa-chart-bar",
        roles: [ROLES.REPOSITORY_MANAGER],
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
        name: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
        subMenu: [
          {
            name: "All Users",
            path: "/research-network/users",
            icon: "fas fa-list",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
          },
          {
            name: "Create User",
            path: "/research-network/users/create",
            icon: "fas fa-user-plus",
            roles: [ROLES.RESEARCHER_NETWORK_MANAGER],
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
