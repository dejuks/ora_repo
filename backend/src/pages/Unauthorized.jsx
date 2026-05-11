import React from "react";

export default function Unauthorized() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <h1 className="text-danger">403</h1>
        <h3>Access Denied</h3>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  );
}
