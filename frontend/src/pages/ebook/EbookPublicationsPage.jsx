import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookPublicationsPage() {
  const location = useLocation();

  const isManagementView =
    location.pathname.startsWith("/ebook/management");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");

  const [accessLevel, setAccessLevel] =
    useState("");

  const [rows, setRows] = useState([]);

  const [suggestions, setSuggestions] =
    useState([]);

  // publish popup states
  const [showPublishModal, setShowPublishModal] =
    useState(false);

  const [selectedPublication, setSelectedPublication] =
    useState(null);

  const [publishing, setPublishing] =
    useState(false);

  const pageMeta = useMemo(
    () =>
      isManagementView
        ? {
            title: "Publication Management",
            subtitle:
              "Review released publications, verify metadata, and inspect visibility and access settings.",
            backTo: "/ebook/dashboard",
            backLabel: "Back to dashboard",
          }
        : {
            title: "Published eBook Catalog",
            subtitle:
              "Search public eBooks, filter access rights, and open each publication detail page.",
            backTo: "/ebook/dashboard",
            backLabel: "Back to dashboard",
          },
    [isManagementView]
  );

  const load = async () => {
    setLoading(true);

    setError("");

    try {
      const params = {
        search,
        access_level:
          accessLevel || undefined,
        limit: 50,
      };

      const result = isManagementView
        ? await ebookApi.listPublications(
            params
          )
        : await ebookApi.listPublicCatalog(
            params
          );

      setRows(
        result?.rows ||
          result?.publications ||
          result ||
          []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load publications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isManagementView]);

  useEffect(() => {
    if (isManagementView) {
      setSuggestions([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const result =
          await ebookApi.getPublicSearchSuggestions(
            {
              q: search,
              limit: 6,
            }
          );

        setSuggestions(
          Array.isArray(result)
            ? result
            : []
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, isManagementView]);

  // open popup
  const openPublishModal = (row) => {
    setSelectedPublication(row);
    setShowPublishModal(true);
  };

  // publish manuscript
  const handlePublish = async () => {
    try {
      setPublishing(true);

      setError("");

      setNotice("");

      await ebookApi.publishManuscript(
        selectedPublication.id
      );

      setNotice(
        "Manuscript published successfully."
      );

      setShowPublishModal(false);

      setSelectedPublication(null);

      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to publish manuscript."
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">
              {pageMeta.title}
            </h1>

            <p className="text-muted mb-0">
              {pageMeta.subtitle}
            </p>
          </div>

          <Link
            className="btn btn-outline-secondary"
            to={pageMeta.backTo}
          >
            {pageMeta.backLabel}
          </Link>
        </div>
      </section>

      {error ? (
        <div className="alert alert-danger">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="alert alert-success">
          {notice}
        </div>
      ) : null}

      <div className="card card-outline card-primary">
        <div className="card-body">
          <div className="form-row align-items-end mb-3">
            <div className="form-group col-md-7">
              <label>
                {isManagementView
                  ? "Search publications"
                  : "Search catalog"}
              </label>

              <input
                className="form-control"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search title, abstract, keywords"
              />

              {!isManagementView &&
                !!suggestions.length && (
                  <div className="border rounded mt-2 bg-white">
                    {suggestions.map(
                      (item) => (
                        <Link
                          key={item.slug}
                          className="d-block px-3 py-2 border-bottom text-dark"
                          to={`/ebook/publications/${item.slug}`}
                        >
                          <div className="font-weight-bold">
                            {item.title}
                          </div>

                          <small className="text-muted">
                            {item.author_name ||
                              "Unknown author"}{" "}
                            ·{" "}
                            {
                              item.access_level
                            }
                          </small>
                        </Link>
                      )
                    )}
                  </div>
                )}
            </div>

            <div className="form-group col-md-3">
              <label>
                Access level
              </label>

              <select
                className="form-control"
                value={accessLevel}
                onChange={(e) =>
                  setAccessLevel(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All
                </option>

                <option value="open_access">
                  Open access
                </option>

                <option value="restricted">
                  Restricted
                </option>

                <option value="embargoed">
                  Embargoed
                </option>

                <option value="institution_only">
                  Institution only
                </option>
              </select>
            </div>

            <div className="form-group col-md-2">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={load}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Year</th>
                  <th>Payment</th>
                  <th width="250">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : !rows.length ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center text-muted py-4"
                    >
                      No publications found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={
                        row.publication_id ||
                        row.slug ||
                        row.id
                      }
                    >
                      <td>
                        <div className="font-weight-bold">
                          {row.title ||
                            row.landing_page_title ||
                            "Untitled publication"}
                        </div>

                        <small className="text-muted">
                          /
                          {row.slug ||
                            "no-slug"}
                        </small>
                      </td>

                      <td>
                        {row.author_name ||
                          row.creator_name ||
                          "—"}
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            row.status ||
                            "draft"
                          }
                        />
                      </td>

                      <td>
                        {row.publication_year ||
                          "—"}
                      </td>

                      <td>
                        {row.payment_status ||
                          "—"}
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {row.status}

                          {row.status !==
                            "published" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                openPublishModal(
                                  row
                                )
                              }
                            >
                              Publish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* publish modal */}
      {showPublishModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.5)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Publish Manuscript
                  </h5>

                  <button
                    type="button"
                    className="close border-0 bg-white"
                    onClick={() =>
                      setShowPublishModal(
                        false
                      )
                    }
                  >
                    <span>
                      &times;
                    </span>
                  </button>
                </div>

                <div className="modal-body">
                  <p>
                    Are you sure you
                    want to publish this
                    manuscript?
                  </p>

                  <div className="mb-3">
                    <strong>
                      Title:
                    </strong>{" "}
                    {
                      selectedPublication?.title
                    }
                  </div>

                  <div className="alert alert-info mb-0">
                    Status will change
                    to:
                    <strong>
                      {" "}
                      published
                    </strong>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowPublishModal(
                        false
                      )
                    }
                    disabled={publishing}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={
                      handlePublish
                    }
                    disabled={publishing}
                  >
                    {publishing
                      ? "Publishing..."
                      : "Yes, Publish"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </MainLayout>
  );
} 