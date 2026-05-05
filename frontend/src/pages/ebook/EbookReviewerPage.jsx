import React, { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

/* ===================== CONFIG ===================== */

const PAGE_CONFIG = {
  all: { title: "My Assigned Submissions", empty: "No data" },
  pending: { title: "Pending Assignments", empty: "No pending" },
  accepted: { title: "Accepted Submissions", empty: "No accepted" },
  rejected: { title: "Rejected Assignments", empty: "No rejected" },
  completed: { title: "Completed Reviews", empty: "No completed" },
  overdue: { title: "Overdue Assignments", empty: "No overdue" },
};

/* ===================== HELPERS ===================== */

// 🔥 FIX: normalize status everywhere
const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase();

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function isOverdue(row) {
  if (!row?.due_date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(row.due_date);
  due.setHours(0, 0, 0, 0);

  const status = normalizeStatus(row.status);

  return due < today && ["assigned", "accepted"].includes(status);
}

function getFilteredRows(rows, filter) {
  return rows.filter((row) => {
    const status = normalizeStatus(row.status);

    switch (filter) {
      case "pending":
        return status === "assigned";
      case "accepted":
        return status === "accepted";
      case "rejected":
        return status === "declined";
      case "completed":
        return status === "submitted";
      case "overdue":
        return isOverdue(row);
      default:
        return true;
    }
  });
}

function getReviewerCounts(rows) {
  return {
    all: rows.length,
    pending: rows.filter((r) => normalizeStatus(r.status) === "assigned").length,
    accepted: rows.filter((r) => normalizeStatus(r.status) === "accepted").length,
    rejected: rows.filter((r) => normalizeStatus(r.status) === "declined").length,
    completed: rows.filter((r) => normalizeStatus(r.status) === "submitted").length,
    overdue: rows.filter((r) => isOverdue(r)).length,
  };
}

function getActionItems(row) {
  const status = normalizeStatus(row.status);

  if (status === "assigned") {
    return [
      { key: "accept", label: "Accept", icon: "✓" },
      { key: "reject", label: "Reject", icon: "✗" },
    ];
  }

  if (status === "accepted") {
    return [{ key: "review", label: "Submit Review", icon: "✍️" }];
  }

  return [];
}

/* ===================== COMPONENT ===================== */

export default function EbookReviewerPage({ filter = "all" }) {
  const page = PAGE_CONFIG[filter] || PAGE_CONFIG.all;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuId, setMenuId] = useState(null);
  const menuRef = useRef(null);

  /* ================= LOAD DATA ================= */

  const load = async () => {
    try {
      setLoading(true);
      const res = await ebookApi.getReviewerDashboard();
      setRows(res?.assignments || []);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuId(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ================= FILTER ================= */

  const filteredRows = useMemo(() => {
    let result = getFilteredRows(rows, filter);

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((r) =>
        [r.title, r.author_name, r.status]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    return result.sort((a, b) => {
      const overdueA = isOverdue(a) ? 1 : 0;
      const overdueB = isOverdue(b) ? 1 : 0;

      if (overdueA !== overdueB) return overdueB - overdueA;

      return new Date(a.due_date || 0) - new Date(b.due_date || 0);
    });
  }, [rows, filter, search]);

  const counts = getReviewerCounts(rows);

  /* ================= ACTION ================= */

  const respond = async (id, status) => {
    try {
      await ebookApi.respondAssignment(id, { status });

      // instant UI update
      setRows((prev) =>
        prev.map((r) =>
          r.assignment_id === id ? { ...r, status } : r
        )
      );

      setNotice("Updated successfully");
    } catch {
      setError("Action failed");
    }
  };

  /* ================= UI ================= */

  return (
    <MainLayout>
      <div className="container mt-4">

        <h3>
          {page.title} ({counts[filter] || 0})
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        <input
          className="form-control mb-3"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Author</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : !filteredRows.length ? (
              <tr>
                <td colSpan="6">{page.empty}</td>
              </tr>
            ) : (
              filteredRows.map((row, i) => (
                <tr key={row.assignment_id}>
                  <td>{i + 1}</td>
                  <td>{row.title}</td>
                  <td>{row.author_name}</td>
                  <td>{formatDate(row.due_date)}</td>
                  <td>
                    <StatusBadge value={normalizeStatus(row.status)} />
                  </td>
                  <td>
                    {getActionItems(row).map((a) => (
                      <button
                        key={a.key}
                        className="btn btn-sm btn-outline-primary mr-1"
                        onClick={() =>
                          respond(
                            row.assignment_id,
                            a.key === "accept"
                              ? "accepted"
                              : a.key === "reject"
                              ? "declined"
                              : ""
                          )
                        }
                      >
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}