import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const RevisionRequiredManuscriptPage = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE = `${API}/ebook/manuscripts/revisions`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    loadData(token);
  }, [navigate]);

  // ✅ FIXED API HANDLING
  const loadData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API RESPONSE:", res.data);

      // ✅ IMPORTANT FIX
      const manuscripts = res.data?.data || [];

      console.log("MANUSCRIPTS:", manuscripts);

      setList(manuscripts);
    } catch (err) {
      console.error("Load error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load revision manuscripts"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH FILTER
  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((m) => {
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.isbn || "").toLowerCase().includes(q) ||
        String(m.publication_year || "").includes(q)
      );
    });
  }, [list, search]);

  // ✅ STATUS BADGE
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "revision_required":
        return "badge badge-warning";
      case "submitted":
        return "badge badge-primary";
      case "approved":
        return "badge badge-success";
      case "rejected":
        return "badge badge-danger";
      default:
        return "badge badge-secondary";
    }
  };

  const getStatusText = (status) => {
    return status ? status.replace(/_/g, " ").toUpperCase() : "UNKNOWN";
  };

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) loadData(token);
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Revision Required Manuscripts</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/ebook/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item active">Revision Required</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            {/* HEADER */}
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">Manuscripts Needing Revision</h3>

              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ maxWidth: "300px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* BODY */}
            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <div className="mt-2">Loading...</div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <div className="alert alert-danger">
                    {error}
                    <br />
                    <button
                      className="btn btn-sm btn-primary mt-2"
                      onClick={handleRetry}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-5">
                  <div className="alert alert-info">
                    No revision-required manuscripts found.
                  </div>
                </div>
              ) : (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      {/* <th>ISBN</th> */}
                      <th>Year</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredList.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.title}</strong>
                          <br />
                          <small className="text-muted">
                            {m.abstract?.substring(0, 60)}
                          </small>
                        </td>

                        {/* <td>{m.isbn || "-"}</td> */}

                        <td>{m.publication_year || "-"}</td>

                        <td>
                          <span>
                            {getStatusText(m.status)}
                          </span>
                        </td>

                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/ebook/manuscripts/show/${m.id}`}
                              className="btn btn-info"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>

                          

                            <Link
                              to={`/ebook/manuscripts/${m.id}/submit-revision`}
                              className="btn btn-success"
                            >
                              <i className="fas fa-upload"></i>
                            </Link>

                            <Link
                              to={`/ebook/manuscripts/edit/${m.id}`}
                              className="btn btn-primary"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* FOOTER */}
            {!loading && filteredList.length > 0 && (
              <div className="card-footer">
                Showing {filteredList.length} of {list.length} manuscripts
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default RevisionRequiredManuscriptPage;