import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";

/* ===============================
   MODULE UUIDS
================================ */
const MODULES = {
  SYSTEM_WIDE: "e936cd83-5383-4220-8cb5-8d1df4338b86",
  JOURNAL: "991aefe2-d96c-4712-a5c4-3be6b56dfe68",
  LIBRARY: "8e1967f9-b9d7-42a9-ae20-2e1d7cdc16bb",
};

/* ===============================
   ROLE UUIDS
================================ */
const ROLES = {
  SUPER_ADMIN: "bf22a62f-e672-4e88-9c28-fa1eee3e0e22",
  LIBRARY_MANAGER: "5042b3f2-2cd6-4a1b-8015-6774c3956409",
  EDITOR: "33333333-aaaa-bbbb-cccc-333333333333",
  JOURNAL_MANAGER: "311b2831-99d3-426b-9a7c-6453756d5d9a",
};

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const moduleId = user?.module_id;
  const userRoleIds = user?.roles?.map(r => r.role_id) || [];

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  /* ===============================
     FILTER ROUTES BY ROLE
================================ */
  const filterRoutesByRole = (routes) =>
    routes
      .map(route => {
        if (!route.roles.some(r => userRoleIds.includes(r))) return null;

        if (route.type === "menu") {
          const children = route.children.filter(c =>
            c.roles.some(r => userRoleIds.includes(r))
          );
          if (!children.length) return null;
          return { ...route, children };
        }
        return route;
      })
      .filter(Boolean);

  /* ===============================
     MODULE ROUTES
================================ */
  const moduleRoutes = {
    [MODULES.SYSTEM_WIDE]: [
      {
        type: "single",
        path: "/admin-dashboard",
        label: "Dashboard",
        icon: "fas fa-tachometer-alt",
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        type: "menu",
        label: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.SUPER_ADMIN],
        children: [
          { path: "/users", label: "All Users", roles: [ROLES.SUPER_ADMIN] },
          { path: "/roles", label: "Roles", roles: [ROLES.SUPER_ADMIN] },
          { path: "/modules", label: "Modules", roles: [ROLES.SUPER_ADMIN] },
        ],
      },
    ],

    [MODULES.JOURNAL]: [
      {
        type: "single",
        path: "/journal-dashboard",
        label: "Dashboard",
        icon: "fas fa-newspaper",
        roles: [ROLES.JOURNAL_MANAGER, ROLES.EDITOR],
      },
      {
        type: "menu",
        label: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.SUPER_ADMIN],
        children: [
          { path: "/users", label: "All Users", roles: [ROLES.SUPER_ADMIN] },
          { path: "/users/create", label: "Create User", roles: [ROLES.SUPER_ADMIN] },
        ],
      },
    ],

    

    [MODULES.LIBRARY]: [
      {
        type: "single",
        path: "/library-dashboard",
        label: "Dashboard",
        icon: "fas fa-book",
        roles: [ROLES.LIBRARY_MANAGER],
      },
      {
        type: "menu",
        label: "User Management",
        icon: "fas fa-users",
        roles: [ROLES.LIBRARY_MANAGER],
        children: [
          { path: "/library/users", label: "All Users", roles: [ROLES.LIBRARY_MANAGER] },
          { path: "/library/users/create", label: "Create User", roles: [ROLES.LIBRARY_MANAGER] },
        ],
      },
    ],
  };

  const routes = moduleRoutes[moduleId]
    ? filterRoutesByRole(moduleRoutes[moduleId])
    : [];

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand */}
      <Link to="/" className="brand-link">
        <span className="brand-text font-weight-light">UMS</span>
      </Link>

      <div className="sidebar">
        {/* User Panel */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img
              src="https://via.placeholder.com/160"
              className="img-circle elevation-2"
              alt="User"
            />
          </div>
          <div className="info">
            <Link to="/profile" className="d-block">
              {user?.full_name}
            </Link>
            <small className="text-muted">{user?.module_name}</small>
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
              if (route.type === "single") {
                return (
                  <li className="nav-item" key={i}>
                    <Link
                      to={route.path}
                      className={`nav-link ${isActive(route.path) ? "active" : ""}`}
                    >
                      <i className={`nav-icon ${route.icon}`} />
                      <p>{route.label}</p>
                    </Link>
                  </li>
                );
              }

              const open = expandedMenus[route.label];
              return (
                <li
                  className={`nav-item has-treeview ${
                    open ? "menu-open" : ""
                  }`}
                  key={i}
                >
                  <a
                    href="#"
                    className={`nav-link ${open ? "active" : ""}`}
                    onClick={e => {
                      e.preventDefault();
                      toggleMenu(route.label);
                    }}
                  >
                    <i className={`nav-icon ${route.icon}`} />
                    <p>
                      {route.label}
                      <i className="right fas fa-angle-left" />
                    </p>
                  </a>

                  <ul className="nav nav-treeview">
                    {route.children.map((c, idx) => (
                      <li className="nav-item" key={idx}>
                        <Link
                          to={c.path}
                          className={`nav-link ${isActive(c.path) ? "active" : ""}`}
                        >
                          <i className="far fa-circle nav-icon" />
                          <p>{c.label}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}

             

            {!routes.length && (
              <li className="nav-item">
                <span className="nav-link text-warning">
                  <i className="nav-icon fas fa-exclamation-circle" />
                  <p>No menu available</p>
                </span>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
