import React from "react";
import { Link } from "react-router-dom";
import LibraryDashboardPage from "./shared/LibraryDashboardPage.jsx";
import { formatCurrency, StatusBadge, formatDate } from "./shared/libraryHelpers.js";

export default function RoleAwareDashboard({ title, subtitle, statCards, quickLinks = [], sections = [], load }) {
  return <LibraryDashboardPage title={title} subtitle={subtitle} statCards={statCards} quickLinks={quickLinks} sections={sections} load={load} />;
}

export { formatCurrency, StatusBadge, formatDate, Link };
