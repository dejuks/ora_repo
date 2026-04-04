import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

const RevisionRequiredManuscriptPage = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  const BASE = `${API}/ebook/manuscripts/revisions`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    loadData(token);
  }, []);

  const loadData = async (token) => {
    const res = await axios.get(`${BASE}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setList(res.data);
  };

  const filteredList = list.filter(
    (m) =>
      m.title.toLowerCase().includes(search) ||
      m.isbn.toLowerCase().includes(search) ||
      m.publication_year.toString().includes(search)
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "badge badge-secondary";
      case "submitted":
        return "badge badge-primary";
      case "revision_required":
        return "badge badge-warning";
      default:
        return "badge badge-success";
    }
  };

  const getStatusText = (status) => {
    return status.replace("_", " ").toUpperCase();
  };

  return (
    <MainLayout>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-12">
                <h1>Manuscripts</h1>
              </div>
              <div className="col-sm-12">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="/ebook/dashboard">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Manuscripts</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Revision Required Manuscripts</h3>
                <div className="card-tools">
                  <div className="input-group input-group-sm" style={{ width: "250px" }}>
                    <input
                      type="text"
                      className="form-control float-right"
                      placeholder="Search by title, ISBN, or year..."
                      onChange={(e) => setSearch(e.target.value.toLowerCase())}
                    />
                    <div className="input-group-append">
                      <button type="submit" className="btn btn-default">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body table-responsive p-0">
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>ISBN</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length > 0 ? (
                      filteredList.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.title}</strong>
                          </td>
                          <td>{m.isbn}</td>
                          <td>
                            <span className="badge badge-info">
                              {m.publication_year}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(m.status)}>
                              {getStatusText(m.status)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <a
                                href={`/ebook/manuscripts/show/${m.id}`}
                                className="btn btn-info"
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </a>

                              {m.status === "revision_required" ? (
                                <>
                                  <a
                                    href={`/ebook/manuscripts/${m.id}/revisions`}
                                    className="btn btn-warning"
                                    title="View Revisions"
                                  >
                                    <i className="fas fa-history"></i>
                                  </a>

                                  <a
                                    href={`/ebook/manuscripts/${m.id}/submit-revision`}
                                    className="btn btn-success"
                                    title="Submit Revision"
                                  >
                                    <i className="fas fa-upload"></i>
                                  </a>
                                </>
                              ) : (
                                <>
                                  <a
                                    href={`/ebook/manuscripts/edit/${m.id}`}
                                    className="btn btn-primary"
                                    title="Edit"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </a>

                                  <button
                                    className="btn btn-danger"
                                    title="Delete"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this manuscript?"
                                        )
                                      ) {
                                        // Add delete logic here
                                      }
                                    }}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          <div className="alert alert-info mb-0">
                            <i className="fas fa-info-circle"></i> No manuscripts found
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card-footer clearfix">
                <div className="row">
                  <div className="col-sm-12 col-md-5">
                    <div className="dataTables_info">
                      Showing {filteredList.length} of {list.length} manuscripts
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-7">
                    <div className="dataTables_paginate paging_simple_numbers">
                      {/* Add pagination here if needed */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </MainLayout>
  );
};

export default RevisionRequiredManuscriptPage;