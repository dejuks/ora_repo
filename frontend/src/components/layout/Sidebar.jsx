import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { logout } from "../../utils/auth";
import { useSidebar } from "../../context/SidebarContext";

const MODULES = {
  SYSTEM_WIDE: "e936cd83-5383-4220-8cb5-8d1df4338b86",
  LIBRARY: "8e1967f9-b9d7-42a9-ae20-2e1d7cdc16bb",
  EBOOK: "aeca9002-e3e1-498d-a9da-34066db00744",
};

const ROLES = {
  SUPER_ADMIN: "bf22a62f-e672-4e88-9c28-fa1eee3e0e22",
  LIBRARY_MANAGER_UUID: "5042b3f2-2cd6-4a1b-8015-6774c3956409",
  LIBRARY_ADMIN: "LIBRARY_ADMIN",
  LIBRARY_MANAGER: "LIBRARY_MANAGER",
  LIBRARIAN: "LIBRARIAN",
  CATALOGER: "CATALOGER",
  ACQUISITION_OFFICER: "ACQUISITION_OFFICER",
  INVENTORY_MANAGER: "INVENTORY_MANAGER",
  CONTENT_UPLOADER: "CONTENT_UPLOADER",
  LIBRARY_MEMBER: "LIBRARY_MEMBER",
  EXTERNAL_PUBLISHER: "EXTERNAL_PUBLISHER",
  EBOOK_ADMIN: "EBOOK_ADMIN",
  EBOOK_AUTHOR: "EBOOK_AUTHOR",
  EBOOK_EDITOR: "EBOOK_EDITOR",
  EBOOK_REVIEWER: "EBOOK_REVIEWER",
  EBOOK_DIGITAL_CONTENT_MANAGER: "EBOOK_DIGITAL_CONTENT_MANAGER",
  EBOOK_FINANCE_OFFICER: "EBOOK_FINANCE_OFFICER",
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
      subMenu: [
        { name: "Admin Dashboard", path: "/library/admin/dashboard", roles: [A] },
        { name: "Manager Dashboard", path: "/library/manager/dashboard", roles: M },
        { name: "Librarian Dashboard", path: "/library/librarian/dashboard", roles: [L] },
        { name: "Cataloger Dashboard", path: "/library/cataloger/dashboard", roles: [C] },
        { name: "Acquisition Dashboard", path: "/library/acquisition/dashboard", roles: [AQ] },
        { name: "Inventory Dashboard", path: "/library/inventory/dashboard", roles: [I] },
        { name: "Uploader Dashboard", path: "/library/uploader/dashboard", roles: [U] },
        { name: "Member Dashboard", path: "/library/member/dashboard", roles: [MB] },
      ],
    },
    {
      name: "Administration",
      roles: [A],
      subMenu: [
        { name: "Library Users", path: "/library/admin/users", roles: [A] },
        { name: "Create User", path: "/library/users/create", roles: [A] },
        { name: "Roles & Permissions", path: "/library/roles", roles: [A] },
        { name: "System Logs", path: "/library/audit-logs", roles: [A] },
        { name: "Security Alerts", path: "/library/admin/security-alerts", roles: [A] },
        { name: "System Settings", path: "/library/admin/system-settings", roles: [A] },
      ],
    },
    {
      name: "Library Settings",
      roles: [A, ...M, L, C, I],
      subMenu: [
        { name: "Library Settings", path: "/library/settings", roles: [A] },
        { name: "Material Types", path: "/library/settings/material-types", roles: [A, C] },
        { name: "Categories", path: "/library/settings/categories", roles: [A, C] },
        { name: "Publishers", path: "/library/settings/publishers", roles: [A, C] },
        { name: "Languages", path: "/library/settings/languages", roles: [A, C] },
        { name: "Subjects", path: "/library/settings/subjects", roles: [A, C] },
        { name: "Contributors", path: "/library/settings/contributors", roles: [A, C] },
        { name: "Branches", path: "/library/settings/branches", roles: [A, L] },
        { name: "Locations", path: "/library/settings/locations", roles: [A, L, I] },
        { name: "Member Types", path: "/library/settings/member-types", roles: [A, ...M] },
      ],
    },
    {
      name: "Management & Reports",
      roles: [A, ...M],
      subMenu: [
        { name: "Policies", path: "/library/policies", roles: [A, ...M] },
        { name: "Summary Reports", path: "/library/reports", roles: [A, ...M] },
        { name: "Usage Reports", path: "/library/manager/usage-reports", roles: [A, ...M] },
        { name: "Loan Reports", path: "/library/manager/loan-reports", roles: [A, ...M] },
        { name: "Inventory Reports", path: "/library/manager/inventory-reports", roles: [A, ...M] },
        { name: "Acquisition Approvals", path: "/library/acquisitions/approvals", roles: [A, ...M] },
      ],
    },
    {
      name: "Catalog & Circulation",
      roles: [A, ...M, L, C, I, AQ, MB],
      subMenu: [
        { name: "OPAC Search", path: "/library/opac", roles: [A, ...M, L, C, I, AQ, MB] },
        { name: "Browse Catalog", path: "/library/books", roles: [A, ...M, L, C, I, AQ, MB] },
        { name: "All Books", path: "/library/books/all", roles: [A, ...M, L, C] },
        { name: "Add Book", path: "/library/books/new", roles: [A, ...M, L, C] },
        { name: "Catalog Metadata", path: "/library/books/metadata", roles: [A, ...M, L, C] },
        { name: "Cataloging Tools", path: "/library/cataloger/tools", roles: [A, ...M, C] },
        { name: "Book Copies", path: "/library/copies", roles: [A, ...M, L, C, I] },
        { name: "Circulation Desk", path: "/library/circulation/desk", roles: [A, ...M, L] },
        { name: "Loans", path: "/library/loans", roles: [A, ...M, L] },
        { name: "Holds / Reservations", path: "/library/holds", roles: [A, ...M, L] },
        { name: "Fines & Fees", path: "/library/fines", roles: [A, ...M, L] },
        { name: "Borrowing History", path: "/library/history", roles: [A, ...M, L, MB] },
      ],
    },
    {
      name: "Acquisitions",
      roles: [A, ...M, AQ],
      subMenu: [
        { name: "Requests", path: "/library/acquisitions/requests", roles: [A, ...M, AQ] },
        { name: "Orders", path: "/library/acquisitions/orders", roles: [A, ...M, AQ] },
        { name: "Deliveries", path: "/library/acquisitions/deliveries", roles: [A, ...M, AQ] },
        { name: "Vendors", path: "/library/vendors", roles: [A, ...M, AQ] },
      ],
    },
    {
      name: "Inventory",
      roles: [A, ...M, I, L, C],
      subMenu: [
        { name: "Inventory Report", path: "/library/inventory/report", roles: [A, ...M, I, L] },
        { name: "Audits", path: "/library/inventory/audits", roles: [A, ...M, I, L] },
        { name: "Missing Items", path: "/library/inventory/missing", roles: [A, ...M, I, L] },
        { name: "Damaged Items", path: "/library/inventory/damaged", roles: [A, ...M, I, L] },
        { name: "Tags / Barcodes", path: "/library/inventory/tags", roles: [A, ...M, I, C, L] },
      ],
    },
    {
      name: "Digital Library",
      roles: [A, ...M, L, U, MB, P],
      subMenu: [
        { name: "Digital Resources", path: "/library/digital", roles: [A, ...M, L, U, MB, P] },
        { name: "Upload Resource", path: "/library/digital/new", roles: [A, ...M, L, U, P] },
        { name: "Metadata Management", path: "/library/digital/metadata", roles: [A, ...M, L, U, P] },
        { name: "Access Rights", path: "/library/digital/access", roles: [A, ...M, L] },
        { name: "Approvals", path: "/library/digital/approvals", roles: [A, ...M, L] },
        { name: "Collections", path: "/library/digital/collections", roles: [A, ...M, L] },
        { name: "Workflow Tracking", path: "/library/digital", roles: [A, ...M, L, U] },
        { name: "Usage Analytics", path: "/library/digital/analytics", roles: [A, ...M, L, U] },
        { name: "Member Digital Portal", path: "/library/member/digital", roles: [MB] },
        { name: "Publisher Packages", path: "/library/digital/publisher-packages", roles: [A, ...M, L, P] },
      ],
    },
    {
      name: "My Library",
      roles: [MB],
      subMenu: [
        { name: "My Account", path: "/library/account", roles: [MB] },
        { name: "My Loans", path: "/library/my-loans", roles: [MB] },
        { name: "My Holds", path: "/library/my-holds", roles: [MB] },
        { name: "My Fines", path: "/library/my-fines", roles: [MB] },
        { name: "Borrowing History", path: "/library/history", roles: [MB] },
        { name: "Digital Library", path: "/library/member/digital", roles: [MB] },
      ],
    },
  ];
}


function buildEbookRoutes() {
  const A = ROLES.EBOOK_ADMIN;
  const AU = ROLES.EBOOK_AUTHOR;
  const E = ROLES.EBOOK_EDITOR;
  const R = ROLES.EBOOK_REVIEWER;
  const D = ROLES.EBOOK_DIGITAL_CONTENT_MANAGER;
  const F = ROLES.EBOOK_FINANCE_OFFICER;

  return [
    { name: "Dashboard", path: "/ebook/dashboard", roles: [A, AU, E, R, D, F] },
    {
      name: "Manuscripts",
      roles: [A, AU, E, D, F],
      subMenu: [
        { name: "Submission List", path: "/ebook/submissions", roles: [A, AU, E, D, F] },
        { name: "Create Submission", path: "/ebook/submissions/create", roles: [A, AU] },
        { name: "Published Catalog", path: "/ebook/publications", roles: [A, AU, E, D, F] },
      ],
    },
    {
      name: "Peer Review",
      roles: [A, E, R],
      subMenu: [
        { name: "Reviewer Workspace", path: "/ebook/reviewer", roles: [R, A] },
        { name: "Submission Queue", path: "/ebook/submissions", roles: [A, E] },
      ],
    },
    {
      name: "Production & Finance",
      roles: [A, D, F],
      subMenu: [
        { name: "Production Queue", path: "/ebook/submissions", roles: [A, D] },
        { name: "Finance Clearance", path: "/ebook/submissions", roles: [A, F] },
      ],
    },
  ];
}

const moduleRoutes = {
  [MODULES.SYSTEM_WIDE]: [
    { name: "Dashboard", path: "/admin-dashboard", roles: [ROLES.SUPER_ADMIN] },
    {
      name: "User Management",
      roles: [ROLES.SUPER_ADMIN],
      subMenu: [
        { name: "All Users", path: "/users", roles: [ROLES.SUPER_ADMIN] },
        { name: "Roles", path: "/roles", roles: [ROLES.SUPER_ADMIN] },
        { name: "Permissions", path: "/permissions", roles: [ROLES.SUPER_ADMIN] },
        { name: "Modules", path: "/modules", roles: [ROLES.SUPER_ADMIN] },
      ],
    },
  ],
  [MODULES.LIBRARY]: buildLibraryRoutes(),
  [MODULES.EBOOK]: buildEbookRoutes(),
};

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const { open, setOpen } = useSidebar();

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

  const routes = useMemo(() => {
    if (!user) return [];
    const currentModuleRoutes = moduleRoutes[user.module_id] || [];
    return currentModuleRoutes
      .map((route) => {
        if (route.roles && !hasRole(route.roles)) return null;
        if (!route.subMenu) return route;
        const visibleChildren = route.subMenu.filter((sub) => !sub.roles || hasRole(sub.roles));
        if (!visibleChildren.length) return null;
        return { ...route, subMenu: visibleChildren };
      })
      .filter(Boolean);
  }, [user, userRoleIds.join(","), userRoleNames.join(",")]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const toggleMenu = (label) => setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  const closeSidebar = () => setOpen(false);

  return (
    <>
      <div className={`app-sidebar__backdrop ${open ? "show" : ""}`} onClick={closeSidebar} />
      <aside className={`app-sidebar ${open ? "is-open" : "is-collapsed"}`}>
        <div className="app-sidebar__brand">
          <Link to="/" className="app-sidebar__logo" onClick={closeSidebar}>
            <span>ORA</span>
            <small>Platform</small>
          </Link>
          <button type="button" className="app-sidebar__close" onClick={closeSidebar} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar">{(user.full_name || user.name || "U").charAt(0).toUpperCase()}</div>
          <div>
            <div className="app-sidebar__name">{user.full_name || user.name}</div>
            <div className="app-sidebar__meta">{user.module_name || "Workspace"}</div>
          </div>
        </div>

        <nav className="app-sidebar__nav">
          {routes.map((route, index) => {
            if (!route.subMenu) {
              return (
                <Link
                  key={`${route.name}-${index}`}
                  to={route.path}
                  className={`app-nav-link ${isActive(route.path) ? "active" : ""}`}
                  onClick={closeSidebar}
                >
                  <span className="app-nav-link__dot" />
                  <span>{route.name}</span>
                </Link>
              );
            }

            const openGroup = expandedMenus[route.name] ?? route.subMenu.some((sub) => isActive(sub.path));

            return (
              <div key={`${route.name}-${index}`} className={`app-nav-group ${openGroup ? "open" : ""}`}>
                <button
                  type="button"
                  className={`app-nav-group__trigger ${openGroup ? "active" : ""}`}
                  onClick={() => toggleMenu(route.name)}
                >
                  <span>{route.name}</span>
                  <i className={`fas ${openGroup ? "fa-chevron-down" : "fa-chevron-right"}`} />
                </button>
                <div className="app-nav-group__content">
                  {route.subMenu.map((sub, idx) => (
                    <Link
                      key={`${sub.name}-${idx}`}
                      to={sub.path}
                      className={`app-nav-sublink ${isActive(sub.path) ? "active" : ""}`}
                      onClick={closeSidebar}
                    >
                      <span className="app-nav-link__dot small" />
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="app-sidebar__footer">
          <button type="button" className="app-sidebar__logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
