import React from "react";
import { logout } from "../../utils/auth";

export default function FinanceDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container mt-4">
      <h2>Finance Dashboard</h2>
      <p className="text-muted">
        Welcome <b>{user?.full_name}</b> (Finance Module)
      </p>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card card-outline card-success">
            <div className="card-body">
              <h5>Payments</h5>
              <p>Manage payments and invoices</p>
              <a href="/payments" className="btn btn-success btn-sm">
                Go
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-outline card-secondary">
            <div className="card-body">
              <h5>Reports</h5>
              <p>Financial reports and analytics</p>
              <a href="/finance-reports" className="btn btn-secondary btn-sm">
                Go
              </a>
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-danger mt-4" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
