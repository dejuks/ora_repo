import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout.jsx";
import ebookApi from "../../../../api/ebook.api";

// ================= ROLE NORMALIZER =================
const normalizeRoleName = (value) =>
  (value || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

// ================= ROLE → PANEL MAP =================
const ROLE_TO_PANEL = {
  EBOOK_ADMIN: "admin",
  EBOOK_AUTHOR: "author",
  EBOOK_EDITOR: "editor",
  EBOOK_REVIEWER: "reviewer",
  EBOOK_FINANCE: "finance",
  EBOOK_DIGITAL_CONTENT_MANAGER: "production",
  EBOOK_DCM: "production",
  PUBLIC_READER: "reader",
  EBOOK_PUBLIC_READER: "reader",
};

// ================= ROLE PRIORITY =================
function getPrimaryPanel(roles = []) {
  const normalized = roles.map(normalizeRoleName);

  const priority = [
    "EBOOK_ADMIN",
    "EBOOK_EDITOR",
    "EBOOK_REVIEWER",
    "EBOOK_AUTHOR",
    "EBOOK_FINANCE",
    "EBOOK_DIGITAL_CONTENT_MANAGER",
    "EBOOK_DCM",
    "PUBLIC_READER",
  ];

  for (const role of priority) {
    if (normalized.includes(role)) {
      return ROLE_TO_PANEL[role];
    }
  }

  return "author";
}

// ================= PANEL META =================
const PANEL_META = {
  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage all ebook workflows",
  },

  author: {
    title: "Author Dashboard",
    subtitle: "Manage your manuscripts",
  },

  editor: {
    title: "Editor Dashboard",
    subtitle: "Editorial workflow management",
  },

  reviewer: {
    title: "Reviewer Dashboard",
    subtitle: "Review assignments and recommendations",
  },

  finance: {
    title: "Finance Dashboard",
    subtitle: "Payments and verification",
  },

  production: {
    title: "Production Dashboard",
    subtitle: "Production and publication workflow",
  },

  reader: {
    title: "Reader Dashboard",
    subtitle: "Browse published ebooks",
  },
};

// ================= MAIN =================
export default function EbookDashboardPage() {
  // ================= USER =================
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ================= USER ROLES =================
  const roles = useMemo(() => {
    return (
      user?.roles?.map((r) =>
        normalizeRoleName(
          r.role_name || r.name || r.code
        )
      ) || []
    );
  }, [user]);

  // ================= ACTIVE PANEL =================
  const panel = useMemo(
    () => getPrimaryPanel(roles),
    [roles]
  );

  // ================= STATE =================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    summary: {},
    manuscripts: [],
    assignments: [],
    finances: [],
    production: [],
  });

  // ================= LOAD DASHBOARD =================
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const apiMap = {
          admin: ebookApi.getAdminDashboard,
          author: ebookApi.getAuthorDashboard,
          editor: ebookApi.getEditorDashboard,
          reviewer: ebookApi.getReviewerDashboard,
          finance: ebookApi.getFinanceDashboard,
          production: ebookApi.getProductionDashboard,
          reader: ebookApi.getPublicDashboard,
        };

        const loader =
          apiMap[panel] ||
          ebookApi.getAuthorDashboard;

        const response = await loader();

        setData({
          summary: response?.summary || {},
          manuscripts:
            response?.manuscripts || [],
          assignments:
            response?.assignments || [],
          finances: response?.finances || [],
          production:
            response?.production || [],
        });
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [panel]);

  // ================= ROWS =================
  const rows =
    data.manuscripts?.length > 0
      ? data.manuscripts
      : data.assignments?.length > 0
      ? data.assignments
      : data.finances?.length > 0
      ? data.finances
      : data.production || [];

  const meta =
    PANEL_META[panel] ||
    PANEL_META.author;

  // ================= UI =================
  return (
    <MainLayout>
      {/* ================= HEADER ================= */}
      <div className="content-header mb-3">
        <h1>{meta.title}</h1>

        <p className="text-muted">
          {meta.subtitle}
        </p>

        <div className="mt-2">
          <strong>Logged User:</strong>{" "}
          {user?.name || "-"}
        </div>

        <div>
          <strong>Active Role:</strong>{" "}
          {panel}
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="card">
          <div className="card-body">
            Loading dashboard...
          </div>
        </div>
      ) : (
        <>
          {/* ================= SUMMARY ================= */}
          <div className="row mb-4">
            {Object.entries(data.summary).map(
              ([key, value]) => (
                <div
                  className="col-md-3 mb-3"
                  key={key}
                >
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <small className="text-muted text-uppercase">
                        {key.replaceAll("_", " ")}
                      </small>

                      <h2 className="mt-2">
                        {value || 0}
                      </h2>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* ================= TABLE ================= */}
          <div className="card">
            <div className="card-header">
              Recent Records
            </div>

            <div className="card-body table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Language</th>
                    <th>Publication Year</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {!rows.length ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={
                          row.id ||
                          row.manuscript_id
                        }
                      >
                        {/* ora_ebook_manuscripts */}
                        <td>
                          <div className="font-weight-bold">
                            {row.title ||
                              "Untitled"}
                          </div>

                          <small className="text-muted">
                            ISBN:{" "}
                            {row.isbn || "-"}
                          </small>
                        </td>

                        {/* status */}
                        <td>
                          <span>
                            {row.status ||
                              "N/A"}
                          </span>
                        </td>

                        {/* language */}
                        <td>
                          {row.language || "-"}
                        </td>

                        {/* publication year */}
                        <td>
                          {row.publication_year ||
                            "-"}
                        </td>

                        {/* created */}
                        <td>
                          {row.created_at
                            ? new Date(
                                row.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* action */}
                        <td>
                          <Link
                            className="btn btn-sm btn-primary"
                            to={`/ebook/manuscripts/${
                              row.id ||
                              row.manuscript_id
                            }`}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}