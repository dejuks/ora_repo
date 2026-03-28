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

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector(".main-sidebar");

        if (
          sidebar &&
          !sidebar.contains(e.target) &&
          !e.target.closest(".nav-link")
        ) {
          document.body.classList.remove("sidebar-open");
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      
      {/* LEFT NAV */}
      <ul className="navbar-nav align-items-center">
        
        {/* HAMBURGER */}
        <li className="nav-item">
          <button
            className="nav-link border-0 bg-transparent"
            onClick={() => {
              if (window.innerWidth <= 768) {
                document.body.classList.toggle("sidebar-open");
              } else {
                document.body.classList.toggle("sidebar-collapse");
              }
            }}
          >
            <i className="fas fa-bars"></i>
          </button>
        </li>

        {/* TITLE (Responsive) */}
        <li className="nav-item">
          {/* Mobile */}
          <span className="nav-link font-weight-bold d-inline d-sm-none">
            ORA
          </span>

          {/* Desktop */}
          <span className="nav-link font-weight-bold d-none d-sm-inline">
            ORA Digital Platform
          </span>
        </li>
      </ul>

      {/* RIGHT NAV */}
      <ul className="navbar-nav ml-auto">
        <li
          className={`nav-item dropdown ${open ? "show" : ""}`}
          ref={dropdownRef}
        >
          {/* USER ICON */}
          <a
            href="/#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
          >
            <i className="fas fa-user-circle fa-lg"></i>
          </a>

          {/* DROPDOWN */}
          <div
            className={`dropdown-menu dropdown-menu-right ${
              open ? "show" : ""
            }`}
          >
            <span className="dropdown-item-text text-muted">
              {user?.email}
            </span>
            <span className="dropdown-item-text text-muted">
              {user?.full_name || user?.name}
            </span>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item text-danger"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </li>
      </ul>

      {/* OPTIONAL MOBILE STYLE */}
      <style>{`
        .navbar .nav-link {
          font-size: 0.95rem;
        }

        @media (max-width: 576px) {
          .navbar .nav-link {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </nav>
  );
}