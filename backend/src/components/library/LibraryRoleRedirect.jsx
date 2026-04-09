import React from "react";
import { Navigate } from "react-router-dom";

export default function LibraryRoleRedirect() {
  return <Navigate to="/library/physical/member/dashboard" replace />;
}
