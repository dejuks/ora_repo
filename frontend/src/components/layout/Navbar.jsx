import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, UserCircle2 } from "lucide-react";
import { logout } from "../../utils/auth";
import { useSidebar } from "../../context/SidebarContext";

const titleMap = {
  "/admin-dashboard": "System Administration",
  "/dashboard": "Dashboard",
  "/users": "User Management",
  "/roles": "Roles",
  "/permissions": "Permissions",
  "/modules": "Modules",
  "/library": "Library Management",
  "/library/admin/dashboard": "Library Admin Dashboard",
  "/library/manager/dashboard": "Library Manager Dashboard",
  "/library/librarian/dashboard": "Librarian Dashboard",
  "/library/cataloger/dashboard": "Cataloger Dashboard",
  "/library/acquisition/dashboard": "Acquisition Dashboard",
  "/library/inventory/dashboard": "Inventory Dashboard",
  "/library/uploader/dashboard": "Content Uploader Dashboard",
  "/library/member/dashboard": "Member Dashboard",
};

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  const location = useLocation();
  const { open, setOpen } = useSidebar();

  const pageTitle = useMemo(() => {
    const exact = titleMap[location.pathname];
    if (exact) return exact;
    if (location.pathname.startsWith("/library/")) {
      const tail = location.pathname
        .replace("/library/", "")
        .split("/")
        .filter(Boolean)
        .slice(-2)
        .join(" ");
      return tail.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Library Management";
    }
    const text = location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return text || "ORA Platform";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-button topbar-menu-button"
          aria-label={open ? "Hide sidebar" : "Show sidebar"}
          onClick={() => setOpen(!open)}
        >
          <Menu size={18} />
        </button>

        <div>
          <div className="topbar-eyebrow">ORA Platform</div>
          <h1 className="topbar-title">{pageTitle}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={16} />
          <span>Search pages, modules, users…</span>
        </div>

        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-chip">
          <UserCircle2 size={18} />
          <div>
            <strong>{user?.full_name || user?.name || "User"}</strong>
            <span>{user?.email || "Signed in"}</span>
          </div>
        </div>

        <button type="button" className="icon-button danger" onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
