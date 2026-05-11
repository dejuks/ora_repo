import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";
import { getMyInvitedCoAuthors } from "../../../../api/odl_manuscript.api";

export default function MyInvitedCoAuthors() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const res = await getMyInvitedCoAuthors();
      setInvites(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load invites", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>My Invited Co-Authors</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-secondary">
            <div className="card-header">
              <h3 className="card-title">Invitations Sent</h3>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <p className="text-center py-4">
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </p>
              ) : invites.length === 0 ? (
                <p className="text-center py-3">No invites sent</p>
              ) : (
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Invited User</th>
                      <th>Email</th>
                      <th>Manuscript</th>
                      <th>Status</th>
                      <th>Invited At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((i, idx) => (
                      <tr key={i.id}>
                        <td>{idx + 1}</td>
                        <td>{i.user_name}</td>
                        <td>{i.user_email}</td>
                        <td>{i.manuscript_title}</td>
                        <td>
                          <span
                            className={`badge ${
                              i.status === "pending"
                                ? "badge-warning"
                                : i.status === "accepted"
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td>{new Date(i.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
