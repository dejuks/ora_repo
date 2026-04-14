import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookPublicationsPage() {
  const location = useLocation();
  const isManagementView = location.pathname.startsWith("/ebook/management");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [rows, setRows] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const pageMeta = useMemo(
    () =>
      isManagementView
        ? {
            title: "Publication Management",
            subtitle: "Review released publications, verify metadata, and inspect visibility and access settings.",
            backTo: "/ebook/dashboard",
            backLabel: "Back to dashboard",
          }
        : {
            title: "Published eBook Catalog",
            subtitle: "Search public eBooks, filter access rights, and open each publication detail page.",
            backTo: "/ebook/dashboard",
            backLabel: "Back to dashboard",
          },
    [isManagementView]
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { search, access_level: accessLevel || undefined, limit: 50 };
      const result = isManagementView ? await ebookApi.listPublications(params) : await ebookApi.listPublicCatalog(params);
      setRows(result?.rows || result?.publications || result || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load publications.");
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
        const result = await ebookApi.getPublicSearchSuggestions({ q: search, limit: 6 });
        setSuggestions(Array.isArray(result) ? result : []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isManagementView]);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">{pageMeta.title}</h1>
            <p className="text-muted mb-0">{pageMeta.subtitle}</p>
          </div>
          <Link className="btn btn-outline-secondary" to={pageMeta.backTo}>{pageMeta.backLabel}</Link>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card card-outline card-primary">
        <div className="card-body">
          <div className="form-row align-items-end mb-3">
            <div className="form-group col-md-7">
              <label>{isManagementView ? "Search publications" : "Search catalog"}</label>
              <input
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, abstract, keywords"
              />
              {!isManagementView && !!suggestions.length && (
                <div className="border rounded mt-2 bg-white">
                  {suggestions.map((item) => (
                    <Link
                      key={item.slug}
                      className="d-block px-3 py-2 border-bottom text-dark"
                      to={`/ebook/publications/${item.slug}`}
                    >
                      <div className="font-weight-bold">{item.title}</div>
                      <small className="text-muted">{item.author_name || "Unknown author"} · {item.access_level}</small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group col-md-3">
              <label>Access level</label>
              <select className="form-control" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
                <option value="">All</option>
                <option value="open_access">Open access</option>
                <option value="restricted">Restricted</option>
                <option value="embargoed">Embargoed</option>
                <option value="institution_only">Institution only</option>
              </select>
            </div>
            <div className="form-group col-md-2">
              <button type="button" className="btn btn-primary btn-block" onClick={load}>Refresh</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Access</th>
                  <th>Year</th>
                  <th>Published</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : !rows.length ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No publications found.</td></tr>
                ) : rows.map((row) => (
                  <tr key={row.publication_id || row.slug || row.id}>
                    <td>
                      <div className="font-weight-bold">{row.title || row.landing_page_title || "Untitled publication"}</div>
                      <small className="text-muted">/{row.slug || "no-slug"}</small>
                    </td>
                    <td>{row.author_name || row.creator_name || "—"}</td>
                    <td><StatusBadge value={row.access_level || (row.is_public ? "public" : "private")} /></td>
                    <td>{row.publication_year || "—"}</td>
                    <td>{row.published_at ? new Date(row.published_at).toLocaleDateString() : "—"}</td>
                    <td>
                      {row.slug ? (
                        <Link className="btn btn-sm btn-outline-primary" to={`/ebook/publications/${row.slug}`}>
                          View details
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
