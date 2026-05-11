import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";

// ================= MOCK USER =================
const mockUser = {
  id: "1",
  name: "Dejene Kasa",
  roles: [
    { role_name: "EBOOK_AUTHOR" },
    { role_name: "EBOOK_REVIEWER" },
  ],
};

// ================= UNIFIED DATA =================
const MOCK_ITEMS = [
  {
    id: 1,
    type: "submission",
    title: "React Basics",
    status: "published",
    stage: null,
    role: "EBOOK_AUTHOR",
    created_at: "2026-05-01",
  },
  {
    id: 2,
    type: "submission",
    title: "Node.js Guide",
    status: "revision_requested",
    stage: null,
    role: "EBOOK_AUTHOR",
    created_at: "2026-05-02",
  },
  {
    id: 3,
    type: "payment",
    title: "Laravel API",
    status: "payment_pending",
    stage: null,
    role: "EBOOK_AUTHOR",
    created_at: "2026-05-03",
  },
  {
    id: 4,
    type: "review",
    title: "AI Book Review",
    status: "assigned",
    stage: null,
    role: "EBOOK_REVIEWER",
    created_at: "2026-05-01",
  },
  {
    id: 5,
    type: "review",
    title: "ML Basics",
    status: "submitted",
    stage: null,
    role: "EBOOK_REVIEWER",
    created_at: "2026-05-02",
  },
  {
    id: 6,
    type: "editing",
    title: "Database Design",
    status: "pending",
    stage: "screening",
    role: "EBOOK_EDITOR",
    created_at: "2026-05-01",
  },
  {
    id: 7,
    type: "system",
    title: "System Overview",
    status: "published",
    stage: null,
    role: "EBOOK_ADMIN",
    created_at: "2026-05-01",
  },
];

// ================= ROLE CONFIG =================
const ROLE_CONFIG = {
  EBOOK_AUTHOR: {
    label: "Author",
    filter: (item) => item.role === "EBOOK_AUTHOR",
    summary: (data) => ({
      total: data.length,
      published: data.filter((d) => d.status === "published").length,
      revisions: data.filter(
        (d) => d.status === "revision_requested"
      ).length,
      payment_pending: data.filter(
        (d) => d.status === "payment_pending"
      ).length,
    }),
  },

  EBOOK_REVIEWER: {
    label: "Reviewer",
    filter: (item) => item.role === "EBOOK_REVIEWER",
    summary: (data) => ({
      assigned: data.filter((d) => d.status === "assigned").length,
      submitted: data.filter((d) => d.status === "submitted").length,
      total: data.length,
    }),
  },

  EBOOK_EDITOR: {
    label: "Editor",
    filter: (item) => item.role === "EBOOK_EDITOR",
    summary: (data) => ({
      screening: data.filter((d) => d.stage === "screening").length,
      total: data.length,
    }),
  },

  EBOOK_ADMIN: {
    label: "Admin",
    filter: () => true,
    summary: (data) => ({
      total: data.length,
      published: data.filter((d) => d.status === "published").length,
    }),
  },
};

// ================= HELPER =================
const normalize = (r) => (r || "").toUpperCase();

// ================= COMPONENT =================
export default function EbookDashboardPage() {
  const user = mockUser;

  // get roles
  const roles = user.roles.map((r) => normalize(r.role_name));

  // pick active config (first role priority)
  const activeRole = roles.find((r) => ROLE_CONFIG[r]) || "EBOOK_AUTHOR";
  const config = ROLE_CONFIG[activeRole];

  // filter items based on ALL user roles
  const visibleItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) =>
      roles.includes(item.role)
    );
  }, [roles]);

  // summary
  const summary = useMemo(
    () => config.summary(visibleItems),
    [visibleItems, config]
  );

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="content-header mb-3">
        <h2>{config.label} Dashboard</h2>
        <p className="text-muted">
          Unified dashboard for all ebook roles
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row mb-4">
        {Object.entries(summary).map(([key, value]) => (
          <div className="col-md-3 mb-2" key={key}>
            <div className="card shadow-sm">
              <div className="card-body">
                <small className="text-muted text-uppercase">
                  {key}
                </small>
                <h3 className="mt-1">{value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <strong>My Activities</strong>
        </div>

        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.type}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to="#"
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}