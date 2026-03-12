// src/components/auth/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    // save the page the user wanted
    const returnTo = location.pathname + location.search;
    try {
      sessionStorage.setItem("returnTo", returnTo);
    } catch {}

    return <Navigate to="/auth" replace />;
  }

  return children;
}