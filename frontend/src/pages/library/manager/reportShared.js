import React from "react";
import MainLayout from "../../../components/layout/MainLayout.jsx";

export function StatCard({ title, value, subtitle, color = "bg-primary", icon = "fas fa-chart-bar" }) {
  return (
    <div className="col-lg-3 col-md-6">
      <div className={`small-box ${color}`}>
        <div className="inner">
          <h3>{value}</h3>
          <p>{title}</p>
          {subtitle ? <small>{subtitle}</small> : null}
        </div>
        <div className="icon"><i className={icon}></i></div>
      </div>
    </div>
  );
}

export function ReportShell({ title, subtitle, error, loading, children }) {
  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>{title}</h1>
          <p className="text-muted mb-0">{subtitle}</p>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading report...</div> : children}
        </div>
      </section>
    </MainLayout>
  );
}

export function number(value) {
  return Number(value || 0).toLocaleString();
}

export function currency(value) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(Number(value || 0));
}
