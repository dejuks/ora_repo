import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      
      {/* LEFT NAV */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#">
            <i className="fas fa-bars"></i>
          </a>
        </li>

        <li className="nav-item d-none d-sm-inline-block">
          <span className="nav-link font-weight-bold">
            User Management System
          </span>
        </li>
      </ul>

      {/* RIGHT NAV */}
      <ul className="navbar-nav ml-auto">
        <li className={`nav-item dropdown ${open ? "show" : ""}`} ref={dropdownRef}>
          
          {/* USER ICON */}
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
          >
            <i className="fas fa-user-circle fa-lg"></i>
          </a>

          {/* DROPDOWN MENU */}
          <div className={`dropdown-menu dropdown-menu-right ${open ? "show" : ""}`}>
            <span className="dropdown-item-text text-muted">
              {user?.email}
            </span>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item text-danger"
              onClick={handleLogout}
            >
              <i className="fas fa-user mr-2"></i>
              Logout
            </button>
          </div>

        </li>
      </ul>
    </nav>
  );
}
