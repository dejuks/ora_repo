import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import StatusBadge from "./components/StatusBadge.jsx";

// ---------------- MOCK USER ----------------
const mockUser = {
  id: "1",
  name: "Dejene",
  roles: [{ role_name: "EBOOK_AUTHOR" }],
};

// ---------------- MOCK DATA ----------------
const MOCK_DATA = {
  author: [
    {
      submission_id: 1,
      title: "React Basics",
      status: "published",
      created_at: "2026-05-01",
    },
    {
      submission_id: 2,
      title: "Node.js Guide",
      status: "revision_requested",
      created_at: "2026-05-02",
    },
    {
      submission_id: 3,
      title: "Laravel API",
      status: "payment_pending",
      created_at: "2026-05-03",
    },
  ],

  reviewer: [
    {
      assignment_id: 1,
      title: "AI Book Review",
      status: "assigned",
      created_at: "2026-05-01",
    },
    {
      assignment_id: 2,
      title: "ML Basics",
      status: "submitted",
      created_at: "2026-05-02",
    },
  ],

  editor: [
    {
      id: 1,
      title: "Database Design",
      stage: "screening",
      status: "pending",
      created_at: "2026-05-01",
    },
  ],

  admin: [
    {
      id: 1,
      title: "System Overview",
      status: "published",
      created_at: "2026-05-01",
    },
  ],
};

// ---------------- HELPERS ----------------
const normalizeRoleName = (value) =>
  (value || "").toString().trim().toUpperCase();

const ROLE_TO_PANEL = {
  EBOOK_AUTHOR: "author",
  EBOOK_REVIEWER: "reviewer",
  EBOOK_EDITOR: "editor",
  EBOOK_ADMIN: "admin",
};

// ---------------- COMPONENT ----------------
export default function EbookDashboardPage() {
  const user = mockUser;

  const roleNames =
    user?.roles?.map((r) => normalizeRoleName(r.role_name)) || [];

  const panel = useMemo(
    () => roleNames.map((r) => ROLE_TO_PANEL[r]).find(Boolean) || "author",
    [roleNames.join(",")]
  );

  const [data] = useState(MOCK_DATA[panel] || []);

  // ---------------- SUMMARY ----------------
  const summary = useMemo(() => {
    if (panel === "author") {
      return {
        total: data.length,
        published: data.filter((d) => d.status === "published").length,
        revisions: data.filter((d) => d.status === "revision_requested").length,
      };
    }

    if (panel === "reviewer") {
      return {
        pending: data.filter((d) =>
          ["assigned", "accepted"].includes(d.status)
        ).length,
        completed: data.filter((d) => d.status === "submitted").length,
        total: data.length,
      };
    }

    if (panel === "editor") {
      return {
        screening: data.filter((d) => d.stage === "screening").length,
        total: data.length,
      };
    }

    return {
      total: data.length,
    };
  }, [data, panel]);

  // ---------------- UI ----------------
  return (
    <MainLayout>
      <div className="content-header">
        <h1>{panel.toUpperCase()} DASHBOARD</h1>
        <p className="text-muted">Static demo (no API)</p>
      </div>

      {/* SUMMARY */}
      <div className="row mb-3">
        {Object.entries(summary).map(([k, v]) => (
          <div className="col-md-3" key={k}>
            <div className="card">
              <div className="card-body">
                <small className="text-muted">{k}</small>
                <h3>{v}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header">My Items</div>
        <div className="card-body table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!data.length ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No data
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i}>
                    <td>{row.title}</td>
                    <td>
                      <span>{row.status}</span>
                    </td>
                    <td>
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        className="btn btn-sm btn-primary"
                        to="#"
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