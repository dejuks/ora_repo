import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth.js";
import ebookApi from "../../api/ebook.api";
import { buildEbookRoutes } from "./sidebar/ebookSidebar.js";
import { buildLibraryRoutes } from "./sidebar/librarySidebar.js";

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
   ROLE UUIDS / ROLE NAMES
================================ */
const ROLES = {
  SUPER_ADMIN: "bf22a62f-e672-4e88-9c28-fa1eee3e0e22",

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
  EBOOK_DCM: "EBOOK_DCM",
  EBOOK_FINANCE_OFFICER: "EBOOK_FINANCE_OFFICER",
  PUBLIC_READER: "PUBLIC_READER",
  EBOOK_PUBLIC_READER: "EBOOK_PUBLIC_READER",
};

function normalizeRoleName(value) {
  return (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");
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

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [reviewerCounts, setReviewerCounts] = useState({
    all: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
    overdue: 0,
  });

  const moduleId = user?.module_id || user?.active_module_id || user?.module?.id;
  const userRoleIds = user?.roles?.map((r) => r.role_id).filter(Boolean) || [];
  const userRoleNames =
    user?.roles
      ?.map((r) => normalizeRoleName(r.role_name || r.name || r.code || r.role))
      .filter(Boolean) || [];

  const hasRole = (allowedRoles = []) =>
    allowedRoles.some((allowed) => {
      const raw = (allowed || "").toString();
      if (!raw) return false;
      return raw.includes("-")
        ? userRoleIds.includes(raw)
        : userRoleNames.includes(normalizeRoleName(raw));
    });

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  useEffect(() => {
    if (!user) return;

    let active = true;
    const isEbookModule = moduleId === MODULES.EBOOK;
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
        setReviewerCounts({
          all: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          completed: 0,
          overdue: 0,
        });
      });

    return () => {
      active = false;
    };
  }, [user, moduleId, userRoleIds.join(","), userRoleNames.join(",")]);

  const filterRoutesByRole = (routes) =>
    routes
      .map((route) => {
        if (route.roles && !hasRole(route.roles)) return null;

        if (route.subMenu) {
          let visibleChildren = route.subMenu.filter(
            (sub) => !sub.roles || hasRole(sub.roles)
          );

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
              return {
                ...sub,
                name: withReviewerCount(sub.name, countMap[sub.path] ?? 0),
              };
            });
          }

          if (!visibleChildren.length) return null;
          return { ...route, subMenu: visibleChildren };
        }

        return route;
      })
      .filter(Boolean);

  if (!user) return null;

  const moduleRoutes = {
    [MODULES.LIBRARY]: buildLibraryRoutes(ROLES),
    [MODULES.EBOOK]: buildEbookRoutes(ROLES),
  };

  const routes = moduleRoutes[moduleId]
    ? filterRoutesByRole(moduleRoutes[moduleId])
    : [];

  const toggleMenu = (label) =>
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));

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
            {routes.length > 0 && <li className="nav-section-title">MAIN NAVIGATION</li>}

            {routes.map((route, i) => {
              if (!route.subMenu) {
                return (
                  <li className="nav-item" key={i}>
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

                  <ul
                    className="nav nav-treeview"
                    style={{ display: open || hasActiveChild ? "block" : "none" }}
                  >
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
      </div>
    </aside>
  );
}