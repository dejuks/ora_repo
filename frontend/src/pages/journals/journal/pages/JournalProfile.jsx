import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import { getAuthUser } from "../../../../utils/auth.js";
import { getManuscriptsByUser } from "../../../../api/odl_manuscript.api.js"; // API to get logged-in user's manuscripts
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function JournalProfile() {
  const loggedUser = getAuthUser();
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserManuscripts();
  }, []);

  const loadUserManuscripts = async () => {
    try {
      setLoading(true);
      const res = await getManuscriptsByUser(loggedUser.uuid);
      setManuscripts(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>
            <i className="fas fa-user mr-2 text-primary"></i> My Profile
          </h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">

            {/* Left Panel - Profile Info */}
            <div className="col-md-4">
              <div className="card card-primary card-outline">
                <div className="card-body box-profile text-center">
                  <div className="profile-user-img img-fluid img-circle mb-2" style={{backgroundColor:"#007bff", width:"100px", height:"100px", lineHeight:"100px", color:"#fff", fontSize:"36px"}}>
                    {loggedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="profile-username text-center">{loggedUser.name}</h3>
                  <p className="text-muted text-center">{loggedUser.role || "Author"}</p>

                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>Email</b> <span className="float-right">{loggedUser.email}</span>
                    </li>
                    <li className="list-group-item">
                      <b>Manuscripts</b> <span className="float-right">{manuscripts.length}</span>
                    </li>
                    <li className="list-group-item">
                      <b>Joined</b> <span className="float-right">{loggedUser.created_at?.split("T")[0]}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Panel - Tabs for Manuscripts & Stats */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header p-2">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <a className="nav-link active" href="#manuscripts" data-toggle="tab">Manuscripts</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#stats" data-toggle="tab">Stats</a>
                    </li>
                  </ul>
                </div>

                <div className="card-body">
                  <div className="tab-content">

                    {/* Manuscripts Tab */}
                    <div className="active tab-pane" id="manuscripts">
                      {loading ? (
                        <div className="text-center py-5">
                          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                          <p className="mt-2">Loading manuscripts...</p>
                        </div>
                      ) : manuscripts.length === 0 ? (
                        <div className="alert alert-info text-center">
                          You have no manuscripts yet.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover">
                            <thead className="thead-light">
                              <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Submitted On</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {manuscripts.map((m, i) => (
                                <tr key={m.id}>
                                  <td>{i + 1}</td>
                                  <td>{m.title}</td>
                                  <td>
                                    <span className={`badge ${
                                      m.status_label === "Draft" ? "badge-warning" :
                                      m.status_label === "Submitted" ? "badge-info" :
                                      m.status_label === "Published" ? "badge-success" : "badge-secondary"
                                    }`}>
                                      {m.status_label}
                                    </span>
                                  </td>
                                  <td>{m.submission_date?.split("T")[0]}</td>
                                  <td>
                                    <Link to={`/journal/manuscripts/show/${m.id}`} className="btn btn-sm btn-info mr-1">
                                      <i className="fas fa-eye"></i>
                                    </Link>
                                    {m.status_label === "Draft" && (
                                      <Link to={`/journal/manuscripts/edit/${m.id}`} className="btn btn-sm btn-warning">
                                        <i className="fas fa-edit"></i>
                                      </Link>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Stats Tab */}
                    <div className="tab-pane" id="stats">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="small-box bg-info">
                            <div className="inner">
                              <h3>{manuscripts.filter(m => m.status_label === "Draft").length}</h3>
                              <p>Draft Manuscripts</p>
                            </div>
                            <div className="icon">
                              <i className="fas fa-file-alt"></i>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="small-box bg-success">
                            <div className="inner">
                              <h3>{manuscripts.filter(m => m.status_label === "Published").length}</h3>
                              <p>Published Manuscripts</p>
                            </div>
                            <div className="icon">
                              <i className="fas fa-check-circle"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
}
