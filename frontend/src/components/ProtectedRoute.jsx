// components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isAuthenticated = !!token && !!user;
  const hasRole = !roles || roles.includes(user?.role);

  if (!isAuthenticated) {
    // Not logged in → redirect to login with return URL
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!hasRole) {
    // Logged in but doesn't have the required role → redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and role allowed
  return children;
};

export default ProtectedRoute;