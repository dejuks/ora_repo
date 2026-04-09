import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const DEV_BYPASS_ACCESS_CHECK = true;

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");

  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (DEV_BYPASS_ACCESS_CHECK) {
    return children;
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
}
